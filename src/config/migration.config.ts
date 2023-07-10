import { createAppSource } from '../utils'

const migrationSources = createAppSource()

migrationSources.initialize()
  .then(async () => {
    console.info('Data Source has been initialized!')
  })
  .catch(err => {
    console.error('Error during Data Source initialization:', err)
  })

export default migrationSources
