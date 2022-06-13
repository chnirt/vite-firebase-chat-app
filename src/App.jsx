// https://gist.github.com/codediodeio/513bf77ee45be6d38d27868f5345a002
import { lazy, Suspense, useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'

import './App.css'
import { Layout } from './layout'
import { PublicRoute, PrivateRoute } from './helpers'
import { Loading } from './components'
import { WebRTCProvider } from './context'
import { analytics } from './firebase'
import { getRemoteAll, getRemoteValue, refreshRemote } from './firebase/remoteConfig'
import { paths } from './constants'
import { setUpBaseName } from './utils'

const LazySignInScreen = lazy(() => import('./pages/SignIn'))
const LazySignUpScreen = lazy(() => import('./pages/SignUp'))

const LazyHomeScreen = lazy(() => import('./pages/Home'))

const LazyCreateBlogScreen = lazy(() => import('./pages/CreateBlog'))
const LazyBlogScreen = lazy(() => import('./pages/Blog'))
const LazyBlogDetailScreen = lazy(() => import('./pages/BlogDetail'))

const LazyWhatsAppScreen = lazy(() => import('./pages/WhatsApp2'))

const LazyPexelsScreen = lazy(() => import('./pages/Pexels'))

const LazyMessengerScreen = lazy(() => import('./pages/Messenger'))

const LazyProfileScreen = lazy(() => import('./pages/Profile'))
const LazyChangePasswordScreen = lazy(() => import('./pages/ChangePassword'))

const LazyNotFoundScreen = lazy(() => import('./pages/NotFound'))

setUpBaseName()

function App() {
  let location = useLocation()

  useEffect(() => {
    refreshRemote()

    // const allRemoteValue = getRemoteAll()
    // const appTitle = getRemoteValue('vite_app_title', 'string')
    // const darkMode = getRemoteValue('dark_mode', 'boolean')
    // const timeout = getRemoteValue('timeout', 'number')

    // console.log(allRemoteValue)
    // console.log(typeof appTitle, appTitle)
    // console.log(typeof darkMode, darkMode)
    // console.log(typeof timeout, timeout)

    if (typeof analytics === 'function') {
      const page_path = location.pathname + location.search
      analytics().setCurrentScreen(page_path)
      analytics().logEvent('page_view', { page_path })
    }
  }, [location, refreshRemote, getRemoteAll, getRemoteValue])

  // We removed the <BrowserRouter> element from App because the
  // useRoutes hook needs to be in the context of a <BrowserRouter>
  // element. This is a common pattern with React Router apps that
  // are rendered in different environments. To render an <App>,
  // you'll need to wrap it in your own <BrowserRouter> element.
  // let element1 = useRoutes([
  //   {
  //     path: '/',
  //     element: <Navigate to="/👾/login" />,
  //     children: [
  //       {
  //         path: paths.login,
  //         element: (
  //           <Suspense fallback={<Loading />}>
  //             {/* <PublicRoute> */}
  //             <LazySignInScreen />
  //             {/* </PublicRoute> */}
  //           </Suspense>
  //         ),
  //       },
  //     ],
  //   },
  // ])
  // return element1
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
              <WebRTCProvider>
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
          path: paths.messenger,
          element: (
            <Suspense fallback={<Loading />}>
              <LazyMessengerScreen />
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
