import { defineStore } from "pinia";
import axios from "axios";

export const useChanUsersListStore = defineStore("chanUsersList", {
  state: () => ({
    user_list: [],
  }),

  actions: {
    async update(chan_id: string) {
      try {
        const res = await axios.get("messages/get-chan-users-list/" + chan_id, {
          withCredentials: true,
        });
        if (res && res.data) {
          const tmp = res.data;
          this.user_list = tmp;
        }
      } catch (err) {
        console.log("messages/get-chan-users-list/");
      }
    },
  },
});
