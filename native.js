function setupWebViewJavascriptBridge(callback) {
  //第一次调用这个方法的时候，为false
  if (window.WebViewJavascriptBridge) {
    return callback(WebViewJavascriptBridge)
  }
  //第一次调用的时候，也是false
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback)
  }
  //把callback对象赋值给对象。
  window.WVJBCallbacks = [callback]
  //这段代码的意思就是执行加载WebViewJavascriptBridge_JS.js中代码的作用
  let WVJBIframe = document.createElement('iframe')
  WVJBIframe.style.display = 'none'
  WVJBIframe.src = 'https://__bridge_loaded__'
  document.documentElement.appendChild(WVJBIframe)
  setTimeout(function () {
    document.documentElement.removeChild(WVJBIframe)
  }, 0)
}

let platform = (function () {
  let user = navigator.userAgent
  if (user.indexOf("Android") > -1 || user.indexOf('Linux') > -1) {
    return 'android'
  } else if (user.indexOf("iPhone") > -1 || user.indexOf("iPad") > -1) {
    return 'ios'
  } else {
    return 'windows'
  }
})()
/**
 *
 * oc就是object-c(ios平台的开发语言)
 * initOc用于初始化oc和js之间的bridge，是一个promise，then里面可以获取到nexus，也就是bridge
 * handler用于把js调用oc的异步回调方法的结果通过promise返回，参数是oc的方法名
 * 如果需要oc调用js的方法，可以import initOc，通过promise来调用
 * 原生调用js的方法，只能把方法挂载到全局window上
 *
 */
let initOc = null, nexus = null, handler = null
if (platform === 'ios') {
  initOc = new Promise((resolve) => {
    setupWebViewJavascriptBridge(function (bridge) {
      nexus = bridge
      resolve(nexus)
    })
  })
  handler = (name) => {
    return initOc.then(() => {
      return new Promise((resolve) => {
        nexus.callHandler(name, {name: '张三'}, function (response) {
          console.log(response)
          resolve(response)
        })
      })
    })
  }
} else {
  const {android} = window
  handler = (name) => Promise.resolve(android[name]())
}

export { platform, handler, initOc }

export default {
  isLogin() {
    return handler('isLogin')
  },
  getUserInfo() {
    return handler('getUserInfo')
  }
}




