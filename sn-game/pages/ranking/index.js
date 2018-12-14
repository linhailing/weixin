// pages/ranking/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    gamelist: [],
    showGames: [],
    allList: [],
    scrolltop: null, //滚动位置
    page: 0 //分页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setGameList(options.id);
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
    }, function(dt) {
      console.log(dt);
    })
  },

  //设置精选列表
  setGameList: function(id) {
    if (id === "2") {
      this.data.title = "新游戏";
    } else if (id === "3") {
      this.data.title = "热门榜";
    } else if (id === "4") {
      this.data.title = "福利榜";
    }
    this.setData({
      title: this.data.title
    });
    const games = app.globalData.games;
    //所有游戏
    this.data.gamelist = [];
    this.allList = [];
    for (var i in games.all) {
      if (typeof(games.all[i]) !== "undefined") {
        this.allList.push(games.all[i]);
      }
    }
    this.showGames = [];
    //精选游戏
    for (var i in games.rgame) {
      if (typeof(games.rgame[i]) !== "undefined" && i === id) {
        for (var j in games.rgame[i]) {
          this.showGames.push(this.getGameData(games.rgame[i][j]));
        }
        break;
      }
    }
    this.fetchGameData();
  },
  //根据游戏信息返回游戏详情
  getGameData: function(gid) {
    for (var i = 0; i < this.allList.length; i++) {
      if (this.allList[i].gid === gid) {
        return this.allList[i];
      }
    }
  },

  //要显示游戏列表
  fetchGameData: function() {
    const perpage = 10;
    this.setData({
      page: this.data.page + 1
    })
    const page = this.data.page;
    const newlist = [];
    let len = page * perpage;
    if (len > this.showGames.length) {
      len = this.showGames.length;
    }
    for (var i = (page - 1) * perpage; i < len; i++) {
      //判断是否有bimg图
      newlist.push({
        "appid": this.showGames[i].appid,
        "banner": app.globalData.cdnServers + this.showGames[i].banner,
        "bimg": app.globalData.cdnServers + this.showGames[i].bimg,
        "gid": this.showGames[i].gid,
        "glabel": this.showGames[i].glabel.replace(/;/g, "  |  "),
        "icon": app.globalData.cdnServers + this.showGames[i].icon,
        "name": this.showGames[i].name,
        "score": this.showGames[i].score + '分',
        "text": this.showGames[i].text.substring(0, 14) + '...',
        "users": this.showGames[i].users + '玩过',
        "jimg": app.globalData.cdnServers + this.showGames[i].jimg
      })
    }

    this.setData({
      gamelist: this.data.gamelist.concat(newlist)
    })
  },

  //滚动事件
  scrollHandle: function(e) {
    this.setData({
      scrolltop: e.detail.scrollTop
    })
  },
  //回到顶部
  goToTop: function() {
    this.setData({
      scrolltop: 0
    })
  },
  //滚动加载
  scrollLoading: function() {
    this.fetchGameData();
  },
  //下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 0,
      gamelist: [],
    })
    //重新加载数据
    this.fetchGameData();
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  onShareAppMessage: function() {
    return app.getShare();
  },
})