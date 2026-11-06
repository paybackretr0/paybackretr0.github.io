import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'
import { vReveal } from './directives/reveal'
import { vTilt } from './directives/tilt'
import { vSpotlight } from './directives/spotlight'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.directive('reveal', vReveal)
app.directive('tilt', vTilt)
app.directive('spotlight', vSpotlight)

app.mount('#app')
