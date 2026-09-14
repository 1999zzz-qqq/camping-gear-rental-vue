<template>
  <div class="auth-container">
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    <div v-if="showSuccess" class="success-overlay">
      <div class="success-card">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>注册成功</h3>
        <p>即将跳转到登录页面...</p>
      </div>
    </div>
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="left-panel">
          <div class="panel-content">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M18 20V10M14 20V4M10 20v-6" />
              </svg>
            </div>
            <h1>开始探索</h1>
            <p>注册账户，开启您的户外冒险之旅</p>
            <div class="features">
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>专属优惠</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>积分奖励</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>订单管理</span>
              </div>
            </div>
          </div>
        </div>
        <div class="right-panel">
          <div class="form-card">
            <h2>立即注册</h2>
            <p>创建您的账户</p>
            <form @submit.prevent="handleRegister" class="form">
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="用户名"
                  required
                  @blur="onUsernameBlur"
                />
              </div>
              <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="密码"
                  required
                  @blur="onPasswordBlur"
                />
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  v-model="form.re_password"
                  type="password"
                  placeholder="确认密码"
                  required
                  @blur="onConfirmPasswordBlur"
                />
              </div>
              <span v-if="errors.re_password" class="error-message">{{ errors.re_password }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="手机号"
                  required
                  @blur="onPhoneBlur"
                />
              </div>
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="邮箱"
                  required
                  @blur="onEmailBlur"
                />
              </div>
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              <span v-if="errors.other" class="error-message">{{ errors.other }}</span>
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading">注册中...</span>
                <span v-else>注册</span>
              </button>
            </form>
            <div class="switch-link">
              <span>已有账号?</span>
              <router-link to="/login">立即登录</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Register">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { register as registerApi } from '@/api/auth'

const router = useRouter()
// 注册背景粒子动画
const particleCanvas = ref<HTMLCanvasElement | null>(null)
// 注册背景粒子动画ID
let animationId: number
// 注册表单数据
const form = reactive({
  username: '',
  password: '',
  re_password: '',
  phone: '',
  email: ''
})
// 验证错误信息
const errors = reactive({
  username: '',
  password: '',
  re_password: '',
  phone: '',
  email: '',
  other: ''
})
// 注册加载状态
const loading = ref(false)
// 注册成功状态
const showSuccess = ref(false)
// 验证用户名格式
function validateUsername(username: string): string {
  if (!username) return ''
  if (username.length < 6) return '用户名至少需要6个字符'
  if (username.length > 12) return '用户名最多12个字符'
  if (!/^[a-zA-Z0-9]+$/.test(username)) return '用户名只能包含字母和数字'
  return ''
}
// 验证密码格式
function validatePassword(password: string): string {
  if (!password) return ''
  if (password.length < 6) return '密码至少需要6个字符'
  return ''
}
// 验证手机号格式
function validatePhone(phone: string): string {
  if (!phone) return ''
  if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入有效的11位手机号'
  return ''
}
// 验证邮箱格式
function validateEmail(email: string): string {
  if (!email) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址'
  return ''
}
// 验证确认密码是否一致

function validateConfirmPassword(password: string, rePassword: string): string {
  if (!rePassword) return ''
  if (password !== rePassword) return '两次输入的密码不一致'
  return ''
}
// 注册表单验证
function onUsernameBlur() {
  errors.username = validateUsername(form.username)
}
// 密码验证
function onPasswordBlur() {
  errors.password = validatePassword(form.password)
}
// 确认密码验证
function onConfirmPasswordBlur() {
  errors.re_password = validateConfirmPassword(form.password, form.re_password)
}
// 手机号验证
function onPhoneBlur() {
  errors.phone = validatePhone(form.phone)
}
// 邮箱验证
function onEmailBlur() {
  errors.email = validateEmail(form.email)
}
// 注册提交事件
async function handleRegister() {
  // 清空所有错误信息
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
  // 验证用户名
  errors.username = validateUsername(form.username)
  // 验证密码
  errors.password = validatePassword(form.password)
  // 验证确认密码
  errors.re_password = validateConfirmPassword(form.password, form.re_password)
  // 验证手机号
  errors.phone = validatePhone(form.phone)
  // 验证邮箱
  errors.email = validateEmail(form.email)
  // 验证是否有错误信息
  if (errors.username || errors.password || errors.re_password || errors.phone || errors.email) {
    return
  }
  // 注册提交事件，设置加载状态为true
  loading.value = true
  try {
    await registerApi({
      username: form.username,
      password: form.password,
      re_password: form.re_password,
      phone: form.phone,
      email: form.email
    })
    showSuccess.value = true
    setTimeout(() => {
      router.push({name: 'Login'})
    }, 500)
  } catch (error: any) {
    // 拿到错误信息
    const data = error?.response?.data
    if (data) {
      // 遍历错误信息，将错误信息赋值给对应的错误信息
           Object.keys(data).forEach(key => {
        if (key in errors) {
          errors[key as keyof typeof errors] = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key])
        }
      })
    } else {
      errors.other = '注册失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
// 注册背景粒子动画
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
}
// 初始化粒子动画
function initParticles() {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
// 初始化粒子动画
  const particles: Particle[] = []
  const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? 'rgba(139, 92, 246,' : 'rgba(99, 102, 241,'
    })
  }

  function animate() {
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

    particles.forEach((p, index) => {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0 || p.x > canvas!.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas!.height) p.vy *= -1

      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx!.fillStyle = p.color + p.alpha + ')'
      ctx!.fill()

      particles.slice(index + 1).forEach(p2 => {
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 120) {
          ctx!.beginPath()
          ctx!.moveTo(p.x, p.y)
          ctx!.lineTo(p2.x, p2.y)
          ctx!.strokeStyle = p.color + (0.15 * (1 - distance / 120)) + ')'
          ctx!.lineWidth = 0.5
          ctx!.stroke()
        }
      })
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

function handleResize() {
  const canvas = particleCanvas.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}
// 组件挂载时初始化粒子动画
onMounted(() => {
  initParticles()
  window.addEventListener('resize', handleResize)
})
// 组件卸载时取消动画动画
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #c3cfe2 100%);
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.auth-wrapper {
  width: 100%;
  max-width: 1000px;
  position: relative;
  z-index: 1;
}

.auth-card {
  width: 100%;
  height: auto;
  min-height: 520px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%);
  position: relative;
  overflow: hidden;
}

