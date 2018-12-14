// pages/sapporde/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestPayment: false,
    shopPlay: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //显示星战来了图标
    this.setData({
      money: app.globalData.extra.extraData.money
    });
    this.clickPay();
  },

  clickPayButton: function() {
    if (this.shopPlay) {
      this.clickPay();
    } else {
      if (this.data.requestPayment) {
        this.navigateToGame(true);
      }
    }
  },

  clickPay: function() {
    var that = this;
    //如果已经充值
    if (that.data.requestPayment) {
      wx.showModal({
        title: '充值提示',
        content: '您已经充值成功',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            //that.navigateToGame(true);
          }
        }
      });
      return;
    }
    let ext = app.globalData.extra;
    that.getGameAll(function() {
      wx.login({
        success: function(dt) {
          console.log(dt);
          app.wxRequest("sapporder", {
            "token": ext.extraData.token,
            "money": ext.extraData.money,
            "extdata": ext.extraData.extdata,
            "pf": ext.extraData.pf,
            "appid": "89",
            "code": dt.code
          }, function(msg) {
            console.log('获取支付数据');
            wx.requestPayment({
              "timeStamp": msg.data.timeStamp + '',
              "nonceStr": msg.data.nonceStr,
              "package": msg.data.package,
              "signType": msg.data.signType,
              "paySign": msg.data.sign,
              success(res) {
                console.log('充值成功');
                console.log(res);
                that.navigateToGame(true);
              },
              fail(res) {
                console.log('充值失败');
                console.log(res);
                wx.showModal({
                  title: '充值提示',
                  content: '充值失败',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      console.log('用户点击确定');
                      that.navigateToGame(false);
                    }
                  }
                });
              },
              complete(res) {
                console.log(res);
                if (res.requestPayment === 'ok') {
                  that.shopPlay = false;
                } else {
                  that.shopPlay = true;
                }
              },
            });
          });
        }
      })
    });
  },

  /**
   * 跳转回游戏
   * @param {Boolean} request 充值状态 ok：成功 fail:失败 
   */
  navigateToGame: function(request) {
    this.data.requestPayment = request;
    console.log(app.globalData.extra.extraData)
    wx.navigateToMiniProgram({
      appId: app.globalData.extra.appId,
      path: 'page/index/index?type=payyxmb',
      extraData: {
        data: app.globalData.extra.extraData,
        requestPayment: request
      },
      envVersion: 'develop',
      success(res) {
        // 打开成功 
      }
    })
  },
  /**
   * 获取游戏列表显示图标和名称
   * @param {callback} cb 回调
   */
  getGameAll: function(cb) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    wx.login({
      success: function(dt) {
        console.log(dt);
        app.wxRequest('auth', {
          "appid": "89",
          "platform": "sgame",
          "code": dt.code,
          "ab": app.globalData.adFrom,
        }, data => {
          let all = data.auth.games.all;
          for (const key in all) {
            if (all.hasOwnProperty(key)) {
              const element = all[key];
              console.log(element)
              if (element.appid === app.globalData.extra.appId) {
                wx.setNavigationBarTitle({
                  title: element.name + '商城' //页面标题为路由参数
                });
                that.setData({
                  iconImage: data.auth.CDNServers + element.icon
                });
                break;
              }
            }
          }
          typeof cb == "function" && cb();
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})