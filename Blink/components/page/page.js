// components/page/page.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    right:Boolean,
    left: Boolean,
    title: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    leftSrc: 'images/triangle@left.png',
    leftSrcDis: 'images/triangle.dis@left.png',
    rightSrc: 'images/triangle@right.png',
    rightSrcDis: 'images/triangle.dis@right.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClickLeft: function(event) {
      console.log('left');
    },
    onClickRight: function(event) {
      console.log('right');
    }
  }
})
