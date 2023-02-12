import { defineStore } from "pinia";
import axios from "axios";

export const useInvitationsStore = defineStore("friendshipInvitations", {
  state: () => ({
    invitations: [],
    length: 0,
  }),

  actions: {
    async update(usedId: string) {
      try {
        const res = await axios.get("friendship/invitations/" + usedId, {
          withCredentials: true,
        });
        if (res && res.data) {
          this.invitations = res.data;
          this.length = this.invitations.length;
        }
      } catch (err) {
        console.log("friendship/invitations/");
      }
    },
  },
});
