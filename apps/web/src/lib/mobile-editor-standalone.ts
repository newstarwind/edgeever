import { emptyDoc, markdownToDoc, type MemoDetail, type Resource, type TiptapDoc } from "@edgeever/shared";

export const MOBILE_EDITOR_AUTO_SAVE_DELAY_MS = 1200;
export const MOBILE_EDITOR_LEAVE_SAVE_TIMEOUT_MS = 1600;
export const MOBILE_EDITOR_INITIAL_FOCUS_DELAY_MS = 160;
export const MOBILE_EDITOR_DRAFT_STORAGE_PREFIX = "edgeever-mobile-tiptap-draft:";
export const DEFAULT_MOBILE_EDITOR_MEMO_TITLE = "无标题笔记";

export type MobileEditorMemoResponse = {
  memo: MemoDetail;
};

export type MobileEditorResourceResponse = {
  resource: Resource;
};

export type MobileEditorDraft = {
  title: string;
  tagsText: string;
  contentJson: TiptapDoc;
  updatedAt: string;
};

export type MobileEditorSaveState =
  | "loading"
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "compressing"
  | "uploading"
  | "error"
  | "local-draft"
  | "leaving";

export const getMobileEditorParams = () =>
  new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : window.location.search);

export const getMobileEditorDraftKey = (memoId: string | null) =>
  memoId ? `${MOBILE_EDITOR_DRAFT_STORAGE_PREFIX}${memoId}` : "";

export const parseMobileEditorTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const safeMobileEditorReturnPath = (value: string | null) => (value?.startsWith("/") ? value : "/");

export const requestMobileEditorJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "error" in body
        ? (body as { error?: { message?: string } }).error?.message
        : response.statusText;
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
};

export const uploadMobileEditorResource = async (memoId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);

  return requestMobileEditorJson<MobileEditorResourceResponse>(`/api/v1/memos/${encodeURIComponent(memoId)}/resources`, {
    method: "POST",
    body: form,
  });
};

export const normalizeMobileEditorDoc = (memo: MemoDetail): TiptapDoc => {
  if (memo.contentJson && typeof memo.contentJson === "object") {
    return memo.contentJson as TiptapDoc;
  }

  if (memo.contentMarkdown) {
    return markdownToDoc(memo.contentMarkdown);
  }

  return emptyDoc();
};
