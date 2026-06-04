# LeetCode 题解查询工具

🎯 **快速、离线、可搜索的LeetCode题解查询工具**，包含**3,901个题目**，支持多语言（Java、Python、SQL、JavaScript、Shell）。

## ✨ 特性

- 🔍 **快速搜索**: 实时搜索3901个题目，毫秒级响应
- 📱 **响应式设计**: 完美支持桌面、平板、手机
- 💻 **多语言支持**: Java、Python、SQL、JavaScript、Shell
- 🎓 **完整题解**: 包含题目描述、解题思路、代码实现、复杂度分析
- ⚡ **离线可用**: 纯静态站点，无需后端服务
- 🏷️ **分类标签**: 按难度、算法标签筛选问题

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
# 或 npm install / yarn install
```

### 开发模式
```bash
pnpm dev
```
打开 http://localhost:3000

### 构建生产版本
```bash
pnpm build
# 输出到 dist/ 目录
```

### 运行测试
```bash
pnpm test
```

## 📊 数据统计

| 语言 | 题目数 | 覆盖范围 |
|------|--------|--------|
| Java | 3,517 | LeetCode 1-3517 |
| Python | 3,517 | LeetCode 1-3517 |
| SQL | 313 | 数据库相关题目 |
| JavaScript | 67 | JS特定题目 |
| Shell | 4 | Shell脚本题目 |
| **总计** | **3,901** | **所有通用+特定题目** |

## 🏗️ 项目结构

```
leetcode-archive/
├── content/                   # LeetCode题目内容
│   ├── java/                  # Java版本 (3517题)
│   ├── python/                # Python版本 (3517题)
│   ├── sql/                   # SQL题解
│   ├── javascript/            # JavaScript题解
│   └── shell/                 # Shell脚本
│
├── src/
│   ├── components/            # Astro组件
│   │   ├── ProblemCard.astro
│   │   └── LanguageTabs.astro
│   ├── layouts/               # 布局组件
│   │   └── BaseLayout.astro
│   ├── pages/                 # 页面
│   │   ├── index.astro        # 首页
│   │   └── problems/          # 问题详情页
│   └── scripts/               # 工具脚本
│       ├── content-loader.mjs # 内容加载器
│       └── build-index.mjs    # 搜索索引生成
│
├── public/
│   └── search-index.json      # 搜索索引 (1.1MB)
│
└── dist/                      # 构建输出 (生产)
```

## 🔍 搜索功能

### 支持的搜索方式
- **题号搜索**: 输入数字如 "1" 或 "100"
- **题目名搜索**: 输入关键词如 "Two Sum" 或 "二元和"
- **标签筛选**: 按难度 (Easy/Medium/Hard) 过滤
- **语言过滤**: 选择特定编程语言查看

### 搜索技术
- 基于 Fuse.js 的模糊匹配
- 客户端实时搜索，无网络延迟
- 搜索索引大小仅 1.1 MB

## 💡 技术栈

- **框架**: Astro 6.4 (静态站点生成)
- **样式**: Tailwind CSS 4.3 + Lightning CSS
- **搜索**: Fuse.js 7.4 (客户端全文搜索)
- **Markdown**: gray-matter + marked + highlight.js
- **测试**: Vitest 4.1
- **包管理**: pnpm

## 📖 使用示例

### 页面结构

#### 首页 (`/`)
- 搜索输入框
- 难度过滤按钮
- 问题卡片列表
- 点击卡片进入详情

#### 问题详情 (`/problems/:number`)
- 问题标题、难度、标签
- 问题描述和约束
- 多语言代码标签切换
- 完整的解题思路
- 代码实现和复杂度分析

### 预生成页面

目前预生成的页面包括：
- 首页 (`/index.html`)
- 前5个问题 (`/problems/1-5/`)

其他问题的元数据可通过搜索功能访问。

## 🛠️ 开发指南

### 添加新题目

1. 在对应语言文件夹中创建 Markdown 文件，命名格式为 `{题号}.{slug}.md`：
   ```
   content/{language}/{number}.{slug}.md
   ```
   例如：`content/python/1.two-sum.md`

2. 文件内容使用 frontmatter 格式：
   ```markdown
   ---
   title: 1.two-sum
   date: 2025-01-13
   categories: easy
   tags: [数组, 哈希表]
   ---

   ## 题目描述
   ...
   ```

   - `title` 格式为 `{题号}.{slug}`，与文件名一致（不含 `.md`）
   - `categories` 为 `easy` / `medium` / `hard`
   - `tags` 为标签数组

3. 构建项目（prebuild → astro build → postbuild 自动串联）：
   ```bash
   pnpm build
   ```

4. （可选）更新中文标题映射，支持中文搜索：
   ```bash
   node src/scripts/fetch-zh-titles.mjs
   ```

### 修改样式

编辑 `src/components/` 和 `src/layouts/` 中的 `.astro` 文件。样式使用 Tailwind CSS v4 原子类，全局配置见 `src/layouts/BaseLayout.astro`。

### 运行测试

```bash
pnpm test              # 运行所有测试
pnpm test --watch      # 监视模式
pnpm test --coverage   # 覆盖率报告
```

## 📈 构建性能

| 操作 | 时间 |
|------|------|
| 搜索索引生成 | < 1s |
| Vite构建 | ~6s |
| 页面生成 (5页) | ~2s |
| **总构建时间** | **~10s** |

## 🎓 学习资源

每道题目都包含：
- 📝 详细的问题描述（中文）
- 💡 多种解题思路
- 💻 完整代码实现
- 📊 时间和空间复杂度分析
- 🏷️ 算法标签分类


## 📄 许可证

[GPLv3 License](LICENSE)

## 🔗 相关资源

- [LeetCode 官网](https://leetcode.com)
- [Astro 文档](https://astro.build)
- [Tailwind CSS](https://tailwindcss.com)

---

