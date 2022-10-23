/* eslint-disable @typescript-eslint/no-unused-vars */
// ** React Imports
import { ReactNode, useContext } from 'react'
// ** Types
import { NavSectionTitle } from 'src/@core/layouts/types'
// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

interface Props {
  children: ReactNode
  navTitle?: NavSectionTitle
}

const CanViewNavSectionTitle = (props: Props) => {
  // ** Props
  const { children, navTitle } = props

  // ** Hook
  const ability = useContext(AbilityContext)

  return <>{children}</>

  // return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null
}

export default CanViewNavSectionTitle
