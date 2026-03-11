import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    theme: 'dark',
    loading: false
  }),
  actions: {
    changeTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
    setLoading(status) {
      this.loading = status
    }
  }
})
