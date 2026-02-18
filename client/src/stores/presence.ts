import { defineStore } from "pinia";
import type { OnlineUser } from "@/services/ws";

export const usePresenceStore = defineStore("presence", {
  state: () => ({
    count: 0,
    users: [] as OnlineUser[]
  }),
  actions: {
    update(count: number, users: OnlineUser[]) {
      this.count = count;
      this.users = users;
    }
  }
});
