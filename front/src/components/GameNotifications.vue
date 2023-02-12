<template>
  <div>
    <a @click="isOpen = true">
      <i class="fas fa-table-tennis fa-2x notification"
        ><span v-if="pendingGamesStore.length > 0" class="badge">{{
          pendingGamesStore.length
        }}</span></i
      >
    </a>
    <ModalOverlay :open="isOpen" @close="isOpen = !isOpen">
      <div class="text-center magin-top">
        <div>
          <a class="title is-6 title-and-icon">
            <div>
              <i class="fas fa-hourglass-half fa-2x"></i>
            </div>
            <div>
              <span class="font-size">Pending games</span>
            </div>
          </a>
        </div>
        <div class="magin-top">
          <GameInvitationsList @closeWindow="closeWindow($event)" />
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
import { socket } from "../services/socketio.service";
import ModalOverlay from "./Modal.vue";
import GameInvitationsList from "../components/GameInvitationsList.vue";
import { ref } from "vue";
import { usePendingGamesStore } from "../store/pendingGames";

const pendingGamesStore = usePendingGamesStore();

const isOpen = ref(false);

socket.on("open-game-notifications", () => {
  isOpen.value = true;
});

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
