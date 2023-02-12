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
          <td class="cell">
            <div>
              Sent you an Invitation to join
              <b>{{ invitations[index].title }}</b> channel
            </div>
          </td>
          <td class="cell">
            <a
              @click="
                accept_invitation(
                  userStore.user.nickname,
                  invitations[index].title,
                  invitations[index].inv_id
                )
              "
              ><div><i class="fas fa-check"></i></div
            ></a>
          </td>
          <td class="cell">
            <a @click="decline_invitation(invitations[index].inv_id)"
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
import { usePrivateChannelInvitationsStore } from "../store/privateChannelInvitation";
import router from "../router";
const userStore = useUserStore();

const privateChannelInvitations = usePrivateChannelInvitationsStore();

const emits = defineEmits(["closeWindow"]);

const invitations = ref();

const accept_invitation = async function (
  nickname: string,
  chan_name: string,
  invitation_id: string
) {
  socket.emit("join-channel", { nickname, chan_name });
  emits("closeWindow", true);
  await axios.delete("private-channel-invitation/delete/" + invitation_id, {
    withCredentials: true,
  });
  socket.emit("updateChanUsersList", {});
  socket.emit("updateUsersToInviteToPC", {});
  socket.emit("updatePrivateChannelInvitationList", {});
  router.push("/chat/" + chan_name);
};

const decline_invitation = async function (invitation_id: string) {
  await axios.delete("private-channel-invitation/delete/" + invitation_id, {
    withCredentials: true,
  });
  socket.emit("updateUsersToInviteToPC", {});
  socket.emit("updatePrivateChannelInvitationList", {});
  emits("closeWindow", true);
};

onMounted(async () => {
  try {
    await privateChannelInvitations.update(userStore.user.id);
    invitations.value = privateChannelInvitations.invitations;
  } catch (err) {
    console.log("privateChannelInvitations.update(userStore.user.id)");
  }
});

socket.on("update-private-channel-invitation-list", async () => {
  try {
    await privateChannelInvitations.update(userStore.user.id);
    invitations.value = privateChannelInvitations.invitations;
  } catch (err) {
    console.log("update-private-channel-invitation-list");
  }
});
const show_scroll_bar = function () {
  if (privateChannelInvitations.length > 1) {
    return "private-channel-inv";
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
.private-channel-inv {
  display: inline-block;
  height: 6rem !important;
  flex-grow: 0;
  overflow-y: scroll;
}
.private-channel-inv::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.private-channel-inv::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}
</style>
