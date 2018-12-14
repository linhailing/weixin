// pages/welfare/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gname: null,
    contact: null,
    tel: null,
    email: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  bindGnameInput: function(e) {
    this.data.gname = e.detail.value;
  },
  bindContactInput: function(e) {
    this.data.contact = e.detail.value;
  },
  bindTelInput: function(e) {
    this.data.tel = e.detail.value;
  },
  bindEmailInput: function(e) {
    this.data.email = e.detail.value;
  },
  clickApply: function() {
    if (this.data.gname === null) {
      this.showToast('请填写游戏名称');
      return;
    } else if (this.data.contact === null) {
      this.showToast('请填写联系人');
      return;
    } else if (this.data.tel === null) {
      this.showToast('请填写联系电话');
      return;
    } else if (this.data.email === null) {
      this.showToast('请填写联系邮箱');
      return;
    } else {
      //验证手机号
      let re = /^1\d{10}$/
      if (re.test(this.data.tel)) {
        console.log("正确");
      } else {
        this.showToast('请填写正确的联系手机');
        return;
      }
      re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
      if (re.test(this.data.email)) {
        console.log("正确");
      } else {
        this.showToast('请填写正确的联系邮箱');
        return;
      }

      app.wxRequest("apply", {
        "token": app.globalData.token,
        "gname": this.data.gname,
        "contact": this.data.contact,
        "tel": this.data.tel,
        "email": this.data.email,
      }, function(dt) {
        console.log(dt);
        if (dt.ret === 0) {
          wx.showToast({
            title: "提交成功",
            duration: 2000
          })
        }
      })
    }
  },

  showToast: function(text) {
    wx.showToast({
      title: text,
      icon: "none",
      duration: 1000
    })
  },
  onShareAppMessage: function() {
    return app.getShare();
  },
})