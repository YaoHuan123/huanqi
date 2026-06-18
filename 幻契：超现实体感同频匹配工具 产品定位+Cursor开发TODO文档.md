# 幻契：超现实体感同频匹配工具 产品定位\+Cursor开发TODO文档

## 文档说明

适配工具：Cursor（前端React\+Next\.js、后端Node\.js Prisma、轻量化SQLite本地初期数据库，后续可无缝迁移Supabase）

核心约束（永久不变）：1\.绝不做大流量、不做公域社交；2\.无APP内置聊天功能；3\.匹配成功仅支持互换用户自主填写的外部联系方式；4\.月收益目标1000\-5000元，覆盖服务器\+AI调用成本即可；5\.产品归类为【个人主观体验语义匹配工具】，规避陌生人社交类目监管；6\.**必须支持全球 App Store（iOS）正式上架**，与 Web 端并行，不以 PWA 替代 iOS 原生分发

目标用户：18\-36岁高敏感人群、梦境体验者、存在主义爱好者、艺术创作者、解离体验人群，全网存量小众圈层，用户规模永久控制在5000DAU以内，停止主动引流

---

## V1 范围锁定：英文版（English-first MVP）

**当前开发阶段仅做英文版**；中文 UI、中文匹配池、微信/小红书联系方式、通义 API、Stripe 中文版等一律延后至 V2。

| 维度 | V1（现在做） | V2（以后做） |
|------|-------------|-------------|
| App / Web UI | **English only** | 简体中文 + 其他语言 |
| 体感撰写语言 | **English only** | 多语言标签 + 跨语言匹配 |
| 匹配池 | **仅英文体感** | 全球混合池 / 同语言优先 |
| 外部联系方式 | **Email、Instagram、Discord** | 可加微信、小红书 |
| 登录 | **Sign in with Apple + Email OTP** | 可选手机号（中国区） |
| AI | **OpenAI Embedding + Moderation** | 可选通义降级 |
| 支付 | **Apple IAP（$0.99 / $2.99）** | Web Stripe 备用 |
| 合规文案 | **English Privacy Policy / Terms** | 中文法务版 |
| 引流 | **Reddit、Tumblr、Discord 英文社区** | 豆瓣、小红书 |

**英文品牌对外名称**

- App 显示名：**HuanQi**
- 副标题 / Slogan：**Find people who share the same surreal sensation**
- App Store 副标题：**Semantic sensation matching**
- 内部中文产品名「幻契」保留在文档与代码注释，不上英文 UI

---

# 第一部分：正式产品定位文档（上架应用商店、官网直接复用）

## 1\.产品基础信息

- 产品名称：**HuanQi**（中文名：幻契；寓意：意识体感暗合，缔结同频契约）

- 产品Slogan：**Find people who share the same surreal sensation**

- 产品类目：工具类\-语义匹配工具（非社交、非树洞、非交友）

- 使用终端：**iOS 原生 App（全球 App Store 上架，主分发渠道）** \+ Web 端（官网/备用入口）；Android 暂不做，H5 仅作营销落地页，**不以 PWA 替代 iOS 上架**

- 核心差异化：全网唯一只匹配**不可标签化、超现实主观体感**，拒绝情绪、人格、爱好标签；平台不承接任何社交对话，仅做匹配中介，场外自主沟通

## 2\.用户核心痛点拆解（精准对应产品功能）

1. 体感失语：无法用通用词汇描述解离、时空错觉、感官异化、梦境残留等超现实感受，主流社交软件无法匹配

2. 社交排斥：厌恶匿名线上尬聊、颜值社交、快餐搭子，只想一对一深度同频交流，希望用 **Email / Instagram / Discord** 等自有渠道私下沟通（V1 英文版）

3. 圈层闭塞：Reddit、Tumblr 等同好分散，无法基于**个人瞬时体感**精准匹配，只能基于兴趣标签聚合

## 3\.核心业务流程（极简闭环，无多余跳转）

用户注册（**Sign in with Apple** \+ **Email OTP**）→ 撰写 **English sensation record**（80–500 words；禁止标签、图片、外貌信息）→ 自愿填写外部联系方式（Email / Instagram / Discord handle，可选，不填无法互换）→ OpenAI Embedding 计算英文体感全局相似度 → 双向相似度 ≥72% 判定为匹配 → 双方收到 APNs / 站内通知，互看体感原文 → 任一方 **Apple IAP** 付费解锁 → 双向查看外部联系方式 → **72 小时**后后台清空联系方式，永久不留存

