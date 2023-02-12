<template>
  <section class="hero is-fullheight main-bg" v-if="showLoader">
    <SpinnerLoader color="#e250e5" scale="1"> </SpinnerLoader>
  </section>
  <section class="hero is-fullheight main-bg" v-if="!showLoader">
    <NavBar />
    <router-view />
    <Footer />
  </section>
</template>

<script setup lang="ts">
import { useUserStore } from "./store/user";
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";

import axios from "axios";
import { onBeforeMount, onUnmounted, onBeforeUnmount } from "vue";
import SpinnerLoader from "./components/Spinner.vue";
import { ref, onMounted } from "vue";
import { useInvitationsStore } from "./store/friendshipInvitations";
import { useToPlayInvitationsStore } from "./store/toPlayInvitations";
import { socket } from "./services/socketio.service";
import { usePrivateChannelInvitationsStore } from "./store/privateChannelInvitation";

const invitationsStore = useInvitationsStore();
const toPlayInvitationsStore = useToPlayInvitationsStore();
const privateChannelInvitations = usePrivateChannelInvitationsStore();

const showLoader = ref(true);
const userStore = useUserStore();
onBeforeMount(async () => {
  try {
    userStore.auth = false;
    const response = await axios.get("http://localhost:3000/user", {
      withCredentials: true,
    });
    if (axios.isAxiosError(response) && response.response) {
      userStore.auth = false;
      return;
    }
    if (
      response.data != undefined &&
      response.data.code != undefined &&
      response.data.code === "005"
    ) {
      userStore.auth = false;
      return;
    }
    userStore.auth = true;
    await userStore.getUserInfos();
    await invitationsStore.update(userStore.user.id);
    await toPlayInvitationsStore.update(userStore.user.id);
    await privateChannelInvitations.update(userStore.user.id);
  } catch (e) {
    console.error("App: ", e);
  }
});
onMounted(async () => {
  if (socket.id) {
    await axios.post(
      "messages/register-client-socket",
      { user_id: userStore.user.id, socket_id: socket.id },
      { withCredentials: true }
    );
  }

  setTimeout(() => {
    showLoader.value = false;
  }, 2000);

  socket.on("authenticate", async () => {
    if (userStore.user.id) {
      await axios.post(
        "messages/register-client-socket",
        { user_id: userStore.user.id, socket_id: socket.id },
        { withCredentials: true }
      );
    }
  });
});

onBeforeUnmount(() => {
  socket.emit("remove-socket");
});

onUnmounted(() => {
  socket.emit("remove-socket");
  socket.disconnect(); // client-side only
});
</script>

<style scoped>
#app {
  height: 100% !important;
}
</style>
