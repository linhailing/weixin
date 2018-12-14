const app = getApp()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    gameList: [],
    allList: [],
    redpack: 0,
  },
  onLoad: function() {
    const userinfo = wx.getStorageSync('userInfo');
    console.log(userinfo)
    let that = this;
    if (app.globalData.userInfo === null) {
      that.data.redpack = 0;
    } else {
      that.data.redpack = Math.floor(app.globalData.userInfo.redpack * 100) / 100;
    }
    if (userinfo !== "") {
      that.setData({
        userInfo: userinfo,
        hasUserInfo: true,
        redpack: that.data.redpack,
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        //保存用户信息
        wx.setStorageSync("userInfo", res.userInfo);
        //app.globalData.userInfo = res.userInfo
        console.log(app.globalData.userInfo);
        that.setData({
          userInfo: res.userInfo,
          redpack: that.data.redpack,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          wx.setStorageSync("userInfo", res.userInfo);
          //app.globalData.userInfo = res.userInfo
          console.log(res);
          that.setData({
            userInfo: res.userInfo,
            redpack: that.data.redpack,
            hasUserInfo: true
          })
        }
      })
    }
    that.setGameList();
  },
  getUserInfo: function(e) {
    console.log(e);
    let that = this;
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      wx.setStorageSync("userInfo", e.detail.userInfo);
      wx.login({
        success: function(dt) {
          app.wxRequest('auth', {
            "appid": "89",
            "platform": "sgame",
            "code": dt.code,
            "encryptedData": e.detail.encryptedData,
            "iv": e.detail.iv,
          }, res => {
            console.log(res);
            app.globalData.games = res.auth.games;
            app.globalData.token = res.auth.token;
            app.globalData.userInfo = res.auth.user;
            app.globalData.cdnServers = res.auth.CDNServers;
            app.globalData.redpack = res.auth.redpack;
            app.globalData.minrp = res.auth.minrp;
            that.data.redpack = res.auth.redpack;
          })
        }
      })
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        redpack: that.data.redpack,
      })
    }
  },
  //根据游戏信息返回游戏详情
  getGameData: function(gid) {
    for (var i = 0; i < this.allList.length; i++) {
      if (this.allList[i].gid === gid) {
        return this.allList[i];
      }
    }
  },
  setGameList: function() {
    const games = app.globalData.games;
    //所有游戏
    this.data.gamelist = [];
    this.allList = [];
    for (let i in games.all) {
      if (typeof(games.all[i]) !== "undefined") {
        this.allList.push(games.all[i]);
      }
    }
    this.gameList = [];
    for (let i in games.me) {
      if (typeof(games.me[i]) !== "undefined") {
        this.gameList.push(this.getGameData(games.me[i].gid));
      }
    }
    const newlist = [];
    for (let i = 0; i < this.gameList.length; i++) {
      if (typeof(this.gameList[i]) !== "undefined") {
        let _name = this.gameList[i].name.length <= 5 ? this.gameList[i].name : this.gameList[i].name.substring(0, 5) + '...';
        newlist.push({
          "appid": this.gameList[i].appid,
          "gid": this.gameList[i].gid,
          "icon": app.globalData.cdnServers + this.gameList[i].icon,
          "name": _name,
          "jimg": app.globalData.cdnServers + this.gameList[i].jimg
        })
      }
    }
    if (newlist.length > 0) {
      this.setData({
        gamelist: this.data.gamelist.concat(newlist)
      })
    }
  },
  //跳转小程序向服务器发送消息
  clickGameNavigator: function(e) {
    let appid = e.currentTarget.dataset.appid;
    if (appid.length <= 0) {
      let url = e.currentTarget.dataset.jimg;
      wx.previewImage({
        urls: [url]
        // 需要预览的图片http链接  使用split把字符串转数组。不然会报错
      })
    }
    let gid = e.currentTarget.dataset.gid;
    app.wxRequest("open", {
      "token": app.globalData.token,
      "gid": gid
    }, dt => {
      console.log(dt);
    })
  },
  onShareAppMessage: function() {
    return app.getShare();
  },
  //余额提现
  getBalance: function() {
    console.log('余额提现')
    let that = this;
    if (that.data.redpack < app.globalData.minrp) {
      let str = '红包余额满' + app.globalData.minrp + '元可提现';
      wx.showModal({
        title: '红包余额提现',
        content: str,
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    } else {
      //提现
      app.wxRequest('withdrawcash', {
        "token": app.globalData.token,
        "money": that.data.redpack,
      }, dt => {
        console.log(dt);
        this.setData({
          redpack: dt.data.redpack,
        })
        wx.showModal({
          title: '红包余额提现',
          content: '红包余额提现成功',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      });
    }
  },
})