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
      {/* Primary Meta Tags */}
      <title>{appTitle}</title>
      <meta name="title" content={appTitle} />
      <meta name="description" content={appDescription} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content="https://vite-firebase-chat-app.vercel.app/"
      />
      <meta property="og:title" content={appTitle} />
      <meta
        property="og:description"
        content={appDescription}
      />
      <meta property="og:image" content />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:url"
        content="https://vite-firebase-chat-app.vercel.app/"
      />
      <meta property="twitter:title" content={appTitle} />
      <meta
        property="twitter:description"
        content={appDescription}
      />
      <meta
        property="twitter:image"
        content="https://firebase.google.com/static/images/brand-guidelines/logo-built_white.png"
      />
    </Helmet>
  )
}
