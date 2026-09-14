<template>
  <div class="orders-list">
    <div class="list-header">
      <h2 class="page-title">我的订单</h2>
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          :class="['filter-tab', { active: activeTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="orders.length > 0" class="orders-container">
      <div v-for="order in orders" :key="order.id" class="order-card" @click="$router.push(`/orders/${order.id}`)">
        <div class="order-header">
          <span class="order-sn">订单编号：{{ order.order_sn }}</span>
          <span :class="['order-status', `status-${order.order_status}`]">
            {{ order.order_status_display }}
          </span>
        </div>
        
        <div class="rental-info">
          <div class="rental-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>租期：{{ formatDate(order.start_time) }} ~ {{ formatDate(order.end_time) }}</span>
          </div>
          <div v-if="order.order_status === 3" :class="['overdue-warning', { 'is-overdue': isOverdue(order) }]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ getOverdueMessage(order) }}
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span class="item-name">{{ item.equipment_name }}</span>
            <span class="item-detail">x{{ item.count }} | ¥{{ item.price }}/天 | {{ item.rental_days }}天</span>
          </div>
          <span v-if="order.items.length > 2" class="more-items">
            等{{ order.items.length }}件装备
          </span>
        </div>

        <div class="order-price">
          <div class="price-row">
            <span class="price-label">租金</span>
            <span class="price-value">¥{{ order.rental_amount }}</span>
          </div>
          <div class="price-row">
            <span class="price-label">押金</span>
            <span class="price-value">¥{{ order.deposit_amount }}</span>
          </div>
          <div class="price-row total">
            <span class="price-label">合计</span>
            <span class="price-value">¥{{ order.total_amount }}</span>
          </div>
        </div>

        <div class="order-footer">
          <span class="order-date">下单时间：{{ formatDate(order.create_time) }}</span>
        </div>

        <div class="order-actions">
          <button 
            v-if="order.order_status === 1" 
            class="action-btn pay-btn"
            @click.stop="handlePay(order.id)"
          >
            立即支付
          </button>
          <button 
            v-if="order.order_status === 1" 
            class="action-btn cancel-btn"
            @click.stop="handleCancel(order.id)"
          >
            取消订单
          </button>
          <button 
            v-if="order.order_status === 2" 
            class="action-btn refund-btn"
            @click.stop="handleRefund(order.id)"
          >
            申请退款
          </button>
          <button 
            v-if="order.order_status === 3" 
            class="action-btn return-btn"
            @click.stop="handleApplyReturn(order.id)"
          >
            申请归还
          </button>
          <button 
            v-if="order.order_status === 4" 
            class="action-btn view-btn"
          >
            待确认
          </button>
          <button 
            v-if="order.order_status === 5" 
            class="action-btn view-btn"
          >
            查看详情
          </button>
          <button 
            v-if="order.order_status === 5 && order.overdue_debt && parseFloat(order.overdue_debt) > 0" 
            class="action-btn debt-btn"
            @click.stop="handlePayDebt(order.id)"
          >
            支付欠费
          </button>
        </div>
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
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <p>暂无订单</p>
    </div>

    <div v-if="showPayModal" class="modal-overlay" @click="closePayModal">
      <div class="pay-modal" @click.stop>
        <div class="pay-modal-header">
          <h3>{{ payType === 'order' ? '确认支付' : '支付逾期欠费' }}</h3>
          <button class="close-btn" @click="closePayModal">&times;</button>
        </div>
        
        <div class="pay-modal-body">
          <div class="pay-amount">
            <span class="amount-label">{{ payType === 'order' ? '支付金额' : '欠费金额' }}</span>
            <span class="amount-value">¥{{ payType === 'order' ? getOrderAmount(currentOrderId) : getDebtAmount(currentOrderId) }}</span>
          </div>
          
          <div class="payment-methods">
            <p class="method-label">选择支付方式</p>
            <div class="method-options">
              <label :class="['method-option', { active: selectedPaymentMethod === 'alipay' }]">
                <input type="radio" v-model="selectedPaymentMethod" value="alipay" />
                <div class="method-icon alipay-icon">
                  <svg viewBox="0 0 24 24" fill="#1677FF">
                    <circle cx="12" cy="12" r="10" fill="#1677FF"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">支</text>
                  </svg>
                </div>
                <span>支付宝</span>
              </label>
              <label :class="['method-option', { active: selectedPaymentMethod === 'wechat' }]">
                <input type="radio" v-model="selectedPaymentMethod" value="wechat" />
                <div class="method-icon wechat-icon">
                  <svg viewBox="0 0 24 24" fill="#07C160">
                    <circle cx="12" cy="12" r="10" fill="#07C160"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">微</text>
                  </svg>
                </div>
                <span>微信支付</span>
              </label>
            </div>
          </div>

          <div v-if="isPaying" class="paying-state">
            <svg class="paying-spinner" viewBox="0 0 24 24">
              <circle class="path" cx="12" cy="12" r="10" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-dasharray="50" stroke-dashoffset="0"/>
            </svg>
            <p>正在跳转支付...</p>
          </div>

          <div v-if="payResult" :class="['pay-result', payResult]">
            <div class="result-icon">
              <svg v-if="payResult === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <p>{{ payMessage }}</p>
          </div>
        </div>

        <div v-if="!isPaying && !payResult" class="pay-modal-footer">
          <button class="cancel-btn" @click="closePayModal">取消</button>
          <button class="confirm-pay-btn" @click="confirmPay">确认支付</button>
        </div>
      </div>
    </div>

    <div v-if="showRefundModal" class="modal-overlay" @click="closeRefundModal">
      <div class="refund-modal" @click.stop>
        <div class="modal-header">
          <h3>申请退款</h3>
          <button class="close-btn" @click="closeRefundModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">退款原因</label>
            <div class="reason-options">
              <label 
                v-for="reason in refundReasons" 
                :key="reason.value"
                :class="['reason-option', { active: refundReason === reason.value }]"
              >
                <input type="radio" v-model="refundReason" :value="reason.value" />
                <span>{{ reason.label }}</span>
              </label>
            </div>
          </div>
          
          <div v-if="refundReason === 'other'" class="form-group">
            <label class="form-label">其他原因</label>
            <input 
              type="text" 
              v-model="refundCustomReason" 
              placeholder="请输入退款原因"
              class="form-input"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeRefundModal">取消</button>
          <button class="confirm-btn" @click="confirmRefund">确认申请</button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
      <div class="confirm-modal" @click.stop>
        <h3 class="modal-title">确认操作</h3>
        <p class="modal-message">{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="modal-cancel" @click="closeConfirmModal">取消</button>
          <button class="modal-confirm" @click="executeConfirmAction">确定</button>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts" name="OrdersList">
import { ref, computed, onMounted, watch } from 'vue'
import type { Order } from '@/types'
import { getOrderList, payOrder, cancelOrder, applyRefund, applyReturn, payOverdueDebt } from '@/api/orders'

// 订单列表
const orders = ref<Order[]>([])
// 分页
const currentPage = ref(1)
const totalCount = ref(0)
const pageSize = 10
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
function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  loadOrders()
}
// 当前选中的标签页
const activeTab = ref(0)
// 支付弹窗是否显示
const showPayModal = ref(false)
// 取消弹窗是否显示
const showCancelModal = ref(false)
// 当前选中的订单ID
const currentOrderId = ref<number>(0)
// 选中的支付方式
const selectedPaymentMethod = ref('alipay')
// 是否正在支付
const isPaying = ref(false)
// 支付结果
const payResult = ref<'success' | 'error' | ''>('')
// 支付结果消息
const payMessage = ref('')
const payType = ref<'order' | 'debt'>('order')
const showRefundModal = ref(false)
const refundReason = ref('')
const refundCustomReason = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

