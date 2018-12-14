// pages/welfare/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openRedPacket: false,
    redpack: 0,
    shareValue: 0,
    sid: 0,
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //当前用户是通过红包分享进入
    if (app.globalData.shareSid !== 0) {
      this.setData({
        openRedPacket: false,
      });
    }else{
      this.clickRedPacket();
    }
  },
  /**
   * 判断用户登录
   */
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
            "sid": app.globalData.shareSid
          }, res => {
            console.log(res);
            if (res.ret === 0) {
              app.globalData.games = res.auth.games;
              app.globalData.token = res.auth.token;
              app.globalData.userInfo = res.auth.userInfo;
              app.globalData.cdnServers = res.auth.CDNServers;
              app.globalData.shareSid = 0;//登陆成功后清除分享状态
              that.clickRedPacket();
            } else {
              wx.showModal({
                title: '登陆提示',
                content: res.msg,
                showCancel: false,
                success: function(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  }
                }
              })
            }
          })
        },
      })
    } else {
      that.clickRedPacket();
    }
  },
  /**
   * 点击开启红包
   */
  clickRedPacket: function(e) {
    let that = this;
    app.wxRequest("redpack", {
      "token": app.globalData.token,
    }, function(dt) {
      that.data.sid = dt.redpack.sid;
      that.data.redpack = dt.redpack.redpack;
      that.getRedpackusers(true);
      that.setData({
        redpack: dt.redpack.redpack,
        openRedPacket: true,
      });
    })
  },
  //邀请的玩家接口
  getRedpackusers: function(e) {
    let that = this;
    app.wxRequest('redpackusers', {
      "token": app.globalData.token,
      "sid": that.data.sid,
    }, data => {
      if (data.list.length > 0 || e) {
        that.data.shareValue = data.list.length;
        const newlist = [];
        for (let i = 0; i < data.list.length; i++) {
          newlist.push({
            "avatar": data.list[i].avatar,
            "uid": data.list[i].uid,
            "name": data.list[i].name,
          })
        }
        that.setData({
          newlist: newlist,
          shareValue: that.data.shareValue,
          redpack: data.list.length >= 7 ? that.data.redpack * 2 : that.data.redpack,
          openRedPacket: data.list.length > 0 || true,
        })
      }
    });
  },
  /** 
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '玩游戏还能领福利？不信进来看',
      path: '/pages/welfare/index?sid=' + this.data.sid, //分享地址
      imageUrl: 'https://mm.shmxplay.com/cdn/gamebox/2.jpg',
    };
  },
})