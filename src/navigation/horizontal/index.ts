// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import Upload from 'mdi-material-ui/Upload'
import ShieldOutline from 'mdi-material-ui/ShieldOutline'

// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => [
  {
    title: 'Home',
    icon: HomeOutline,
    path: '/home'
  },
  {
    title: 'Create Contract',
    icon: Upload,
    path: '/second-page'
  }
]

export default navigation
