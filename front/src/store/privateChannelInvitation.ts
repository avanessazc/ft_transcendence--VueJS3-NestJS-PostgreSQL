import { defineStore } from "pinia";
import axios from "axios";

export const usePrivateChannelInvitationsStore = defineStore(
  "privateChannelInvitations",
  {
    state: () => ({
      invitations: [],
      length: 0,
    }),

    actions: {
      async update(userId: string) {
        try {
          const res = await axios.get(
            "private-channel-invitation/invitations/" + userId,
            {
              withCredentials: true,
            }
          );
          if (res && res.data) {
            this.invitations = res.data;
            this.length = this.invitations.length;
          }
        } catch (err) {
          console.log("private-channel-invitation/invitations/");
        }
      },
    },
  }
);
