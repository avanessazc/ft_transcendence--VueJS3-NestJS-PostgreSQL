<template>
  <div class="users-box">
    <div class="users-text">Users</div>
    <div class="users-list">
      <div
        v-for="(user, index) in user_list"
        :key="index"
        class="user-nickname"
      >
        <div>
          <!-- If logged user is who blockes-->
          <div v-if="user_list[index].who_blocks == 1">
            <a @click="unblock(user_list[index].id)" class="white">
              <div class="icon is-medium is-left margin5 tooltip">
                <i class="fas fa-ban"></i
                ><span class="tooltiptext">Unblock</span>
              </div> </a
            ><b
              ><a class="white">{{ user_list[index].nickname }}</a></b
            >
          </div>
          <!-- If logged user has beed blocked-->
          <div v-else-if="user_list[index].who_blocks == 2">
            <b
              ><a class="white">{{ user_list[index].nickname }}</a></b
            >
            <StatusDot :status_id="user_list[index].status_id"></StatusDot>
          </div>
          <!-- If logged user is who invites-->
          <div v-else-if="user_list[index].who_invites == 1">
            <a
              v-if="status_game_invitation(user_list[index].id) === 0"
              class="white"
            >
              <div class="icon is-medium is-left tooltip-pong">
                <i class="fas fa-table-tennis"></i>
                <span class="tooltiptext-pong">
                  <span class="option"
                    >Invite to Play Pong - Select Game Mode</span
                  >
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 1)"
                      class="white"
                      >1. Default</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 2)"
                      class="white"
                      >2. Blackhole</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 3)"
                      class="white"
                      >3. Color collision</a
                    >
                  </div>
                </span>
              </div>
            </a>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 1"
              class="icon is-medium is-left tooltip"
            >
              <i class="far fa-hourglass"></i>
              <span class="tooltiptext">Sent Invitation to Play Pong</span>
            </div>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fas fa-fire-alt"></i>
              <span class="tooltiptext">Lava Pong Invitation</span>
            </div>
            <div class="icon is-medium is-left tooltip">
              <i class="fas fa-paper-plane"></i
              ><span class="tooltiptext">Sent Friendship Invitation</span>
            </div>
            <a @click="block(user_list[index].id, 4)" class="white">
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-user-slash"></i
                ><span class="tooltiptext">Block</span>
              </div>
            </a>
            <b
              ><a class="white">{{ user_list[index].nickname }}</a></b
            ><StatusDot :status_id="user_list[index].status_id"></StatusDot>
          </div>
          <!-- If logged user has beed invited-->
          <div v-else-if="user_list[index].who_invites == 2">
            <a
              v-if="status_game_invitation(user_list[index].id) === 0"
              class="white"
            >
              <div class="icon is-medium is-left tooltip-pong">
                <i class="fas fa-table-tennis"></i>
                <span class="tooltiptext-pong">
                  <span class="option"
                    >Invite to Play Pong - Select Game Mode</span
                  >
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 1)"
                      class="white"
                      >1. Default</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 2)"
                      class="white"
                      >2. Blackhole</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 3)"
                      class="white"
                      >3. Color collision</a
                    >
                  </div>
                </span>
              </div>
            </a>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 1"
              class="icon is-medium is-left tooltip"
            >
              <i class="far fa-hourglass"></i>
              <span class="tooltiptext">Sent Invitation to Play Pong</span>
            </div>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fas fa-fire-alt"></i>
              <span class="tooltiptext">Lava Pong Invitation</span>
            </div>
            <div class="icon is-medium is-left tooltip">
              <i class="far fa-envelope"></i
              ><span class="tooltiptext">Friendship Invitation</span>
            </div>

            <a @click="block(user_list[index].id, 4)" class="white">
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-user-slash"></i
                ><span class="tooltiptext">Block</span>
              </div>
            </a>
            <b
              ><a class="white">{{ user_list[index].nickname }}</a></b
            ><StatusDot :status_id="user_list[index].status_id"></StatusDot>
          </div>
          <div v-else>
            <a
              v-if="status_game_invitation(user_list[index].id) === 0"
              class="white"
            >
              <div class="icon is-medium is-left tooltip-pong">
                <i class="fas fa-table-tennis"></i>
                <span class="tooltiptext-pong">
                  <span class="option"
                    >Invite to Play Pong - Select Game Mode</span
                  >
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 1)"
                      class="white"
                      >1. Default</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 2)"
                      class="white"
                      >2. Blackhole</a
                    >
                  </div>
                  <div class="option">
                    <a
                      @click="pong_request(userStore.user.id, user.id, 1, 3)"
                      class="white"
                      >3. Color collision</a
                    >
                  </div>
                </span>
              </div>
            </a>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 1"
              class="icon is-medium is-left tooltip"
            >
              <i class="far fa-hourglass"></i>
              <span class="tooltiptext">Sent Invitation to Play Pong</span>
            </div>
            <div
              v-else-if="status_game_invitation(user_list[index].id) === 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fas fa-fire-alt"></i>
              <span class="tooltiptext">Lava Pong Invitation</span>
            </div>
            <a @click="friend_request(user_list[index].id)" class="white">
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-user-plus"></i
                ><span class="tooltiptext">Add Friend</span>
              </div></a
            >
            <a @click="block(user_list[index].id, 4)" class="white">
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-user-slash"></i
                ><span class="tooltiptext">Block</span>
              </div>
            </a>
            <b
              ><a class="white">{{ user_list[index].nickname }}</a></b
            ><StatusDot :status_id="user_list[index].status_id"></StatusDot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, Ref } from "vue";
