// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import Upload from 'mdi-material-ui/Upload'
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
    path: '/create-contract'
  }
]

export default navigation
