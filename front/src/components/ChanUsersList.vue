<template>
  <div class="users-box">
    <div class="users-list">
      <div
        v-for="(user, index) in user_list"
        :key="index"
        class="user-nickname"
      >
        <div>
          <div>
            <a
              @click="promoteToAdmin(user_list[index].user_id)"
              class="white"
              v-if="
                user_list[index].user_role_id == 1 &&
                userStore.user.user_role_id == 2
              "
            >
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fa-brands fa-superpowers"></i
                ><span class="tooltiptext">Promote to Admin</span>
              </div>
            </a>
            <a
              @click="relegate(user_list[index].user_id)"
              class="white"
              v-if="
                user_list[index].user_role_id == 2 &&
                is_cur_user_chan_owner &&
                user_list[index].user_id != owner_user_id
              "
            >
              <div class="icon is-medium is-left margin5 tooltip unsuperpowers">
                <img src="../assets/img/icons/unsuperpowers-w.svg" />
                <img
                  src="../assets/img/icons/unsuperpowers-p.svg"
                  class="img-top"
                />
                <span class="tooltiptext">Remove Admin</span>
              </div>
            </a>
            <a
              @click="kick(user_list[index].user_id, user_list[index].nickname)"
              class="white"
              v-if="
                userStore.user.user_role_id == 2 &&
                (user_list[index].user_role_id == 1 ||
                  user_list[index].user_id != owner_user_id)
              "
            >
              <div class="icon is-medium is-left tooltip">
                <i class="fa-solid fa-eject"></i>
                <span class="tooltiptext">Kick</span>
              </div>
            </a>
            <a
              @click="ban(user_list[index].user_id, user_list[index].nickname)"
              class="white"
              v-if="
                userStore.user.user_role_id == 2 &&
                user_list[index].user_mode_id == 1 &&
                (user_list[index].user_role_id == 1 ||
                  user_list[index].user_id != owner_user_id)
              "
            >
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-ban"></i><span class="tooltiptext">Ban</span>
              </div></a
            >
            <a
              @click="mute(user_list[index].user_id, user_list[index].nickname)"
              class="white"
              v-if="
                userStore.user.user_role_id == 2 &&
                user_list[index].user_mode_id == 1 &&
                (user_list[index].user_role_id == 1 ||
                  user_list[index].user_id != owner_user_id)
              "
            >
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-comment-slash"></i
                ><span class="tooltiptext">Mute</span>
              </div>
            </a>
            <b
              ><a class="white" v-if="user_list[index].user_id">{{
                user_list[index].nickname
              }}</a></b
            >
            <a class="white" v-if="user_list[index].user_mode_id == 2">
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fa-solid fa-bell-slash"></i
                ><span class="tooltiptext">This user is banned</span>
              </div>
            </a>
            <a class="white" v-if="user_list[index].user_mode_id == 3">
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fa-solid fa-volume-xmark"></i
                ><span class="tooltiptext">This user is mute</span>
              </div>
            </a>
            <a
              class="pink"
              v-if="
                user_list[index].user_role_id == 2 &&
                !(user_list[index].user_id == owner_user_id)
              "
            >
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fa-solid fa-star"></i
                ><span class="tooltiptext">Chan Admin</span>
              </div>
            </a>
            <a class="pink" v-if="user_list[index].user_id == owner_user_id">
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fa-solid fa-crown"></i
                ><span class="tooltiptext">Chan Owner</span>
              </div>
            </a>
            <StatusDot
              v-if="user_list[index].user_id"
              :status_id="user_list[index].status_id"
            ></StatusDot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, onBeforeMount } from "vue";
