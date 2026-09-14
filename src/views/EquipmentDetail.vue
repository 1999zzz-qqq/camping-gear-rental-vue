<template>
  <div class="equipment-detail">
    <div v-if="equipment" class="detail-container">
      <div class="detail-image">
        <img 
          :src="equipment.cover_img_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20equipment%20outdoor%20gear%20detail&image_size=portrait_4_3'" 
          :alt="equipment.name"
        />
      </div>
      <div class="detail-info">
        <div class="info-header">
          <h1 class="equipment-name">{{ equipment.name }}</h1>
          <span class="category-tag">{{ equipment.category_name }}</span>
        </div>
        <div class="price-section">
          <div class="price-main">
            <span class="price-label">日租金</span>
            <span class="price-value">¥{{ equipment.daily_rental }}/天</span>
          </div>
          <div class="price-extra">
            <span class="deposit">押金 ¥{{ equipment.deposit }}</span>
            <span class="original-price">原价 ¥{{ equipment.price }}</span>
          </div>
        </div>
        <div class="stock-section">
          <span :class="equipment.stock > 0 ? 'stock-available' : 'stock-unavailable'">
            {{ equipment.stock > 0 ? `库存充足 (${equipment.stock}件)` : '暂无可租' }}
          </span>
          <span v-if="equipment.is_sold_out" class="sold-out">已售出</span>
        </div>
        <div class="rental-config">
          <label class="config-label">租赁天数</label>
          <div class="days-selector">
            <button 
              class="day-btn" 
              v-for="day in [1, 3, 7, 14, 30]" 
              :key="day"
              :class="{ active: rentalDays === day }"
              @click="rentalDays = day"
            >
              {{ day }}天
            </button>
          </div>
        </div>
        <div class="desc-section">
          <h3 class="section-title">装备简介</h3>
          <p class="desc-content">{{ equipment.desc || '暂无简介' }}</p>
        </div>
        <div class="action-section">
          <button 
            class="cart-btn" 
            :disabled="equipment.stock <= 0 || equipment.is_sold_out"
            @click="handleAddToCart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            加入购物车
          </button>
          <button 
            class="rent-btn" 
            :disabled="equipment.stock <= 0 || equipment.is_sold_out"
            @click="handleRent"
          >
            立即租赁
          </button>
          <button class="back-btn" @click="$router.back()">返回列表</button>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="equipment" class="comment-section">
      <div class="comment-header">
        <h2 class="comment-title">用户评价</h2>
        <div class="comment-summary">
          <span class="comment-count">共 {{ comments.length }} 条评价</span>
          <span v-if="averageRating > 0" class="comment-avg">
            平均评分：{{ averageRating.toFixed(1) }} 分
          </span>
        </div>
      </div>

      <!-- 发表评论表单（仅登录用户可见） -->
      <div v-if="isLoggedIn" class="comment-form">
        <h3 class="form-title">发表我的评价</h3>
        <div class="rating-selector">
          <span class="rating-label">评分：</span>
          <div class="star-group">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ active: star <= newRating }"
              @click="newRating = star"
            >★</span>
          </div>
        </div>
        <textarea
          v-model="newContent"
          class="comment-textarea"
          placeholder="请分享您的使用体验（不少于10个字符）..."
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="char-count">{{ newContent.length }}/200</div>
        <div v-if="formError" class="form-error">{{ formError }}</div>
        <button
          class="submit-btn"
          :disabled="submitting"
          @click="handleSubmitComment"
        >
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>
      <div v-else class="login-tip">
        请先<a @click="$router.push('/login')">登录</a>后发表评论
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-if="comments.length === 0" class="empty-comments">
          暂无评价，快来发表第一条评论吧～
        </div>
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-user">
            <div class="user-avatar">{{ comment.username?.charAt(0) || 'U' }}</div>
            <div class="user-info">
              <span class="user-name">{{ comment.username || '匿名用户' }}</span>
              <div class="user-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="mini-star"
                  :class="{ active: star <= comment.rating }"
                >★</span>
              </div>
            </div>
            <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
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

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts" name="EquipmentDetail">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Equipment, Comment } from '@/types'
import { getEquipmentDetail } from '@/api/equiment'
import { addToCart } from '@/api/orders'
import { getCommentList, createComment } from '@/api/comments'
import { storage } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const equipment = ref<Equipment | null>(null)
const rentalDays = ref(1)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 评论相关
const comments = ref<Comment[]>([])
const newRating = ref(0)  // 默认0 = 全部不亮，点击后才点亮
const newContent = ref('')
const formError = ref('')
const submitting = ref(false)

// 平均评分
const averageRating = computed(() => {
  if (comments.value.length === 0) return 0
  const sum = comments.value.reduce((acc, c) => acc + c.rating, 0)
  return sum / comments.value.length
})

// 是否登录（根据 token 判断）
const isLoggedIn = computed(() => !!storage.get('access_token'))

