<template>
  <div :class="show_scroll_bar()">
    <table class="table row-spacing transparent-bg-color table-center">
      <tbody>
        <tr v-for="(inv, index) in toPlayInvitations" :key="index">
          <td>
            <div class="">
              <img
                :src="`${toPlayInvitations[index].avatar}`"
                :alt="`${toPlayInvitations[index].avatar}`"
                class="rounded-avatar-inv"
              />
            </div>
          </td>
          <td class="cell">
            <div>{{ toPlayInvitations[index].nickname }}</div>
          </td>
          <td class="cell"><div>Sent you a Pong invitation</div></td>
          <td class="cell">
            <!-- Accept -->
            <a
              @click="
                response_to_play_request(
                  toPlayInvitations[index].match_id,
                  toPlayInvitations[index].id,
                  2
                )
              "
              ><div><i class="fas fa-check"></i></div
            ></a>
          </td>
          <td class="cell">
            <!-- Decline -->
            <a
              @click="
                response_to_play_request(
                  toPlayInvitations[index].match_id,
                  toPlayInvitations[index].id,
                  3
                )
              "
              ><div><i class="fas fa-times"></i></div
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, ref, defineEmits } from "vue";
import axios from "axios";
import { socket } from "../services/socketio.service";
import { useUserStore } from "../store/user";
import { useToPlayInvitationsStore } from "../store/toPlayInvitations";
import { setUserStatus } from "../utils/setUserStatus.ts";
import router from "../router";
const userStore = useUserStore();

const toPlayInvitationsStore = useToPlayInvitationsStore();

const emits = defineEmits(["closeWindow"]);

const toPlayInvitations = ref();
const response_to_play_request = async function (
  match_id: string,
  user_id: string,
  status: number
) {
  await axios.patch(
    "pong/update",
    {
      id: match_id,
      from_player_id: user_id,
      to_player_id: userStore.user.id,
      invitation_status_id: status,
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
  socket.emit("updatePongPendingGames", {});
  socket.emit("updatePendingPongInvitation", {});
  socket.emit("updatePendingPongInvitationUserList", {});
  socket.emit("updatePendingPongInvitationFriendList", {});
  emits("closeWindow", true);
  //Accept
  if (status == 2) {
    await setUserStatus(userStore.user.id, 2);
    socket.emit("updateUsers", {});
    socket.emit("updateFriends", {});
    router.push({
      name: "pong",
      params: { match_id: match_id },
    });
  }
  if (status == 3) {
    socket.emit("declinedMatchInvitation", { match_id: match_id });
  }
};
onMounted(async () => {
  try {
    await toPlayInvitationsStore.update(userStore.user.id);
    toPlayInvitations.value = toPlayInvitationsStore.invitations;
  } catch (err) {
    console.log("toPlayInvitationsStore.update(userStore.user.id)");
  }
});

socket.on("update-pong-invitation-list", async () => {
  try {
    await toPlayInvitationsStore.update(userStore.user.id);
    toPlayInvitations.value = toPlayInvitationsStore.invitations;
  } catch (err) {
    console.log("update-pong-invitation-list");
  }
});
const show_scroll_bar = function () {
  if (toPlayInvitationsStore.length > 1) {
    return "pong-inv";
  } else {
    return "";
  }
};
</script>

<style scoped>
@import "../css/mystyles.css";

td {
  text-align: center;
}

.rounded-avatar-inv {
  border-radius: 20px;
  width: 40px;
  height: 40px;
  max-height: 40px !important;
}

.table-center,
th {
  text-align: center !important;
  margin-right: auto;
  margin-left: auto;
  color: #ffffff !important;
}

.row-spacing {
  border-collapse: separate !important;
  border-spacing: 0 15px !important;
}

.transparent-bg-color {
  background-color: transparent;
}
.cell {
  display: table-cell !important;
  vertical-align: middle !important;
}

table,
tr,
td,
tbody,
th {
  border-color: transparent !important;
}
.pong-inv {
  display: inline-block;
  height: 6rem !important;
  flex-grow: 0;
  overflow-y: scroll;
}
.pong-inv::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.pong-inv::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}
</style>