import { ref } from "vue";
import { socket } from "../services/socketio.service";
import axios from "axios";
import { useUserStore } from "../store/user";
import { useUsersListStore } from "../store/usersList";
import { useChanUsersListStore } from "../store/chanUsersList";
import StatusDot from "./StatusDot.vue";
import { defineAsyncComponent, watch } from "vue";
import { useRouter } from "vue-router";
export default {
  props: {
    chan_name: {
      type: String,
    },
  },
  components: {
    StatusDot: defineAsyncComponent(() => import("./StatusDot.vue")),
  },
  setup(props: { chan_name: string }) {
    const userStore = useUserStore();
    const userListStore = useUsersListStore();
    const chanUsersListStore = useChanUsersListStore();
    const user_list = ref();
    const is_cur_user_chan_owner = ref(false);
    const owner_user_id = ref("");
    const router = useRouter();
    var chan_id: string;

    async function checkIfChanOwner(current_user_id: string) {
      const res = await axios.post(
        "messages/check-current-chan-owner",
        {
          from_id: userStore.user.id,
          chan_id: chan_id,
        },
        {
          withCredentials: true,
        }
      );
      if (res && res.data && res.data.user_owner_id == current_user_id) {
        return true;
      }
      return false;
    }

    onBeforeMount(async () => {
      const response = await axios.get(
        "/messages/get-chan-id/" + props.chan_name,
        {
          withCredentials: true,
        }
      );
      if (response && response.data) {
        chan_id = response.data;
        const res = await axios.get(
          "messages/get-chan-owner-user-id/" + chan_id,
          {
            withCredentials: true,
          }
        );
        if (res && res.data) {
          owner_user_id.value = res.data;
          is_cur_user_chan_owner.value = await checkIfChanOwner(
            userStore.user.id
          );
        }
      }
    });

    watch(
      () => props.chan_name,
      async (newValue, oldValue) => {
        if (newValue != oldValue) {
          const response = await axios.get(
            "/messages/get-chan-id/" + props.chan_name,
            {
              withCredentials: true,
            }
          );
          if (response && response.data) {
            chan_id = response.data;
            const res = await axios.get(
              "messages/get-chan-owner-user-id/" + chan_id,
              {
                withCredentials: true,
              }
            );
            if (res && res.data) {
              owner_user_id.value = res.data;
              is_cur_user_chan_owner.value = await checkIfChanOwner(
                userStore.user.id
              );
              if (chan_id) {
                await chanUsersListStore.update(chan_id);
                await userStore.getChanUserInfos(chan_id);
                user_list.value = chanUsersListStore.user_list;
              }
            }
          }
        }
      }
    );
    const promoteToAdmin = async function (user_id: string) {
      await axios.patch(
        "messages/update-user-to-chan-admin",
        {
          from_id: userStore.user.id,
          user_id: user_id,
          chan_id: chan_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      socket.emit("updateChanUsersList", {});
      await chanUsersListStore.update(chan_id);
      user_list.value = chanUsersListStore.user_list;
      socket.emit("updateUsersToInviteToPC", {});
      socket.emit("updatePrivateChannelInvitationList", {});
      socket.emit("updateAdminInChannel", { channel: props.chan_name });
    };
    const relegate = async function (user_id: string) {
      await axios.patch(
        "messages/update-user-to-chan-basic-user",
        {
          from_id: userStore.user.id,
          user_id: user_id,
          chan_id: chan_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      socket.emit("updateChanUsersList", {});
      await chanUsersListStore.update(chan_id);
      user_list.value = chanUsersListStore.user_list;
      socket.emit("updateUsersToInviteToPC", {});
      socket.emit("updatePrivateChannelInvitationList", {});
      socket.emit("updateAdminInChannel", { channel: props.chan_name });
    };

    const mute = async function (
      muted_user_id: string,
      muted_user_nickname: string
    ) {
      socket.emit("temp-modify-user-mode-infos", {
        from_id: userStore.user.id,
        user_id: muted_user_id,
        chan_id: chan_id,
        user_mode_id: 3, //MUTE
        user_mode_time: 60,
      });

      socket.emit("wasMuted", {
        chan_id: chan_id,
        chan_name: props.chan_name,
        muted_user_id: muted_user_id,
        muted_user_nickname: muted_user_nickname,
        muter_user_nickname: userStore.user.nickname,
        muted_user_mode_time: 60,
      });
      socket.emit("updateChanUsersList", {});
      await chanUsersListStore.update(chan_id);
      user_list.value = chanUsersListStore.user_list;
    };

    const ban = async function (
      banned_user_id: string,
      banned_user_nickname: string
    ) {
      socket.emit("temp-modify-user-mode-infos", {
        from_id: userStore.user.id,
        user_id: banned_user_id,
        chan_id: chan_id,
        user_mode_id: 2, //BAN
        user_mode_time: 60,
      });
      socket.emit("out-of-channel", {
        user_id: banned_user_id,
        chan_name: props.chan_name,
      });
      socket.emit("wasBanned", {
        chan_id: chan_id,
        chan_name: props.chan_name,
        banned_user_id: banned_user_id,
        banned_user_nickname: banned_user_nickname,
        banner_user_nickname: userStore.user.nickname,
        banned_user_mode_time: 60,
      });
      socket.emit("updateChanUsersList", {});
      socket.emit("updateChannels", {});
      await chanUsersListStore.update(chan_id);
      user_list.value = chanUsersListStore.user_list;
    };

    const kick = async function (
      user_id: string,
      kicked_user_nickname: string
    ) {
      await axios.patch(
        "messages/kick-user-from-chan",
        {
          from_id: userStore.user.id,
          user_id: user_id,
          chan_id: chan_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      socket.emit("updateChanUsersList", {});
      await chanUsersListStore.update(chan_id);
      user_list.value = chanUsersListStore.user_list;
      socket.emit("out-of-channel", {
        user_id: user_id,
        chan_name: props.chan_name,
      });
      socket.emit("wasKickedFromChannel", {
        chan_id: chan_id,
        chan_name: props.chan_name,
        cur_user_id: user_id,
        cur_user_nickname: kicked_user_nickname,
        kicker_nickname: userStore.user.nickname,
      });
      socket.emit("updateChannels", {});
      socket.emit("updateUsersToInviteToPC", {});
      socket.emit("updatePrivateChannelInvitationList", {});
    };

    onMounted(async () => {
      const response = await axios.post(
        "/messages/retrieve-chan-id/",
        { chan_name: props.chan_name },
        {
          withCredentials: true,
        }
      );
      if (response && response.data) {
        var chan_id = response.data;
        await chanUsersListStore.update(chan_id);
        await userStore.getChanUserInfos(chan_id);
        user_list.value = chanUsersListStore.user_list;
      }
    });

    socket.on("update-users", async () => {
      try {
        await chanUsersListStore.update(chan_id);
        await userStore.getChanUserInfos(chan_id);
        user_list.value = chanUsersListStore.user_list;
      } catch (err) {
        console.log("update-users");
      }
    });
    return {
      user_list,
      ban,
      mute,
      StatusDot,
      router,
      userStore,
      userListStore,
      promoteToAdmin,
      is_cur_user_chan_owner,
      relegate,
      kick,
      owner_user_id,
    };
  },
};
</script>

<style scoped>
@import "../css/mystyles.css";
.users-box {
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(255, 178, 176, 0.2);
  height: 33%;
  margin: 0.5rem;
}
.users-text {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(240, 157, 154, 0.09);
  height: 2rem;
  line-height: 30px;
}
.user-nickname {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(240, 157, 154, 0.09);
  height: 2rem;
  line-height: 30px;
}
.users-list {
  height: 73%;
  flex-grow: 0;
  overflow-y: scroll;
}
.users-list::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}
.users-list::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}
.white {
  position: relative;
  top: 2px;
  color: #ffffff !important;
}
.white:hover {
  color: #f557c5 !important;
}
.margin5 {
  margin-left: 15px;
}
.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip .tooltiptext {
  font-size: 11px;
  visibility: hidden;
  width: 80px;
  background-color: rgba(186, 178, 176, 0.2);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: 60%;
  left: 60%;
  margin-left: -50px;
  line-height: normal;
}
.pink {
  color: #f557c5 !important;
  font-size: 12px;
  margin-left: -20px;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}
.unsuperpowers {
  width: 16px !important;
  height: 16px !important;
  position: relative;
  top: 4px;
  right: 3px;
  display: inline-block;
}
.unsuperpowers .img-top {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
}
.unsuperpowers:hover .img-top {
  display: inline;
}
.pong-inv {
  width: 25px;
  height: 25px;
  color: #e0e0e0;
}
</style>
