<template>
  <div class="cart-container">
    <h1 class="page-title">我的购物车</h1>
    
    <div v-if="cart && cart.items.length > 0" class="cart-content">
      <div class="rental-days-header">
        <label class="days-label">统一租赁天数</label>
        <div class="days-control-large">
          <button 
            class="control-btn-large" 
            @click="updateAllRentalDays(unifiedRentalDays - 1)"
            :disabled="unifiedRentalDays <= baseRentalDays"
            :title="unifiedRentalDays <= baseRentalDays ? `不可减少（最低${baseRentalDays}天）` : '减少租期'"
          >-</button>
          <span class="days-value-large">{{ unifiedRentalDays }}天</span>
          <button 
            class="control-btn-large" 
            @click="updateAllRentalDays(unifiedRentalDays + 1)"
          >+</button>
        </div>
        <span class="days-tip">所有商品按此天数统一计算租金（可加，不可低于初始{{ baseRentalDays }}天）</span>
      </div>

      <div class="cart-items">
        <div 
          v-for="item in cart.items" 
          :key="item.id" 
          class="cart-item"
        >
          <div class="item-image">
            <img 
              :src="item.cover_img_url || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20equipment%20outdoor%20gear&image_size=square`" 
              :alt="item.equipment_name"
            />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.equipment_name }}</h3>
            <p class="item-category">{{ item.category_name }}</p>
            <div class="item-price">
              <span class="daily-rental">¥{{ item.daily_rental }}/天</span>
              <span class="deposit">押金 ¥{{ item.deposit }}</span>
            </div>
          </div>
          <div class="item-count">
            <label>数量</label>
            <div class="count-control">
              <button 
                class="control-btn" 
                @click="updateCount(item, item.count - 1)"
                :disabled="item.count <= 1"
              >-</button>
              <span class="count-value">{{ item.count }}件</span>
              <button 
                class="control-btn" 
                @click="updateCount(item, item.count + 1)"
                :disabled="item.count >= item.stock"
              >+</button>
            </div>
          </div>
          <div class="item-total">
            <span class="total-label">小计</span>
            <span class="total-value">¥{{ getSubtotal(item) }}</span>
          </div>
          <div class="item-actions">
            <button class="delete-btn" @click="removeItem(item.id)">删除</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-info">
          <div class="summary-row">
            <span>商品总数</span>
            <span>{{ cart.total_count }}件</span>
          </div>
          <div class="summary-row">
            <span>租赁费用</span>
            <span>¥{{ cart.total_rental }}</span>
          </div>
          <div class="summary-row">
            <span>押金</span>
            <span>¥{{ cart.total_deposit }}</span>
          </div>
          <div class="summary-row total">
            <span>合计</span>
            <span>¥{{ getTotal() }}</span>
          </div>
        </div>
        <div class="summary-actions">
          <button class="clear-btn" @click="handleClear">清空购物车</button>
          <button class="checkout-btn" @click="handleCheckout">去结算</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-cart">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <p>购物车是空的</p>
      <button class="go-shopping-btn" @click="$router.push({name: 'equipment'})">去挑选装备</button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="confirm-modal" @click.stop>
        <h3>确认操作</h3>
        <p>确定要清空购物车吗？</p>
        <div class="modal-actions">
          <button class="modal-cancel" @click="showConfirmModal = false">取消</button>
          <button class="modal-confirm" @click="confirmClear">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Cart, CartItem } from '@/types'
import { getCart, updateCartItem, removeCartItem, clearCart } from '@/api/orders'

const router = useRouter()
const cart = ref<Cart | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const showConfirmModal = ref(false)
const baseRentalDays = ref(1)

const unifiedRentalDays = computed(() => {
  if (!cart.value || cart.value.items.length === 0) return 1
  return Math.max(...cart.value.items.map(item => item.rental_days))
})

