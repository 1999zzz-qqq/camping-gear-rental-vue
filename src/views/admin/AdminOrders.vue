<template>
  <div class="admin-orders">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>

    <div v-if="errorMessage" class="error-tip">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success-tip">
      {{ successMessage }}
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label>订单状态</label>
        <select v-model="filterStatus" @change="searchOrders">
          <option value="">全部</option>
          <option value="1">待支付</option>
          <option value="2">待发货</option>
          <option value="3">租赁中</option>
          <option value="4">待归还</option>
          <option value="5">已归还</option>
          <option value="6">已取消</option>
          <option value="7">已买断</option>
        </select>
      </div>
      <div class="filter-group">
        <label>搜索</label>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="订单编号/用户名"
          @keyup.enter="searchOrders"
        />
        <button class="search-btn" @click="searchOrders">搜索</button>
      </div>
    </div>

    <table class="orders-table">
      <thead>
        <tr>
          <th>订单编号</th>
          <th>用户名</th>
          <th>装备</th>
          <th>租赁天数</th>
          <th>总价</th>
          <th>状态</th>
          <th>逾期情况</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.order_sn }}</td>
          <td>{{ order.user_name || '-' }}</td>
          <td>{{ getEquipmentNames(order) }}</td>
          <td>{{ order.rental_days }}天</td>
          <td>¥{{ order.total_amount }}</td>
          <td>
            <span :class="['status-tag', `status-${order.order_status}`]">
              {{ order.order_status_display }}
            </span>
          </td>
          <td>
            <span v-if="order.overdue_days && order.overdue_days > 0" class="overdue-warning">
              逾期{{ order.overdue_days }}天
            </span>
            <span v-else class="no-overdue">正常</span>
          </td>
          <td>
            <button class="detail-btn" @click="viewDetail(order)">详情</button>
            <button 
              v-if="order.order_status === 1" 
              class="action-btn pay-btn"
              @click="handleUpdateStatus(order, 2)"
            >
              确认支付
            </button>
            <button 
              v-if="order.order_status === 2" 
              class="action-btn deliver-btn"
              @click="handleConfirmOutbound(order)"
            >
              发货
            </button>
            <button 
              v-if="order.order_status === 4" 
              class="action-btn return-btn"
              @click="handleConfirmReturn(order)"
            >
              确认归还
            </button>
            <button 
              v-if="order.order_status === 2" 
              class="action-btn buyout-btn"
              @click="handleBuyout(order)"
            >
              买断
            </button>
            <button 
              v-if="order.order_status === 3 && order.overdue_days && order.overdue_days >= 7" 
              class="action-btn force-buyout-btn"
              @click="handleForceBuyout(order)"
            >
              强制买断
            </button>
            <button 
              v-if="order.order_status === 1 || order.order_status === 2" 
              class="action-btn cancel-btn"
              @click="handleCancel(order)"
            >
              取消订单
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="orders.length === 0" class="empty-state">
      <p>暂无订单数据</p>
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

    <div v-if="selectedOrder" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content large">
        <div class="modal-header">
          <h3 class="modal-title">订单详情</h3>
          <span :class="['status-badge', `status-${selectedOrder.order_status}`]">
            {{ selectedOrder.order_status_display }}
          </span>
          <button class="close-btn" @click="closeDetail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="detail-content">
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">订单编号</span>
              <span class="info-value">{{ selectedOrder.order_sn }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">用户</span>
              <span class="info-value">{{ selectedOrder.user_name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">下单时间</span>
              <span class="info-value">{{ formatDate(selectedOrder.create_time) }}</span>
            </div>
            <div class="info-row" v-if="selectedOrder.pay_time">
              <span class="info-label">支付时间</span>
              <span class="info-value">{{ formatDate(selectedOrder.pay_time) }}</span>
            </div>
          </div>
          <div class="info-row">
              <span class="info-label">押金状态</span>
              <span class="info-value">{{ getDepositStatusText(selectedOrder.deposit_status) }}</span>
            </div>

          <div class="info-section">
            <h4 class="section-title">联系信息</h4>
            <div class="info-row">
              <span class="info-label">联系人</span>
              <span class="info-value">{{ selectedOrder.contact_name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">联系电话</span>
              <span class="info-value">{{ selectedOrder.contact_phone }}</span>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">租赁信息</h4>
            <div class="info-row">
              <span class="info-label">租赁天数</span>
              <span class="info-value">{{ selectedOrder.rental_days }}天</span>
            </div>
            <div class="info-row">
              <span class="info-label">开始时间</span>
              <span class="info-value">{{ formatDate(selectedOrder.start_time) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">结束时间</span>
              <span class="info-value">{{ formatDate(selectedOrder.end_time) }}</span>
            </div>
          </div>

          <div class="info-section" v-if="selectedOrder.overdue_days && selectedOrder.overdue_days > 0">
            <h4 class="section-title">逾期信息</h4>
            <div class="info-row">
              <span class="info-label">逾期天数</span>
              <span class="info-value overdue">{{ selectedOrder.overdue_days }}天</span>
            </div>
            <div class="info-row">
              <span class="info-label">逾期费用</span>
              <span class="info-value overdue">¥{{ selectedOrder.overdue_fee }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">逾期欠费</span>
              <span class="info-value overdue">¥{{ selectedOrder.overdue_debt }}</span>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">费用明细</h4>
            <div class="info-row">
              <span class="info-label">租金</span>
              <span class="info-value">¥{{ selectedOrder.rental_amount }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">押金</span>
              <span class="info-value">¥{{ selectedOrder.deposit_amount }}</span>
            </div>
            <div class="info-row" v-if="selectedOrder.buyout_amount">
              <span class="info-label">买断金额</span>
              <span class="info-value">¥{{ selectedOrder.buyout_amount }}</span>
            </div>
            <div class="info-row total">
              <span class="info-label">订单总价</span>
              <span class="info-value">¥{{ selectedOrder.total_amount }}</span>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">租赁装备</h4>
            <div class="items-list">
              <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
                <span class="item-name">{{ item.equipment_name }}</span>
                <span class="item-price">¥{{ item.price }}/天</span>
                <span class="item-count">x{{ item.count }}</span>
                <span class="item-subtotal">¥{{ item.subtotal }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">操作记录</h4>
            <div class="action-log">
              <div class="log-item">
                <span class="log-time">{{ formatDate(selectedOrder.create_time) }}</span>
                <span class="log-action">订单创建</span>
              </div>
              <div v-if="selectedOrder.pay_time" class="log-item">
                <span class="log-time">{{ formatDate(selectedOrder.pay_time) }}</span>
                <span class="log-action">支付成功</span>
              </div>
              <div v-if="selectedOrder.return_time" class="log-item">
                <span class="log-time">{{ formatDate(selectedOrder.return_time) }}</span>
                <span class="log-action">装备归还</span>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <button 
              v-if="selectedOrder.order_status === 1" 
              class="action-btn pay-btn"
              @click="handleUpdateStatus(selectedOrder, 2)"
            >
              确认支付
            </button>
            <button 
              v-if="selectedOrder.order_status === 2" 
              class="action-btn deliver-btn"
              @click="handleConfirmOutbound(selectedOrder)"
            >
              确认出库
            </button>
            <button 
              v-if="selectedOrder.order_status === 4" 
              class="action-btn return-btn"
              @click="handleConfirmReturn(selectedOrder)"
            >
              确认归还
            </button>
            <button 
              v-if="selectedOrder.order_status === 2" 
              class="action-btn buyout-btn"
              @click="handleBuyout(selectedOrder)"
            >
              强制买断
            </button>
            <button 
              v-if="selectedOrder.order_status === 1 || selectedOrder.order_status === 2" 
              class="action-btn cancel-btn"
              @click="handleCancel(selectedOrder)"
            >
              取消订单
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AdminOrders">
import { ref, computed, onMounted, watch } from 'vue'
import type { Order } from '@/types'
import { storage } from '@/utils/storage'
import request from '@/utils/request'

const orders = ref<Order[]>([])
const searchKeyword = ref('')
const filterStatus = ref('')
// 分页状态
const currentPage = ref(1)
const totalCount = ref(0)
const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
// 页码按钮：最多显示5个，当前页居中
const pageNumbers = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(total, start + 4)
  start = Math.max(1, end - 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const selectedOrder = ref<Order | null>(null)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
let errorTimer: number | null = null
let successTimer: number | null = null

function showError(msg: string) {
  errorMessage.value = msg
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = window.setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

function showSuccess(msg: string) {
  successMessage.value = msg
  if (successTimer) clearTimeout(successTimer)
  successTimer = window.setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const depositStatusMap: Record<number, string> = {
  0: '未支付',
  1: '已冻结',
  2: '已退还',
  3: '已扣除'
}

// 搜索/筛选：重置到第1页再加载
function searchOrders() {
  currentPage.value = 1
  loadOrders()
}

// 翻页
function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  loadOrders()
}

async function loadOrders() {
  try {
    const params: Record<string, string | number> = {
      page: currentPage.value
    }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    // DRF 分页响应：{ count, next, previous, results }
    const data = await request.get('/orders/admin/', { params }) as unknown as {
      count: number
      results: Order[]
    }
    orders.value = data.results || []
    totalCount.value = data.count || 0
    // 当前页超出范围（如筛选后数据变少），回退到最后一页
    if (orders.value.length === 0 && currentPage.value > 1) {
      currentPage.value = totalPages.value
      await loadOrders()
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function getEquipmentNames(order: Order) {
  return order.items?.slice(0, 2).map(item => item.equipment_name).join(', ') + 
    (order.items && order.items.length > 2 ? `等${order.items.length}件` : '')
}

function getDepositStatusText(status: number) {
  return depositStatusMap[status] || '-'
}

function viewDetail(order: Order) {
  selectedOrder.value = order
}

function closeDetail() {
  selectedOrder.value = null
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

async function handleUpdateStatus(order: Order, newStatus: number) {
  showConfirm(`确定将订单状态更新为${newStatus === 2 ? '已支付' : '未知'}吗？`, async () => {
    try {
      const token = storage.get('access_token')
      await request.post(`/orders/admin/${order.id}/update-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: { order_status: newStatus }
      })
      closeDetail()
      await loadOrders()
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  })
}

async function handleConfirmOutbound(order: Order) {
  showConfirm('确定发货吗？系统将扣减装备库存，订单进入租赁中状态。', async () => {
    try {
      // ⭐ 1. 路径去掉 /api（baseURL已带）
      // ⭐ 2. 不用手动加token（拦截器已加）
      // ⭐ 3. request.post 第二个参数是请求体，不需要 method/headers
      await request.post(`/orders/admin/${order.id}/deliver/`)
      
      showSuccess('发货成功')   // ⭐ 显示成功提示
      closeDetail()
      await loadOrders()
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || '发货失败'
      showError(msg)
      console.error('发货失败:', error)
    }
  })
}

async function handleConfirmReturn(order: Order) {
  showConfirm('确定确认归还吗？系统将自动计算逾期费用并退还押金。', async () => {
    try {
      const res = await request.post(`/orders/admin/${order.id}/confirm_return/`)
      const data = res.data || res
      let msg = '归还成功，押金已退还'
      if (data.overdue_days > 0) {
        msg = `归还成功，逾期${data.overdue_days}天，扣除逾期费¥${data.overdue_fee}，实退押金¥${data.actual_return_amount}`
        if (parseFloat(data.overdue_debt) > 0) {
          msg += `，另欠逾期费¥${data.overdue_debt}需补缴`
        }
      }
      showSuccess(msg)
      closeDetail()
      await loadOrders()
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || '确认归还失败'
      showError(msg)
      console.error('确认归还失败:', error)
    }
  })
}

async function handleBuyout(order: Order) {
  showConfirm('确定执行强制买断吗？押金将转为买断金额。', async () => {
    try {
      const token = storage.get('access_token')
      await request.post(`/orders/admin/${order.id}/buyout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      closeDetail()
      await loadOrders()
    } catch (error) {
      console.error('买断失败:', error)
    }
  })
}

async function handleForceBuyout(order: Order) {
  showConfirm(`该订单已逾期${order.overdue_days}天，确定执行强制买断并冻结用户账户吗？`, async () => {
    try {
      const token = storage.get('access_token')
      await request.post(`/orders/admin/${order.id}/force_buyout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      closeDetail()
      await loadOrders()
    } catch (error) {
      console.error('强制买断失败:', error)
    }
  })
}

async function handleCancel(order: Order) {
  showConfirm('确定取消该订单吗？', async () => {
    try {
      const token = storage.get('access_token')
      await request.post(`/orders/admin/${order.id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      closeDetail()
      await loadOrders()
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  })
}

onMounted(async () => {
  await loadOrders()
})

watch([filterStatus, searchKeyword], async () => {
  await loadOrders()
})
</script>

<style scoped>
.admin-orders {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  font-size: 14px;
  color: #64748b;
}

.filter-group select,
.filter-group input {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.orders-table th,
.orders-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.orders-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
}

.orders-table td {
  font-size: 14px;
  color: #1e293b;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.status-1 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-tag.status-2 {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-tag.status-3 {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-tag.status-4 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-tag.status-5 {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.status-tag.status-6 {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.status-tag.status-7 {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.overdue-warning {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.no-overdue {
  font-size: 12px;
  color: #22c55e;
}

.detail-btn,
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 6px;
}

.detail-btn {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.pay-btn {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.action-btn.deliver-btn {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.action-btn.return-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.buyout-btn {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.action-btn.force-buyout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-btn.cancel-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
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
  width: 600px;
  max-width: 90%;
}

.modal-content.large {
  width: 800px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-content.confirm-content {
  width: 400px;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.status-1 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-badge.status-2 {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.status-3 {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.status-4 {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.status-badge.status-5 {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.status-badge.status-6 {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.info-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
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

.info-value.overdue {
  color: #ef4444;
}

.info-row.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.info-row.total .info-value {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.item-name {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.item-price,
.item-count {
  font-size: 13px;
  color: #64748b;
}

.item-subtotal {
  font-size: 14px;
  color: #ef4444;
  font-weight: 600;
}

.action-log {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.log-time {
  color: #94a3b8;
}

.log-action {
  color: #64748b;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.detail-actions .action-btn {
  padding: 10px 24px;
  font-size: 14px;
}

.error-tip {
  padding: 12px 20px;
  background: rgba(251, 146, 60, 0.1);
  color: #ea580c;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(251, 146, 60, 0.3);
}
.success-tip {
  padding: 12px 20px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(34, 197, 94, 0.3);
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