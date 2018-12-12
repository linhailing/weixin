import {HTTP} from "../utils/http";

class Like extends HTTP{
  getLike(cid){
    this.request({
      url: 'like',
      method:'POST',
      data:{cid:cid}
    })
  }
}

export {Like}