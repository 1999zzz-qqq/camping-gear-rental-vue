<template>
  <div class="admin-users">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <button class="add-btn" @click="showAddModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加用户
      </button>
    </div>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="搜索用户名或手机号..."
        @keyup.enter="searchUsers"
      />
      <button class="search-btn" @click="searchUsers">搜索</button>
    </div>

    <table class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>手机号</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>账户状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="user in users" :key="user?.id">
        <tr v-if="user">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.phone || '-' }}</td>
          <td>{{ user.email || '-' }}</td>
          <td>
            <span :class="['role-tag', user.is_staff ? 'admin' : 'user']">
              {{ user.is_staff ? '管理员' : '普通用户' }}
            </span>
          </td>
          <td>
            <span :class="['status-tag', user.is_frozen ? 'frozen' : 'normal']">
              {{ user.is_frozen ? '已冻结' : '正常' }}
            </span>
          </td>
          <td>{{ formatDate(user.date_joined) }}</td>
          <td>
            <button class="edit-btn" @click="editUser(user)">编辑</button>
            <button 
              v-if="user.is_frozen" 
              class="unfreeze-btn" 
              @click="unfreezeUser(user.id)"
            >
              解冻
            </button>
            <button 
              v-else 
              class="freeze-btn" 
              @click="freezeUser(user)"
            >
              冻结
            </button>
            <button class="delete-btn" @click="deleteUser(user.id)">删除</button>
          </td>
        </tr>
        </template>
      </tbody>
    </table>

    <div v-if="users.length === 0" class="empty-state">
      <p>暂无用户数据</p>
    </div>

    <!-- 分页条 -->
    <div v-if="totalPages > 1" class="pagination">
      <span class="pagination-total">共 {{ totalCount }} 条</span>
      <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一页</button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="goToPage(p)"
      >{{ p }}</button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">下一页</button>
    </div>

    <div v-if="showFreezeModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">冻结用户</h3>
        <div class="modal-body">
          <p>确定要冻结用户 <strong>{{ freezeUserInfo?.username }}</strong> 吗？</p>
          <div class="form-group">
            <label>冻结原因</label>
            <textarea 
              v-model="freezeReason" 
              placeholder="请输入冻结原因"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="closeModal">取消</button>
          <button type="button" class="submit-btn freeze-submit" @click="confirmFreeze">确认冻结</button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
      <div class="modal-content confirm-content">
        <h3 class="modal-title">确认操作</h3>
        <p class="modal-message">{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="modal-cancel" @click="closeConfirmModal">取消</button>
          <button class="modal-confirm" @click="executeConfirmAction">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
        <form class="modal-form" @submit.prevent="saveUser">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="formData.username" 
              :disabled="editingUser !== null"
              placeholder="请输入用户名"
            />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input 
              type="tel" 
              v-model="formData.phone" 
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input 
              type="email" 
              v-model="formData.email" 
              placeholder="请输入邮箱"
            />
          </div>
          <div class="form-group" v-if="!editingUser">
            <label>密码</label>
            <input 
              type="password" 
              v-model="formData.password" 
              placeholder="请输入密码（至少6位）"
            />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="formData.is_staff" />
              设为管理员
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AdminUsers">
import { ref, computed, onMounted, reactive } from 'vue'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import request from '@/utils/request'
interface AdminUser extends User {
  is_staff: boolean
  date_joined: string
  is_frozen: boolean
  frozen_reason?: string
  frozen_time?: string
}

const users = ref<AdminUser[]>([])
const searchKeyword = ref('')
// 分页状态
const currentPage = ref(1)
const totalCount = ref(0)
const pageSize = 20
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
const pageNumbers = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  let start = Math.max(1, currentPage.value - 2)
  const end = Math.min(total, start + 4)
  start = Math.max(1, end - 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const showAddModal = ref(false)
const editingUser = ref<AdminUser | null>(null)
const showFreezeModal = ref(false)
const freezeUserInfo = ref<AdminUser | null>(null)
const freezeReason = ref('')
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

const formData = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  is_staff: false
})

// 搜索：重置到第1页
function searchUsers() {
  currentPage.value = 1
  loadUsers()
}

// 翻页
function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  loadUsers()
}

