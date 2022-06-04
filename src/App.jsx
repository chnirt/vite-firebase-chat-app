import { lazy, Suspense } from 'react'
import { useRoutes } from 'react-router-dom'

import './App.css'
import { Layout } from './layout'
import { PublicRoute, PrivateRoute } from './helpers'
import { Loading } from './components'
import { WebRTCProvider } from './context'

const LazySignInScreen = lazy(() => import('./pages/SignIn'))
const LazySignUpScreen = lazy(() => import('./pages/SignUp'))

const LazyHomeScreen = lazy(() => import('./pages/Home'))

const LazyCreateBlogScreen = lazy(() => import('./pages/CreateBlog'))
const LazyBlogScreen = lazy(() => import('./pages/Blog'))
const LazyBlogDetailScreen = lazy(() => import('./pages/BlogDetail'))

const LazyWhatsAppScreen = lazy(() => import('./pages/WhatsApp2'))

const LazyMessengerScreen = lazy(() => import('./pages/Messenger'))
const LazyProfileScreen = lazy(() => import('./pages/Profile'))
const LazyChangePasswordScreen = lazy(() => import('./pages/ChangePassword'))

const LazyNotFoundScreen = lazy(() => import('./pages/NotFound'))

function App() {
  // We removed the <BrowserRouter> element from App because the
  // useRoutes hook needs to be in the context of a <BrowserRouter>
  // element. This is a common pattern with React Router apps that
  // are rendered in different environments. To render an <App>,
  // you'll need to wrap it in your own <BrowserRouter> element.
  let element = useRoutes([
    // A route object has the same properties as a <Route>
    // element. The `children` is just an array of child routes.
    {
      path: '/login',
      element: (
        <Suspense fallback={<Loading />}>
          <PublicRoute>
            <LazySignInScreen />
          </PublicRoute>
        </Suspense>
      ),
    },
    {
      path: '/register',
      element: (
        <Suspense fallback={<Loading />}>
          <PublicRoute>
            <LazySignUpScreen />
          </PublicRoute>
        </Suspense>
      ),
    },
    {
      path: '/',
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
          path: 'create-blog',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyCreateBlogScreen />
            </Suspense>
          ),
        },
        {
          path: 'blog',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyBlogScreen />
            </Suspense>
          ),
        },
        {
          path: 'blog/:blogId',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyBlogDetailScreen />
            </Suspense>
          ),
        },

        {
          path: 'whatsapp',
          element: (
            <Suspense fallback={<Loading />}>
              <WebRTCProvider>
                <LazyWhatsAppScreen />
              </WebRTCProvider>
            </Suspense>
          ),
        },

        {
          path: 'messenger',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyMessengerScreen />
            </Suspense>
          ),
        },
        {
          path: 'profile',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyProfileScreen />
            </Suspense>
          ),
        },
        {
          path: 'change-password',
          element: (
            <Suspense fallback={<Loading />}>
              <LazyChangePasswordScreen />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<Loading />}>
          <LazyNotFoundScreen />{' '}
        </Suspense>
      ),
    },
  ])

  return element
}

export default App
