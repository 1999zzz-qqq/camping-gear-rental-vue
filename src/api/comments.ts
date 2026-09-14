import request from '@/utils/request'
import type { Comment } from '@/types'

// 获取某装备的评论列表（后端全局分页，返回 {count, results}，需解包 results）
export function getCommentList(equipmentId: number) {
  return request.get<Comment[]>('/comments/', {
    params: { equipment_id: equipmentId }
  })
    .then((res: any) => res.results ?? res) as unknown as Promise<Comment[]>
}

// 创建评论
export function createComment(data: {
  equipment: number
  content: string
  rating: number
}) {
  return request.post<Comment>('/comments/', data) as unknown as Promise<Comment>
}

// 修改评论
export function updateComment(id: number, data: {
  content: string
  rating: number
}) {
  return request.put<Comment>(`/comments/${id}/`, data) as unknown as Promise<Comment>
}

// 删除评论
export function deleteComment(id: number) {
  return request.delete(`/comments/${id}/`) as unknown as Promise<void>
}
