import { defineStore } from "pinia";
import axios from "axios";
import { reactive } from "vue";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: reactive({
      id: "",
      firstname: "",
      surname: "",
      nickname: "",
      avatar: "",
      email: "",
      two_factor_enabled: false,
      user_role_id: 1,
      user_mode_id: 1,
      mode_date_hour: null,
      mode_time: 0,
    }),
    autoscroll: false,
    auth: false,
  }),

  actions: {
    async getUserInfos() {
      axios.defaults.baseURL = "http://localhost:3000/";
      const res = await axios.get("user", { withCredentials: true });
      if (res && res.data) {
        this.user = res.data;
        this.auth = true;
      }
    },
    resetUserInfos() {
      this.auth = false;
      this.user.id = "";
      this.user.firstname = "";
      this.user.surname = "";
      this.user.avatar = "";
      this.user.email = "";
      this.user.two_factor_enabled = false;
      this.user.user_role_id = 1;
      this.user.user_mode_id = 1;
      this.user.mode_date_hour = null;
      this.user.mode_time = 0;
    },
    async getChanUserInfos(chan_id: string) {
      if (this.user.id) {
        const res = await axios.get(
          "messages/get-chan-user-infos/" + this.user.id + "/" + chan_id,
          { withCredentials: true }
        );
        if (res && res.data) {
          this.user.user_role_id = res.data.user_role_id;
          this.user.user_mode_id = res.data.user_mode_id;
          this.user.mode_date_hour = res.data.mode_date_hour;
          this.user.mode_time = res.data.mode_time;
        }
      }
    },
    async update_achievements(user_id: string, achievement_id: number) {
      try {
        await axios.patch(
          "achievements/update",
          {
            user_id: user_id,
            achievement_id: achievement_id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.log("achievements/update");
      }
    },
  },
});
