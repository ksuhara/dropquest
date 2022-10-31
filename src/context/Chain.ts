/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChainId } from '@thirdweb-dev/sdk'
import { createContext } from 'react'

const ChainContext = createContext({
  selectedChain: ChainId.Mumbai,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedChain: (chain: ChainId) => {}
})

export default ChainContext
