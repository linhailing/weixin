import {config} from "../config";

class HTTP{
  request(params){
    let method = params.method ? params.method : "GET"
    let data = params.data ? params.data : {}
    wx.request({
      url: config.base_url + params.url,
      header: {
        'content-type': 'application/json',
        "token": config.token
      },
      data: data,
      method: method,
      success:(res)=>{
        let code = res.statusCode + ""
        if (code.startsWith('2')){
          if (res.data.ret == 0 ) params.success && params.success(res.data)
          else this._showToast(res.data.ret ? res.data.ret : 1 ,res.data.msg ? res.data.msg:'现了一个错误')
        }
        else this._showToast('1','出现了一个错误.')
      },
      fail:(err)=>{
        this._showToast(err.ret,err.msg)
      }
    });
  }
  _showToast(code,msg){
    wx.showToast({
      title: 'code:'+code+',error:'+msg,
      icon: 'none',
      duration: 2000
    })
  }
}

export {HTTP}