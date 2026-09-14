<template>
  <div class="order-detail">
    <div v-if="order" class="detail-container">
      <div class="detail-header">
        <button class="back-btn" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回列表
        </button>
        <h1 class="page-title">订单详情</h1>
        <span :class="['status-badge', `status-${order.order_status}`]">
          {{ order.order_status_display }}
        </span>
      </div>

      <div class="order-info-card">
        <div class="info-row">
          <span class="label">订单编号</span>
          <span class="value">{{ order.order_sn }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间</span>
          <span class="value">{{ formatDateTime(order.create_time) }}</span>
        </div>
        <div class="info-row">
          <span class="label">支付时间</span>
          <span class="value">{{ order.pay_time ? formatDateTime(order.pay_time) : '-' }}</span>
        </div>
      </div>

      <div class="contact-card">
        <h3 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          联系信息
        </h3>
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-label">联系人</span>
            <span class="contact-value">{{ order.contact_name }}</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">联系电话</span>
            <span class="contact-value">{{ order.contact_phone }}</span>
          </div>
        </div>
      </div>

      <div class="rental-card">
        <h3 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          租赁信息
        </h3>
        <div class="rental-info">
          <div class="rental-item">
            <span class="rental-label">租赁天数</span>
            <span class="rental-value">{{ order.rental_days }} 天</span>
          </div>
          <div class="rental-item">
            <span class="rental-label">开始时间</span>
            <span class="rental-value">{{ formatDateTime(order.start_time) }}</span>
          </div>
          <div class="rental-item">
            <span class="rental-label">结束时间</span>
            <span class="rental-value">{{ formatDateTime(order.end_time) }}</span>
          </div>
        </div>
      </div>

      <div class="items-card">
        <h3 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7h-9"></path>
            <path d="M14 17H5"></path>
            <path d="M17 17c0-2-2-2-2-2 0-2-3-1.5-3-4.5S10 5 12 5c2 0 2 2 2 2"></path>
          </svg>
          租赁装备
        </h3>
        <div class="items-list">
          <div v-for="item in order.items" :key="item.id" class="item-row">
            <div class="item-info">
              <span class="item-name">{{ item.equipment_name }}</span>
              <span class="item-price">¥{{ item.price }}/天</span>
            </div>
            <div class="item-meta">
              <span class="item-count">x{{ item.count }}</span>
              <span class="item-subtotal">¥{{ item.subtotal }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="payment-card">
        <h3 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          费用明细
        </h3>
        <div class="payment-info">
          <div class="payment-row">
            <span class="payment-label">租金</span>
            <span class="payment-value">¥{{ order.rental_amount }}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">押金</span>
            <span class="payment-value">¥{{ order.deposit_amount }}</span>
          </div>
          <div v-if="order.overdue_fee && parseFloat(order.overdue_fee) > 0" class="payment-row">
            <span class="payment-label">逾期费</span>
            <span class="payment-value overdue">¥{{ order.overdue_fee }}</span>
          </div>
          <div class="payment-row total">
            <span class="payment-label">订单总价</span>
            <span class="payment-value">¥{{ order.total_amount }}</span>
          </div>
        </div>
      </div>

      <div class="deposit-card">
        <h3 class="card-title">押金状态</h3>
        <div class="deposit-info">
          <span :class="['deposit-status', `deposit-${order.deposit_status}`]">
            {{ order.deposit_status_display }}
          </span>
          <span v-if="order.deposit_status === 2" class="deposit-return">
            已退还: ¥{{ order.actual_return_amount }}
          </span>
        </div>
      </div>

      <div v-if="order.order_status === 5" class="return-card">
        <h3 class="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          归还信息
        </h3>
        <div class="return-info">
          <div class="return-item">
            <span class="return-label">实际归还时间</span>
            <span class="return-value">{{ order.return_time ? formatDateTime(order.return_time) : '-' }}</span>
          </div>
          <div v-if="order.overdue_days && order.overdue_days > 0" class="return-item">
            <span class="return-label">逾期天数</span>
            <span class="return-value overdue">{{ order.overdue_days }} 天</span>
          </div>
          <div v-if="order.overdue_fee && parseFloat(order.overdue_fee) > 0" class="return-item">
            <span class="return-label">逾期费用</span>
            <span class="return-value overdue">¥{{ order.overdue_fee }}</span>
          </div>
          <div v-if="order.actual_return_amount && parseFloat(order.actual_return_amount) > 0" class="return-item">
            <span class="return-label">实际退还押金</span>
            <span class="return-value success">¥{{ order.actual_return_amount }}</span>
          </div>
          <div v-if="order.overdue_debt && parseFloat(order.overdue_debt) > 0" class="return-item">
            <span class="return-label">逾期欠费</span>
            <span class="return-value danger">¥{{ order.overdue_debt }}</span>
          </div>
        </div>
      </div>

      <div class="actions-card">
        <div class="action-buttons">
          <button 
            v-if="order.order_status === 1" 
            class="action-btn primary"
            @click="handlePay"
          >
            立即支付
          </button>
          <button 
            v-if="order.order_status === 1" 
            class="action-btn danger"
            @click="handleCancel"
          >
            取消订单
          </button>
          <button 
            v-if="order.order_status === 2" 
            class="action-btn warning"
            @click="handleRefund"
          >
            申请退款
          </button>
          <button 
            v-if="order.order_status === 3" 
            class="action-btn success"
            @click="handleApplyReturn"
          >
            申请归还
          </button>
          <button 
            v-if="order.order_status === 4" 
            class="action-btn disabled"
            disabled
          >
            待管理员确认归还
          </button>
          <button 
            v-if="order.overdue_debt && parseFloat(order.overdue_debt) > 0" 
            class="action-btn danger"
            @click="handlePayOverdue"
          >
            支付欠费
          </button>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <p>加载中...</p>
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
  </div>
</template>

<script setup lang="ts" name="OrderDetail">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Order } from '@/types'
import { getOrderDetail, payOrder, cancelOrder, applyRefund, applyReturn, payOverdueDebt } from '@/api/orders'

const route = useRoute()
const router = useRouter()
const order = ref<Order | null>(null)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

async function loadOrder() {
  try {
    const id = parseInt(route.params.id as string)
    order.value = await getOrderDetail(id)
  } catch (error) {
    console.error('加载订单详情失败:', error)
  }
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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

async function handlePay() {
  try {
    await payOrder(order.value!.id)
    await loadOrder()
  } catch (error) {
    console.error('支付失败:', error)
  }
}

async function handleCancel() {
  showConfirm('确定取消该订单吗？', async () => {
    try {
      await cancelOrder(order.value!.id)
      router.push('/orders')
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  })
}

async function handleRefund() {
  const reason = prompt('请选择退款原因：\n1. 不想租了\n2. 时间冲突\n3. 装备问题\n4. 价格问题\n5. 其他')
  if (!reason) return
  
  let reasonType = 'other'
  const reasonMap: Record<string, string> = {
    '1': 'change_mind',
    '2': 'schedule_conflict',
    '3': 'equipment_issue',
    '4': 'price_concern',
    '5': 'other'
  }
  reasonType = reasonMap[reason] || 'other'
  
  try {
    await applyRefund(order.value!.id, reasonType)
    await loadOrder()
  } catch (error) {
    console.error('退款申请失败:', error)
  }
}

async function handleApplyReturn() {
  showConfirm('确定要申请归还吗？归还后管理员将确认并退还押金', async () => {
    try {
      await applyReturn(order.value!.id)
      await loadOrder()
    } catch (error) {
      console.error('申请归还失败:', error)
    }
  })
}

async function handlePayOverdue() {
  showConfirm(`确定支付逾期欠费 ¥${order.value!.overdue_debt} 吗？`, async () => {
    try {
      await payOverdueDebt(order.value!.id)
      await loadOrder()
    } catch (error) {
      console.error('支付欠费失败:', error)
    }
  })
}

onMounted(async () => {
  await loadOrder()
})
</script>

<style scoped>
.order-detail {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.detail-header {
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

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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

.order-info-card,
.contact-card,
.rental-card,
.items-card,
.payment-card,
.deposit-card,
.actions-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 14px;
  color: #64748b;
}

.info-row .value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.contact-info,
.rental-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item,
.rental-item {
  display: flex;
  justify-content: space-between;
}

.contact-label,
.rental-label {
  font-size: 14px;
  color: #64748b;
}

.contact-value,
.rental-value {
  font-size: 14px;
  color: #1e293b;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.item-price {
  font-size: 13px;
  color: #64748b;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.item-count {
  font-size: 13px;
  color: #64748b;
}

.item-subtotal {
  font-size: 14px;
  color: #ef4444;
  font-weight: 600;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
}

.payment-label {
  font-size: 14px;
  color: #64748b;
}

.payment-value {
  font-size: 14px;
  color: #1e293b;
}

.payment-value.overdue {
  color: #ef4444;
}

.payment-row.total {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  margin-top: 8px;
}

.payment-row.total .payment-label {
  font-weight: 600;
}

.payment-row.total .payment-value {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}

.deposit-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.deposit-return {
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
}

.return-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.return-item {
  display: flex;
  justify-content: space-between;
}

.return-label {
  font-size: 14px;
  color: #64748b;
}

.return-value {
  font-size: 14px;
  color: #1e293b;
}

.return-value.overdue,
.return-value.danger {
  color: #ef4444;
}

.return-value.success {
  color: #22c55e;
}

.deposit-status {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.deposit-0 {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.deposit-1 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.deposit-2 {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.deposit-3 {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  flex: 1;
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a6fd6;
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.action-btn.warning {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.action-btn.warning:hover {
  background: rgba(251, 191, 36, 0.15);
}

.action-btn.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.action-btn.success:hover {
  background: rgba(34, 197, 94, 0.15);
}

.action-btn.disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #94a3b8;
}

.loading-state svg {
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
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

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>