// 加载评论列表
async function loadComments() {
  if (!equipment.value) return
  try {
    comments.value = await getCommentList(equipment.value.id)
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 提交评论
async function handleSubmitComment() {
  if (!equipment.value) return
  formError.value = ''
  // 前端校验
  if (newContent.value.trim().length < 10) {
    formError.value = '评论内容不能少于10个字符'
    return
  }
  if (newRating.value < 1 || newRating.value > 5) {
    formError.value = '请选择评分'
    return
  }
  submitting.value = true
  try {
    await createComment({
      equipment: equipment.value.id,
      content: newContent.value.trim(),
      rating: newRating.value
    })
    showMessage('评论发表成功', 'success')
    // 清空表单并刷新列表
    newContent.value = ''
    newRating.value = 0
    await loadComments()
  } catch (error: any) {
    // 后端错误：未租赁过、已评价过、内容不合法等
    const errMsg = error.response?.data?.detail
      || error.response?.data?.content?.[0]
      || error.response?.data?.rating?.[0]
      || error.response?.data
      || '发表失败，请重试'
    formError.value = String(errMsg)
  } finally {
    submitting.value = false
  }
}

async function loadEquipment() {
  try {
    const id = parseInt(route.params.id as string)
    const res = await getEquipmentDetail(id)
    equipment.value = res
  } catch (error) {
    console.error('加载装备详情失败:', error)
  }
}

async function handleAddToCart() {
  if (!equipment.value) return
  try {
    console.log('添加购物车参数:', {
      equipment_id: equipment.value.id,
      count: 1,
      rental_days: rentalDays.value
    })
    const response = await addToCart({
      equipment_id: equipment.value.id,
      count: 1,
      rental_days: rentalDays.value
    })
    console.log('添加购物车成功:', response)
    showMessage('添加购物车成功', 'success')
  } catch (error: any) {
    console.error('添加购物车失败:', error)
    console.error('响应数据:', error.response?.data)
    console.error('响应状态:', error.response?.status)
    const errorMsg = error.response?.data?.error || error.response?.data || '添加失败'
    showMessage(String(errorMsg), 'error')
  }
}

async function handleRent() {
  if (!equipment.value) return
  try {
    await addToCart({
      equipment_id: equipment.value.id,
      count: 1,
      rental_days: rentalDays.value
    })
    router.push('/orders/create')
  } catch (error: any) {
    console.error('添加购物车失败:', error)
    const errorMsg = error.response?.data?.error || '添加失败，请重试'
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

onMounted(async () => {
  await loadEquipment()
  await loadComments()
})
function formatTime(time: string) {
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
.equipment-detail {
  padding: 24px;
}

.detail-container {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-image {
  width: 500px;
  height: 400px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.equipment-name {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 13px;
  border-radius: 20px;
}

.price-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.price-label {
  font-size: 14px;
  color: #64748b;
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  color: #ef4444;
}

.price-extra {
  display: flex;
  gap: 20px;
}

.deposit,
.original-price {
  font-size: 14px;
  color: #94a3b8;
}

.stock-section {
  display: flex;
  gap: 16px;
}

.stock-available {
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
}

.stock-unavailable {
  font-size: 14px;
  color: #ef4444;
  font-weight: 500;
}

.sold-out {
  padding: 4px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 13px;
  border-radius: 20px;
}

.rental-config {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.config-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  display: block;
}

.days-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.day-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.day-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.desc-section {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.desc-content {
  font-size: 14px;
  color: #64748b;
  line-height: 1.8;
}

.action-section {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.cart-btn {
  padding: 14px 24px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.cart-btn:disabled {
  border-color: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.rent-btn {
  flex: 1;
  padding: 14px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-btn:hover:not(:disabled) {
  background: #5a6fd6;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.rent-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.back-btn {
  padding: 14px 24px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #667eea;
  color: #667eea;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* ===== 评论区样式 ===== */
.comment-section {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.comment-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.comment-summary {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #64748b;
}

.comment-avg {
  color: #f59e0b;
  font-weight: 600;
}

/* 发表评论表单 */
.comment-form {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rating-label {
  font-size: 14px;
  color: #64748b;
}

.star-group {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 28px;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.star.active {
  color: #fbbf24;
}

.star:hover {
  color: #f59e0b;
}

.comment-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}

.form-error {
  font-size: 13px;
  color: #f97316;
  margin-top: 8px;
}

.submit-btn {
  margin-top: 16px;
  padding: 10px 28px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #5a6fd6;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.login-tip {
  text-align: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 32px;
  color: #64748b;
  font-size: 14px;
}

.login-tip a {
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-comments {
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 12px;
}

.comment-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  transition: box-shadow 0.2s ease;
}

.comment-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.user-rating {
  margin-top: 2px;
}

.mini-star {
  font-size: 14px;
  color: #cbd5e1;
}

.mini-star.active {
  color: #fbbf24;
}

.comment-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.comment-content {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
  word-break: break-word;
}

@media (max-width: 900px) {
  .detail-container {
    flex-direction: column;
  }
  .detail-image {
    width: 100%;
    height: 300px;
  }
  .action-section {
    flex-wrap: wrap;
  }
  .cart-btn,
  .rent-btn,
  .back-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>