import { using } from "@aiszlab/relax/react";
import { ValueOf } from "@aiszlab/relax/types";

export const EVENT_BUS_TOKENS = {
  REFRESH_TOURIST_PLANS: "refresh-tourist-plans",
} as const;

type EventToken = ValueOf<typeof EVENT_BUS_TOKENS>;
type Handler = () => void | Promise<void>;

interface Store {
  handlers: Map<EventToken, Handler>;
  on: (event: EventToken, handler: Handler) => () => void;
  emit: (event: EventToken) => void;
}

const useEventBusStore = using<Store>((setState, getState) => ({
  handlers: new Map(),

  on: (event, handler) => {
    getState().handlers.set(event, handler);

    return () => {
      getState().handlers.delete(event);
    };
  },

  emit: (event) => {
    getState().handlers.get(event)?.();
  },
}));

export { useEventBusStore };
