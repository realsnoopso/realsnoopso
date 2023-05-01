/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
            github
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={85}
        height={85}
        quality={95}
        alt="Profile picture"
      />
      <div>
        <p>
          <strong>{author?.name}</strong>
        </p>
        <p>
          좋은 제품을 만들고 싶은 프로덕트 엔지니어.
          <br />
          현재는 프론트엔드 개발 공부를 하고 있습니다.
        </p>
      </div>
    </div>
  )
}

export default Bio
