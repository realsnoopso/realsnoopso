import * as React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  header = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link className="logo" to="/">
        {title}
      </Link>
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-4)",
        }}
      >
        <Link
          className="header-link-home"
          to="https://github.com/realsnoopso"
          target="_blank"
        >
          github
        </Link>
        <Link
          className="header-link-home"
          to="https://drive.google.com/file/d/1az8bZSsq2-I6KSY3LPVwiA2Rm9yTREGe/view?usp=sharing"
          target="_blank"
        >
          resume
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <header className="global-header">{header}</header>
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <main>{children}</main>
        <footer></footer>
      </div>
    </>
  )
}

export default Layout
