import { LazyStore } from "@tauri-apps/plugin-store";

interface Task {
  name: string;
}

export class TaskStore {
  store = new LazyStore("tasks.json", { autoSave: false });

  async add(id: string, task: Task) {
    await this.store.set(id, task);
    await this.store.save();
  }

  async delete(id: string) {
    return await this.store.delete(id);
  }
}
