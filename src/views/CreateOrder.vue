<template>
  <div class="create-order">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回
      </button>
      <h1 class="page-title">确认订单</h1>
      <div class="header-placeholder"></div>
    </div>

    <div v-if="cart && cart.items.length > 0" class="order-content">
      <div class="cart-items-card">
        <h3 class="card-title">购物车商品</h3>
        <div class="cart-items-list">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img 
                :src="item.cover_img_url || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20equipment&image_size=square`" 
                :alt="item.equipment_name"
              />
            </div>
            <div class="item-info">
              <h4 class="item-name">{{ item.equipment_name }}</h4>
              <p class="item-category">{{ item.category_name }}</p>
              <div class="item-price">
                <span class="daily-rental">¥{{ item.daily_rental }}/天</span>
                <span class="deposit">押金 ¥{{ item.deposit }}</span>
              </div>
            </div>
            <div class="item-meta">
              <span class="rental-days">租赁{{ item.rental_days }}天</span>
              <span class="count">x{{ item.count }}</span>
              <span class="subtotal">¥{{ getSubtotal(item) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-card">
        <h3 class="card-title">联系信息</h3>
        <div class="form-group">
          <label>联系人</label>
          <input 
            v-model="form.contact_name" 
            type="text" 
            placeholder="请输入联系人姓名"
            @blur="validateContactName"
          />
          <span v-if="errors.contact_name" class="error">{{ errors.contact_name }}</span>
        </div>
        <div class="form-group">
          <label>联系电话</label>
          <input 
            v-model="form.contact_phone" 
            type="tel" 
            placeholder="请输入11位手机号码"
            @blur="validateContactPhone"
          />
          <span v-if="errors.contact_phone" class="error">{{ errors.contact_phone }}</span>
        </div>
      </div>

      <div class="time-card">
        <h3 class="card-title">租赁时间 <span class="days-badge">{{ rentalDays }}天</span></h3>
        <div class="form-group">
          <label>开始时间</label>
          <input 
            v-model="form.start_time" 
            type="datetime-local" 
            @change="onStartTimeChange"
          />
          <span v-if="errors.start_time" class="error">{{ errors.start_time }}</span>
        </div>
        <div class="form-group">
          <label>结束时间（自动计算）</label>
          <input 
            :value="form.end_time" 
            type="datetime-local" 
            disabled
            class="readonly-input"
          />
        </div>
      </div>

      <div class="summary-card">
        <h3 class="card-title">费用明细</h3>
        <div class="summary-row">
          <span>商品数量</span>
          <span>{{ cart.total_count }}件</span>
        </div>
        <div class="summary-row">
          <span>租金</span>
          <span>¥{{ cart.total_rental }}</span>
        </div>
        <div class="summary-row">
          <span>押金</span>
          <span>¥{{ cart.total_deposit }}</span>
        </div>
        <div class="summary-row total">
          <span>订单总价</span>
          <span>¥{{ getTotal() }}</span>
        </div>
      </div>

      <div class="submit-section">
        <button 
          class="submit-btn" 
          :disabled="!isValid"
          @click="handleSubmit"
        >
          提交订单
        </button>
        <p class="tip">提交订单后请尽快完成支付</p>
      </div>
    </div>

    <div v-else class="empty-cart">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <p>购物车是空的</p>
      <button class="go-shopping-btn" @click="$router.push('/equipment')">去挑选装备</button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Cart, CartItem } from '@/types'
import { getCart, createOrder, clearCart } from '@/api/orders'

const route = useRoute()
const router = useRouter()

const cart = ref<Cart | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const rentalDays = computed(() => {
  if (!cart.value || cart.value.items.length === 0) return 1
  return Math.max(...cart.value.items.map(item => item.rental_days))
})

const form = reactive({
  contact_name: '',
  contact_phone: '',
  start_time: '',
  end_time: ''
})

const errors = reactive({
  contact_name: '',
  contact_phone: '',
  start_time: '',
  end_time: ''
})

function getSubtotal(item: CartItem) {
  const dailyRental = parseFloat(item.daily_rental)
  const deposit = parseFloat(item.deposit)
  return ((dailyRental * item.rental_days) + deposit) * item.count
}

function getTotal() {
  if (!cart.value) return 0
  return parseFloat(cart.value.total_rental) + parseFloat(cart.value.total_deposit)
}

function validateContactName() {
  if (!form.contact_name.trim()) {
    errors.contact_name = '请输入联系人姓名'
  } else if (form.contact_name.length > 20) {
    errors.contact_name = '姓名不能超过20个字符'
  } else {
    errors.contact_name = ''
  }
}

function validateContactPhone() {
  const phone = form.contact_phone.replace(/\s/g, '')
  if (!phone) {
    errors.contact_phone = '请输入联系电话'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    errors.contact_phone = '请输入有效的11位手机号码'
  } else {
    errors.contact_phone = ''
  }
}

function recalcEndTime() {
  if (!form.start_time) return
  const start = new Date(form.start_time)
  const end = new Date(start)
  end.setDate(end.getDate() + rentalDays.value)
  form.end_time = end.toISOString().slice(0, 16)
}

function onStartTimeChange() {
  validateStartTime()
  recalcEndTime()
}

function validateStartTime() {
  if (!form.start_time) {
    errors.start_time = '请选择开始时间'
  } else {
    errors.start_time = ''
    recalcEndTime()
  }
}

function validateEndTime() {
  if (!form.end_time) {
    errors.end_time = '请选择结束时间'
  } else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
    errors.end_time = '结束时间必须晚于开始时间'
  } else {
    errors.end_time = ''
  }
}

