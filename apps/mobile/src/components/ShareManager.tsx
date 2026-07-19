import { useQuery } from "@tanstack/react-query";
import { useShareIntent, ShareIntentProvider } from "expo-share-intent";
import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useSession } from "../lib/session";
import {
	clearPendingShare,
	loadPendingShare,
	savePendingShare,
	type SharedContent,
} from "../lib/share-receiver";
import { ShareReceiveModal } from "./ShareReceiveModal";

/**
 * Inner component that must be rendered inside ShareIntentProvider.
 */
const ShareManagerInner = () => {
	const { session, client } = useSession();
	const { hasShareIntent, shareIntent, resetShareIntent, isReady } =
		useShareIntent();
	const [externalShare, setExternalShare] = useState<SharedContent | null>(
		null,
	);

	// Handle incoming share intent from the OS
	const handleShareIntent = useCallback(async () => {
		if (!isReady || !hasShareIntent) {
			return;
		}

		const text = shareIntent.text ?? "";
		const webUrl = shareIntent.webUrl ?? null;
		const sharedContent: SharedContent = { text, webUrl };

		if (session) {
			// User is logged in — show modal immediately
			setExternalShare(sharedContent);
		} else {
			// User not logged in — save for later
			await savePendingShare(sharedContent);
		}

		resetShareIntent();
	}, [isReady, hasShareIntent, shareIntent, session, resetShareIntent]);

	// Process share intent whenever it changes
	useEffect(() => {
		if (hasShareIntent && isReady) {
			handleShareIntent();
		}
	}, [hasShareIntent, isReady, handleShareIntent]);

	// When user logs in (session transitions from null → value),
	// check for a pending share that was saved before login
	useEffect(() => {
		if (!session) {
			return;
		}

		const checkPendingShare = async () => {
			const pending = await loadPendingShare();
			if (pending) {
				setExternalShare(pending);
				await clearPendingShare();
			}
		};

		checkPendingShare();
	}, [session]);

	// Also check for pending share when app comes to foreground
	useEffect(() => {
		const checkPendingShare = async () => {
			if (!session) {
				return;
			}

			const pending = await loadPendingShare();
			if (pending) {
				setExternalShare(pending);
				await clearPendingShare();
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			(nextState: AppStateStatus) => {
				if (nextState === "active") {
					checkPendingShare();
				}
			},
		);

		return () => subscription.remove();
	}, [session]);

	const handleClose = () => {
		setExternalShare(null);
	};

	const handleSaved = () => {
		setExternalShare(null);
	};

	// Load notebooks for ShareReceiveModal
	const notebooksQuery = useQuery({
		queryKey: ["mobile", "share-receive", "notebooks"],
		queryFn: async () => {
			if (!client) {
				throw new Error("Client is not ready");
			}
			return client.listNotebooks();
		},
		enabled: Boolean(client && externalShare),
	});

	const notebooks = notebooksQuery.data?.notebooks ?? [];

	if (!externalShare || !client) {
		return null;
	}

	return (
		<ShareReceiveModal
			client={client}
			notebooks={notebooks}
			sharedContent={externalShare}
			onClose={handleClose}
			onSaved={handleSaved}
		/>
	);
};

/**
 * Exported ShareManager to be used in _layout.tsx.
 * Wraps the inner component with ShareIntentProvider.
 */
export const ShareManager = () => (
	<ShareIntentProvider>
		<ShareManagerInner />
	</ShareIntentProvider>
);
