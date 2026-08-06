/** 全局「编辑器是否有未保存改动」信号，供 PWA 更新流程使用：
 *  编辑过程中若有未保存改动，延迟应用自动刷新，待用户保存完成后再刷新，
 *  避免部署新版本时打断编辑。 */
let editorHasUnsavedChanges = false;

export const setEditorHasUnsavedChanges = (dirty: boolean): void => {
  editorHasUnsavedChanges = dirty;
};

export const editorHasUnsavedChangesNow = (): boolean => editorHasUnsavedChanges;
