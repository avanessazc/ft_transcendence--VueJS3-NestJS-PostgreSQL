<template>
  <div class="hero-head z-index-31">
    <header class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <LogoFlame />
          <a
            role="button"
            class="navbar-burger"
            :class="{ 'is-active': isHamburgerOpen }"
            @click="openHamburgerMenu"
            aria-label="menu"
            aria-expanded="false"
            data-target="navMenu"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div
          id="navMenu"
          class="navbar-menu"
          :class="{ 'is-active': isHamburgerOpen }"
        >
          <div class="navbar-start">
            <router-link to="/chat/private" class="navbar-item">
              Chat
            </router-link>
            <router-link to="/ranking" class="navbar-item">
              Ranking
            </router-link>
            <router-link
              to="/matchmaking"
              replace
              class="navbar-item"
              v-if="show_play_button"
            >
              Play
            </router-link>
          </div>

          <div
            class="navbar-end"
            v-if="userStore.auth !== undefined && userStore.auth"
          >
            <div class="navbar-item">
              <div class="tooltip">
                <GameNotifications /><span class="tooltiptext"
                  >Pending Games</span
                >
              </div>
              <div class="tooltip">
                <EnvelopeNotifications /><span class="tooltiptext"
                  >Pending Invitations</span
                >
              </div>
              <AvatarCard />
              <div class="buttons">
                <router-link to="/" class="button is-primary" @click="logout">
                  <strong>Logout</strong>
                </router-link>
              </div>
            </div>
          </div>

          <div
            class="navbar-end"
            v-if="userStore.auth !== undefined && userStore.auth === false"
          >
            <div class="navbar-item">
              <div class="buttons">
                <router-link to="/signup" class="button is-primary">
                  <strong>Sign up</strong>
                </router-link>
                <router-link to="/signin" class="button is-light">
                  Log in
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useUserStore } from "../store/user";
import LogoFlame from "../components/LogoFlame.vue";
import { setUserStatus } from "../utils/setUserStatus.ts";
import { socket } from "../services/socketio.service";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const show_play_button = ref(true);
const userStore = useUserStore();

const route = useRoute();

watch(
  () => route.name,
  () => {
    if (route.name == "pong" || route.name == "matchmaking") {
      show_play_button.value = false;
    } else if (route.name != "pong" || route.name != "matchmaking") {
      show_play_button.value = true;
    }
  }
);

onMounted(async () => {
  if (userStore.user.id) {
    socket.emit("join-server", {
      user_id: userStore.user.id,
    });
  }
});

let isHamburgerOpen = ref(false);

const openHamburgerMenu = () => {
  isHamburgerOpen.value = !isHamburgerOpen.value;
};

const logout = async () => {
  socket.emit("leave-server", {
    user_id: null,
  });

  const nb_of_alive_refresh_tokens = await axios.get(
    "user/check-alive-refresh-tokens/" + userStore.user.id,
    { withCredentials: true }
  );
  if (nb_of_alive_refresh_tokens && nb_of_alive_refresh_tokens.data == 1) {
    await setUserStatus(userStore.user.id, 0);
    setTimeout(() => {
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
    }, 500);
  }
  await axios.post("local/auth/logout", {}, { withCredentials: true });
  userStore.$reset();
};
</script>
<script lang="ts">
import { defineAsyncComponent } from "vue";
export default {
  components: {
    AvatarCard: defineAsyncComponent(() => import("./AvatarCard.vue")),
    EnvelopeNotifications: defineAsyncComponent(
      () => import("./EnvelopeNotifications.vue")
    ),
    GameNotifications: defineAsyncComponent(
      () => import("./GameNotifications.vue")
    ),
  },
};
</script>
<style scoped>
.z-index-31 {
  z-index: 31;
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
</style>