## 4\.合规风控设计（小规模零法务成本，Cursor直接代码埋点）

- 内容风控：禁止5类内容：自残/自杀描述、极端虚无反社会、色情体感、宗教玄学通灵、猎奇暴力幻觉。前端发布页实时AI预审\+后台定时批量复核，Cursor配置AI自动封禁脚本

- 隐私风控：联系方式短时留存策略：匹配解锁后72小时强制脱敏删除，数据库只留存脱敏体感文本，不关联用户隐私；用户支持一键注销：清空所有体感记录、匹配日志、联系方式，1秒永久删除不可恢复

- 场外免责：全站全局弹窗、注册协议、解锁付费页三处同步免责声明：幻契仅提供文本语义相似度计算工具，不参与用户场外沟通，场外骚扰、纠纷、诈骗由用户自行承担，平台仅提供举报封禁权限

- 账号风控：单 Apple ID / 邮箱 / 手机号仅注册1账号，限制每日体感发布2次、每日匹配查看3次，杜绝羊毛党、骚扰批量账号

- **App Store 合规（全球 iOS 强制项）**：
  - App Store 类目选 **Utilities（工具）**，副标题强调「语义相似度计算」，**禁止选 Social Networking / Dating**
  - 满足 Guideline **1.2 用户生成内容**：内置举报、拉黑、封禁、24h 内处理机制；App Review 备注说明「无内置 IM、仅交换用户自填外部联系方式」
  - 满足 Guideline **5.1 隐私**：独立 Privacy Policy URL、App Privacy 营养标签、GDPR 数据导出/删除、年龄分级 **17\+**（敏感心理/解离类 UGC）
  - 满足 Guideline **3.1.1 应用内购买**：iOS 端所有数字权益（解锁券、订阅会员）**必须走 Apple IAP**，禁止跳转微信/外链支付
  - 提供 **Sign in with Apple**（若提供邮箱/手机号等第三方登录则 Apple 登录为必选项）
  - 推送匹配通知使用 **APNs**，需在 App Store Connect 配置 Push Notifications capability

## 5\.商业化方案（零打扰、不破坏调性、微收益）

不做广告、不做信息流、不做推荐流量，仅双付费项；**iOS 端经 Apple IAP 抽成后，毛利率约 70%–85%**（Small Business Program 15%，否则 30%）

1. 单次解锁券：**$0.99 USD**（StoreKit 消耗型 IAP）。单次一对匹配双向联系方式解锁，永久有效，仅针对当前匹配对象

2. 月契会员：**$2.99 USD / month**（StoreKit 自动续订订阅）。权益：每日 5 次匹配查看、优先语义匹配、屏蔽负能量超标体感、导出个人体感 PDF

3. **V1 不做 Web 端第三方支付**；Stripe 延后 V2。iOS App 内仅 IAP

## 6\.产品页面结构（总计5个页面，极致轻量化）

1. 登录注册页：**Sign in with Apple** \+ Email OTP；**English-only** copy；Privacy Policy / Terms 强制勾选；年龄 **17\+**

2. 体感录入页：主文本输入框（限制80\-500字，过滤短句水内容）、联系方式录入框、发布规则提示

3. 同频文库页：匿名公开体感合集，隐藏所有联系方式，无评论、无点赞、无用户昵称，仅纯文本浏览，解决用户无匹配时留存问题

4. 我的匹配页：所有历史匹配列表、匹配体感预览、解锁付费入口、拉黑用户入口

5. 个人设置页：一键注销、数据导出、账号拉黑、支付订单记录

---

# 第二部分：Cursor专属分阶段TODO开发文档（按Cursor开发习惯拆分，可直接复制到Cursor侧边栏Todo）

开发技术栈（Cursor 最优 AI 适配组合；**含全球 iOS 上架，预估 4–5 周首版**）

