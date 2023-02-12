import { defineStore } from "pinia";
import axios from "axios";

export const usePendingGamesStore = defineStore("pendingGames", {
  state: () => ({
    pending_matches: [],
    length: 0,
  }),

  actions: {
    async update(user_id: string) {
      try {
        const res = await axios.get("pong/pending-matches/" + user_id, {
          withCredentials: true,
        });
        if (res && res.data) {
          this.pending_matches = res.data;
          this.length = this.pending_matches.length;
        }
      } catch (err) {
        console.log("pong/pending-matches/");
      }
    },
  },
});
