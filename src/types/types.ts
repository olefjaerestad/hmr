export type TFsEventName = "add" | "addDir" | "change" | "unlink" | "unlinkDir";

export interface IFileChangedEvent {
  filename?: string;
  type: TFsEventName | 'restart';
}
