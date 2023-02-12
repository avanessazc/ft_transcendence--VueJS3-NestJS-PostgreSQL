import { defineStore } from "pinia";
import axios from "axios";

export const useToPlayInvitationsStore = defineStore("toPlayInvitations", {
  state: () => ({
    invitations: [],
    length: 0,
  }),

  actions: {
    async update(userId: string) {
      try {
        const res = await axios.get("pong/invitations/" + userId, {
          withCredentials: true,
        });
        if (res && res.data) {
          this.invitations = res.data;
          this.length = this.invitations.length;
        }
      } catch (err) {
        console.log("pong/invitations/");
      }
    },
  },
});
