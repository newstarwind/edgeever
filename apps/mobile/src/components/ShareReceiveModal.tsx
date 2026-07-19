import type { createEdgeEverClient } from "@edgeever/client";
import type { MemoDetail, Notebook } from "@edgeever/shared";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	buildMemoContentFromShare,
	guessTitleFromShare,
	type SharedContent,
} from "../lib/share-receiver";

type ShareReceiveModalProps = {
	client: ReturnType<typeof createEdgeEverClient>;
	notebooks: Notebook[];
	sharedContent: SharedContent;
	onClose: () => void;
	onSaved: (memo: MemoDetail) => void;
};

export const ShareReceiveModal = ({
	client,
	notebooks,
	sharedContent,
	onClose,
	onSaved,
}: ShareReceiveModalProps) => {
	const [title, setTitle] = useState(() =>
		guessTitleFromShare(sharedContent.text, sharedContent.webUrl),
	);
	const [tagsText, setTagsText] = useState("web-clip");
	const [selectedNotebookId, setSelectedNotebookId] = useState<string>(
		notebooks[0]?.id ?? "",
	);
	const [isSaving, setIsSaving] = useState(false);
	const [showNotebookPicker, setShowNotebookPicker] = useState(false);

	const [savingError, setSavingError] = useState<string | null>(null);

	const contentMarkdown = buildMemoContentFromShare(
		sharedContent.text,
		sharedContent.webUrl,
	);

	const handleSave = async () => {
		if (!selectedNotebookId) {
			return;
		}

		setIsSaving(true);
		setSavingError(null);

		try {
			const tags = tagsText
				.split(/[,，\s]+/)
				.map((tag) => tag.trim())
				.filter(Boolean);

			const response = await client.createMemo({
				notebookId: selectedNotebookId,
				title: title.trim() || "分享的链接",
				contentMarkdown,
				tags: tags.length > 0 ? tags : ["web-clip"],
			});
			onSaved(response.memo);
		} catch (error) {
			setSavingError(
				error instanceof Error ? error.message : "保存失败，请重试。",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const selectedNotebook =
		notebooks.find((n) => n.id === selectedNotebookId) ?? null;

	return (
		<Modal animationType="slide" onRequestClose={onClose} visible>
			<SafeAreaView style={styles.safeArea}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.flex}
				>
					{/* Header */}
					<View style={styles.header}>
						<Pressable
							accessibilityRole="button"
							disabled={isSaving}
							onPress={onClose}
							style={styles.headerButton}
						>
							<Text style={styles.cancelText}>取消</Text>
						</Pressable>
						<Text style={styles.headerTitle}>保存到 EdgeEver</Text>
						<Pressable
							accessibilityRole="button"
							disabled={isSaving || !selectedNotebookId || !title.trim()}
							onPress={handleSave}
							style={[
								styles.saveButton,
								(isSaving || !selectedNotebookId || !title.trim()) &&
									styles.saveButtonDisabled,
							]}
						>
							{isSaving ? (
								<ActivityIndicator color="#ffffff" size="small" />
							) : (
								<Text style={styles.saveButtonText}>保存</Text>
							)}
						</Pressable>
					</View>

					<ScrollView
						contentContainerStyle={styles.body}
						keyboardShouldPersistTaps="handled"
					>
						{/* Title */}
						<View style={styles.field}>
							<Text style={styles.label}>标题</Text>
							<TextInput
								autoFocus
								onChangeText={setTitle}
								placeholder="笔记标题"
								placeholderTextColor="#94a3b8"
								style={styles.input}
								value={title}
							/>
						</View>

						{/* URL (if present) */}
						{sharedContent.webUrl ? (
							<View style={styles.field}>
								<Text style={styles.label}>链接</Text>
								<TextInput
									editable={false}
									multiline
									placeholderTextColor="#64748b"
									style={[styles.input, styles.inputReadonly]}
									value={sharedContent.webUrl}
								/>
							</View>
						) : null}

						{/* Notebook Picker */}
						<View style={styles.field}>
							<Text style={styles.label}>笔记本</Text>
							<Pressable
								accessibilityRole="button"
								disabled={notebooks.length === 0}
								onPress={() => setShowNotebookPicker(true)}
								style={styles.notebookPicker}
							>
								<Text
									style={[
										styles.notebookPickerText,
										!selectedNotebook && styles.notebookPickerPlaceholder,
									]}
									numberOfLines={1}
								>
									{selectedNotebook?.name ?? "请选择笔记本"}
								</Text>
								<Text style={styles.notebookPickerArrow}>▼</Text>
							</Pressable>
						</View>

						{/* Tags */}
						<View style={styles.field}>
							<Text style={styles.label}>标签（逗号分隔）</Text>
							<TextInput
								onChangeText={setTagsText}
								placeholder="web-clip, 文章"
								placeholderTextColor="#94a3b8"
								style={styles.input}
								value={tagsText}
							/>
						</View>

						{/* Content Preview */}
						<View style={styles.field}>
							<Text style={styles.label}>内容预览</Text>
							<ScrollView nestedScrollEnabled style={styles.previewBox}>
								<Text style={styles.previewText}>{contentMarkdown}</Text>
							</ScrollView>
						</View>

						{/* Error */}
						{savingError ? (
							<Text style={styles.error}>{savingError}</Text>
						) : null}
					</ScrollView>
				</KeyboardAvoidingView>

				{/* Notebook Picker Modal */}
				<NotebookPickerSheet
					notebooks={notebooks}
					selectedId={selectedNotebookId}
					visible={showNotebookPicker}
					onClose={() => setShowNotebookPicker(false)}
					onSelect={(id) => {
						setSelectedNotebookId(id);
						setShowNotebookPicker(false);
					}}
				/>
			</SafeAreaView>
		</Modal>
	);
};

type NotebookPickerSheetProps = {
	notebooks: Notebook[];
	selectedId: string;
	visible: boolean;
	onClose: () => void;
	onSelect: (id: string) => void;
};

const NotebookPickerSheet = ({
	notebooks,
	selectedId,
	visible,
	onClose,
	onSelect,
}: NotebookPickerSheetProps) => (
	<Modal
		animationType="fade"
		onRequestClose={onClose}
		transparent
		visible={visible}
	>
		<Pressable
			accessibilityRole="button"
			onPress={onClose}
			style={styles.pickerOverlay}
		>
			<Pressable
				accessibilityRole="button"
				onPress={() => {}}
				style={styles.pickerSheet}
			>
				<Text style={styles.pickerTitle}>选择笔记本</Text>
				<ScrollView style={styles.pickerList}>
					{notebooks.map((notebook) => (
						<Pressable
							accessibilityRole="button"
							key={notebook.id}
							onPress={() => onSelect(notebook.id)}
							style={[
								styles.pickerItem,
								notebook.id === selectedId && styles.pickerItemSelected,
							]}
						>
							<Text
								style={[
									styles.pickerItemText,
									notebook.id === selectedId && styles.pickerItemTextSelected,
								]}
								numberOfLines={1}
							>
								{notebook.name}
							</Text>
							{notebook.id === selectedId ? (
								<Text style={styles.pickerCheck}>✓</Text>
							) : null}
						</Pressable>
					))}
				</ScrollView>
			</Pressable>
		</Pressable>
	</Modal>
);

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#f8fafc",
		flex: 1,
	},
	flex: {
		flex: 1,
	},
	header: {
		alignItems: "center",
		borderBottomColor: "#e2e8f0",
		borderBottomWidth: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	headerButton: {
		minWidth: 60,
	},
	cancelText: {
		color: "#64748b",
		fontSize: 16,
	},
	headerTitle: {
		color: "#0f172a",
		fontSize: 17,
		fontWeight: "700",
	},
	saveButton: {
		alignItems: "center",
		backgroundColor: "#0f172a",
		borderRadius: 8,
		justifyContent: "center",
		minHeight: 36,
		minWidth: 60,
		paddingHorizontal: 16,
	},
	saveButtonDisabled: {
		opacity: 0.45,
	},
	saveButtonText: {
		color: "#ffffff",
		fontSize: 15,
		fontWeight: "700",
	},
	body: {
		padding: 16,
		gap: 16,
	},
	field: {
		gap: 8,
	},
	label: {
		color: "#334155",
		fontSize: 13,
		fontWeight: "700",
	},
	input: {
		backgroundColor: "#ffffff",
		borderColor: "#e2e8f0",
		borderRadius: 8,
		borderWidth: 1,
		color: "#0f172a",
		fontSize: 15,
		minHeight: 44,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	inputReadonly: {
		backgroundColor: "#f1f5f9",
		color: "#64748b",
	},
	notebookPicker: {
		alignItems: "center",
		backgroundColor: "#ffffff",
		borderColor: "#e2e8f0",
		borderRadius: 8,
		borderWidth: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		minHeight: 44,
		paddingHorizontal: 12,
	},
	notebookPickerText: {
		color: "#0f172a",
		flex: 1,
		fontSize: 15,
	},
	notebookPickerPlaceholder: {
		color: "#94a3b8",
	},
	notebookPickerArrow: {
		color: "#64748b",
		fontSize: 10,
		marginLeft: 8,
	},
	previewBox: {
		backgroundColor: "#ffffff",
		borderColor: "#e2e8f0",
		borderRadius: 8,
		borderWidth: 1,
		maxHeight: 200,
		padding: 12,
	},
	previewText: {
		color: "#334155",
		fontSize: 14,
		lineHeight: 20,
	},
	error: {
		color: "#dc2626",
		fontSize: 13,
		lineHeight: 18,
	},
	pickerOverlay: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.4)",
		flex: 1,
		justifyContent: "flex-end",
	},
	pickerSheet: {
		backgroundColor: "#ffffff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		maxHeight: "60%",
		paddingBottom: 34,
		width: "100%",
	},
	pickerTitle: {
		color: "#0f172a",
		fontSize: 17,
		fontWeight: "700",
		padding: 16,
		textAlign: "center",
	},
	pickerList: {
		maxHeight: 300,
	},
	pickerItem: {
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	pickerItemSelected: {
		backgroundColor: "#f1f5f9",
	},
	pickerItemText: {
		color: "#0f172a",
		flex: 1,
		fontSize: 16,
	},
	pickerItemTextSelected: {
		fontWeight: "700",
	},
	pickerCheck: {
		color: "#0f172a",
		fontSize: 16,
		fontWeight: "700",
		marginLeft: 8,
	},
});
