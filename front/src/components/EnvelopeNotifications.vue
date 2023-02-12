<template>
  <div>
    <a @click="isOpen = true">
      <i class="far fa-envelope fa-2x notification"
        ><span
          v-if="
            invitationsStore.length +
              toPlayInvitationsStore.length +
              privateChannelInvitations.length >
            0
          "
          class="badge"
          >{{
            invitationsStore.length +
            toPlayInvitationsStore.length +
            privateChannelInvitations.length
          }}</span
        ></i
      >
    </a>
    <ModalOverlay :open="isOpen" @close="isOpen = !isOpen">
      <div class="text-center magin-top">
        <div>
          <a class="title is-6 title-and-icon">
            <div>
              <i class="fas fa-user-friends fa-2x"></i>
            </div>
            <div>
              <span class="font-size">Friendship Invitations</span>
            </div>
          </a>
        </div>
        <div class="magin-top">
          <FriendInvitation />
        </div>
      </div>
      <div class="text-center magin-top">
        <div>
          <a class="title is-6 title-and-icon">
            <div>
              <i class="fas fa-table-tennis fa-2x"></i>
            </div>
            <div>
              <span class="font-size">Pong Invitations</span>
            </div>
          </a>
        </div>
        <div class="magin-top">
          <ToPlayInvitation @closeWindow="closeWindow($event)" />
        </div>
      </div>
      <div class="text-center magin-top">
        <div>
          <a class="title is-6 title-and-icon">
            <div>
              <i class="fas fa-shield-alt fa-2x"></i>
            </div>
            <div>
              <span class="font-size">Private Channel Invitations</span>
            </div>
          </a>
        </div>
        <div class="magin-top">
          <PrivateChannelInvitation />
        </div>
      </div>
    </ModalOverlay>
  </div>
</template>

<script lang="ts">
export default {
  name: "EnvelopeNotifications",
};
</script>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { useUserStore } from "../store/user";
import { useInvitationsStore } from "../store/friendshipInvitations";
import { socket } from "../services/socketio.service";
import ModalOverlay from "./Modal.vue";
import FriendInvitation from "../components/FriendInvitation.vue";
import ToPlayInvitation from "../components/ToPlayInvitation.vue";
import PrivateChannelInvitation from "../components/PrivateChannelInvitation.vue";
import { ref } from "vue";
import { useToPlayInvitationsStore } from "../store/toPlayInvitations";
import { usePrivateChannelInvitationsStore } from "../store/privateChannelInvitation";
const userStore = useUserStore();

const toPlayInvitationsStore = useToPlayInvitationsStore();

const invitationsStore = useInvitationsStore();

const privateChannelInvitations = usePrivateChannelInvitationsStore();

socket.on("update-invitation-list", async () => {
  try {
    await invitationsStore.update(userStore.user.id);
  } catch (err) {
    console.log("update-invitation-list");
  }
});

socket.on("update-pong-invitation-list", async () => {
  try {
    await toPlayInvitationsStore.update(userStore.user.id);
  } catch (err) {
    console.log("update-pong-invitation-list");
  }
});

socket.on("update-private-channel-invitation-list", async () => {
  try {
    await privateChannelInvitations.update(userStore.user.id);
  } catch (err) {
    console.log("update-private-channel-invitation-list");
  }
});

const isOpen = ref(false);

const closeWindow = (value: boolean) => {
  isOpen.value = false;
};
</script>

<style scoped>
.notification {
  background-color: transparent;
}
.notification .badge {
  position: absolute;
  top: 15px;
  right: 25px;
  padding: 5px 8px;
  border-radius: 50%;
  background-color: red;
  color: white;
  font-size: x-small;
}

.text-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-and-icon {
  display: flex;
  align-items: center;
}
.font-size {
  font-size: 1.5rem;
  margin-left: 0.8rem;
}

.magin-top {
  margin-top: 30px !important;
}
.magin-bottom {
  margin-bottom: 20px !important;
}
</style>
