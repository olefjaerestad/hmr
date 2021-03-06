export type TFsEventName = "add" | "addDir" | "change" | "unlink" | "unlinkDir";
export interface IFileChangedEvent {
  filename?: string;
  filepath?: string;
  type: TFsEventName | 'restart';
}
export type TEventName = keyof IEventNameToEventAndCallback;
export type TChangeCallback = (event: IChangeEvent) => any;
export interface IChangeEvent extends IEvent {
  value: any;
}
export interface IEventNameToEventAndCallback {
  change: [IChangeEvent, TChangeCallback];
}

interface IEvent {
  [key: string]: any;
}