- **iOS 客户端**：Expo（React Native）\+ Expo Router；共享 TypeScript 类型与 API 客户端；EAS Build 打包上架；StoreKit 2（`expo-in-app-purchases` 或 RevenueCat 简化收据校验）
- **Web 端**：Next\.js 15 \+ TailwindCSS（官网、隐私政策页、管理后台）
- **后端**：Next\.js API Route（Monorepo：`apps/ios` \+ `apps/web` \+ `packages/shared`）
- **数据库**：Supabase PostgreSQL（**iOS 全球用户不宜用本地 SQLite**；需云端 + Row Level Security）
- **语义匹配（V1）**：OpenAI `text-embedding-3-small` \+ 余弦相似度；**仅英文体感入池**；阈值 72%
- **内容安全（V1）**：OpenAI Moderation API \+ 英文关键词规则
- **登录（V1）**：Sign in with Apple \+ Resend Email OTP
- **文案（V1）**：`packages/shared/src/locales/en.json` 单一语言包，不做 i18n 框架切换
- **推送**：APNs（Expo Notifications）

## 阶段0：前置准备（1天，Cursor环境初始化）

* [ ] 0\.1 Cursor Monorepo 初始化：Turborepo 创建 `apps/ios`（Expo）\+ `apps/web`（Next\.js）\+ `packages/shared`；安装 Prisma、Tailwind、Apple Auth、StoreKit 相关依赖

* [ ] 0\.2 第三方账号申请（V1 英文版）：Apple Developer（$99/年）、App Store Connect、APNs Key；OpenAI API Key；Resend Email OTP；RevenueCat 或 App Store Server API

* [ ] 0\.3 Prisma数据模型设计：使用Cursor AI生成数据表，包含用户表、体感记录表、匹配记录表、支付订单表、拉黑记录表，写入短时联系方式脱敏字段

* [ ] 0\.4 Cursor自定义prompt录入：保存专属指令【所有代码遵循最小权限原则、自动添加接口请求日志、自动写入合规风控拦截代码、拒绝多余UI功能】

## 阶段1：核心数据\&用户基建（2天，Cursor快速CRUD）

* [ ] 1\.1 登录体系（V1）：**Sign in with Apple** \+ Email OTP；账号与 Apple `sub` / email 绑定；单账号限购

* [ ] 1\.2 合规文案（V1）：**English-only** Privacy Policy / Terms of Service 独立 URL；App Privacy 营养标签；注册强制勾选

* [ ] 1\.3 个人联系方式加密存储：采用aes简单加密，禁止明文入库，配置72小时定时删除定时任务（Cursor编写cron定时脚本）

* [ ] 1\.4 一键注销功能：级联删除用户所有体感、匹配、联系方式数据，数据库不留备份

## 阶段2：体感发布\+内容风控（3天，AI内容拦截）

* [ ] 2\.1 体感录入表单：**English only**；80–500 words；禁用图片、表情、外链；前端 + 后端语言检测（非英文拒绝并提示）

* [ ] 2\.2 AI 预审：OpenAI Moderation \+ 英文 5 类违规规则；标准化英文错误提示

* [ ] 2\.3 匿名同频文库：体感脱敏展示，隐藏用户ID、昵称，关闭所有互动按钮，仅支持上下滑动浏览

* [ ] 2\.4 重复体感查重：Cursor编写文本哈希算法，拦截复制粘贴同质化水内容，避免无效匹配

## 阶段3：语义匹配核心逻辑（4天，产品核心壁垒）

* [ ] 3\.1 语义相似度：**English pool only**；Embedding \+ 余弦相似度；阈值 72%；相似度结果缓存

* [ ] 3\.2 双向匹配判定逻辑：必须双方体感互相达到阈值，单向达标不匹配，避免单方面强行匹配

* [ ] 3\.3 匹配通知：**APNs 推送**（iOS 主通道）\+ 应用内站内信；禁止营销短信骚扰

* [ ] 3\.4 匹配拉黑功能：拉黑后双方永久互相屏蔽，不再进入彼此匹配池，删除现有匹配记录

* [ ] 3\.5 冷启动兜底策略：新用户7天内无匹配，自动推送文库高同频体感，提升留存

## 阶段4：付费解锁\&联系方式置换（4天，盈利模块）

* [ ] 4\.1 **Apple IAP（iOS 必做）**：StoreKit 2 配置解锁券 \+ 月会员两个 Product；App Store Server Notifications V2 收据校验；订阅状态同步

