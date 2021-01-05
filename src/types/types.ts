export interface IFileChangedEvent {
  filename?: string;
  type: 'filechanged' | 'serverrestart';
}
