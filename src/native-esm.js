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
 * initOc用于初始化oc和js之间的bridge，是一个promise对象，bridge当then的参数传递出去
 * nexus用于把js调用原生的方法的结果通过promise返回，第一个参数是方法名，后续参数是传递给原生方法的参数
 * 如果需要oc调用js的方法，可以import initOc，通过promise来调用
 * 原生调用js的方法，只能把方法挂载到全局window上
 *
 */
let initOc = null, nexus = null
if (platform === 'ios') {
  initOc = new Promise(resolve => {
    setupWebViewJavascriptBridge(function (bridge) {
      resolve(bridge)
    })
  })
  nexus = (name, str) => {
    str = str || ''
    return initOc.then(bridge => {
      return new Promise(resolve => {
        bridge.callHandler(name, str, function (response) {
          console.log(response)
          resolve(response)
        })
      })
    })
  }
} else {
  nexus = (name, str) => {
    let fn = window.android[name]
    let res = str ? fn(str) : fn()
    return Promise.resolve(res)
  }
}

export { platform, nexus, initOc }

export default {
  isLogin() {
    return nexus('isLogin')
  },
  getUserInfo() {
    return nexus('getUserInfo')
  },
  showToast(str) {
    return nexus('showToast', str)
  }
}