const refundReasons = [
  { value: 'change_mind', label: '不想租了' },
  { value: 'schedule_conflict', label: '时间冲突' },
  { value: 'equipment_issue', label: '装备问题' },
  { value: 'price_concern', label: '价格问题' },
  { value: 'other', label: '其他' }
]

const filterTabs = [
  { label: '全部', value: 0 },
  { label: '待支付', value: 1 },
  { label: '待发货', value: 2 },
  { label: '租赁中', value: 3 },
  { label: '待归还', value: 4 },
  { label: '已归还', value: 5 },
  { label: '已取消', value: 6 }
]
async function loadOrders() {
  try {
    const params: { status?: number; page?: number } = { page: currentPage.value }
    if (activeTab.value !== 0) {
      params.status = activeTab.value
    }
    const data = await getOrderList(params)
    orders.value = data.results || []
    totalCount.value = data.count || 0
    // 当前页超出范围（切tab后数据变少），回退到最后一页
    if (orders.value.length === 0 && currentPage.value > 1) {
      currentPage.value = totalPages.value
      await loadOrders()
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}
function switchTab(value: number) {
  if (activeTab.value === value) return
  activeTab.value = value
  currentPage.value = 1   // 切状态后回到第 1 页，否则可能停在超出范围的页码
  loadOrders()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isOverdue(order: Order): boolean {
  if (!order.end_time) return false
  return new Date(order.end_time) < new Date()
}

function getOverdueMessage(order: Order): string {
  if (!order.end_time) return ''
  const now = new Date()
  const endTime = new Date(order.end_time)
  const diff = endTime.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) {
    return `已逾期 ${Math.abs(days)} 天，请尽快归还`
  } else if (days === 0) {
    return '今日到期，请及时归还'
  } else if (days <= 3) {
    return `剩余 ${days} 天到期`
  } else {
    return `租期进行中`
  }
}

function handlePay(orderId: number) {
  currentOrderId.value = orderId
  payType.value = 'order'
  selectedPaymentMethod.value = 'alipay'
  payResult.value = ''
  payMessage.value = ''
  showPayModal.value = true
}

function closePayModal() {
  showPayModal.value = false
  currentOrderId.value = 0
  selectedPaymentMethod.value = 'alipay'
  isPaying.value = false
  payResult.value = ''
  payMessage.value = ''
}

function getOrderAmount(orderId: number): string {
  const order = orders.value.find(o => o.id === orderId)
  return order?.total_amount || '0.00'
}

function getDebtAmount(orderId: number): string {
  const order = orders.value.find(o => o.id === orderId)
  return order?.overdue_fee || '0.00'
}

async function confirmPay() {
  isPaying.value = true
  
  setTimeout(async () => {
    try {
      let response
      if (payType.value === 'order') {
        response = await payOrder(currentOrderId.value, selectedPaymentMethod.value)
      } else {
        response = await payOverdueDebt(currentOrderId.value)
      }
      console.log('支付响应:', response)
      payResult.value = 'success'
      payMessage.value = payType.value === 'order' ? '支付成功！正在返回订单列表...' : '欠费支付成功！正在返回订单列表...'
      
      setTimeout(() => {
        closePayModal()
        loadOrders()
      }, 1500)
    } catch (error: any) {
      console.error('支付失败:', error)
      payResult.value = 'error'
      payMessage.value = error.response?.data?.error || '支付失败，请重试'
      isPaying.value = false
    }
  }, 1500)
}

async function handleCancel(orderId: number) {
  showConfirm('确定取消该订单吗？', async () => {
    try {
      await cancelOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  })
}

function handleRefund(orderId: number) {
  currentOrderId.value = orderId
  refundReason.value = ''
  refundCustomReason.value = ''
  showRefundModal.value = true
}

function closeRefundModal() {
  showRefundModal.value = false
  refundReason.value = ''
  refundCustomReason.value = ''
}

async function confirmRefund() {
  if (!refundReason.value) {
    showMessage('请选择退款原因', 'error')
    return
  }
  
  if (refundReason.value === 'other' && !refundCustomReason.value.trim()) {
    showMessage('请输入其他原因', 'error')
    return
  }
  
  showRefundModal.value = false
  
  try {
    await applyRefund(currentOrderId.value, refundReason.value, refundCustomReason.value.trim())
    await loadOrders()
    showMessage('退款申请成功', 'success')
  } catch (error) {
    console.error('退款申请失败:', error)
    showMessage('退款申请失败', 'error')
  }
}

async function handleApplyReturn(orderId: number) {
  showConfirm('确定要申请归还吗？归还后管理员将确认并退还押金', async () => {
    try {
      await applyReturn(orderId)
      await loadOrders()
      showMessage('归还申请已提交，请等待管理员确认', 'success')
    } catch (error) {
      console.error('申请归还失败:', error)
      showMessage('申请归还失败', 'error')
    }
  })
}

function handlePayDebt(orderId: number) {
  currentOrderId.value = orderId
  payType.value = 'debt'
  selectedPaymentMethod.value = 'alipay'
  payResult.value = ''
  payMessage.value = ''
  showPayModal.value = true
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

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(async () => {
  await loadOrders()
})

watch(activeTab, async () => {
  currentPage.value = 1
  await loadOrders()
})
</script>

<style scoped>
.orders-list {
  padding: 24px;
}

.list-header {
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

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tab.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-sn {
  font-size: 14px;
  color: #64748b;
}

.order-status {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-1 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-2 {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-3 {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-4 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-5 {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.status-6 {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.rental-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.rental-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.overdue-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #f59e0b;
}

.overdue-warning.is-overdue {
  color: #ef4444;
}

.order-items {
  padding: 12px 0;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 1px dashed #e2e8f0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-name {
  font-size: 14px;
  color: #1e293b;
}

.item-detail {
  font-size: 13px;
  color: #94a3b8;
}

.more-items {
  font-size: 13px;
  color: #94a3b8;
}

.order-price {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row .price-label {
  font-size: 13px;
  color: #64748b;
}

.price-row .price-value {
  font-size: 13px;
  color: #1e293b;
}

.price-row.total .price-label {
  font-weight: 600;
  color: #1e293b;
}

.price-row.total .price-value {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.order-date {
  font-size: 13px;
  color: #94a3b8;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 14px;
  color: #64748b;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.action-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pay-btn {
  background: #667eea;
  color: white;
}

.pay-btn:hover {
  background: #5a6fd6;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
}

.refund-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.refund-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.return-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.return-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

.debt-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.debt-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.view-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
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

.pay-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.pay-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.pay-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-modal-body {
  padding: 24px;
}

.pay-amount {
  text-align: center;
  margin-bottom: 24px;
}

.amount-label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: #ef4444;
}

.payment-methods {
  margin-bottom: 24px;
}

.method-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  display: block;
}

.method-options {
  display: flex;
  gap: 12px;
}

.method-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-option:hover {
  border-color: #667eea;
}

.method-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.method-option input {
  display: none;
}

.method-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-icon svg {
  width: 32px;
  height: 32px;
}

.alipay-icon {
  background: #1677FF;
}

.wechat-icon {
  background: #07C160;
}

.method-option span {
  font-size: 14px;
  color: #334155;
}

.paying-state {
  text-align: center;
  padding: 20px 0;
}

.paying-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.paying-state p {
  font-size: 14px;
  color: #64748b;
}

.pay-result {
  text-align: center;
  padding: 20px 0;
}

.pay-result.success {
  color: #16a34a;
}

.pay-result.error {
  color: #ef4444;
}

.result-icon svg {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
}

.pay-result p {
  font-size: 16px;
  font-weight: 500;
}

.pay-modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.pay-modal-footer .cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.confirm-pay-btn {
  flex: 1;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-pay-btn:hover {
  background: #5a6fd6;
}

.refund-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  display: block;
}

.reason-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reason-option {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reason-option:hover {
  border-color: #667eea;
}

.reason-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.reason-option input {
  display: none;
}

.reason-option span {
  font-size: 14px;
  color: #334155;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.modal-footer .cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #5a6fd6;
}

.message {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 3000;
  animation: slideIn 0.3s ease;
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

.message.success {
  background: #dcfce7;
  color: #16a34a;
}

.message.error {
  background: #fee2e2;
  color: #ef4444;
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  padding: 24px;
  animation: scaleIn 0.2s ease;
}

.confirm-modal .modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.confirm-modal .modal-message {
  font-size: 14px;
  color: #64748b;
  margin: 16px 0 24px;
  line-height: 1.6;
}

.confirm-modal .modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.confirm-modal .modal-cancel,
.confirm-modal .modal-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-modal .modal-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-modal .modal-cancel:hover {
  background: #e2e8f0;
}

.confirm-modal .modal-confirm {
  background: #667eea;
  color: white;
}

.confirm-modal .modal-confirm:hover {
  background: #5a6fd6;
}

/* 分页条 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
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