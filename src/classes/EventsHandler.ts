import { IEventNameToEventAndCallback, TChangeCallback, TEventName } from '../types/types';

type TEvents = {
  // Want to use this, but it results in errors:
  // [eventName in TEventName]?: IEventNameToEventAndCallback[eventName][1][];
  [eventName in keyof IEventNameToEventAndCallback]?: (TChangeCallback)[];
}

export class EventsHandler {
  _events: TEvents = {};

  addEventListener<T extends TEventName>(eventName: T, callback: IEventNameToEventAndCallback[T][1]) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    
    this._events[eventName].push(callback);
  }

  emit<T extends TEventName>(eventName: T, event: IEventNameToEventAndCallback[T][0]): boolean {
    if (!this._events[eventName]) {
      return false;
    }

    this._events[eventName].forEach((callback: IEventNameToEventAndCallback[T][1]) => {
      // @ts-ignore: Argument of type 'IEventNameToEventAndCallback[T][0]' is not assignable to parameter of type 'IChangeEvent & IClickEvent'.
      callback(event);
    });

    return true;
  }

  removeEventListener<T extends TEventName>(eventName: T, callback: IEventNameToEventAndCallback[T][1]): boolean {
    if (!this._events[eventName]) {
      return false;
    }
    
    const index = this._events[eventName].indexOf(callback);

    if (index === -1) {
      return false;
    }

    this._events[eventName].splice(index, 1);

    if (this._events[eventName].length === 0) {
      delete this._events[eventName];
    }

    return true;
  }
}
