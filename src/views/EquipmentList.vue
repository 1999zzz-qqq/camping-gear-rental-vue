<template>
  <div class="equipment-list">
    <div class="list-container">
      <aside class="category-sidebar">
        <div class="sidebar-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7h-9"></path>
            <path d="M14 17h9"></path>
            <path d="M17 21h-9"></path>
            <path d="M12 12h9"></path>
            <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path>
          </svg>
          <span>装备分类</span>
        </div>
        <div class="category-tree">
          <button 
            class="category-item"
            :class="{ active: selectedFirstCategory === null && selectedSecondCategory === null }"
            @click="handleFirstCategoryClick(null)"
          >
            全部装备
          </button>
          <div v-for="firstCat in categories" :key="firstCat.id" class="first-category">
            <button 
              class="category-item first-item"
              :class="{ active: selectedFirstCategory === firstCat.id }"
              @click="handleFirstCategoryClick(firstCat.id)"
            >
              {{ firstCat.name }}
              <svg 
                v-if="firstCat.children && firstCat.children.length > 0" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                :class="{ rotated: selectedFirstCategory === firstCat.id }"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div 
              v-if="selectedFirstCategory === firstCat.id && firstCat.children && firstCat.children.length > 0" 
              class="second-category-list"
            >
              <button 
                v-for="secondCat in firstCat.children" 
                :key="secondCat.id"
                class="category-item second-item"
                :class="{ active: selectedSecondCategory === secondCat.id }"
                @click="handleSecondCategoryClick(secondCat.id)"
              >
                {{ secondCat.name }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="equipment-content">

        <div class="results-info">
          <span>共 {{ equipmentList.length }} 件装备</span>
        </div>

        <div class="equipment-grid">
          <div 
            v-for="item in equipmentList" 
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

        <div v-if="equipmentList.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7h-9"></path>
            <path d="M14 17h9"></path>
            <path d="M17 21h-9"></path>
            <path d="M12 12h9"></path>
            <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path>
          </svg>
          <p>暂无装备</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts" name="EquipmentList">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Equipment, Category } from '@/types'
import { getEquipmentList, getCategoryList } from '@/api/equiment'
// 装备列表页面逻辑
//路由参数
const route = useRoute()
// 装备列表
const equipmentList = ref<Equipment[]>([])
// 装备分类列表
const categories = ref<Category[]>([])
// 选中的一级分类
const selectedFirstCategory = ref<number | null>(null)
//选中的二级分类
const selectedSecondCategory = ref<number | null>(null)
// 搜索关键词
const searchKeyword = ref('')
// 加载装备列表
async function loadEquipment() {
  try {
    // 构建查询参数
    const params: { keyword?: string; category_id?: number } = {}
    // 搜索关键词
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    // 分类筛选
    if (selectedSecondCategory.value !== null) {
      // 选中二级分类
      params.category_id = selectedSecondCategory.value
    } else if (selectedFirstCategory.value !== null) {
      // 选中一级分类
      const firstCat = categories.value.find(c => c.id === selectedFirstCategory.value)
      // 一级分类下的所有子分类ID
      const categoryIds: number[] = [selectedFirstCategory.value]
      if (firstCat && firstCat.children && firstCat.children.length > 0) {
        categoryIds.push(...firstCat.children.map(c => c.id))
      }
      // 加载所有子分类下的装备
      params.category_id = categoryIds[0]
      const allEquipments: Equipment[] = []
      for (const id of categoryIds) {
        const res = await getEquipmentList({ category_id: id })
        allEquipments.push(...res)
      }
      equipmentList.value = allEquipments
      return
    }
    const res = await getEquipmentList(params)
    equipmentList.value = res
  } catch (error) {
    console.error('加载装备失败:', error)
  }
}
// 加载装备分类列表
async function loadCategories() {
  try {
    const res = await getCategoryList()
    categories.value = res
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}
// 处理一级分类点击事件
function handleFirstCategoryClick(id: number | null) {
  selectedFirstCategory.value = id
  selectedSecondCategory.value = null
  loadEquipment()
}
// 处理二级分类点击事件
function handleSecondCategoryClick(id: number) {
  selectedSecondCategory.value = id
  loadEquipment()
}
// 处理搜索事件
function handleSearch() {
  loadEquipment()
}
// 初始化加载装备列表
onMounted(async () => {
  const keyword = route.query.keyword as string
  const categoryId = route.query.category_id as string
  if (keyword) {
    searchKeyword.value = keyword
  }
  if (categoryId) {
    const catId = parseInt(categoryId)
    const firstCat = categories.value.find(c => c.id === catId)
    if (firstCat) {
      selectedFirstCategory.value = catId
    } else {
      for (const cat of categories.value) {
        if (cat.children && cat.children.find(c => c.id === catId)) {
          selectedFirstCategory.value = cat.id
          selectedSecondCategory.value = catId
          break
        }
      }
    }
  }
  // 加载装备分类列表
  await loadCategories()
  // 加载装备列表
  await loadEquipment()
})
// 监听一级分类、二级分类、搜索关键词变化
watch([selectedFirstCategory, selectedSecondCategory, searchKeyword], () => {
  loadEquipment()
})
</script>

<style scoped>
.equipment-list {
  padding: 24px;
}

.list-container {
  display: flex;
  gap: 24px;
}

.category-sidebar {
  width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: left;
}

.category-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.category-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.first-item {
  font-weight: 500;
}

.second-category-list {
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
  margin-left: 8px;
  margin-top: 4px;
}

.second-item {
  padding-left: 16px;
  font-size: 13px;
}

.category-item svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.category-item svg.rotated {
  transform: rotate(90deg);
}

.equipment-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  margin-bottom: 20px;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.search-filter svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-filter .search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #334155;
}

.search-filter .search-input::placeholder {
  color: #94a3b8;
}

.search-filter .search-btn {
  padding: 8px 20px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-filter .search-btn:hover {
  background: #5a6fd6;
}

.results-info {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
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
  height: 180px;
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
  padding: 16px;
}

.equipment-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.equipment-category {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
}

.equipment-price {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.daily-price {
  font-size: 17px;
  font-weight: 700;
  color: #ef4444;
}

.deposit {
  font-size: 12px;
  color: #94a3b8;
}

.equipment-stock {
  font-size: 12px;
}

.stock-available {
  color: #22c55e;
}

.stock-unavailable {
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}
</style>