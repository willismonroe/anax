import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router'
import MainContentVue from './components/MainContent.vue'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/anax/',
            name: 'Main',
            component: MainContentVue
        }
    ]
})

const app = createApp(App)
app.use(router)

app.mount('#app')
