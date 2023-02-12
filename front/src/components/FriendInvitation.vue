<template>
  <div :class="show_scroll_bar()">
    <table class="table row-spacing transparent-bg-color table-center">
      <tbody>
        <tr v-for="(inv, index) in invitations" :key="index">
          <td>
            <div class="">
              <img
                :src="`${invitations[index].avatar}`"
                :alt="`${invitations[index].avatar}`"
                class="rounded-avatar-inv"
              />
            </div>
          </td>
          <td class="cell">
            <div>{{ invitations[index].nickname }}</div>
          </td>
          <td class="cell"><div>Sent you a Friendship invitation</div></td>
          <td class="cell">
            <a @click="response_friend_request(invitations[index].id, 2)"
              ><div><i class="fas fa-check"></i></div
            ></a>
          </td>
          <td class="cell">
            <a @click="response_friend_request(invitations[index].id, 3)"
              ><div><i class="fas fa-times"></i></div
            ></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, ref } from "vue";
import axios from "axios";
import { socket } from "../services/socketio.service";
import { useUserStore } from "../store/user";
import { useInvitationsStore } from "../store/friendshipInvitations";
const userStore = useUserStore();

const invitationsStore = useInvitationsStore();

export default {
  setup() {
    const invitations = ref();
    const response_friend_request = async function (
      user_id: string,
      status: number
    ) {
      await axios.patch(
        "friendship/update",
        {
          from_id: user_id,
          to_id: userStore.user.id,
          status: status,
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
      socket.emit("updatePendingPongInvitationFriendList", {});
      if (status === 3) {
        await userStore.update_achievements(userStore.user.id, 4);
        socket.emit("updateAchievements", {});
      }
    };
    onMounted(async () => {
      try {
        await invitationsStore.update(userStore.user.id);
        invitations.value = invitationsStore.invitations;
      } catch (err) {
        console.log("invitationsStore.update");
      }
    });

    socket.on("update-invitation-list", async () => {
      try {
        await invitationsStore.update(userStore.user.id);
        invitations.value = invitationsStore.invitations;
      } catch (err) {
        console.log("update-invitation-list");
      }
    });
    const show_scroll_bar = function () {
      if (invitationsStore.length > 1) {
        return "friend-inv";
      } else {
        return "";
      }
    };
    return {
      invitations,
      response_friend_request,
      show_scroll_bar,
    };
  },
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
.friend-inv {
  display: inline-block;
  height: 6rem !important;
  flex-grow: 0;
  overflow-y: scroll;
}
.friend-inv::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.friend-inv::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}
</style>