.panel-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.logo {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  font-size: 32px;
}

.left-panel h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.left-panel p {
  font-size: 15px;
  opacity: 0.9;
  text-align: center;
  margin-bottom: 40px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
}

.feature-item svg {
  width: 28px;
  height: 22px;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  background: white;
  position: relative;
  overflow: hidden;
}

.form-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.form-card h2 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.form-card p {
  font-size: 14px;
  color: #999;
  margin-bottom: 36px;
}

.form {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group svg {
  width: 22px;
  height: 22px;
  color: #999;
  position: absolute;
  left: 0;
}

.input-group input {
  width: 100%;
  padding: 16px 0 16px 36px;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  font-size: 16px;
  color: #333;
  outline: none;
  transition: border-color 0.3s ease;
  background: transparent;
}

.input-group input:focus {
  border-bottom-color: #8b5cf6;
}

.input-group input::placeholder {
  color: #ccc;
}

.error-message {
  font-size: 12px;
  color: #f97316;
  margin-top: 4px;
  min-height: 18px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(139, 92, 246, 0.5);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-link {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  font-size: 14px;
  color: #666;
}

.switch-link router-link {
  color: #8b5cf6;
  font-weight: 600;
  text-decoration: none;
}

.switch-link router-link:hover {
  text-decoration: underline;
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.success-card h3 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.success-card p {
  font-size: 16px;
  color: #999;
}
</style>