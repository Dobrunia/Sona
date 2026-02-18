import { defineStore } from "pinia";

export type ToastItem = {
  id: string;
  message: string;
  type: "info" | "error";
};

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [] as ToastItem[]
  }),
  actions: {
    push(message: string, type: ToastItem["type"] = "info") {
      const id = crypto.randomUUID();
      this.items.push({ id, message, type });
      setTimeout(() => this.remove(id), 4000);
    },
    remove(id: string) {
      this.items = this.items.filter((item) => item.id !== id);
    }
  }
});
