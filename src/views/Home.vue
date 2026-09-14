<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>探索户外，畅享自然</h1>
        <p>精选优质露营装备，让您的户外之旅更加精彩</p>
        <router-link to="/equipment" class="hero-btn">浏览装备</router-link>
      </div>
    </section>

    <section class="stats">
      <div class="stat-item">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7h-9"></path>
            <path d="M14 17h9"></path>
            <path d="M17 21h-9"></path>
            <path d="M12 12h9"></path>
            <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">500+</span>
          <span class="stat-label">装备种类</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">10000+</span>
          <span class="stat-label">满意用户</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">98%</span>
          <span class="stat-label">好评率</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">24/7</span>
          <span class="stat-label">全天服务</span>
        </div>
      </div>
    </section>

    <section class="categories">
      <h2 class="section-title">装备分类</h2>
      <div class="category-list">
        <div 
          v-for="cat in categories" 
          :key="cat.id" 
          class="category-card"
          @click="$router.push({name: 'equipment', params: {category_id: cat.id}})"
        >
          <div class="category-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-9"></path>
              <path d="M14 17h9"></path>
              <path d="M17 21h-9"></path>
              <path d="M12 12h9"></path>
              <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path>
            </svg>
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </section>

    <section class="hot-equipment">
      <div class="section-header">
        <h2 class="section-title">热门装备</h2>
        <router-link :to="{name: 'equipment'}" class="view-more">查看全部 →</router-link>
      </div>
      <div class="equipment-grid">
        <div 
          v-for="item in hotEquipment" 
          :key="item.id" 
          class="equipment-card"
          @click="$router.push({name: 'equipment-detail', params: {id: item.id}})"
        >
          <div class="equipment-image">
            <img 
              :src="item.cover_img_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20equipment%20outdoor%20gear&image_size=square'" 
              :alt="item.name"
            />
          </div>
          <div class="equipment-info">
            <h3 class="equipment-name">{{ item.name }}</h3>
            <p class="equipment-category">{{ item.category_name }}</p>
            <div class="equipment-price">
              <span class="daily-price">¥{{ item.daily_rental }}/天</span>
              <span class="deposit">押金 ¥{{ item.deposit }}</span>
            </div>
            <div class="equipment-stock">
              <span :class="item.stock > 0 ? 'stock-available' : 'stock-unavailable'">
                {{ item.stock > 0 ? '库存充足' : '暂无可租' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2 class="section-title">我们的优势</h2>
      <div class="feature-list">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h3>品质保证</h3>
          <p>所有装备经过严格检测，确保安全可靠</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3>便捷租赁</h3>
          <p>在线预约，快速取还，一站式服务</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3>全天服务</h3>
          <p>专业客服团队，随时为您解答疑问</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="Home">
import { ref, onMounted } from 'vue'
import type { Equipment, Category } from '@/types'
import { getEquipmentList, getCategoryList } from '@/api/equiment'
// 
const categories = ref<Category[]>([])
const hotEquipment = ref<Equipment[]>([])
// 加载数据
onMounted(async () => {
  try {
    const [catRes, equipRes] = await Promise.all([
      getCategoryList(),
      getEquipmentList({ page: 1 })
    ])
    categories.value = catRes
    hotEquipment.value = equipRes.slice(0, 6)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.home {
  min-height: 100%;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 40px;
  text-align: center;
  color: white;
  background-image: url('https://images.pexels.com/photos/7689148/pexels-photo-7689148.jpeg');
  background-size: cover;
  background-position: center;
  
}

.hero-content h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.hero-btn {
  display: inline-block;
  padding: 14px 32px;
  background: white;
  color: #667eea;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 40px;
  background: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  color: #667eea;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.categories {
  padding: 40px;
  background: #f8fafc;
}

.category-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.category-icon {
  color: #667eea;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.hot-equipment {
  padding: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-more {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
}

.view-more:hover {
  text-decoration: underline;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.equipment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.equipment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.equipment-image {
  height: 200px;
  overflow: hidden;
}

.equipment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.equipment-card:hover .equipment-image img {
  transform: scale(1.05);
}

.equipment-info {
  padding: 20px;
}

.equipment-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.equipment-category {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.equipment-price {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.daily-price {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.deposit {
  font-size: 13px;
  color: #94a3b8;
}

.equipment-stock {
  font-size: 13px;
}

.stock-available {
  color: #22c55e;
}

.stock-unavailable {
  color: #ef4444;
}

.features {
  padding: 40px;
  background: #f8fafc;
}

.feature-list {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 280px;
}

.feature-icon {
  color: #667eea;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}
</style>