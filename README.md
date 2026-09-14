# 营装备租赁平台 - 前端
基于 Vue 3 + TypeScript + Vite 构建的露营装备租赁平台前端，配合 Django + Django REST Framework 后端，提供装备浏览、购物车、订单租赁、支付退款、装备评论及后台管理等完整功能。

## 技术栈
分类 技术 框架 Vue 3.5（Composition API +`<script setup>` ） 语言 TypeScript 6 构建工具 Vite 8 路由 Vue Router（History 模式，路由守卫控制权限） 状态管理 Pinia HTTP 请求 Axios（统一封装、JWT 拦截器） UI 组件库 Element Plus 认证方式 JWT（Access Token，存储于本地）

## 环境要求
- Node.js`^20.19.0` 或`>=22.12.0`
- npm / pnpm
- 后端服务运行在`http://127.0.0.1:8000` （Django）
## 快速开始
Bash

运行

1
2
3
4
5
6
7
8
9
10
11
12
13
14

`# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173 ）
npm run dev

# 3. 生产构建（先执行 TypeScript 类型检查，再打包）
npm run build

# 4. 本地预览生产构建
npm run preview

# 单独执行类型检查
npm run type-check`

开发服务器已配置代理：所有`/api` 开头的请求自动转发到`http://127.0.0.1:8000` ，解决跨域问题（见`vite.config.ts` ）。

## 功能模块
### 用户端
- 用户认证 ：登录（含图形验证码）、注册（用户名/密码/手机号/邮箱校验）、JWT 登录态保持
- 装备浏览 ：首页、装备分类导航、装备列表（关键词搜索、分类筛选）、装备详情
- 购物车 ：加入购物车、修改数量与租赁天数、删除、清空
- 订单管理 ：创建订单（自动计算结束时间、租金、押金）、订单列表（分页）、订单详情
- 支付与售后 ：模拟支付（支付宝/微信）、归还装备（逾期费计算）、申请退款（退款原因选择）
- 装备评论 ：星级评分（1-5 星）+ 文字评价、评论列表、平均评分；仅租赁并归还过该装备的用户可评价
- 个人中心 ：查看/修改个人信息、修改密码
### 管理端（需管理员权限）
- 用户管理、装备管理（上下架、分类、图片上传/URL）、订单管理（分页、状态处理）
## 目录结构
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36

`src/
├── api/                  # 接口封装（按业务模块划分）
│   ├── auth.ts           # 登录/注册/验证码
│   ├── user.ts           # 用户信息
│   ├── equiment.ts       # 装备、分类
│   ├── orders.ts         # 购物车、订单、支付、退款
│   └── comments.ts       # 装备评论
├── components/           # 公共组件
│   ├── Header.vue
│   ├── Sidebar.vue
│   ├── CategoryNav.vue   # 分类导航
│   └── EquipmentCard.vue # 装备卡片
├── views/                # 页面
│   ├── Home.vue          # 首页
│   ├── Login.vue         # 登录
│   ├── Register.vue      # 注册
│   ├── EquipmentList.vue # 装备列表
│   ├── EquipmentDetail.vue # 装备详情（含评论）
│   ├── Cart.vue          # 购物车
│   ├── CreateOrder.vue   # 创建订单
│   ├── OrdersList.vue    # 订单列表
│   ├── OrderDetail.vue   # 订单详情
│   ├── Profile.vue       # 个人中心
│   └── admin/            # 管理端页面
│       ├── AdminUsers.vue
│       ├── AdminEquipment.vue
│       └── AdminOrders.vue
├── router/index.ts       # 路由配置 + 全局前置守卫
├── stores/               # Pinia 状态管理
├── utils/
│   ├── request.ts        # Axios 实例与拦截器
│   ├── storage.ts        # 本地存储封装
│   └── format.ts         # 格式化工具
├── types/index.ts        # 全局 TypeScript 类型定义
├── App.vue
└── main.ts`

## 核心设计说明
### 1. 请求封装（src/utils/request.ts）
- `baseURL: '/api'` ，统一接口前缀，配合 Vite 代理转发至后端
- 请求拦截器：自动在 Header 中携带`Authorization: Bearer <token>`
- 响应拦截器：直接返回`response.data` ；遇到 401 清除登录态并跳转登录页（登录页本身不重定向，避免死循环）
### 2. 路由权限（src/router/index.ts）
- 通过路由元信息`meta.requiresAuth` （需登录）、`meta.requiresAdmin` （需管理员）控制访问
- 全局前置守卫`beforeEach` ：未登录访问受保护页面 → 跳转登录页；已登录访问登录页 → 跳转首页
- 所有页面组件采用路由懒加载（动态`import()` ），按需打包
### 3. 分页数据处理
后端 DRF 列表接口返回`{ count, next, previous, results }` 结构，前端在 API 层统一解包`results` 数组（见`api/comments.ts` 、`api/equiment.ts` ），视图层直接操作数组。

### 4. 装备评论业务规则
- 评论需登录，且 只有租赁并归还过该装备 （订单状态=已归还）才能评价
- 一人对同一装备仅能评价一次（后端唯一约束）
- 内容不少于 10 字符、评分 1-5 星，前后端双重校验
- 错误信息在表单内橙色提示；成功显示绿色提示条并自动刷新列表
## 主要页面路由
路径 页面 权限 `/login` 、`/register` 登录 / 注册 公开 `/` 首页 公开 `/equipment` 、`/equipment/:id` 装备列表 / 详情 公开 `/cart` 购物车 公开 `/orders/create` 创建订单 需登录 `/orders` 、`/orders/:id` 订单列表 / 详情 登录可见本人数据 `/profile` 个人中心 需登录 `/admin/users` 用户管理 管理员 `/admin/equipment` 装备管理 管理员 `/admin/orders` 订单管理 管理员

## 配套后端
后端为 Django + Django REST Framework + MySQL（JWT 认证），需先启动后端服务并执行数据库迁移，前端接口方可正常使用。
## 后端仓库地址
[后端仓库](https://github.com/1999-zzz-qqq/Camping_gear_rental)
## 前端仓库地址
[前端仓库](https://github.com/1999-zzz-qqq/camping-gear-rental-vue)
