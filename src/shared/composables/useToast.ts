import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastState {
  message: string
  type: ToastType
}

const toast = ref<ToastState | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info') => {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { message, type }
    toastTimer = setTimeout(() => {
      toast.value = null
    }, 4000)
  }

  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const info = (message: string) => showToast(message, 'info')
  const warning = (message: string) => showToast(message, 'warning')

  return {
    toast,
    showToast,
    success,
    error,
    info,
    warning
  }
}
