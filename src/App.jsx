// https://gist.github.com/codediodeio/513bf77ee45be6d38d27868f5345a002
import { lazy, Suspense, useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'

import './App.less'
import { Layout } from './layout'
import { PublicRoute, PrivateRoute } from './helpers'
import { Loading } from './components'
import { useRemoteConfig, WebRTCProvider } from './context'
import { analytics } from './firebase'
import { getRemoteAll, getRemoteValue } from './firebase/remoteConfig'
import { eventNames, paths } from './constants'
// import { setUpBaseName } from './utils'
import { logAnalyticsEvent } from './firebase/analytics'

const LazySignInScreen = lazy(() => import('./pages/SignIn'))
const LazySignUpScreen = lazy(() => import('./pages/SignUp'))

const LazyHomeScreen = lazy(() => import('./pages/Home'))

const LazyCreateBlogScreen = lazy(() => import('./pages/CreateBlog'))
const LazyBlogScreen = lazy(() => import('./pages/Blog'))
const LazyBlogDetailScreen = lazy(() => import('./pages/BlogDetail'))

const LazyWhatsAppScreen = lazy(() => import('./pages/WhatsApp'))

const LazyPexelsScreen = lazy(() => import('./pages/Pexels'))

const LazySearchScreen = lazy(() => import('./pages/Search'))
const LazyUserDetailScreen = lazy(() => import('./pages/UserDetail'))

const LazyMessengerScreen = lazy(() => import('./pages/Messenger'))

const LazyAudioPlayerScreen = lazy(() => import('./pages/AudioPlayer'))
const LazySpotifyScreen = lazy(() => import('./pages/Spotify'))

const LazyProfileScreen = lazy(() => import('./pages/Profile'))
const LazyChangePasswordScreen = lazy(() => import('./pages/ChangePassword'))

const LazyNotFoundScreen = lazy(() => import('./pages/NotFound'))

// setUpBaseName()

function App() {
  let location = useLocation()
  const { vite_app_turn_server } = useRemoteConfig()

  useEffect(() => {
    if (typeof analytics === 'function') {
      const page_path = location.pathname + location.search
      analytics().setCurrentScreen(page_path)
      logAnalyticsEvent(eventNames.pageView, {
        page_path,
      })
    }
  }, [location, getRemoteAll, getRemoteValue])

  // We removed the <BrowserRouter> element from App because the
  // useRoutes hook needs to be in the context of a <BrowserRouter>
  // element. This is a common pattern with React Router apps that
  // are rendered in different environments. To render an <App>,
  // you'll need to wrap it in your own <BrowserRouter> element.
  let element = useRoutes([
    // A route object has the same properties as a <Route>
    // element. The `children` is just an array of child routes.
    {
      path: paths.login,
      element: (
        <Suspense fallback={<Loading />}>
          <PublicRoute>
            <LazySignInScreen />
          </PublicRoute>
        </Suspense>
      ),
    },
    {
      path: paths.register,
      element: (
        <Suspense fallback={<Loading />}>
          <PublicRoute>
            <LazySignUpScreen />
          </PublicRoute>
        </Suspense>
      ),
    },
    {
      path: paths.home,
      element: (
        <Suspense fallback={<Loading />}>
          <PrivateRoute>
            <Layout>
              <LazyHomeScreen />
            </Layout>
          </PrivateRoute>
        </Suspense>
      ),
      children: [
        {
          path: paths.createBlog,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyCreateBlogScreen />
            </Suspense>
          ),
        },
        {
          path: paths.blog,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyBlogScreen />
            </Suspense>
          ),
        },
        {
          path: paths.blogDetail,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyBlogDetailScreen />
            </Suspense>
          ),
        },

        {
          path: paths.whatsapp,
          element: (
            <Suspense fallback={<Loading />}>
              <WebRTCProvider enableTurnServer={vite_app_turn_server}>
                <LazyWhatsAppScreen />
              </WebRTCProvider>
            </Suspense>
          ),
        },

        {
          path: paths.pexels,
          element: (
            <Suspense fallback={<Loading />}>
              <WebRTCProvider>
                <LazyPexelsScreen />
              </WebRTCProvider>
            </Suspense>
          ),
        },

        {
          path: paths.search,
          element: (
            <Suspense fallback={<Loading />}>
              <LazySearchScreen />
            </Suspense>
          ),
        },

        {
          path: paths.userDetail,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyUserDetailScreen />
            </Suspense>
          ),
        },

        {
          path: paths.messenger,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyMessengerScreen />
            </Suspense>
          ),
        },

        {
          path: paths.audioPlayer,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyAudioPlayerScreen />
            </Suspense>
          ),
        },

        {
          path: paths.profile,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyProfileScreen />
            </Suspense>
          ),
        },
        {
          path: paths.changePassword,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyChangePasswordScreen />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: paths.spotify,
      element: (
        <LazySpotifyScreen />
      )
    },
    {
      path: paths.notFound,
      element: (
        <Suspense fallback={<Loading />}>
          <LazyNotFoundScreen />
        </Suspense>
      ),
    },
  ])

  return element
}

export default App
