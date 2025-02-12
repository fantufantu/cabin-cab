import { bootstrap } from '@aiszlab/bee'
import './styles.css'
import 'musae/styles.css'
import Application from './application'
import { lazy } from 'react'

const Home = lazy(() => import('./pages/home'))

bootstrap({
  selectors: '#root',
  render: Application,
  routes: [
    {
      path: '/',
      element: <Home />
    }
  ]
})
