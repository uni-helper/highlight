import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp(): Record<string, unknown> {
  const app = createSSRApp(App)
  return {
    app,
  }
}
