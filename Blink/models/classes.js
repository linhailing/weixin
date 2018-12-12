import {HTTP} from "../utils/http";

class Classes extends HTTP{
  getClassesInfo(calback){
    this.request({
      url: 'classic/latest',
      success:(res)=>{
        calback && calback(res)
      }
    })
  }
}

export {Classes}