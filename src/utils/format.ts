// 格式化金额
export function formatMoney(num: number): string {
  return `¥${num.toFixed(2)}`
}
// 格式化数字
export function formatNum(num: number): string {
  return num.toFixed(2)
}
// 格式化日期：2026-07-02T10:00:00Z → "2026-07-02 10:00"
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}