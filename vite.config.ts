import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { env } from 'node:process'

const getBasePath = () => {
  if (env.VITE_BASE_PATH) {
    return env.VITE_BASE_PATH
  }

  const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1]

  if (!repositoryName || repositoryName.endsWith('.github.io')) {
    return '/'
  }

  return `/${repositoryName}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