* [ ] 4\.2 双向解锁逻辑：单方付费无法查看，必须付费后系统双向同时开放联系方式，杜绝单向偷窥

* [ ] 4\.3 72 小时自动清除脚本：到期清空加密联系方式，日志仅保留匹配 ID

* [ ] 4\.4 订单查询、退款：iOS Apple 官方退款流程

## 阶段5：iOS 全球上架 \& Web 部署（5天，上线收尾）

* [ ] 5\.1 Cursor 全局代码扫描：排查隐私泄露、接口越权、IAP 收据伪造漏洞

* [ ] 5\.2 违规内容压力测试：模拟极端体感文本，验证 Moderation 拦截成功率 ≥95%

* [ ] 5\.3 **App Store 上架物料（English-only）**：截图、描述、关键词均为英文；强调 semantic matching tool；Review Notes 附无 IM、举报拉黑、72h 删除说明

* [ ] 5\.4 **TestFlight 内测** → 提交 App Review（预留 1–2 周审核周期；若因「社交」拒审，改文案/类目后申诉，强调 Utilities \+ 无聊天）

* [ ] 5\.5 EAS Build 生产包 \+ App Store Connect 全球定价（Tier 1 国家统一 $0.99 / $2.99）

* [ ] 5\.6 Web 部署 Vercel；隐私政策页、Support URL 可公开访问

## 阶段5b：App Store 拒审预案（与阶段5并行准备）

* [ ] 5b\.1 拒审理由「4.3 重复/社交」→ 移除一切交友话术，Review 视频演示完整「写体感→匹配→IAP 解锁→复制邮箱」流程

* [ ] 5b\.2 拒审理由「1.2 UGC 不足」→ 补全举报入口、管理后台封禁截图、审核 SLA 说明

* [ ] 5b\.3 拒审理由「3.1.1 支付」→ 移除 App 内任何外链购买/价格提示，仅保留 IAP

## 阶段6：长期小规模运维（常态化每日10分钟）

* [ ] 6\.1 每日复核AI漏审违规体感，手动封禁账号

* [ ] 6\.2 每月调整语义匹配阈值，优化匹配精准度

* [ ] 6\.3 不投放公域流量；V1 维护 **Reddit**（r/dpdr、r/Dreams 等）、Tumblr、Discord 英文小众渠道

---

# 第三部分：Cursor专属开发避坑提示（专属优化技巧）

1. 禁止让Cursor生成社交互动功能：遇到AI自动推荐点赞、评论、私聊功能，直接指令删除，严格恪守非社交定位

2. 语义接口成本优化：Cursor编写缓存脚本，重复相似体感复用历史相似度结果，降低API调用成本60%以上

3. 越权安全规避：Cursor批量校验所有接口，禁止用户通过url篡改查看他人联系方式、匹配记录

4. **iOS 审核避坑（V1 英文）**：联系方式字段仅用 Email / Instagram / Discord；禁止头像/昵称；TestFlight 预填英文合规体感样本

5. **全球服务**：后端部署选 Vercel + Supabase 区域（如 `us-east-1`）；OpenAI 需确认目标国家可用；欧盟用户启用 GDPR 同意弹窗与数据导出接口

6. **IAP 与 Web 定价分离**：同一 Apple ID 在 iOS 购买的订阅，Web 端只读状态不同步降价，避免 Guideline 3.1.3 违规

# 第四部分：收益\&成本预估（小规模稳态，含全球 iOS）

- 月度固定成本：Apple Developer **$99/年（约 ¥70/月摊销）** \+ OpenAI API **$15–30** \+ Supabase **$0–25** \+ 邮箱 OTP **$0–10**，合计约 **¥200–400/月**

- 月度稳态收益（iOS 为主）：3000 MAU，2%–3% 付费；iOS IAP 扣 15%–30% 后，月净收约 **¥800–2800**（低于纯 Web 方案，因 Apple 抽成与美元定价）

- 用户上限：永久控制 4500 活跃用户，超出后关闭注册入口，控制审核与合规压力

- **全球 iOS 增量价值**：触达 Reddit/Tumblr/Discord 等海外小众圈层；**增量风险**：App Review 对「陌生人匹配 + 联系方式」审查更严，首版过审不保证，需预留 2–4 周审核与申诉周期

> （注：部分内容可能由 AI 生成）
