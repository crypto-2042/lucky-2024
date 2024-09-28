
## 开发说明

### 技术栈

- iconify
- tailwindcss
- vue 3
- pinia

### 业务知识

- solana
- anchor 智能合约
- metaplex NFT
- solana 钱包

### 项目结构

- pages: 页面
- components: 组件
- layouts: 布局
- store: 状态管理
- utils: 工具类
- types: 类型
- assets: 资源


### 页面

- `index.vue`: 首页
    - 展示所有项目
- `project/[address].vue`: 项目页
    1. 展示项目详情
    2. 以滑动卡片的方式展示每一期提案
    3. 如果提案处于投票中，则展示投票按钮，点击后可以进行投票
    4. 根据当前选中的提案展示投票情况
- `project/creator.vue`: 项目创建页
    - 创建新项目
- `mine.vue`: 我的
    1. 展示当前登录的用户信息
    2. 展示当前的设置菜单
- `vote.vue`: 投票记录页
    - 展示当前用户的投票记录
    - 根据当前选中的项目进行筛选

#### 页面风格

- 深色背景
- 黑金渐变主题
- 圆角
- 阴影
- 渐变
- 边框
- 动画
