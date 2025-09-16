import './assets/main.css'
import HighlightJSVuePlugin from '@highlightjs/vue-plugin';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())

app.use(HighlightJSVuePlugin)
app.use(router)

app.mount('#app')
