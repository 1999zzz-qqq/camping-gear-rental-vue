# Bug 记录本（面试用）

> 每个 bug 按模板记录：现象 → 排查 → 根因 → 修复 → 沉淀

---

## Bug 1：分页开启后，用户管理页白屏 `Cannot read properties of null (reading 'id')`

### 现象
- 用户管理页突然白屏，控制台报：
  `TypeError: Cannot read properties of null (reading 'id') at AdminUsers.vue:38`
- 报错行：`<tr v-for="user in users" :key="user.id">`
- 前一天刚给订单列表加了分页功能

### 时间线
1. settings.py 里 DRF 全局分页配置**早就写了**，但 Django 服务是配置前启动的 → 一直没生效
2. 加订单分页后**重启了 Django** → 全局分页对**所有** ViewSet 生效
3. 用户列表接口返回结构从「数组」变成「分页对象」
4. 前端还在按数组取值 → 白屏

### 排查过程
| 步骤 | 动作 | 发现 |
|------|------|------|
| ① 读报错 | 遍历出的某个 `user` 是 null | 数据库不可能有 null 用户，怀疑数据结构 |
| ② 追数据来源 | 看 `loadUsers()`：`users.value = response` | 前端假设 response 是数组 |
| ③ 看真实响应 | Network / console 打印 response.data | 返回 `{count, next, previous, results}` 对象 |
| ④ 推演崩溃点 | v-for 遍历对象时遍历的是 value | 见下方 |

### 根因
**接口契约变更，消费方没同步。**

`v-for` 遍历分页对象时，遍历的是 4 个字段的 value：
```javascript
{
  count: 25,        // user = 25（数字，取.id 得 undefined，不报错）
  results: [...],   // user = 数组（取.id 得 undefined，不报错）
  next: null,       // user = null → null.id 💥 崩溃
  previous: null    // user = null → 同上
}
```
遍历到 `next: null` 时执行 `null.id`，Vue 渲染函数抛异常，整个组件白屏。

> 注：装备页没炸，是因为它的视图重写了 `list()` 直接 `Response(serializer.data)`，**绕过了分页**。

### 修复
1. 前端按契约拆包：`data.results` 取列表、`data.count` 取总数
2. 补全分页条：页码状态、翻页、搜索重置页码、空页回退
3. 渲染层兜底：`<template v-for><tr v-if="user">`，脏数据不拖垮整页
4. 教训落地：改后端响应结构时，全局检索所有消费方，不能只改正在做的页面

### 知识点沉淀
- **DRF 分页契约**：开启 `PageNumberPagination` 后，走默认 `list()` 的接口统一返回
  `{count: 总数, next: 下一页URL, previous: 上一页URL, results: 当前页数组}`；
  重写 `list()` 直接返回 `serializer.data` 的视图不分页
- **前端怎么"知道"响应结构**：没有自动识别，全靠契约——框架文档 / Network 面板 / 后端代码 / 接口文档
- **axios 拦截器** `response => response.data` 已剥掉 axios 外壳，await 拿到的就是后端 JSON 体
- **TS 的 `as` 类型断言只在编译期生效**，运行时不检查，契约写错就会运行时炸
- **v-for 遍历对象遍历的是 value 不是 key**
- **Vue3 中 v-for 和 v-if 不能写在同一元素**（v-if 优先级高，拿不到循环变量），用 `<template v-for>` 包裹
- **翻页参数**：前端发 `?page=2`，后端 DRF 自动转 SQL `LIMIT 10 OFFSET 10`
- **总页数算法**：`Math.ceil(count / pageSize)`
- **分页两个边界处理**：① 搜索/筛选后页码重置为 1；② 当前页数据为空（如最后一页删完）自动回退到最后有效页

### 面试话术
> "有一次给订单列表加分页，重启服务后用户管理页突然白屏报 null.id。排查发现 DRF 全局分页生效后，列表接口返回结构从数组变成了 `{count, results}` 对象，而 v-for 遍历对象时把 `next: null` 当成一条数据，读 null.id 崩溃。这个 bug 让我理解了两点：一是接口响应结构是前后端契约，后端改结构必须全局排查所有调用方；二是渲染层要做防御性兜底，单条脏数据不能拖垮整个列表。"

---

## Bug 2：确认归还接口 500（MySQL 版本兼容）

### 现象
- 管理员点「确认归还」→ 500 Internal Server Error
- Django 日志：`NotSupportedError`

### 根因
- `services.py` 用了 `select_for_update(skip_locked=True)`
- `SKIP LOCKED` 是 **MySQL 8.0.1+** 语法，本地是 **MySQL 5.7.9**，不支持
- 视图只捕获 `ValueError`，`NotSupportedError` 漏网 → 500

### 修复
去掉 `skip_locked=True`，改为普通 `select_for_update()`（排队等锁，单管理员场景够用）

### 沉淀
| MySQL 版本 | SKIP LOCKED |
|-----------|-------------|
| 5.7 | ❌ |
| 8.0.1+ | ✅ |

`select_for_update` = 行锁（事务内 `SELECT ... FOR UPDATE`），防并发超卖；
`skip_locked` = 抢不到锁就跳过该行不等，适合高并发抢库存。

---

## Bug 3：逾期费算成 6180 元（逾期 5 天）

### 现象
- 用户逾期 5 天，逾期费高达 ¥6180，明显不合理

### 根因（两个叠加）
1. **公式基数错**：用「总租金」算逾期费
   `overdue_fee = rental_amount × 150% × 逾期天数`
   → 等于每天罚 1.5 倍**整个租期**的租金，5 天 = 7.5 倍总租金
2. **逾期率过高**：默认 `overdue_rate = 150%`

### 修复
```python
# 改为按日租金算：逾期1天 = 每件装备日租金 × 数量 × 逾期率
rate = overdue_rate / 100
overdue_fee = sum(item.price * item.count * rate * capped_days
                  for item in order.items.all())
# 默认逾期率 150% → 120%
```
修复后同单逾期费 ¥6180 → ¥558

### 沉淀
- 惩罚类费用的基数要和「违约时间单位」一致：按天罚就用日租金，不能用总租金
- 改模型默认值要记得 `makemigrations + migrate`；历史数据的旧默认值不会自动变

---

## Bug 4：确认出库失败——租期天数三方不一致

### 现象
- 购物车选 7 天，管理员看到的订单只有 1 天，出库校验失败

### 根因
- 结算页 `setDefaultTime()` 硬编码 `结束时间 = 开始时间 + 1天`
- 但购物车传的 `rental_days = 7`
- 后端按日期差算出 1 天，与明细里的 7 天冲突 → 出库报错

### 修复
- 租期以**购物车最大租期为唯一真相源**（computed）
- 结束时间 = 开始时间 + 租期天数，自动计算、禁止手改
- 购物车统一租期：默认取所有商品最大租期，只能加不能减（减到初始底线为止，防误触）

### 沉淀
- 同一业务数据只能有**一个真相源**，其他地方派生计算，不要各存一份
- 能自动算的字段就不要让用户手填，从根源杜绝不一致
