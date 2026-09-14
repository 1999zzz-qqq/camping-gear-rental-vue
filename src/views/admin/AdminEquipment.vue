<template>
  <div class="admin-equipment">
    <div class="page-header">
      <h2 class="page-title">装备管理</h2>
      <button class="add-btn" @click="showAddModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加装备
      </button>
    </div>

    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索装备名称..."
        @keyup.enter="loadEquipment"
      />
      <button class="search-btn" @click="loadEquipment">搜索</button>
    </div>

    <table class="equipment-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>分类</th>
          <th>日租金</th>
          <th>押金</th>
          <th>库存</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in equipment" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.category_name || '-' }}</td>
          <td>¥{{ item.daily_rental }}</td>
          <td>¥{{ item.deposit }}</td>
          <td>
            <span :class="['stock-tag', item.stock <= 0 ? 'low' : 'normal']">
              {{ item.stock }}
            </span>
          </td>
          <td>
            <span :class="['status-tag', item.is_shelf ? 'shelf' : 'off-shelf']">
              {{ item.is_shelf ? '在售' : '下架' }}
            </span>
          </td>
          <td>
            <button class="edit-btn" @click="editEquipment(item)">编辑</button>
            <button 
              v-if="!item.is_shelf && item.stock > 0" 
              class="toggle-btn shelf-btn"
              @click="handleToggleShelf(item, true)"
            >
              上架
            </button>
            <button 
              v-if="item.is_shelf" 
              class="toggle-btn off-shelf-btn"
              @click="handleToggleShelf(item, false)"
            >
              下架
            </button>
            <button 
              v-if="item.stock <= 0 && !item.is_shelf" 
              class="disabled-btn"
              title="库存不足，无法上架"
            >
              库存不足
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="equipment.length === 0" class="empty-state">
      <p>暂无装备数据</p>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelConfirm">
      <div class="modal-content confirm-modal">
        <h3 class="modal-title">{{ confirmTitle }}</h3>
        <p class="confirm-message">{{ confirmMessage }}</p>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="cancelConfirm">取消</button>
          <button type="button" class="submit-btn danger-btn" @click="confirmAction">确认</button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessToast" class="success-toast">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingEquipment ? '编辑装备' : '添加装备' }}</h3>
        <form class="modal-form" @submit.prevent="saveEquipment">
          <div v-if="saveError" class="save-error" style="text-align: left;">{{ saveError }}</div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.name }">
            <label>装备名称</label>
            <input 
              type="text" 
              v-model="formData.name" 
              placeholder="请输入装备名称"
              @focus="fieldTouched.name = true"
              @input="fieldErrors.name = ''"
              @blur="validateField('name')"
            />
            <span v-if="fieldErrors.name && fieldTouched.name" class="field-error">{{ fieldErrors.name }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.category }">
            <label>分类</label>
            <select 
              v-model="formData.category"
              @focus="fieldTouched.category = true"
              @change="fieldErrors.category = ''; validateField('category')"
              @blur="validateField('category')"
            >
              <option value="" disabled>请选择分类</option>
              <template v-for="firstCat in categories" :key="firstCat.id">
                <option :value="firstCat.id">{{ firstCat.name }}</option>
                <option v-for="secondCat in (firstCat.children || [])" :key="secondCat.id" :value="secondCat.id">
                  └ {{ secondCat.name }}
                </option>
              </template>
            </select>
            <span v-if="fieldErrors.category && fieldTouched.category" class="field-error">{{ fieldErrors.category }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.price }">
            <label>单价</label>
            <input 
              type="number" 
              v-model="formData.price" 
              placeholder="请输入单价"
              @focus="fieldTouched.price = true"
              @input="fieldErrors.price = ''"
              @blur="validateField('price')"
            />
            <span v-if="fieldErrors.price && fieldTouched.price" class="field-error">{{ fieldErrors.price }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.daily_rental }">
            <label>日租金</label>
            <input 
              type="text" 
              :value="computedDailyRental"
              disabled placeholder="输入单价后自动计算"
            />
            <span v-if="fieldErrors.daily_rental && fieldTouched.daily_rental" class="field-error">{{ fieldErrors.daily_rental }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.deposit }">
            <label>押金</label>
            <input 
              type="text" 
              :value="computedDeposit"
              disabled placeholder="输入单价后自动计算"
            />
            <span v-if="fieldErrors.deposit && fieldTouched.deposit" class="field-error">{{ fieldErrors.deposit }}</span>
          </div>
          <div class="form-group" :class="{ 'has-error': !!fieldErrors.stock }">
            <label>库存数量</label>
            <input 
              type="number" 
              v-model="formData.stock" 
              placeholder="请输入库存数量"
              @focus="fieldTouched.stock = true"
              @input="fieldErrors.stock = ''"
              @blur="validateField('stock')"
            />
            <span v-if="formData.stock <= 0" class="warning-text">库存不足，装备将自动下架</span>
            <span v-if="fieldErrors.stock && fieldTouched.stock" class="field-error">{{ fieldErrors.stock }}</span>
          </div>
          <div class="form-group">
            <label>装备简介</label>
            <textarea 
              v-model="formData.desc" 
              placeholder="请输入装备简介"
              @focus="fieldTouched.desc = true"
              @input="fieldErrors.desc = ''"
              @blur="validateField('desc')"
            ></textarea>
          </div>
          <div class="form-group">
            <label>装备图片</label>
            <div class="image-upload-section">
              <div class="image-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload"
                  ref="imageInput"
                />
                <div v-if="formData.cover_img_url" class="image-preview">
                  <img :src="formData.cover_img_url" alt="装备图片" />
                  <button class="remove-image-btn" @click="removeImage">×</button>
                </div>
                <div v-else class="upload-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>点击上传图片</span>
                </div>
              </div>
              <div class="image-url-input">
                <input 
                  type="text" 
                  v-model="imageUrlInput" 
                  placeholder="或输入图片URL"
                  @blur="handleUrlInput"
                />
                <button class="url-confirm-btn" @click="handleUrlInput">确认</button>
              </div>
            </div>
          </div>
          <div class="form-group" v-if="editingEquipment">
            <label>
              <input type="checkbox" v-model="formData.is_shelf" :disabled="formData.stock <= 0" />
              {{ formData.stock <= 0 ? '库存不足，无法上架' : '上架状态' }}
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn" :disabled="isSaving">
              {{ isSaving ? '保存中...' : (editingEquipment ? '保存' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AdminEquipment">
import { ref, reactive, onMounted } from 'vue'
import type { Equipment, Category } from '@/types'
import request from '@/utils/request'
import { computed } from 'vue'

const equipment = ref<Equipment[]>([])
const categories = ref<Category[]>([])
const searchKeyword = ref('')
const showAddModal = ref(false)
const editingEquipment = ref<Equipment | null>(null)
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
let confirmCallback: (() => void) | null = null

const showSuccessToast = ref(false)
const successMessage = ref('')

const saveError = ref('')
const fieldErrors = ref<Record<string, string>>({})
const fieldTouched = ref<Record<string, boolean>>({})
const isSaving = ref(false)   // 防抖，防止连点

const formData = reactive({
  name: '',
  category: '',
  price: '',
  stock: 1,
  desc: '',
  is_shelf: true,
  cover_img_url: '',
  cover_img: null as File | null
})
// 租赁费率和押金费率
const RENTAL_RATE= 0.1
const DEPOSIT_RATE= 0.5
const computedDailyRental = computed(() => {
  const price = Number(formData.price || 0.0)
  return price >0? (price * RENTAL_RATE).toFixed(2) : ''
})
const computedDeposit = computed(() => {
  const price = Number(formData.price || 0.0)
  return price > 0 ? (price * DEPOSIT_RATE).toFixed(2) : ''
})

const imageInput = ref<HTMLInputElement | null>(null)
const imageUrlInput = ref('')

async function loadEquipment() {
  try {
    const params: Record<string, string> = {}
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    const data = await request.get('/equipment/equipment-admin/', { params })
    console.log('Equipment data:', data)
    if (Array.isArray(data)) {
      equipment.value = data
    } else {
      console.error('Invalid response:', data)
      equipment.value = []
    }
  } catch (error) {
    console.error('加载装备失败:', error)
  }
}

async function loadCategories() {
  try {
    const response = await fetch('/api/equipment/category/')
    categories.value = await response.json()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

function editEquipment(item: Equipment) {
  editingEquipment.value = item
  formData.name = item.name
  formData.category = String(item.category)
  formData.price = item.price
  formData.stock = item.stock
  formData.desc = item.desc || ''
  formData.is_shelf = item.is_shelf || false
  formData.cover_img_url = item.cover_img_url || ''
  formData.cover_img = null
  imageUrlInput.value = ''
  showAddModal.value = true
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    formData.cover_img = file
    formData.cover_img_url = URL.createObjectURL(file)
  }
}

function removeImage() {
  formData.cover_img = null
  formData.cover_img_url = ''
  imageUrlInput.value = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handleUrlInput() {
  const url = imageUrlInput.value.trim()
  if (url) {
    formData.cover_img_url = url
    formData.cover_img = null
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

// 实时校验：输入框失焦时调用，空则报提示
const fieldRules: Record<string, (v: any) => string | null> = {
  name:       (v) => !v?.trim() ? '装备名称不能为空' : null,
  category:   (v) => !v         ? '请选择分类'       : null,
  price:      (v) => v === '' || v === null ? '请输入单价'      : null,
  stock:      (v) => v === null || v < 0 ? '库存数量不能小于0' : null,
}
function validateField(key: string) {
  fieldTouched.value[key] = true
  const rule = fieldRules[key]
  if (!rule) return
  const val = (formData as any)[key]
  const msg = rule(val)
  if (msg) {
    fieldErrors.value[key] = msg
  } else {
    delete fieldErrors.value[key]
  }
}

async function saveEquipment() {
  if (isSaving.value) return
  fieldErrors.value = {}
  saveError.value = ''

  // ---- 统一用 validateField 校验所有规则，标 touched ----
  for (const k of Object.keys(fieldRules)) validateField(k)
  if (Object.keys(fieldErrors.value).length > 0) return

  isSaving.value = true
  try {
    const form = new FormData()
    form.append('name', formData.name)
    form.append('category', String(formData.category))   // 之前 parseInt('') 得 NaN → 后端爆类型错误
    form.append('price', String(parseFloat(formData.price) || 0))
    form.append('stock', String(formData.stock))
    form.append('desc', formData.desc)
    form.append('is_shelf', String(formData.is_shelf && formData.stock > 0))
    form.append('is_show', 'true')

    if (formData.cover_img) {
      form.append('cover_img', formData.cover_img)
    } else if (imageUrlInput.value.trim()) {
      form.append('cover_img_url_input', imageUrlInput.value.trim())
    }

    if (editingEquipment.value) {
      await request.put(`/equipment/equipment-admin/${editingEquipment.value.id}/`, form)
    } else {
      await request.post('/equipment/equipment-admin/', form)
    }

    closeModal()
    await loadEquipment()
    showSuccess(editingEquipment.value ? '编辑成功' : '添加成功')
  } catch (error: any) {
    console.error('保存装备失败:', error)
    console.error('后端 response.data:', error?.response?.data)
    let errorMsg = '保存失败'
    if (error?.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') {
        errorMsg = data
      } else if (data.detail) {
        errorMsg = String(data.detail)
      } else if (data.error) {
        errorMsg = String(data.error)
      } else if (data.non_field_errors) {
        errorMsg = [data.non_field_errors].flat().join('，')
      } else {
        const parts: string[] = []
        for (const [k, v] of Object.entries(data)) {
          const msg = Array.isArray(v) ? v.join('，') : String(v)
          parts.push(`${k}: ${msg}`)
          fieldErrors.value[k] = msg
          fieldTouched.value[k] = true
        }
        errorMsg = parts.join('； ')
      }
    } else if (error.message) {
      errorMsg = error.message
    }
    saveError.value = errorMsg
    setTimeout(() => {
      saveError.value = ''
      fieldErrors.value = {}
      fieldTouched.value = {}
    }, 5000)
  } finally {
    isSaving.value = false
  }
}

function showConfirm(title: string, message: string, callback: () => void) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback = callback
  showConfirmModal.value = true
}

function showSuccess(message: string) {
  successMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2000)
}

function cancelConfirm() {
  showConfirmModal.value = false
  confirmCallback = null
}

function confirmAction() {
  if (confirmCallback) {
    confirmCallback()
  }
  showConfirmModal.value = false
  confirmCallback = null
}

function handleToggleShelf(item: Equipment, isShelf: boolean) {
  if (isShelf) {
    showConfirm('上架确认', `确定要上架装备「${item.name}」吗？`, () => {
      toggleShelf(item, isShelf)
    })
  } else {
    showConfirm('下架确认', `确定要下架装备「${item.name}」吗？下架后该装备将不再对外展示。`, () => {
      toggleShelf(item, isShelf)
    })
  }
}

async function toggleShelf(item: Equipment, isShelf: boolean) {
  try {
    await request.put(`/equipment/equipment-admin/${item.id}/`, { is_shelf: isShelf })
    await loadEquipment()
  } catch (error: any) {
    console.error('修改状态失败:', error)
    const msg = error?.response?.data?.error || '操作失败'
    showConfirm('操作失败', msg, () => {})
  }
}

function closeModal() {
  showAddModal.value = false
  editingEquipment.value = null
  formData.name = ''
  formData.category = ''
  formData.price = ''
  formData.stock = 1
  formData.desc = ''
  formData.is_shelf = true
  formData.cover_img_url = ''
  formData.cover_img = null
  imageUrlInput.value = ''
  saveError.value = ''
  fieldErrors.value = {}
  fieldTouched.value = {}
}

onMounted(async () => {
  await loadCategories()
  await loadEquipment()
})
</script>

<style scoped>
.admin-equipment {
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

.equipment-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.equipment-table th,
.equipment-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.equipment-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.equipment-table td {
  font-size: 14px;
  color: #1e293b;
}

.stock-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.stock-tag.normal {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stock-tag.low {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.shelf {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-tag.off-shelf {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.edit-btn,
.toggle-btn,
.disabled-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 6px;
}

.edit-btn {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.15);
}

.toggle-btn.shelf-btn {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.toggle-btn.shelf-btn:hover {
  background: rgba(34, 197, 94, 0.15);
}

.toggle-btn.off-shelf-btn {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.toggle-btn.off-shelf-btn:hover {
  background: rgba(251, 191, 36, 0.15);
}

.disabled-btn {
  background: rgba(226, 232, 240, 0.5);
  color: #94a3b8;
  cursor: not-allowed;
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
  width: 500px;
  max-width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.modal-form::-webkit-scrollbar { width: 6px; }
.modal-form::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.modal-form::-webkit-scrollbar-track { background: transparent; }

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
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.warning-text {
  font-size: 12px;
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
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

.submit-btn.danger-btn {
  background: #ef4444;
}

.submit-btn.danger-btn:hover {
  background: #dc2626;
}

.confirm-modal {
  text-align: center;
}

.confirm-message {
  font-size: 14px;
  color: #64748b;
  margin: 16px 0;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload {
  position: relative;
}

.image-upload input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.upload-placeholder {
  width: 200px;
  height: 150px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-placeholder:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-placeholder span {
  font-size: 13px;
  color: #94a3b8;
}

.image-url-input {
  display: flex;
  gap: 8px;
  max-width: 400px;
}

.image-url-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
}

.url-confirm-btn {
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.url-confirm-btn:hover {
  background: #f1f5f9;
}

.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: rgba(34, 197, 94, 0.95);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.save-error {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}
.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;                    /* 橙色 #ea580c → 红色 #ef4444 */
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.4;
  padding: 6px 10px;
  background: rgba(239, 68, 68, 0.06);  /* 透明度 0.08 → 0.06，更淡 */
  border-radius: 6px;
  border-left: 3px solid #ef4444;     /* 橙色 → 红色 */
}
.field-error::before {
  content: '⚠';
  font-size: 13px;
  flex-shrink: 0;
}
.form-group.has-error input,
.form-group.has-error select,
.form-group.has-error textarea {
  border-color: #ef4444;              /* 橙色 → 红色 */
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);  /* 橙色 → 红色，透明度 0.1 → 0.08 */
}
.form-group.has-error label {
  color: #ef4444;                     /* 橙色 → 红色 */
}

</style>