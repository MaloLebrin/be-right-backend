import { useEnv } from '../env'

export function isProduction() {
  const { NODE_ENV } = useEnv()

  return NODE_ENV === 'production'
}
