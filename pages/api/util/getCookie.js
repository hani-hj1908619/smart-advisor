import {parseCookies} from 'nookies'

export function getCookie (ctx, cookieName){
  try{
    //console.log(Object.keys(JSON.parse(parseCookies(ctx)[cookieName])).length > 1)
    return JSON.parse(parseCookies(ctx)[cookieName])
  }
  catch (e) {
    console.log(e)
  }
}
