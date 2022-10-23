// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import Upload from 'mdi-material-ui/Upload'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
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
}

export default navigation
