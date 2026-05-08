<template>
  <div class="flex items-center justify-center min-h-screen bg-linear-to-br from-[#121212] to-[#1a1a2e] text-white p-4 font-sans">
    <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl animate-fade-in-up">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold m-0 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Selty</h1>
        <p class="text-slate-400 mt-2 text-sm">Smart Follow-up System</p>
      </div>

      <form @submit.prevent="handleAuth" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-semibold text-slate-300">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="tu@email.com" 
            required 
            class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-base transition-all duration-200 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/25 focus:bg-black/40"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-semibold text-slate-300">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
            class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-base transition-all duration-200 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/25 focus:bg-black/40"
          />
        </div>

        <button type="submit" class="mt-2 bg-gradient-to-br from-blue-400 to-cyan-400 text-white border-none rounded-xl p-4 text-base font-semibold cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(79,172,254,0.6)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed" :disabled="loading">
          {{ loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse') }}
        </button>

        <button type="button" class="bg-transparent border-none text-slate-400 text-sm cursor-pointer transition-colors duration-200 hover:text-white" @click="isLogin = !isLogin" :disabled="loading">
          {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
        </button>

        <p v-if="error" class="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/shared/infrastructure/supabase/client'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const handleAuth = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (isLogin.value) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (signInError) throw signInError
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (signUpError) throw signUpError
      alert('Registro exitoso. Revisa tu correo o inicia sesión directamente (si el autoconfirm está activado).')
      isLogin.value = true
      return
    }

    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Error en la autenticación'
  } finally {
    loading.value = false
  }
}
</script>
