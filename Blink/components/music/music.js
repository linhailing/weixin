// components/music/music.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img: {
      type:String,
      value: 'images/music.jpg'
    },
    content: String,
    isPlay:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconSrc: "images/music@tag.png",
    playImg: "images/player@play.png"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPlay: function (event) {
      let isPlay = !this.properties.isPlay
      let playImg = isPlay ? 'images/player@play.png' : 'images/player@pause.png'
      this.setData({
        playImg:playImg,
        isPlay: isPlay
      })
    }
  }
})
