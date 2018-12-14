//app.js
App({
  onLaunch: function (res) {
    console.log('onLaunch')
    console.log(res);
    let that = this;
    if (typeof wx.getUpdateManager === 'function') {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          wx.showModal({
            title: '更新提示',
            content: '有新版本正在下载中！',
          });
        } else {
          for (let i in res.query) {
            if (i === "from") {
              that.globalData.adFrom = res.query[i];
            }
          }
        }
      })
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
              for (let i in res.query) {
                if (i === "from") {
                  that.globalData.adFrom = res.query[i];
                }
              }
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败，请删除图标重新搜索',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              // 应用更新失败退出游戏
              wx.navigateBack({
                delta: 0
              })
            }
          }
        })
      })
    } else {
      wx.showModal({
        title: '更新提示',
        content: '为了正常运行，建议您先升级至微信最高版本！',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 微信版本过低退出游戏
            wx.navigateBack({
              delta: 0
            })
          }
        }
      })
    }
  },

  onShow: function (res) {
    console.log('onShow start')
    console.log(res);
    //每次小程序启动，或从后台进入前台显示时
    //判断场景值  红包分享进入强制登录
    if (res.path === "pages/sapporde/index") {
      console.log('充值进入');
      this.globalData.extra = res.referrerInfo;
    } else {
      if (res.path === 'pages/welfare/index') {
        console.log('红包分享进入')
        this.globalData.shareSid = res.query.sid;
      }
      //重新拉取一次服务器数据
      let that = this;
      //获取游戏数据
      that.wxRequest('games', {
        'token': that.globalData.token
      }, data => {
        console.log('game....')
        console.log(data)
        that.globalData.games = data.games;
      });
      console.log("token",this.globalData.token);
      if (this.globalData.token === null) {
        return;
      }

    }
    console.log('onShow end...')
  },
  //分享内容
  getShare: function () {
    return {
      title: '最好玩的游戏都在这里',
      imageUrl: 'https://mm.shmxplay.com/cdn/gamebox/1.png',
    }
  },
  login: function (cb) {
    //开启分享
    wx.showShareMenu({
      withShareTicket: true
    });
    var that = this;
    if (that.globalData.userInfo && that.globalData.games) {
      typeof cb == "function" && cb(that.globalData.games)
    } else {
      //用户未登陆 登陆连接服务器
      //调用登录接口
      wx.showLoading({
        title: '加载中',
      })
      wx.login({
        success: function (dt) {
          console.log(dt);
          that.wxRequest('auth', {
            "appid": "89",
            "platform": "sgame",
            "code": dt.code,
            "ab": that.globalData.adFrom,
          }, data => {
            console.log(data)
            that.globalData.games = data.auth.games;
            that.globalData.token = data.auth.token;
            that.globalData.userInfo = data.auth.user;
            that.globalData.cdnServers = data.auth.CDNServers;
            that.globalData.redpack = data.auth.redpack;
            that.globalData.minrp = data.auth.minrp;
            typeof cb == "function" && cb(that.globalData.games)
          });
        }
      })
    }
  },
  //请求服务器
  wxRequest: function (url, dt, cb) {
    console.log(dt)
    wx.request({
      url: 'https://box.shmxplay.com/game/' + url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: dt,
      success: function (res) {
        wx.hideLoading();
        console.log('res', res)
        console.log(res.data);
        typeof cb == "function" && cb(res.data)
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '网络错误',
          content: '网络出错，请刷新重试1',
          showCancel: false
        })
      },
      complete: function (res) { },
    });
  },
  //全局信息
  globalData: {
    code: "",
    userInfo: null,
    cdnServers: null,
    token: null,
    games: null,
    adFrom: "",
    redpack: null, //红包余额
    shareSid: 0,
    minrp: 10, //最小提额值
    extra: null,
  }
})