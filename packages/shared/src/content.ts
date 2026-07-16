export type TiptapTextNode = {
  type: "text";
  text: string;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<TiptapNode | TiptapTextNode>;
};

export type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

export const DEFAULT_MEMO_TITLE = "无标题笔记";

export const emptyDoc = (): TiptapDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export const markdownToDoc = (markdown: string): TiptapDoc => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const content: TiptapNode[] = [];

  for (let index = 0; index < lines.length; ) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }

    const fence = /^```([^\s`]*)\s*$/.exec(lines[index].trim());

    if (fence) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && lines[index].trim() !== "```") {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      content.push({
        type: "codeBlock",
        attrs: { language: fence[1] || "plaintext" },
        content: [{ type: "text", text: codeLines.join("\n") }],
      });
      continue;
    }

    const blockLines: string[] = [];
    while (index < lines.length && lines[index].trim()) {
      blockLines.push(lines[index]);
      index += 1;
    }

    const block = blockLines.join("\n").trim();

    // Check if block is a Markdown table
    if (isTableBlock(blockLines)) {
      content.push(parseTable(blockLines));
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(block);
    const image = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/.exec(block);

    if (heading) {
      content.push({
        type: "heading",
        attrs: { level: heading[1].length },
        content: [{ type: "text", text: heading[2] }],
      });
      continue;
    }

    if (image) {
      content.push({
        type: "image",
        attrs: {
          src: image[2],
          alt: image[1] || null,
          title: image[3] || null,
        },
      });
      continue;
    }

    if (/^-{3,}$/.test(block)) {
      content.push({ type: "horizontalRule" });
      continue;
    }

    content.push({
      type: "paragraph",
      content: [{ type: "text", text: block }],
    });
  }

  if (content.length === 0) {
    return emptyDoc();
  }

  return { type: "doc", content };
};

/** Detect whether lines form a Markdown table block. */
const isTableBlock = (lines: string[]): boolean => {
  if (lines.length < 2) return false;
  if (!lines.every((l) => /^\s*\|.*\|\s*$/.test(l))) return false;
  // Second line must be a separator (|---|)
  const sep = lines[1].replace(/\|/g, "").trim();
  return /^-{3,}(\s+-{3,})*$/.test(sep);
};