import { ref } from "vue";
import { socket } from "../services/socketio.service";
import axios from "axios";
import { useUserStore } from "../store/user";
import { useUsersListStore } from "../store/usersList";
import StatusDot from "./StatusDot.vue";
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { PendingGames } from "../types";

export default {
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  components: {
    StatusDot: defineAsyncComponent(() => import("./StatusDot.vue")),
  },
  setup() {
    const userStore = useUserStore();

    const userListStore = useUsersListStore();
    const user_list = ref();
    const router = useRouter();
    const block = async function (user_id: string, status: number) {
      await axios.patch(
        "friendship/update",
        {
          from_id: userStore.user.id,
          to_id: user_id,
          status: status,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      await axios.delete("pong/delete/" + userStore.user.id + "/" + user_id, {
        withCredentials: true,
      });
      await axios.delete("pong/delete/" + user_id + "/" + userStore.user.id, {
        withCredentials: true,
      });
      socket.emit("updateMessages", {});
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
      socket.emit("updateInvitationList", {});
      socket.emit("updatePongInvitationList", {});
      socket.emit("updatePongPendingGames", {});
      socket.emit("updatePendingPongInvitationUserList", {});
    };

    const unblock = async function (user_id: string) {
      await axios.delete(
        "friendship/delete/" + userStore.user.id + "/" + user_id,
        { withCredentials: true }
      );
      socket.emit("updateMessages", {});
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
      socket.emit("updateInvitationList", {});
      socket.emit("updatePongInvitationList", {});
      socket.emit("updatePendingPongInvitationUserList", {});
    };

    const friend_request = async function (user_id: string) {
      await axios.post(
        "friendship/create",
        {
          from_id: userStore.user.id,
          to_id: user_id,
          status: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
      socket.emit("updateInvitationList", {});
      socket.emit("updatePongInvitationList", {});
      socket.emit("updatePendingPongInvitationUserList", {});
      await userStore.update_achievements(userStore.user.id, 2);
      await userStore.update_achievements(user_id, 1);
      socket.emit("updateAchievements", {});
    };

    const pendingGames: Ref<PendingGames[]> = ref([] as PendingGames[]);
    const pending_game = async (player_id: string) => {
      try {
        const res = await axios.get(
          "pong/pending-invitation-user/" + player_id,
          {
            withCredentials: true,
          }
        );
        if (res && res.data) {
          pendingGames.value = res.data;
        }
      } catch (err) {
        console.log("pong/pending-invitation-user/");
      }
    };

    const status_game_invitation = function (user_id: string): number {
      for (let i = 0; i < pendingGames.value.length; i++) {
        if (
          pendingGames.value[i].player_id == user_id &&
          pendingGames.value[i].who_invites_to_play_pong == 1
        ) {
          return 1; // i_invite
        } else if (
          pendingGames.value[i].player_id == user_id &&
          pendingGames.value[i].who_invites_to_play_pong == 2
        ) {
          return 2; // i_am_invited
        }
      }
      return 0; // there is no pending invitation
    };

    const pong_request = async function (
      from_player_id: string,
      to_player_id: string,
      invitation_status_id: number,
      pong_map: number
    ) {
      const match = await axios.post(
        "pong/match/create",
        {
          id: "",
          from_player_id: from_player_id,
          to_player_id: to_player_id,
          invitation_status_id: invitation_status_id,
          pong_map: pong_map,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      socket.emit("updatePongInvitationList", {});
      socket.emit("updatePendingPongInvitationUserList", {});
      if (match && match.data && match.data.id) {
        router.push({
          name: "pong",
          params: { match_id: match.data.id },
        });
      }
    };
    onMounted(async () => {
      try {
        if (userStore.user.id) {
          await userListStore.update(userStore.user.id);
          user_list.value = userListStore.user_list;
          await pending_game(userStore.user.id);
        }
      } catch (err) {
        console.log("userListStore.update(userStore.user.id)");
      }
    });
    socket.on("update-users", async () => {
      try {
        if (userStore.user.id) {
          await userListStore.update(userStore.user.id);
          user_list.value = userListStore.user_list;
        }
      } catch (err) {
        console.log("update-users");
      }
    });
    socket.on("update-pending-pong-invitation-user-list", async () => {
      try {
        if (userStore.user.id) {
          await pending_game(userStore.user.id);
        }
      } catch (err) {
        console.log("update-pending-pong-invitation-user-list");
      }
    });
    return {
      user_list,
      block,
      unblock,
      friend_request,
      pong_request,
      StatusDot,
      router,
      userStore,
      userListStore,
      pending_game,
      pendingGames,
      status_game_invitation,
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

.tooltip:hover .tooltiptext {
  visibility: visible;
}

.pong-inv {
  width: 25px;
  height: 25px;
  color: #e0e0e0;
}

.tooltip-pong {
  position: relative;
  display: inline-block;
}

.tooltip-pong .tooltiptext-pong {
  font-size: 15px;
  visibility: hidden;
  width: 180px;
  background-color: rgb(125, 54, 146, 0.9);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  top: 60%;
  left: 60%;
  margin-left: 10px;
  line-height: normal;
}

.tooltip-pong:hover .tooltiptext-pong {
  visibility: visible;
}

.option {
  padding: 5px;
}
</style>
