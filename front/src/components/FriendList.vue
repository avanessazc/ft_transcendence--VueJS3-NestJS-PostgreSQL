<template>
  <div class="friends-box">
    <div class="friends-text">Friends</div>
    <div class="friends-list">
      <div
        v-for="(user, index) in user_friends"
        :key="index"
        class="friend-nickname"
      >
        <a
          v-if="status_game_invitation(user_friends[index].id) === 0"
          class="white"
        >
          <div class="icon is-medium is-left tooltip-pong">
            <i class="fas fa-table-tennis"></i>
            <span class="tooltiptext-pong">
              <span class="option">Invite to Play Pong - Select Game Mode</span>
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
          v-else-if="status_game_invitation(user_friends[index].id) === 1"
          class="icon is-medium is-left tooltip"
        >
          <i class="far fa-hourglass"></i>
          <span class="tooltiptext">Sent Invitation to Play Pong</span>
        </div>
        <div
          v-else-if="status_game_invitation(user_friends[index].id) === 2"
          class="icon is-medium is-left tooltip"
        >
          <i class="fas fa-fire-alt"></i>
          <span class="tooltiptext">Lava Pong Invitation</span>
        </div>
        <a @click="remove_friend(user.id)" class="white">
          <div class="icon is-medium is-left tooltip">
            <i class="fas fa-user-minus"></i
            ><span class="tooltiptext">Remove Friend</span>
          </div></a
        >&nbsp;&nbsp;<b
          ><a
            class="white"
            @click="
              launchPrivateChat(
                userStore.user.id,
                user_friends[index].nickname,
                user_friends[index].id
              )
            "
            >{{ user.nickname }}</a
          ></b
        ><StatusDot
          :status_id="
            user_friends[index].status_id ? user_friends[index].status_id : 0
          "
        ></StatusDot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, onBeforeMount, Ref } from "vue";
import { ref } from "vue";
import { socket } from "../services/socketio.service";
import { useUserStore } from "../store/user";
import axios from "axios";
import { useRouter } from "vue-router";
const router = useRouter();
const userStore = useUserStore();

const launchPrivateChat = (
  main_user_id: string,
  guest_nickname: string,
  guest_id: string
) => {
  socket.emit("join-private-chat", { main_user_id, guest_id });
  router.push("/chat/private/" + guest_nickname);
};

const user_friends = ref([
  {
    avatar: "",
    email: "",
    firstname: "",
    id: "",
    inv_status: 2,
    nickname: "",
    surname: "",
  },
]);

const update_friends_list = async () => {
  try {
    if (userStore.user.id) {
      const res = await axios.get("friendship/friends/" + userStore.user.id, {
        withCredentials: true,
      });
      if (res && res.data) {
        const tmp = res.data;
        user_friends.value = tmp;
      }
    }
  } catch (err) {
    console.log("update_friends_list");
  }
};
const remove_friend = async function (user_id: string) {
  await axios.delete("friendship/delete/" + userStore.user.id + "/" + user_id, {
    withCredentials: true,
  });
  socket.emit("updateUsers", {});
  socket.emit("updateFriends", {});
  socket.emit("updateInvitationList", {});
  socket.emit("updatePendingPongInvitationFriendList", {});
  socket.emit("out-of-private-chat", {
    user_id: userStore.user.id,
    guest_id: user_id,
  });
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
  if (axios.isAxiosError(match) && match.response) {
    return;
  }
  socket.emit("updatePongInvitationList", {});
  socket.emit("updatePendingPongInvitationFriendList", {});
  if (match && match.data && match.data.id) {
    router.push({
      name: "pong",
      params: { match_id: match.data.id },
    });
  }
};

onBeforeMount(async () => {
  await update_friends_list();
});
onMounted(async () => {
  try {
    await pending_game(userStore.user.id);
  } catch (err) {
    console.log("pending_game");
  }
});
const pendingGames: Ref<PendingGames[]> = ref([] as PendingGames[]);
const pending_game = async (player_id: string) => {
  try {
    const res = await axios.get("pong/pending-invitation-user/" + player_id, {
      withCredentials: true,
    });
    if (res && res.data) {
      pendingGames.value = res.data;
    }
  } catch (err) {
    console.log("pong/pending-invitation-user/");
  }
};
const status_game_invitation = function (user_id: string): number {
  for (let i = 0; i < pendingGames?.value.length; i++) {
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
socket.on("update-friends", async () => {
  try {
    await update_friends_list();
  } catch (err) {
    console.log("update_friends_list");
  }
});

socket.on("update-pending-pong-invitation-friend-list", async () => {
  try {
    await pending_game(userStore.user.id);
  } catch (err) {
    console.log("update-pending-pong-invitation-friend-list");
  }
});
</script>

<script lang="ts">
import StatusDot from "./StatusDot.vue";
import { defineAsyncComponent } from "vue";
import { PendingGames } from "../types";
export default {
  components: {
    StatusDot: defineAsyncComponent(() => import("./StatusDot.vue")),
  },
};
</script>

<style scoped>
@import "../css/mystyles.css";

.friends-box {
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(182, 145, 243, 0.2);
  height: 33%;
  margin: 0.5rem;
}

.friends-text {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(146, 176, 241, 0.09);
  height: 2rem;
  line-height: 30px;
}

.friend-nickname {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(163, 197, 240, 0.09);
  height: 2rem;
  line-height: 30px;
}

.friends-list {
  height: 73%;
  flex-grow: 0;
  overflow-y: scroll;
}
.friends-list::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.friends-list::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}

.white {
  position: relative;
  top: 2px;
  color: #ffffff !important;
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
