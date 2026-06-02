import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdiMenu, mdiClose, mdiAccount, mdiLogout, mdiPlus, mdiPencil, mdiDelete, mdiEye, mdiStar } from '@mdi/js'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    values: {
      mdiMenu,
      mdiClose,
      mdiAccount,
      mdiLogout,
      mdiPlus,
      mdiPencil,
      mdiDelete,
      mdiEye,
      mdiStar
    }
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1976d2',
          secondary: '#424242',
          accent: '#82b1ff',
          error: '#ff5252',
          warning: '#ffc107',
          info: '#2196f3',
          success: '#4caf50'
        }
      }
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
