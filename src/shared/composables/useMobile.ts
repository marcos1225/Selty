import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)

function update() {
  isMobile.value = window.innerWidth < 768
}

let listeners = 0

export function useMobile() {
  onMounted(() => {
    if (listeners === 0) {
      update()
      window.addEventListener('resize', update)
    }
    listeners++
  })

  onUnmounted(() => {
    listeners--
    if (listeners === 0) {
      window.removeEventListener('resize', update)
    }
  })

  return { isMobile }
}