async function loadCart() {
  try {
    const res = await getCart()
    cart.value = res
    if (res.items.length > 0) {
      const maxDays = Math.max(...res.items.map(item => item.rental_days))
      if (maxDays < baseRentalDays.value) {
        baseRentalDays.value = maxDays
      } else if (baseRentalDays.value === 1) {
        baseRentalDays.value = maxDays
      }
    }
  } catch (error) {
    console.error('加载购物车失败:', error)
    showMessage('加载购物车失败', 'error')
  }
}

function getSubtotal(item: CartItem) {
  const dailyRental = parseFloat(item.daily_rental)
  const deposit = parseFloat(item.deposit)
  return ((dailyRental * item.rental_days) + deposit) * item.count
}

function getTotal() {
  if (!cart.value) return 0
  return parseFloat(cart.value.total_rental) + parseFloat(cart.value.total_deposit)
}

async function updateAllRentalDays(days: number) {
  if (!cart.value) return
  if (days < baseRentalDays.value) return
  try {
    for (const item of cart.value.items) {
      await updateCartItem({ item_id: item.id, count: item.count, rental_days: days })
    }
    await loadCart()
  } catch (error) {
    console.error('更新租赁天数失败:', error)
    showMessage('更新失败', 'error')
  }
}

async function updateCount(item: CartItem, count: number) {
  if (count < 1 || count > item.stock) return
  try {
    await updateCartItem({ item_id: item.id, count: count, rental_days: unifiedRentalDays.value })
    await loadCart()
  } catch (error) {
    console.error('更新数量失败:', error)
    showMessage('更新失败', 'error')
  }
}

async function removeItem(itemId: number) {
  try {
    await removeCartItem(itemId)
    await loadCart()
    showMessage('删除成功', 'success')
  } catch (error) {
    console.error('删除失败:', error)
    showMessage('删除失败', 'error')
  }
}

function handleClear() {
  showConfirmModal.value = true
}

async function confirmClear() {
  showConfirmModal.value = false
  try {
    await clearCart()
    await loadCart()
    showMessage('已清空购物车', 'success')
  } catch (error) {
    console.error('清空失败:', error)
    showMessage('清空失败', 'error')
  }
}

function handleCheckout() {
  router.push('/orders/create')
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(async () => {
  await loadCart()
})
</script>

<style scoped>
.cart-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rental-days-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.days-label {
  font-size: 16px;
  font-weight: 600;
}

.days-control-large {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
}

.control-btn-large {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn-large:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.5);
}

.control-btn-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.days-value-large {
  font-size: 20px;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
}

.days-tip {
  font-size: 13px;
  opacity: 0.8;
  margin-left: auto;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-image {
  width: 100px;
  height: 100px;
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
  min-width: 200px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.item-category {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 12px 0;
}

.item-price {
  display: flex;
  gap: 16px;
}

.daily-rental {
  font-size: 14px;
  color: #ef4444;
  font-weight: 600;
}

.deposit {
  font-size: 13px;
  color: #94a3b8;
}

.item-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 120px;
}

.item-count label {
  font-size: 13px;
  color: #64748b;
}

.days-control,
.count-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #667eea;
}

.control-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.days-value,
.count-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  min-width: 60px;
  text-align: center;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100px;
}

.total-label {
  font-size: 12px;
  color: #94a3b8;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.item-actions {
  margin-left: auto;
}

.delete-btn {
  padding: 8px 16px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #fee2e2;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.summary-row.total span:last-child {
  color: #ef4444;
}

.summary-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.clear-btn {
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.checkout-btn {
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

.checkout-btn:hover {
  background: #5a6fd6;
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
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

.confirm-modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.confirm-modal p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-cancel {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel:hover {
  background: #f8fafc;
}

.modal-confirm {
  padding: 10px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-confirm:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-info {
    width: calc(100% - 120px);
  }
  
  .item-rental-days,
  .item-count {
    width: 100px;
  }
  
  .summary-actions {
    flex-direction: column;
  }
  
  .clear-btn,
  .checkout-btn {
    width: 100%;
  }
}
</style>