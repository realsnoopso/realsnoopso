// custom typefaces
import "@fontsource/montserrat/variable.css"
import "@fontsource/merriweather"
// normalize CSS across browsers
import "./src/normalize.css"
// custom CSS styles
import "./src/style.css"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

export const onClientEntry = () => {
  // Facebook SDK 초기화
  window.fbAsyncInit = function () {
    FB.init({
      appId: "793696815238428", // 여기에 실제 Facebook 앱 ID를 입력하세요.
      xfbml: true,
      version: "v12.0", // Facebook Graph API 버전을 입력하세요.
    })
  }

  // Facebook SDK 스크립트를 동적으로 추가
  ;(function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) return
    js = d.createElement(s)
    js.id = id
    js.src = "//connect.facebook.net/en_US/sdk.js"
    fjs.parentNode.insertBefore(js, fjs)
  })(document, "script", "facebook-jssdk")
}
