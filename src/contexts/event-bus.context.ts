import { ValueOf } from "@aiszlab/relax/types";
import { createContext, RefObject, useContext } from "react";

export const EVENT_BUS_TOKENS = {
  REFRESH_TOURIST_PLANS: "refresh-tourist-plans",
} as const;

export type Handlers = Map<ValueOf<typeof EVENT_BUS_TOKENS>, () => Promise<void>>;

interface ContextValue {
  handlersRef: RefObject<Handlers>;
}

const EventBusContext = createContext<ContextValue | null>(null);

const useEventBusContext = () => {
  const _value = useContext(EventBusContext);
  if (!_value) {
    throw new Error("");
  }

  return _value;
};

export default EventBusContext;
export { useEventBusContext };
