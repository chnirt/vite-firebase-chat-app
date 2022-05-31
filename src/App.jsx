import { lazy } from 'react'
import { useRoutes } from 'react-router-dom'

import './App.css'
import { Layout } from './layout'
import { PublicRoute, PrivateRoute } from './helpers'

const LazySignInScreen = lazy(() => import('./pages/SignIn'))
const LazySignUpScreen = lazy(() => import('./pages/SignUp'))

const LazyHomeScreen = lazy(() => import('./pages/Home'))
const LazyProfileScreen = lazy(() => import("./pages/Profile"));
const LazyChangePasswordScreen = lazy(() => import("./pages/ChangePassword"));

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
        <PublicRoute>
          <LazySignInScreen />
        </PublicRoute>
      ),
    },
    {
      path: '/register',
      element: (
        <PublicRoute>
          <LazySignUpScreen />
        </PublicRoute>
      ),
    },
    {
      path: '/',
      element: (
        <PrivateRoute>
          <Layout>
            <LazyHomeScreen />
          </Layout>
        </PrivateRoute>
      ),
      children: [
        {
          path: 'profile',
          element: <LazyProfileScreen />,
        },
        {
          path: 'change-password',
          element: <LazyChangePasswordScreen />,
        },
      ],
    },
    { path: '*', element: <LazyNotFoundScreen /> },
  ])

  return element
}

export default App
