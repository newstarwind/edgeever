import type { createEdgeEverClient } from "@edgeever/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_SHARE_KEY = "edgeever.mobile.pendingShare";

export type SharedContent = {
	text: string;
	webUrl: string | null;
};

export const savePendingShare = async (content: SharedContent) => {
	await AsyncStorage.setItem(PENDING_SHARE_KEY, JSON.stringify(content));
};

export const loadPendingShare = async (): Promise<SharedContent | null> => {
	const raw = await AsyncStorage.getItem(PENDING_SHARE_KEY);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed.text !== "string" || typeof parsed.webUrl !== "string") {
			return null;
		}
		return parsed as SharedContent;
	} catch {
		return null;
	}
};

export const clearPendingShare = async () => {
	await AsyncStorage.removeItem(PENDING_SHARE_KEY);
};

export const saveMemoFromSharedContent = async (
	client: ReturnType<typeof createEdgeEverClient>,
	payload: {
		notebookId: string;
		title: string;
		contentMarkdown: string;
		tags: string[];
	},
) => {
	const response = await client.createMemo({
		notebookId: payload.notebookId,
		title: payload.title,
		contentMarkdown: payload.contentMarkdown,
		tags: payload.tags.length > 0 ? payload.tags : ["web-clip"],
	});
	return response.memo;
};

export const buildMemoContentFromShare = (
	sharedText: string,
	sharedUrl: string | null,
): string => {
	const lines: string[] = [];

	if (sharedUrl) {
		lines.push(`来源：${sharedUrl}\n`);
	}

	if (sharedText.trim()) {
		lines.push(sharedText.trim());
	}

	return lines.join("\n\n");
};

export const guessTitleFromShare = (
	sharedText: string,
	sharedUrl: string | null,
): string => {
	if (sharedUrl) {
		try {
			const url = new URL(sharedUrl);
			return url.hostname.replace(/^www\./, "");
		} catch {
			// ignore invalid URL
		}
	}

	const firstLine = sharedText.split("\n")[0]?.trim() ?? "";
	return firstLine.substring(0, 80) || "分享的链接";
};
