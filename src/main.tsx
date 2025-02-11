import { bootstrap } from '@aiszlab/bee'
import './styles.css'
import 'musae/styles.css'
import Application from './application'

bootstrap({
  selectors: '#root',
  render: Application
})
