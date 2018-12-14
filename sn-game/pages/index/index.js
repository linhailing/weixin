 var app = getApp()
 Page({
   data: {
     navTab: [{
       "id": 0,
       "title": "精选",
     }, {
       "id": 1,
       "title": "分类",
     }, {
       "id": 2,
       "title": "排行",
     }, ],
     currentTab: "0", //当前选择的tab
     gtypeTab: "0", //分类选择的tab

     showGames: [], //要显示的游戏列表
     allList: [], //保存所有游戏
     gamelist: [], //游戏列表 1.精选 

     gtypeList: [], //游戏分类列表
     tgameList: [], //分类游戏

     //排行下的游戏 1.精选 2.新游 3.热门 4.福利 5.banner
     brankList: [], //5.banner
     nrankList: [], //2.新游
     hrankList: [], //3.热门 
     wrankList: [], //4.福利

     scrolltop: null, //滚动位置
     page: 0 //分页
   },

   onLoad: function() {
     //判断当前是否拥有列表数据
     let that = this;
     if (app.globalData.games) {
       that.initList();
     } else {
       app.login(dt => {
         console.log('index login------------------------');
         that.initList();
       });
     }
   },

   onReady: function() {
     var that = this;
     var shareAnimation = wx.createAnimation({
       duration: 500,
       timingFunction: 'ease-in-out',
       //delay: 0,
       //transformOrigin: '"50% 50% 0"',
     });
     var next = true;
     setInterval(function() {
       if (next) {
         shareAnimation.translateX(-6).step()
         next = !next;
       } else {
         shareAnimation.translateX(0).step()
         next = !next;
       }
       // 更新数据
       that.setData({
         // 导出动画示例
         shareAnimation: shareAnimation.export(),
       })
     }.bind(that), 500);
   },

   //初始化列表数据
   initList() {
     const games = app.globalData.games;
     this.showGames = [];
     //所有游戏
     this.allList = [];
     for (var i in games.all) {
       if (typeof(games.all[i]) !== "undefined") {
         this.allList.push(games.all[i]);
       }
     }
     this.setSGameList();
     //游戏分类列表
     this.gtypeList = [];
     for (var i in games.gtype) {
       if (typeof(games.gtype[i]) !== "undefined") {
         this.gtypeList.push(games.gtype[i]);
       }
     }
     this.setData({
       gtypeList: this.gtypeList
     })
   },

   //根据游戏信息返回游戏详情
   getGameData: function(gid) {
     for (var i = 0; i < this.allList.length; i++) {
       if (this.allList[i].gid === gid) {
         return this.allList[i];
       }
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
     }, function(dt) {
       console.log(dt);
     })
   },
   //点击切换Tab
   currentTabClick: function(e) {
     let idx = e.currentTarget.dataset.idx;
     this.data.currentTab = idx;
     this.showGames = [];
     this.setData({
       currentTab: idx,
     })
     //0精选 1分类 2排行
     if (idx === 0) {
       this.setSGameList();
     } else if (idx === 1) {
       this.setGTypeList(1);
     } else if (idx === 2) {
       this.setRGameList();
     };
   },
   //设置精选列表
   setSGameList: function() {
     const games = app.globalData.games;
     //清空数据
     this.setData({
       page: 0,
       gamelist: []
     })
     //精选游戏
     for (var i in games.rgame) {
       if (typeof(games.rgame[i]) !== "undefined" && i === "1") {
         for (var j in games.rgame[i]) {
           this.showGames.push(this.getGameData(games.rgame[i][j]));
         }
         break;
       }
     }
     this.fetchGameData();
   },

   //点击分类列表 切换Tab
   gtypeTabClick: function(e) {
     //分类列表
     let idx = e.currentTarget.dataset.idx;
     this.gtypeTab = idx;
     this.setGTypeList(this.gtypeTab + 1);
     this.setData({
       gtypeTab: idx,
     });
   },
   //设置分类列表数据
   setGTypeList: function(index) {
     //清空数据
     this.setData({
       page: 0,
       tgameList: []
     })
     const games = app.globalData.games;
     this.tgameList = [];
     this.showGames = [];
     for (var i in games.tgame) {
       if (typeof(games.tgame[i]) !== "undefined" && i === index.toString()) {
         for (var j in games.tgame[i]) {
           this.showGames.push(this.getGameData(games.tgame[i][j]));
         }
         break;
       }
     }
     this.fetchGameData();
   },
   //设置排行列表数据
   setRGameList: function() {
     const games = app.globalData.games;
     //清空数据
     this.setData({
       page: 0,
       brankList: [],
       nrankList: [],
       hrankList: [],
       wrankList: [],
     })
     for (var i in games.rgame) {
       if (typeof(games.rgame[i]) !== "undefined" && i !== "1") {
         const lists = [];
         const newlist = [];
         for (var j in games.rgame[i]) {
           lists.push(this.getGameData(games.rgame[i][j]));
         }
         let len = 3;
         if (lists.length < 3) {
           len = lists.length;
         }
         for (let k = 0; k < len; k++) {
           newlist.push({
             "appid": lists[k].appid,
             "banner": app.globalData.cdnServers + lists[k].banner,
             "bimg": app.globalData.cdnServers + lists[k].bimg,
             "extra": lists[k].extra,
             "gid": lists[k].gid,
             "glabel": lists[k].glabel.replace(/;/g, "  |  "),
             "icon": app.globalData.cdnServers + lists[k].icon,
             "name": lists[k].name,
             "path": lists[k].path,
             "score": lists[k].score + '分',
             "text": lists[k].text.substring(0, 14) + '...',
             "users": lists[k].users + '玩过',
             "jimg": app.globalData.cdnServers + lists[k].jimg
           })
         }
         if (i === "2") {
           this.setData({
             nrankList: this.data.nrankList.concat(newlist)
           })
         } else if (i === "3") {
           this.setData({
             hrankList: this.data.hrankList.concat(newlist)
           })
         } else if (i === "4") {
           this.setData({
             wrankList: this.data.wrankList.concat(newlist)
           })
         } else if (i === "5") {
           this.setData({
             brankList: this.data.brankList.concat(newlist)
           })
         }
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
       newlist.push({
         "appid": this.showGames[i].appid,
         "banner": app.globalData.cdnServers + this.showGames[i].banner,
         "bimg": app.globalData.cdnServers + this.showGames[i].bimg,
         "extra": this.showGames[i].extra,
         "gid": this.showGames[i].gid,
         "glabel": this.showGames[i].glabel.replace(/;/g, "  |  "),
         "icon": app.globalData.cdnServers + this.showGames[i].icon,
         "name": this.showGames[i].name,
         "path": this.showGames[i].path,
         "score": this.showGames[i].score + '分',
         "text": this.showGames[i].text.substring(0, 14) + '...',
         "users": this.showGames[i].users + '玩过',
         "jimg": app.globalData.cdnServers + this.showGames[i].jimg
       })
     }
     let _index = this.data.currentTab.toString();
     //根据标签页刷新列表
     if (_index === "0") {
       this.setData({
         gamelist: this.data.gamelist.concat(newlist)
       })
     } else if (_index === "1") {
       this.setData({
         tgameList: this.data.tgameList.concat(newlist)
       })
     }
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
     wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
     this.setData({
       scrolltop: 0
     })
     //根据标签页清空数据
     if (this.data.currentTab === "0") {
       this.setData({
         page: 0,
         gamelist: [],
       })
     } else if (this.data.currentTab === "1") {
       this.setData({
         page: 0,
         tgameList: [],
       })
     } else if (this.data.currentTab === "2") {
       this.setData({
         page: 0,
         brankList: [],
         nrankList: [],
         hrankList: [],
         wrankList: [],
       })
     }
     //重新加载数据
     this.fetchGameData();
     setTimeout(() => {
       wx.hideNavigationBarLoading(); //隐藏导航条加载动画
       wx.stopPullDownRefresh()
     }, 1000)
   },
   onShareAppMessage: function() {
     return app.getShare();
   },
   previewImage: function(e) {
     console.log(e)
     let url = e.currentTarget.dataset.gid;
     wx.previewImage({
       urls: [url]
       // 需要预览的图片http链接  使用split把字符串转数组。不然会报错
     })
   },
 })