import { Key } from './types'

export const filterValidKeys = (keys: Key[]) => {
  return keys.filter(key => key.keyStatus == 'stock')
}
