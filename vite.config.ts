import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { execFileSync } from 'child_process'

function versionPlugin() {
  let version = ''
  return {
    name: 'version-json',
    configResolved(config: { define?: Record<string, string> }) {
      const timestamp = Date.now()
      let commitSha = 'unknown'
      let branch = 'unknown'
      try {
        commitSha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf-8' }).trim()
        branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf-8' }).trim()
      } catch { /* not in git */ }
      version = `${commitSha}-${timestamp}`
      const versionData = JSON.stringify({
        version,
        buildTime: new Date(timestamp).toISOString(),
        commitSha,
        branch,
      })
      writeFileSync('public/version.json', versionData + '\n')
      // Inject __APP_VERSION__ into the build
      if (config.define) {
        config.define['__APP_VERSION__'] = JSON.stringify(version)
      }
    },
    config() {
      return {
        define: {
          __APP_VERSION__: JSON.stringify('dev'),
        },
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin()],
})
