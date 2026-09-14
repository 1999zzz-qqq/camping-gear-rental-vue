<template>
  <div class="profile">
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-info">
          <h2 class="username">{{ user?.username }}</h2>
          <p class="user-id">用户ID: {{ user?.id }}</p>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">基本信息</h3>
          <button v-if="!isEditing" class="edit-btn" @click="startEdit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            修改
          </button>
        </div>

        <div v-if="!isEditing" class="info-view">
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ user?.username || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ user?.phone || '未填写' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ user?.email || '未填写' }}</span>
          </div>
        </div>

        <form v-else class="info-form" @submit.prevent="handleUpdate">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              class="form-input" 
              :value="user?.username" 
              disabled
            />
          </div>
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input 
              type="tel" 
              class="form-input" 
              v-model="formData.phone" 
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              type="email" 
              class="form-input" 
              v-model="formData.email" 
              placeholder="请输入邮箱"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="cancelEdit">取消</button>
            <button type="submit" class="save-btn">保存修改</button>
          </div>
        </form>
      </div>

      <div class="password-card">
        <div class="card-header">
          <h3 class="card-title">修改密码</h3>
          <button v-if="!isChangingPassword" class="edit-btn" @click="startChangePassword">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            修改
          </button>
        </div>

        <form v-if="isChangingPassword" class="password-form" @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label class="form-label">原密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="passwordForm.old_password" 
              placeholder="请输入原密码"
            />
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="passwordForm.new_password" 
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="passwordForm.confirm_password" 
              placeholder="请再次输入新密码"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="cancelChangePassword">取消</button>
            <button type="submit" class="save-btn">确认修改</button>
          </div>
        </form>
      </div>

      <div class="menu-card">
        <div class="menu-item" @click="$router.push('/orders')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>我的订单</span>
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div class="menu-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 19.5a2.121 2.121 0 0 1-3-3L16.5 3.5z"></path>
          </svg>
          <span>收藏夹</span>
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div class="menu-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>帮助中心</span>
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div class="menu-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>设置</span>
          <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <div class="logout-card">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="custom-modal" @click.stop>
        <div class="modal-icon" :class="modalType">
          <svg v-if="modalType === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 class="modal-title">{{ modalTitle }}</h3>
        <p class="modal-message">{{ modalMessage }}</p>
        <button class="modal-confirm" @click="confirmModal">{{ modalButtonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Profile">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types'
import { getUserInfo, updateUserInfo, changePassword } from '@/api/user'
import { logout } from '@/api/auth'

const router = useRouter()
const user = ref<User | null>(null)
const isEditing = ref(false)
const isChangingPassword = ref(false)
const showModal = ref(false)
const modalType = ref<'success' | 'error'>('success')
const modalTitle = ref('')
const modalMessage = ref('')
const modalButtonText = ref('确定')
const modalCallback = ref<(() => void) | null>(null)

const formData = reactive({
  phone: '',
  email: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

async function loadUserInfo() {
  try {
    user.value = await getUserInfo()
    if (user.value) {
      formData.phone = user.value.phone || ''
      formData.email = user.value.email || ''
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}
// 开始编辑
function startEdit() {
  isEditing.value = true
}
// 取消编辑
function cancelEdit() {
  isEditing.value = false
  if (user.value) {
    formData.phone = user.value.phone || ''
    formData.email = user.value.email || ''
  }
}
// 更新用户信息
async function handleUpdate() {
  try {
    await updateUserInfo(formData)
    showCustomModal('success', '更新成功', '信息更新成功', '确定', () => {
      isEditing.value = false
      loadUserInfo()
    })
  } catch (error) {
    console.error('更新信息失败:', error)
    showCustomModal('error', '更新失败', '信息更新失败，请重试', '确定')
  }
}

function startChangePassword() {
  isChangingPassword.value = true
}

function cancelChangePassword() {
  isChangingPassword.value = false
  passwordForm.old_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
}

async function handleChangePassword() {
  if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
    showCustomModal('error', '验证失败', '新密码至少需要6位', '确定')
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    showCustomModal('error', '验证失败', '两次输入的新密码不一致', '确定')
    return
  }
  try {
    await changePassword(passwordForm)
    showCustomModal('success', '修改成功', '密码修改成功，请重新登录', '确定', () => {
      cancelChangePassword()
      handleLogout()
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    showCustomModal('error', '修改失败', '密码修改失败，请重试', '确定')
  }
}

async function handleLogout() {
  try {
    await logout()
    localStorage.removeItem('access_token')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

function showCustomModal(type: 'success' | 'error', title: string, message: string, buttonText: string = '确定', callback?: () => void) {
  modalType.value = type
  modalTitle.value = title
  modalMessage.value = message
  modalButtonText.value = buttonText
  modalCallback.value = callback || null
  showModal.value = true
}
// 关闭弹窗
function closeModal() {
  showModal.value = false
}

function confirmModal() {
  showModal.value = false
  if (modalCallback.value) {
    modalCallback.value()
  }
}

onMounted(async () => {
  await loadUserInfo()
})
</script>

<style scoped>
.profile {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  color: white;
}

.username {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.user-id {
  font-size: 14px;
  opacity: 0.8;
  margin: 8px 0 0 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.password-card,
.menu-card,
.logout-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.15);
}

.info-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-label {
  font-size: 14px;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.info-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 24px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f1f5f9;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #64748b;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.save-btn,
.change-pwd-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #667eea;
  color: white;
}

.save-btn:hover {
  background: #5a6fd6;
}

.change-pwd-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  align-self: flex-end;
}

.change-pwd-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  color: #667eea;
  padding-left: 8px;
}

.menu-item span {
  flex: 1;
  font-size: 14px;
}

.arrow {
  opacity: 0.5;
}

.logout-card {
  text-align: center;
}

.logout-btn {
  padding: 14px 48px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  min-width: 320px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.modal-icon.error {
  background: #fee2e2;
  color: #ef4444;
}

.modal-icon svg {
  width: 32px;
  height: 32px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.modal-message {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.modal-confirm {
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-confirm:hover {
  background: #5a6fd6;
}
</style>