import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
//使用pinia
app.use(createPinia())
//使用路由
app.use(router)
// 挂载应用
app.mount('#app')
