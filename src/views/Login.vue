<template>
  <div class="auth-container">
    <div class="auth-wrapper" :class="{ 'register-mode': isRegisterMode }">
      <div class="auth-card">
        <div v-if="showRegisterSuccess" class="success-overlay">
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
        <div class="left-panel">
          <div class="panel-content login-content">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M18 20V10M14 20V4M10 20v-6" />
              </svg>
            </div>
            <h1>露营装备租赁</h1>
            <p>探索户外，畅享自然，优质露营装备等你来租</p>
            <div class="features">
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>品质保证</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span>便捷租赁</span>
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>全天服务</span>
              </div>
            </div>
          </div>

          <div class="panel-content register-content">
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
          <div class="form-card login-card">
            <h2>欢迎回来</h2>
            <p>登录您的账户</p>
            <form @submit.prevent="handleLogin" class="form">
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="用户名"
                  required
                />
              </div>
              <span v-if="loginErrors.username" class="error-message">{{ loginErrors.username }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="密码"
                  required
                />
                <span class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21" />
                  </svg>
                </span>
              </div>
              <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
              <div class="input-group captcha-group">
                <input
                  v-model="loginForm.captcha_code"
                  type="text"
                  placeholder="验证码"
                  maxlength="4"
                />
                <img :src="captchaImage" alt="验证码" class="captcha-img" @click="refreshCaptcha" />
              </div>
              <span v-if="loginErrors.captcha" class="error-message">{{ loginErrors.captcha }}</span>
              <div class="form-options">
                <label class="checkbox">
                  <input type="checkbox" v-model="loginForm.rememberMe" />
                  <span>记住我</span>
                </label>
                <span class="forgot-link">忘记密码?</span>
              </div>
              <span v-if="loginErrors.other" class="error-message">{{ loginErrors.other }}</span>
              <button type="submit" class="submit-btn" :disabled="loginLoading">
                <span v-if="loginLoading">登录中...</span>
                <span v-else>登录</span>
              </button>
            </form>
            <div class="switch-btn" @click="toggleMode">
              <span>还未注册?</span>
              <span class="highlight">立即注册</span>
            </div>
          </div>

          <div class="form-card register-card">
            <h2>立即注册</h2>
            <p>创建您的账户</p>
            <form @submit.prevent="handleRegister" class="form">
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  v-model="registerForm.username"
                  type="text"
                  placeholder="用户名"
                  required
                  @blur="onRegisterUsernameBlur"
                />
              </div>
              <span v-if="registerErrors.username" class="error-message">{{ registerErrors.username }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  placeholder="密码"
                  required
                  @blur="onRegisterPasswordBlur"
                />
                <span class="toggle-password" @click="showRegisterPassword = !showRegisterPassword">
                  <svg v-if="!showRegisterPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21" />
                  </svg>
                </span>
              </div>
              <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  v-model="registerForm.re_password"
                  :type="showRegisterConfirmPassword ? 'text' : 'password'"
                  placeholder="确认密码"
                  required
                  @blur="onRegisterConfirmPasswordBlur"
                />
                <span class="toggle-password" @click="showRegisterConfirmPassword = !showRegisterConfirmPassword">
                  <svg v-if="!showRegisterConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m0 0L21 21" />
                  </svg>
                </span>
              </div>
              <span v-if="registerErrors.re_password" class="error-message">{{ registerErrors.re_password }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  v-model="registerForm.phone"
                  type="tel"
                  placeholder="手机号"
                  required
                  @blur="onRegisterPhoneBlur"
                />
              </div>
              <span v-if="registerErrors.phone" class="error-message">{{ registerErrors.phone }}</span>
              <div class="input-group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  v-model="registerForm.email"
                  type="email"
                  placeholder="邮箱"
                  required
                  @blur="onRegisterEmailBlur"
                />
              </div>
              <span v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</span>
              <span v-if="registerErrors.other" class="error-message">{{ registerErrors.other }}</span>
              <button type="submit" class="submit-btn" :disabled="registerLoading">
                <span v-if="registerLoading">注册中...</span>
                <span v-else>注册</span>
              </button>
            </form>
            <div class="switch-btn" @click="toggleMode">
              <span>已有账号?</span>
              <span class="highlight">立即登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="login">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login as loginApi, register as registerApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import { storage } from '@/utils/storage'
// 引入路由
const router = useRouter()
// 引入用户状态目的是为了在登录成功后，将用户信息存储到用户状态中
const userStore = useUserStore()
// 引入动画id
let animationId: number
// 登录注册模式
const isRegisterMode = ref(false)
// 显示密码
const showPassword = ref(false)
// 显示注册密码
const showRegisterPassword = ref(false)
// 显示注册确认密码
const showRegisterConfirmPassword = ref(false)
// 登录加载状态
const loginLoading = ref(false)
// 注册加载状态
const registerLoading = ref(false)
// 注册成功状态
const showRegisterSuccess = ref(false)
// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
  captcha_key: '',
  captcha_code: ''
})
// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  re_password: '',
  phone: '',
  email: ''
})
// 登录错误信息
const loginErrors = reactive({
  username: '',
  password: '',
  captcha: '',
  other: ''
})
// 验证码图片
const captchaImage = ref('')
// 刷新验证码
async function refreshCaptcha() {
  try {
    const response: { image: string; key: string } = await request.get('/users/captcha/')
    captchaImage.value = response.image
    loginForm.captcha_key = response.key
    loginForm.captcha_code = ''
    loginErrors.captcha = ''
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}
// 注册错误信息
const registerErrors = reactive({
  username: '',
  password: '',
  re_password: '',
  phone: '',
  email: '',
  other: ''
})

// 切换登录注册模式
function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  // 切换模式时，验证码图片需要刷新
  refreshCaptcha()
  // 切换模式时，清空错误信息
// 加类型断言的原因是为了告诉 TypeScript 我们知道 loginErrors 是一个对象，而不是一个字符串
  Object.keys(loginErrors).forEach(key => loginErrors[key as keyof typeof loginErrors] = '')
  Object.keys(registerErrors).forEach(key => registerErrors[key as keyof typeof registerErrors] = '')
}

