import { EventEmitter } from "events";
import type { FriendshipDTO } from "@mindarena/shared";

// Strongly typed event names
export const EVENTS = {
  FRIEND_REQUEST_SENT: "FRIEND_REQUEST:SENT",
  FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST:ACCEPTED",
  FRIEND_REMOVED: "FRIEND:REMOVED",
} as const;

// Typed event payloads
interface EventMap {
  [EVENTS.FRIEND_REQUEST_SENT]: { targetUserId: string; request: FriendshipDTO };
  [EVENTS.FRIEND_REQUEST_ACCEPTED]: { requesterId: string; addresseeId: string; request: FriendshipDTO };
  [EVENTS.FRIEND_REMOVED]: { targetUserId: string; friendshipId: string };
}

type EventKey = keyof EventMap;

class AppEventBus {
  private emitter = new EventEmitter();

  emit<K extends EventKey>(event: K, payload: EventMap[K]): boolean {
    return this.emitter.emit(event, payload);
  }

  on<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  off<K extends EventKey>(event: K, listener: (payload: EventMap[K]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  removeAllListeners(event?: EventKey): this {
    this.emitter.removeAllListeners(event);
    return this;
  }
}

export const eventBus = new AppEventBus();