/** Parse pipe-delimited table lines into a TipTap table node. */
const parseTable = (lines: string[]): TiptapNode => {
  const rows: TiptapNode[] = [];

  const parseRow = (line: string): string[] =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const makeCell = (type: "tableHeader" | "tableCell", text: string): TiptapNode => ({
    type,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

  // Header row
  const headerCells = parseRow(lines[0]);
  rows.push({
    type: "tableRow",
    content: headerCells.map((c) => makeCell("tableHeader", c)),
  });

  // Data rows (skip separator at index 1)
  for (let i = 2; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    rows.push({
      type: "tableRow",
      content: cells.map((c) => makeCell("tableCell", c)),
    });
  }

  return { type: "table", content: rows };
};

export const docToText = (doc: unknown): string => {
  const pieces: string[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") {
      return;
    }

    const current = node as { type?: unknown; text?: unknown; attrs?: Record<string, unknown>; content?: unknown };

    if (typeof current.text === "string") {
      pieces.push(current.text);
    }

    if (current.type === "image") {
      const label =
        getStringAttr(current.attrs, "alt") ||
        getStringAttr(current.attrs, "title") ||
        getStringAttr(current.attrs, "filename");

      if (label) {
        pieces.push(label);
      }
    }

    if (Array.isArray(current.content)) {
      for (const child of current.content) {
        walk(child);
      }
    }
  };

  walk(doc);

  return pieces.join(" ").replace(/\s+/g, " ").trim();
};

export const docToMarkdown = (doc: unknown): string => {
  if (!doc || typeof doc !== "object") {
    return "";
  }

  const root = doc as { content?: unknown };

  if (!Array.isArray(root.content)) {
    return "";
  }

  return root.content
    .map((node) => blockToMarkdown(node))
    .filter(Boolean)
    .join("\n\n");
};

const blockToMarkdown = (node: unknown): string => {
  if (!node || typeof node !== "object") {
    return "";
  }

  const current = node as {
    type?: unknown;
    attrs?: Record<string, unknown>;
    content?: unknown;
    text?: unknown;
  };

  if (current.type === "heading") {
    const level = typeof current.attrs?.level === "number" ? current.attrs.level : 1;
    const text = inlineToMarkdown(current.content);
    return text ? `${"#".repeat(Math.min(Math.max(level, 1), 6))} ${text}` : "";
  }

  if (current.type === "image") {
    return imageToMarkdown(current.attrs);
  }

  if (current.type === "horizontalRule") {
    return "---";
  }

  if (current.type === "bulletList" && Array.isArray(current.content)) {
    return current.content
      .map((item) => inlineToMarkdown((item as { content?: unknown })?.content))
      .filter(Boolean)
      .map((item) => `- ${item.replace(/\n/g, "\n  ")}`)
      .join("\n");
  }

  if (current.type === "orderedList" && Array.isArray(current.content)) {
    return current.content
      .map((item, index) => {
        const text = inlineToMarkdown((item as { content?: unknown })?.content);
        return text ? `${index + 1}. ${text.replace(/\n/g, "\n   ")}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  if (current.type === "blockquote") {
    const text = inlineToMarkdown(current.content);
    return text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }

  if (current.type === "codeBlock") {
    const language = getStringAttr(current.attrs, "language");
    const languageSuffix = language && language !== "plaintext" ? language : "";
    const code = contentToPlainText(current.content);
    return `\`\`\`${languageSuffix}\n${code}\n\`\`\``;
  }

  if (current.type === "table" && Array.isArray(current.content)) {
    const rows = current.content as Array<{ type?: string; content?: unknown }>;
    if (rows.length === 0) return "";

    const lines: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].content;
      if (!Array.isArray(cells)) continue;

      const cellTexts = cells.map((cell) => {
        const cellContent = (cell as { content?: unknown }).content;
        return contentToPlainText(cellContent).trim();
      });
      lines.push(`| ${cellTexts.join(" | ")} |`);

      // Insert separator after header row
      if (i === 0 && cells.length > 0) {
        const firstCellType = (cells[0] as { type?: string }).type;
        if (firstCellType === "tableHeader") {
          lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
        }
      }
    }
    return lines.join("\n");
  }

  return inlineToMarkdown(current.content);
};

const contentToPlainText = (content: unknown): string => {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((node) => {
      if (!node || typeof node !== "object") {
        return "";
      }

      const current = node as { type?: unknown; text?: unknown; content?: unknown };

      if (typeof current.text === "string") {
        return current.text;
      }

      if (current.type === "hardBreak") {
        return "\n";
      }

      return contentToPlainText(current.content);
    })
    .join("");
};

const inlineToMarkdown = (content: unknown): string => {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((node) => {
      if (!node || typeof node !== "object") {
        return "";
      }

      const current = node as {
        type?: unknown;
        text?: unknown;
        attrs?: Record<string, unknown>;
        content?: unknown;
      };

      if (typeof current.text === "string") {
        return current.text;
      }

      if (current.type === "hardBreak") {
        return "\n";
      }

      if (current.type === "image") {
        return imageToMarkdown(current.attrs);
      }

      return inlineToMarkdown(current.content);
    })
    .join("");
};

const imageToMarkdown = (attrs: Record<string, unknown> | undefined): string => {
  const src = getStringAttr(attrs, "src");

  if (!src) {
    return "";
  }

  const alt = getStringAttr(attrs, "alt");
  const title = getStringAttr(attrs, "title");
  const titleSuffix = title ? ` "${title.replace(/"/g, '\\"')}"` : "";

  return `![${alt.replace(/\]/g, "\\]")}](${src}${titleSuffix})`;
};

const getStringAttr = (attrs: Record<string, unknown> | undefined, key: string) => {
  const value = attrs?.[key];
  return typeof value === "string" ? value.trim() : "";
};

export const createExcerpt = (text: string, maxLength = 30): string => {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
};

export const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
        .map((tag) => tag.replace(/^#/, ""))
    )
  ).slice(0, 24);
};
