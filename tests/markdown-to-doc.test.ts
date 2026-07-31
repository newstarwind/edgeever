import { describe, expect, test } from "bun:test";
import { docToMarkdown, markdownToDoc } from "@edgeever/shared";

describe("markdownToDoc headings", () => {
  test("parses ATX headings followed directly by list items", () => {
    const doc = markdownToDoc("## 来源项目\nMyLandmass（F:/unityProjects/MyLandmass）— 程序化地形生成");
    expect(doc.content).toEqual([
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "来源项目" }] },
      {
        type: "paragraph",
        content: [{ type: "text", text: "MyLandmass（F:/unityProjects/MyLandmass）— 程序化地形生成" }],
      },
    ]);
  });

  test("parses heading levels 1-6", () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const doc = markdownToDoc(`${"#".repeat(level)} 标题${level}`);
      expect(doc.content).toEqual([
        { type: "heading", attrs: { level }, content: [{ type: "text", text: `标题${level}` }] },
      ]);
    }
  });

  test("parses heading immediately followed by a bullet list", () => {
    const doc = markdownToDoc("### Step 1: 熟悉编辑器\n- 安装 Godot 4\n- 创建 3D 场景");
    expect(doc.content?.[0]).toEqual({
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Step 1: 熟悉编辑器" }],
    });
    expect(doc.content?.[1]?.type).toBe("bulletList");
    expect((doc.content?.[1] as { content?: unknown[] }).content?.length).toBe(2);
  });

  test("keeps headings separated by blank lines as separate headings", () => {
    const doc = markdownToDoc("# 一级\n\n## 二级\n\n### 三级");
    expect(doc.content?.map((n) => n.type)).toEqual(["heading", "heading", "heading"]);
  });

  test("round-trips headings and following content through docToMarkdown", () => {
    const md = "## 标题\n正文内容\n\n### 小标题\n- 列表项";
    const doc = markdownToDoc(md);
    expect(docToMarkdown(doc)).toBe("## 标题\n\n正文内容\n\n### 小标题\n\n- 列表项");
  });

  test("a bare hash is not a heading", () => {
    const doc = markdownToDoc("#没有空格的标题");
    expect(doc.content?.[0]?.type).toBe("paragraph");
  });
});
