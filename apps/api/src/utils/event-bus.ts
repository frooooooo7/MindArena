import { EventEmitter } from "events";

class AppEventBus extends EventEmitter {}

export const eventBus = new AppEventBus();

// Strongly typed event names
export const EVENTS = {
  FRIEND_REQUEST_SENT: "FRIEND_REQUEST:SENT",
  FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST:ACCEPTED",
};
