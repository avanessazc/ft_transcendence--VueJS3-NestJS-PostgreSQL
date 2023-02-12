import { defineStore } from "pinia";
import axios from "axios";

export const useUsersListStore = defineStore("usersList", {
  state: () => ({
    user_list: [],
  }),

  actions: {
    async update(userId: string) {
      try {
        const res = await axios.get("friendship/users/" + userId, {
          withCredentials: true,
        });
        if (res && res.data) {
          const tmp = res.data;
          this.user_list = tmp;
        }
      } catch (err) {
        console.log("friendship/users/");
      }
    },
  },
});
