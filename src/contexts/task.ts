import { Nullable } from "@aiszlab/relax/types";
import { TaskStore } from "../stores/task";
import { createContext } from "react";

interface ContextValue {
  taskStore: Nullable<TaskStore>;
}

const Context = createContext<ContextValue>({ taskStore: null });

export default Context;
