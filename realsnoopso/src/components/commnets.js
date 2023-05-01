import React, { useEffect } from "react"

const Comments = ({ pathname }) => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.FB) {
      window.FB.XFBML.parse()
    }
  }, [])

  return (
    <div
      className="fb-comments"
      data-href={`https://snoop.so${pathname}`} // 실제 웹 페이지 URL을 입력하세요.
      data-width="100%"
      data-numposts="5"
    ></div>
  )
}

export default Comments
