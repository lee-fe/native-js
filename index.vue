<template>
    <div>
        <button @click="is">是否登陆</button>
    </div>
</template>

<script>
  import native, { platform, initOc } from './native-esm'

  export default {
    methods: {
      // 判断是否登陆
      is() {
        native.isLogin().then(res => {
          if (res) {
            console.log('登陆了')
          } else {
            console.log('没登录')
          }
        })
      },
      // 获取用户信息
      getUserInfo() {
        native.getUserInfo().then(res => {
          console.log(`用户信息是${res}`)
        })
      },
      // 刷新页面(留给native调用)
      refresh() {
        location.reload()
      }
    },
    mounted() {
      console.log(`${platform}设备`)

      //把vue的方法挂载到全局
      window.refresh = this.refresh

      //处理 oc 调用 js -->
      if (platform === 'ios') {
        initOc.then(bridge => {
          bridge.registerHandler('refresh', function (data, responseCallback) {
            //处理oc给的传参
            alert('oc请求js  传值参数是：' + data)
            let responseData = {'result': 'handle success'}
            //处理完，回调传值给oc
            responseCallback(responseData)
          })
        })
      }
    }
  }
</script>