async function loadUsers() {
  try {
    const params: Record<string, string | number> = { page: currentPage.value }
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    // DRF 分页响应：{ count, next, previous, results }
    const data = await request.get(`/users/admin/`, { params }) as unknown as {
      count: number
      results: AdminUser[]
    }
    users.value = data.results || []
    totalCount.value = data.count || 0
    // 当前页超出范围（搜索后数据变少），回退到最后一页
    if (users.value.length === 0 && currentPage.value > 1) {
      currentPage.value = totalPages.value
      await loadUsers()
    }
  } catch (error) {
    console.error('加载用户失败:', error)
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function editUser(user: AdminUser) {
  editingUser.value = user
  formData.username = user.username
  formData.phone = user.phone || ''
  formData.email = user.email || ''
  formData.is_staff = user.is_staff
  formData.password = ''
  showAddModal.value = true
}
// 保存用户
async function saveUser() {
  try {
    if (editingUser.value) {
      await request.put(`/users/admin/${editingUser.value.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.get('access_token')}`
        },
        data: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          is_staff: formData.is_staff
        })
      })
    } else {
      await request.post<User>('/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.get('access_token')}`
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          re_password: formData.password,
          phone: formData.phone,
          email: formData.email,
          is_staff: formData.is_staff
        })
      })
    }
    closeModal()
    await loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
  }
}

function freezeUser(user: AdminUser) {
  freezeUserInfo.value = user
  freezeReason.value = ''
  showFreezeModal.value = true
}

async function confirmFreeze() {
  if (!freezeUserInfo.value) return
  
  try {
    await request.post(`/users/admin/${freezeUserInfo.value.id}/freeze/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.get('access_token')}`
      },
      body: JSON.stringify({
        reason: freezeReason.value || '账户异常'
      })
    })
    showFreezeModal.value = false
    await loadUsers()
  } catch (error) {
    console.error('冻结用户失败:', error)
  }
}

async function unfreezeUser(id: number) {
  showConfirm('确定解冻该用户吗？', async () => {
    try {
      await request.post(`/users/admin/${id}/unfreeze/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storage.get('access_token')}`
        }
      })
      await loadUsers()
    } catch (error) {
      console.error('解冻用户失败:', error)
    }
  })
}

async function deleteUser(id: number) {
  showConfirm('确定删除该用户吗？', async () => {
    try {
      await request.delete(`/users/admin/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storage.get('access_token')}`
        }
      })
      await loadUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  })
}

function showConfirm(msg: string, action: () => void) {
  confirmMessage.value = msg
  confirmAction.value = action
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
  confirmMessage.value = ''
  confirmAction.value = null
}

async function executeConfirmAction() {
  if (confirmAction.value) {
    await confirmAction.value()
    closeConfirmModal()
  }
}

function closeModal() {
  showFreezeModal.value = false
  freezeUserInfo.value = null
  freezeReason.value = ''
  showAddModal.value = false
  editingUser.value = null
  formData.username = ''
  formData.phone = ''
  formData.email = ''
  formData.password = ''
  formData.is_staff = false
}

onMounted(async () => {
  await loadUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #5a6fd6;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-bar input {
  flex: 1;
  max-width: 300px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.search-btn {
  padding: 12px 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.users-table th,
.users-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.users-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.users-table td {
  font-size: 14px;
  color: #1e293b;
}

.role-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.user {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.role-tag.admin {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.normal {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-tag.frozen {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.edit-btn,
.delete-btn,
.freeze-btn,
.unfreeze-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.edit-btn {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.15);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.freeze-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.freeze-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.unfreeze-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.unfreeze-btn:hover {
  background: rgba(34, 197, 94, 0.15);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.modal-content.confirm-content {
  text-align: center;
}

.modal-message {
  font-size: 14px;
  color: #64748b;
  margin: 16px 0 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-cancel,
.modal-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.modal-cancel:hover {
  background: #e2e8f0;
}

.modal-confirm {
  background: #667eea;
  color: white;
}

.modal-confirm:hover {
  background: #5a6fd6;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #64748b;
}

.form-group input,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.cancel-btn {
  padding: 10px 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* 分页条 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
.pagination-total {
  font-size: 13px;
  color: #64748b;
  margin-right: auto;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}
.page-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>