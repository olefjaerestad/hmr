// type ISocket = WebSocket & {id: number};
// type ISocket = Omit<WebSocket, 
//   'close' | 'send' | 'addEventListener' | 'removeEventListener' | 'dispatchEvent'> 
//   & {id: number};
// close, send, addEventListener, removeEventListener, dispatchEvent
// type ICloseEvent = (event: {
//   wasClean: boolean; code: number;
//   reason: string; target: WebSocket
// }) => void;
export interface IFileChangedEvent {
  filename?: string;
  type: 'filechanged' | 'serverrestart';
}
