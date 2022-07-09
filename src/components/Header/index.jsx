import Helmet from 'react-helmet'

import { APP_NAME } from '../../env'

export const Header = () => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <title>{APP_NAME} Messenger</title>
    </Helmet>
  )
}
