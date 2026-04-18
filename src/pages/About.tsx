import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/I18nProvider";

const aboutMarkdownEn = `# About this site

**Aaron.skill** is a conversational portfolio — a chat interface where you can talk
to a "distilled" version of Aaron right in your browser.

## Frontend stack

- **Framework**: **Vite 7**
- **UI**: **React 19**, **Tailwind CSS v4**, **shadcn/ui** (Radix primitives)
- **Routing**: \`react-router-dom\` for client-side navigation
- **Markdown**: [\`react-markdown\`](https://github.com/remarkjs/react-markdown) for rendering rich replies
- **State / Data**: TanStack Query, plus a tiny \`localStorage\`-backed chat store
- **Forms / Validation**: React Hook Form + Zod
- **i18n**: Lightweight custom provider with English & 中文 dictionaries
- **Deployment target**: Cloudflare Workers (via \`@cloudflare/vite-plugin\`)

## Backend stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with [Pydantic](https://docs.pydantic.dev/) for request/response schemas and validation
- **Server**: [Uvicorn](https://www.uvicorn.org/) ASGI server, containerized with **Docker**
- **Streaming**: Tokens are streamed to the browser over **Server-Sent Events (SSE)**
- **Inference**: OpenAI **Chat Completions** API style, with multi-turn conversation context management on the server
- **Inference provider**: [Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers)
- **Base model**: \`google/gemma-4-31B-it:together\`

## Agentic capabilities

- **Skill loading from remote git repos**: at runtime the backend can clone (or pull) a "skill" — a versioned bundle of system prompt, tools manifest, and few-shot examples — from any git repository and apply it as the active **system prompt** for the conversation. This makes personality, expertise, and guardrails hot-swappable without redeploying the server.
- **Skills as code**: each skill is just a folder in git, so they are diffable, reviewable, and reusable across agents.
- **Planned — sandboxed executable environment**: a coding agent will run inside an isolated sandbox (filesystem, shell, network egress controls) so it can read/write files, install dependencies, and execute code as the foundation for any complex, multi-step task.
- **Planned — MCP integration**: the agent will connect to [Model Context Protocol](https://modelcontextprotocol.io/) servers to access external tools and data (issue trackers, docs, databases, design tools, etc.) through a standard, typed interface.

## How it works

1. Each conversation is persisted to \`localStorage\` so your history survives a refresh.
2. The client \`POST\`s to \`/prompt\` to register a turn and receives a \`session_id\`.
3. The client opens an SSE connection to \`/conversation?session_id=...\` and the server streams tokens as they are generated.
4. The FastAPI backend keeps multi-turn context per session and forwards it to the Hugging Face Inference endpoint via the OpenAI Chat Completions interface.
5. Response timings (in seconds) are recorded per assistant reply.
6. All assistant replies are rendered through \`ReactMarkdown\`, so links, lists, code blocks, and emphasis all just work.
`;

const aboutMarkdownCn = `# 关于本站

**Aaron.skill** 是一个对话式作品集 —— 一个可以在浏览器里直接与 Aaron 的“数字分身”聊天的界面。

## 前端技术栈

- **框架**：**Vite 7**
- **UI**：**React 19**、**Tailwind CSS v4**、**shadcn/ui**(基于 Radix)
- **路由**：使用 \`react-router-dom\` 实现客户端导航
- **Markdown**：使用 [\`react-markdown\`](https://github.com/remarkjs/react-markdown) 渲染富文本回复
- **状态 / 数据**：TanStack Query，加上一个基于 \`localStorage\` 的轻量聊天存储
- **表单 / 校验**：React Hook Form + Zod
- **国际化**：自研轻量 Provider，支持英文与中文
- **部署目标**：Cloudflare Workers(通过 \`@cloudflare/vite-plugin\`)

## 后端技术栈

- **框架**：[FastAPI](https://fastapi.tiangolo.com/) + [Pydantic](https://docs.pydantic.dev/) 负责请求/响应的模型与校验
- **服务器**：[Uvicorn](https://www.uvicorn.org/) ASGI 服务器，使用 **Docker** 容器化部署
- **流式传输**：通过 **Server-Sent Events(SSE)** 将 token 实时推送到浏览器
- **推理接口**：兼容 OpenAI **Chat Completions** API 风格，并在服务端管理多轮对话上下文
- **推理服务商**：[Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers)
- **基础模型**：\`google/gemma-4-31B-it:together\`

## 智能体能力

- **从远程 Git 仓库加载 Skill**:后端会在运行时从任意 Git 仓库克隆(或拉取)一个 "skill" —— 一个包含系统提示、工具清单与少样本示例的版本化包 —— 并将其作为当前对话的 **system prompt** 应用。这样就可以在不重新部署服务的情况下,热切换人格、专业领域与安全边界。
- **Skill 即代码**:每个 skill 只是 Git 中的一个文件夹,因此可被 diff、评审,并在多个智能体之间复用。
- **规划中 —— 沙箱化可执行环境**:编程智能体将运行在隔离的沙箱中(受控的文件系统、Shell、网络出口),可以读写文件、安装依赖、执行代码,作为完成任意复杂多步任务的基础。
- **规划中 —— MCP 集成**:智能体将通过 [Model Context Protocol](https://modelcontextprotocol.io/) 连接到外部工具与数据源(任务系统、文档、数据库、设计工具等),以标准化、强类型的接口进行交互。

## 工作方式

1. 每个对话都会持久化到 \`localStorage\`,刷新页面也不会丢。
2. 客户端先 \`POST\` 到 \`/prompt\` 注册一次对话回合,并获得 \`session_id\`。
3. 客户端再通过 SSE 连接 \`/conversation?session_id=...\`,服务端会随生成实时推送 token。
4. FastAPI 后端按 session 维护多轮上下文,并以 OpenAI Chat Completions 接口调用 Hugging Face 推理端点。
5. 每条助手回复都会记录响应耗时(秒)。
6. 所有助手回复都通过 \`ReactMarkdown\` 渲染,链接、列表、代码块、强调都开箱即用。
`;

export function AboutPage() {
  const { locale, t } = useTranslation();
  const md = locale === "cn" ? aboutMarkdownCn : aboutMarkdownEn;

  return (
    <main className="min-h-dvh w-full bg-canvas text-ink">
      <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-clay hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          {t("about.back") || "Back to chat"}
        </Link>

        <article className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-ink prose-a:text-clay prose-a:no-underline hover:prose-a:underline prose-code:text-ink prose-code:bg-felt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-clay prose-blockquote:text-clay">
          <ReactMarkdown>{md}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
