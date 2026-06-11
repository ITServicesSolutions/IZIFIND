import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/global.scss'
import './assets/style.css'
import './assets/styles/admin.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
