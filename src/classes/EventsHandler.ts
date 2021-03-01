type TEventName = keyof IEventNameToEventAndCallback;
type TChangeCallback = (event: IChangeEvent) => any;
type TEvents = {
  // Want to use this, but it results in errors:
  // [eventName in TEventName]?: IEventNameToEventAndCallback[eventName][1][];
  [eventName in keyof IEventNameToEventAndCallback]?: (TChangeCallback)[];
}
interface IEvent {
  [key: string]: any;
}
interface IChangeEvent extends IEvent {
  value: any;
}
interface IEventNameToEventAndCallback {
  change: [IChangeEvent, TChangeCallback];
}

export class EventsHandler {
  _events: TEvents = {};

  addEventListener<T extends TEventName>(eventName: T, callback: IEventNameToEventAndCallback[T][1]) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    
    this._events[eventName].push(callback);
  }

  emit<T extends TEventName>(eventName: T, event: IEventNameToEventAndCallback[T][0]) {
    if (!this._events[eventName]) {
      return;
    }

    this._events[eventName].forEach((callback: IEventNameToEventAndCallback[T][1]) => {
      // @ts-ignore: Argument of type 'IEventNameToEventAndCallback[T][0]' is not assignable to parameter of type 'IChangeEvent & IClickEvent'.
      callback(event);
    });
  }

  removeEventListener<T extends TEventName>(eventName: T, callback: IEventNameToEventAndCallback[T][1]) {
    if (!this._events[eventName]) {
      return;
    }
    
    const index = this._events[eventName].indexOf(callback);
    (index !== -1) && this._events[eventName].splice(index, 1);

    if (this._events[eventName].length === 0) {
      delete this._events[eventName];
    }
  }
}
