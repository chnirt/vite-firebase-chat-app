import Helmet from 'react-helmet'

import { APP_NAME } from '../../env'

export const Header = () => {
  const appTitle = `${APP_NAME} Messenger`
  const appDescription = 'Free social network for all friends'
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <title>{appTitle}</title>
      <meta name="description" content={appDescription} />
      <meta name="keywords" content="Firebase, Messenger" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:image"
        content="https://firebase.google.com/static/images/brand-guidelines/logo-built_white.png"
      />
      <meta name="twitter:title" content={appTitle} />
      <meta name="twitter:creator" content="@chnirt" />
      <meta name="twitter:site" content="@chnirt" />
      <meta name="twitter:description" content={appDescription} />
      {/* Facebook */}
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content="https://vite-firebase-chat-app.vercel.app"
      />
      <meta property="og:title" content={appTitle} />
      <meta property="og:description" content={appDescription} />
      <meta
        property="og:image"
        content="https://firebase.google.com/static/images/brand-guidelines/logo-built_white.png"
      />
    </Helmet>
  )
}