// 验证用户名
function validateUsername(username: string): string {
  if (!username) return ''
  if (username.length < 6) return '用户名至少需要6个字符'
  if (username.length > 12) return '用户名最多12个字符'
  if (!/^[a-zA-Z0-9]+$/.test(username)) return '用户名只能包含字母和数字'
  return ''
}

// 验证密码
function validatePassword(password: string): string {
  if (!password) return ''
  if (password.length < 6) return '密码至少需要6个字符'
  return ''
}

// 验证手机号
function validatePhone(phone: string): string {
  if (!phone) return ''
  if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入有效的11位手机号'
  return ''
}

// 验证邮箱
function validateEmail(email: string): string {
  if (!email) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址'
  return ''
}

// 验证确认密码
function validateConfirmPassword(password: string, rePassword: string): string {
  if (!rePassword) return ''
  if (password !== rePassword) return '两次输入的密码不一致'
  return ''
}

// 注册时验证用户名
function onRegisterUsernameBlur() {
  registerErrors.username = validateUsername(registerForm.username)
}

// 注册时验证密码
function onRegisterPasswordBlur() {
  registerErrors.password = validatePassword(registerForm.password)
}

// 注册时验证确认密码
function onRegisterConfirmPasswordBlur() {
  registerErrors.re_password = validateConfirmPassword(registerForm.password, registerForm.re_password)
}

// 注册时验证手机号
function onRegisterPhoneBlur() {
  registerErrors.phone = validatePhone(registerForm.phone)
}

