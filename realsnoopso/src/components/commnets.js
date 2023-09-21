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
      data-href={`https://snoop.so${pathname}`}
      data-width="100vw"
      data-numposts="5"
    ></div>
  )
}

export default Comments
