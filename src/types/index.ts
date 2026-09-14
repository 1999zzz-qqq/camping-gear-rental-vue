export interface User{
  id:number,
  username:string,
  phone?:string,
  email?:string,
  is_staff?:boolean,
  refresh_token?:string
}
// 设备接口
export interface Equipment{
  id : number,
  name: string,
  price: string,
  daily_rental: string,
  deposit: string,
  stock: number,
  category: number
  category_name?: string
  cover_img_url?: string
  desc?: string
  is_sold_out?: boolean
  is_shelf?: boolean
  is_show?: boolean
  created_time?: string
}
// 设备分类接口
export interface Category{
  id:number,
  name:string,
  children?:Category[]
}

// 订单详情项接口
export interface OrderItem{
  id: number
  equipment_id: number
  equipment_name: string
  price: string
  rental_days: number
  count: number
  subtotal: string
}

// 订单接口
export interface Order{
  id: number
  order_sn: string
  order_status: number
  order_status_display: string
  rental_days: number
  rental_amount: string
  deposit_amount: string
  total_amount: string
  deposit_status: number
  deposit_status_display: string
  start_time: string
  end_time: string
  contact_name: string
  contact_phone: string
  create_time: string
  return_time?: string
  pay_time?: string
  items: OrderItem[]
  refund_status?: number
  refund_status_display?: string
  overdue_days?: number
  overdue_fee?: string
  overdue_debt?: string
  buyout_amount?: string
  user_name?: string
  actual_return_amount?: string
}

export interface CartItem{
  id: number
  equipment_id: number
  equipment_name: string
  equipment_price: string
  daily_rental: string
  deposit: string
  count: number
  rental_days: number
  cover_img_url?: string
  category_name?: string
  stock: number
}

export interface Cart{
  id: number
  items: CartItem[]
  total_count: number
  total_rental: string
  total_deposit: string
}

// 装备评论接口
export interface Comment {
  id: number
  user?: number
  equipment?: number
  content: string
  rating: number
  username?: string
  equipment_name?: string
  create_time: string
  update_time?: string
}