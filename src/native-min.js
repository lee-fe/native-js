(function (window) {
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
    var WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'https://__bridge_loaded__'
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  }

  var platform = (function () {
    var user = navigator.userAgent
    if (user.indexOf("Android") > -1 || user.indexOf('Linux') > -1) {
      return 'android'
    } else if (user.indexOf("iPhone") > -1 || user.indexOf("iPad") > -1) {
      return 'ios'
    } else {
      return 'windows'
    }
  })()

  var initOc = null, nexus = null
  if (platform === 'ios') {
    initOc = new Promise(function (resolve) {
      setupWebViewJavascriptBridge(function (bridge) {
        resolve(bridge)
      })
    })
    nexus = function (name, str) {
      str = str || ''
      return initOc.then(function (bridge) {
        return new Promise(function (resolve) {
          bridge.callHandler(name, str, function (response) {
            resolve(response)
          })
        })
      })
    }
  } else {
    nexus = function (name, str) {
      var fn = window.android[name]
      var res = str ? fn(str) : fn()
      return Promise.resolve(res)
    }
  }
  window.native = {
    platform,
    nexus,
    initOc,
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
})(window)