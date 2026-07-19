# ten-IQ Agent Starter

一个可直接运行、由 Agent 规则约束的预测市场前端脚手架。视觉语言参考现代预测市场产品的共同模式：紧凑、数据密集、卡片化、概率优先、低装饰。项目使用自有品牌和 Token，不复制第三方商标、Logo 或专有素材。

## 你以后怎么提需求

进入仓库后，直接告诉 Codex / Claude / Cursor：

```text
增加“收藏市场”功能。
```

Agent 应自动读取 `AGENTS.md` 和 `.codex/skills/`，创建任务工作流，完成产品、UX、技术、安全、测试和发布评审，再开发、测试和汇报。复杂功能建议给出业务目标，但不需要重复技术栈、视觉风格、响应式、测试和质量要求。

## 已包含

- React 19、TypeScript 6、Vite 8、Tailwind CSS 4
- Radix UI、React Query、Zod、Zustand、MSW
- 可运行首页、市场详情、概率图、订单簿、交易预览、账户占位页
- 语义 Design Tokens、核心组件契约、Storybook
- Vitest、Testing Library、Playwright、axe、视觉回归模板
- ESLint、Prettier、Husky、Commitlint、设计漂移检测
- Codex Skills、`AGENTS.md`、Cursor / Copilot / Claude / Gemini 入口
- 多角色多轮评审、需求任务档案、QA 和发布报告模板
- GitHub Actions、Dependabot、Issue / PR 模板、Docker 部署样例
- API、架构、安全、无障碍、性能、监控、分析和发布文档

## 快速启动

环境要求：Node.js 22.13+、pnpm 10.15+。

```bash
pnpm install
pnpm dev
```

开发模式默认启动 MSW Mock API。访问 `http://127.0.0.1:5173`。

生产构建默认不打包 Mock：

```bash
pnpm build
pnpm preview
```

演示构建会启用 Mock：

```bash
pnpm build:demo
pnpm preview
```

## 创建一个 Agent 任务

```bash
pnpm run agent:new -- "收藏市场"
```

生成：

```text
.agent/tasks/<timestamp>-收藏市场/
  brief.md
  reviews.md
  plan.md
  qa.md
  release.md
  task.json
```

Agent 必须按 Gate 顺序更新这些文件。检查和关闭：

```bash
pnpm run agent:check
pnpm run agent:close
```

## 质量命令

```bash
pnpm run quality
pnpm run build:storybook
pnpm run test:e2e
pnpm run test:visual:update  # 仅在设计变更被批准后
```

`quality` 包括格式、Lint、类型、单元测试、设计契约和生产构建。

## 目录

```text
.codex/skills/          Agent 专项技能
.agent/tasks/           每个功能的多轮工作流记忆
src/design/             语义 Token 和全局样式
src/components/ui/      基础 UI 原语
src/components/market/  市场发现与市场卡组件
src/components/trading/ 交易意图组件，不含真实签名/托管
src/services/           HTTP 边界
src/types/              Zod Schema 与领域类型
src/mocks/              开发和测试 Mock API
docs/                   产品、架构、质量、安全和流程文档
tests/e2e/              页面、无障碍和视觉测试
```

## 接入真实 API

1. 设置 `VITE_USE_MOCKS=false`。
2. 设置 `VITE_API_BASE_URL`。
3. 让后端响应满足 `src/types/market.ts` 的 Zod Schema。
4. 只修改 `src/services/` 和必要的 Query Hook，不在页面里直接 `fetch`。
5. 对认证、钱包、签名、真实交易和资金动作单独做威胁建模与人工批准。

## 视觉一致性边界

Agent 会被 Token、组件契约、设计检测、Storybook 和工作流约束，能显著降低风格漂移。没有任何提示文件能数学上保证所有未来代码都“像素完全一致”，所以大型变更仍保留视觉回归和人工审批 Gate。这比单纯写一句“仿 Polymarket”可靠得多。
