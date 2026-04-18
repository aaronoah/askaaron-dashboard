import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/I18nProvider";

const aboutMarkdownEn = `# About this site

**Aaron.skill** is a conversational portfolio — a chat interface where you can talk
to a "distilled" version of Aaron right in your browser.

## Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) v1 on top of **Vite 7**
- **UI**: **React 19**, **Tailwind CSS v4**, **shadcn/ui** (Radix primitives)
- **Routing**: \`react-router-dom\` for client-side navigation
- **Markdown**: [\`react-markdown\`](https://github.com/remarkjs/react-markdown) for rendering rich replies
- **State / Data**: TanStack Query, plus a tiny \`localStorage\`-backed chat store
- **Forms / Validation**: React Hook Form + Zod
- **i18n**: Lightweight custom provider with English & 中文 dictionaries
- **Deployment target**: Cloudflare Workers (via \`@cloudflare/vite-plugin\`)

## How it works

1. Each conversation is persisted to \`localStorage\` so your history survives a refresh.
2. Messages are streamed from the \`/prompt\` endpoint via Server-Sent Events.
3. Response timings (in seconds) are recorded per assistant reply.
4. All assistant replies are rendered through \`ReactMarkdown\`, so links, lists,
   code blocks, and emphasis all just work.

> Built and iterated on [Lovable](https://lovable.dev).
`;

const aboutMarkdownCn = `# 关于本站

**Aaron.skill** 是一个对话式作品集 —— 一个可以在浏览器里直接与 Aaron 的“数字分身”聊天的界面。

## 技术栈

- **框架**：[TanStack Start](https://tanstack.com/start) v1 + **Vite 7**
- **UI**：**React 19**、**Tailwind CSS v4**、**shadcn/ui**(基于 Radix)
- **路由**：使用 \`react-router-dom\` 实现客户端导航
- **Markdown**：使用 [\`react-markdown\`](https://github.com/remarkjs/react-markdown) 渲染富文本回复
- **状态 / 数据**:TanStack Query，加上一个基于 \`localStorage\` 的轻量聊天存储
- **表单 / 校验**：React Hook Form + Zod
- **国际化**：自研轻量 Provider，支持英文与中文
- **部署目标**：Cloudflare Workers(通过 \`@cloudflare/vite-plugin\`)

## 工作方式

1. 每个对话都会持久化到 \`localStorage\`,刷新页面也不会丢。
2. 消息通过 Server-Sent Events 从 \`/prompt\` 端点流式返回。
3. 每条助手回复都会记录响应耗时（秒)。
4. 所有助手回复都通过 \`ReactMarkdown\` 渲染,链接、列表、代码块、强调都开箱即用。

> 在 [Lovable](https://lovable.dev) 上构建和迭代。
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
