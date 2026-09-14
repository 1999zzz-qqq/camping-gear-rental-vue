export const storage = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string) {
    const val = localStorage.getItem(key)
    if (!val) return null
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}