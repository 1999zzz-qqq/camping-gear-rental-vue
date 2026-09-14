import request from '@/utils/request'
import type { Equipment, Category } from '@/types'

export function getEquipmentList(params?: {
  keyword?: string
  category_id?: number
  page?: number
}) {
  return request.get<Equipment[]>('/equipment/equipment/', { params }) as unknown as Promise<Equipment[]>
}

export function getEquipmentDetail(id: number) {
  return request.get<Equipment>(`/equipment/equipment/${id}/`) as unknown as Promise<Equipment>
}

// 分类列表
export function getCategoryList() {
  return request.get<{ results: Category[] }>('/equipment/category/')
    .then((res: any) => res.results ?? res)
}