const dateDaysMatch = computed(() => {
  if (!form.start_time || !form.end_time) return false
  const diffMs = new Date(form.end_time).getTime() - new Date(form.start_time).getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return diffDays === rentalDays.value
})

const isValid = computed(() => {
  return !errors.contact_name && 
         !errors.contact_phone && 
         !errors.start_time && 
         !errors.end_time &&
         form.contact_name.trim() &&
         form.contact_phone.trim() &&
         form.start_time &&
         form.end_time &&
         dateDaysMatch.value
})

async function loadCart() {
  try {
    cart.value = await getCart()
  } catch (error) {
    console.error('加载购物车失败:', error)
    showMessage('加载购物车失败', 'error')
  }
}

async function handleSubmit() {
  if (!isValid.value || !cart.value) return

  if (!dateDaysMatch.value) {
    showMessage(`租期日期与所选租赁天数（${rentalDays.value}天）不一致，请重新选择开始时间`, 'error')
    return
  }

  const orderItems = cart.value.items.map(item => ({
    equipment_id: item.equipment_id,
    count: item.count,
    rental_days: item.rental_days
  }))

  try {
    await createOrder({
      create_order_items: orderItems,
      start_time: form.start_time,
      end_time: form.end_time,
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.replace(/\s/g, '')
    })

    await clearCart()
    showMessage('订单创建成功', 'success')

    setTimeout(() => {
      router.push('/orders')
    }, 1500)
  } catch (error: any) {
    console.error('创建订单失败:', error)
    const errorMsg = error.response?.data?.error || '创建订单失败'
    showMessage(errorMsg, 'error')
  }
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function setDefaultTime() {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  now.setMinutes(0)
  
  form.start_time = now.toISOString().slice(0, 16)
  recalcEndTime()
}

onMounted(async () => {
  await loadCart()
  setDefaultTime()
})

watch(() => route.query, async () => {
  await loadCart()
})
</script>

<style scoped>
.create-order {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-title {
  flex: 1;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-placeholder {
  width: 80px;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-items-card,
.contact-card,
.time-card,
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.days-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  margin-left: 8px;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  gap: 16px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.item-category {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.item-price {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.daily-rental {
  font-size: 13px;
  color: #ef4444;
  font-weight: 500;
}

.deposit {
  font-size: 12px;
  color: #94a3b8;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
}

.rental-days,
.count {
  font-size: 12px;
  color: #94a3b8;
}

.subtotal {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.readonly-input,
.form-group input:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group .error {
  font-size: 13px;
  color: #ef4444;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #64748b;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 8px;
}

.summary-row.total span:last-child {
  color: #ef4444;
}

.submit-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn {
  width: 100%;
  max-width: 400px;
  padding: 16px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #5a6fd6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.tip {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #94a3b8;
}

.empty-cart svg {
  margin-bottom: 16px;
}

.empty-cart p {
  font-size: 16px;
  margin: 0 0 24px 0;
}

.go-shopping-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.go-shopping-btn:hover {
  background: #5a6fd6;
}

.message {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #dcfce7;
  color: #16a34a;
}

.message.error {
  background: #fee2e2;
  color: #ef4444;
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

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-meta {
    width: 100%;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  .submit-btn {
    width: 100%;
    max-width: none;
  }
}
</style>