// 注册时验证邮箱
function onRegisterEmailBlur() {
  registerErrors.email = validateEmail(registerForm.email)
}
// 登录
async function handleLogin() {
  //清空登录错误信息
  Object.keys(loginErrors).forEach(key => loginErrors[key as keyof typeof loginErrors] = '')
  // 登录时显示加载状态
  loginLoading.value = true
  try {
    //登录请求
    const loginResponse = await loginApi({
      username: loginForm.username,
      password: loginForm.password,
      captcha_key: loginForm.captcha_key,
      captcha_code: loginForm.captcha_code
    })
    // 登陆成功将 access_token 存储到本地存储
    storage.set('access_token', loginResponse.access)
    // 登陆成功将 refresh_token 存储到本地存储
    storage.set('refresh_token', loginResponse.refresh)
    // 登陆成功获取用户信息
    const userResponse = await getUserInfoApi()
    // 登陆成功将用户信息存储到本地存储
    storage.set('user', JSON.stringify(userResponse))
    // 登陆成功将用户信息存储到用户状态
    userStore.login({ access_token: loginResponse.access,
      refresh_token: loginResponse.refresh,
       user: userResponse })
    // 登陆成功后，跳转到首页
    router.push({ name: 'home' })
  } catch (error: any) {
    /// 登录失败时，刷新验证码
    refreshCaptcha()
    /// 登录失败时，根据错误信息设置错误状态
    const data = error?.response?.data
    if (data) {
      if (data.message) {
        if (data.message.includes('验证码')) {
          loginErrors.captcha = data.message
        } else {
          loginErrors.other = data.message
        }
      } else if (data.detail) {
        loginErrors.other = data.detail
      } else {
        Object.keys(data).forEach(key => {
          if (key in loginErrors) {
            loginErrors[key as keyof typeof loginErrors] = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key])
          }
        })
      }
    } else {
      loginErrors.other = '登录失败，请检查用户名和密码。'
    }
  } finally {
    loginLoading.value = false
  }
}
// 注册
async function handleRegister() {
  // 清空注册错误信息
  Object.keys(registerErrors).forEach(key => registerErrors[key as keyof typeof registerErrors] = '')

  if (registerForm.password !== registerForm.re_password) {
    registerErrors.re_password = '两次输入的密码不一致'
    return
  }
  registerLoading.value = true
  try {
    await registerApi({
      username: registerForm.username,
      password: registerForm.password,
      re_password: registerForm.re_password,
      phone: registerForm.phone,
      email: registerForm.email
    })
    //显示注册成功提示
    showRegisterSuccess.value = true
    Object.keys(registerForm).forEach(key => registerForm[key as keyof typeof registerForm] = '')
    setTimeout(() => {
      showRegisterSuccess.value = false
      isRegisterMode.value = false
    }, 500)
  } catch (error: any) {
    const data = error?.response?.data
    if (data) {
      Object.keys(data).forEach(key => {
        if (key in registerErrors) {
          registerErrors[key as keyof typeof registerErrors] = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key])
        }
      })
    } else {
      registerErrors.other = '注册失败，请重试'
    }
  } finally {
    registerLoading.value = false
  }
}
//挂载时刷新验证码和用户信息
onMounted(() => {
  refreshCaptcha()
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
  background: url('https://images.unsplash.com/photo-1605138951852-8fd7ad8ee098?q=90&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center fixed;
  background-size: 100% 100%;
  animation: backgroundZoom 20s ease-in-out infinite;
}

@keyframes backgroundZoom {
  0% {
    background-size: 100% 100%;
    filter: brightness(0.95);
  }
  50% {
    background-size: 110% 110%;
    filter: brightness(1);
  }
  100% {
    background-size: 100% 100%;
    filter: brightness(0.95);
  }
}

.auth-wrapper {
  width: 100%;
  max-width: 1100px;
  position: relative;
  z-index: 1;
}

.auth-card {
  width: 100%;
  height: auto;
  min-height: 700px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.left-panel {
  flex: 1;
  background: rgba(14, 165, 233, 0.88);
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.88) 0%, rgba(6, 182, 212, 0.88) 50%, rgba(16, 185, 129, 0.88) 100%);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  transition: transform 0.5s ease-in-out;
}

.register-content {
  transform: translateX(100%);
}

.register-mode .login-content {
  transform: translateX(-100%);
}

.register-mode .register-content {
  transform: translateX(0);
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
  background: rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  transition: transform 0.5s ease-in-out;
}

.register-card {
  transform: translateX(100%);
}

.register-mode .login-card {
  transform: translateX(-100%);
}

.register-mode .register-card {
  transform: translateX(0);
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
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  color: #1f2937;
  outline: none;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.7);
}

.input-group input:focus {
  border-bottom-color: #8b5cf6;
}

.input-group input::placeholder {
  color: #ccc;
}

.toggle-password {
  position: absolute;
  right: 0;
  cursor: pointer;
  color: #999;
  padding: 8px;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.toggle-password:hover {
  color: #8b5cf6;
}

.error-message {
  font-size: 12px;
  color: #f97316;
  margin-top: 4px;
  min-height: 18px;
}

.captcha-group {
  display: flex;
  gap: 10px;
}

.captcha-group input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.captcha-img:hover {
  border-color: #8b5cf6;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox input {
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
}

.forgot-link {
  font-size: 14px;
  color: #8b5cf6;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
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

.switch-btn {
  display: flex;
  gap: 8px;
  margin-top: 32px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.switch-btn .highlight {
  color: #8b5cf6;
  font-weight: 600;
}

.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
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