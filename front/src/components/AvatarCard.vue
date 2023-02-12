<template>
  <router-link :to="'/' + profileUrl">
    <img
      :src="userStore.user.avatar"
      :alt="userStore.user.avatar"
      class="rounded-avatar is-small"
    />
    <span class="avatar-nickname"
      ><strong>{{ userStore.user.nickname }}</strong></span
    >
  </router-link>
</template>

<script lang="ts">
export default {
  name: "AvatarCard",
};
</script>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { useUserStore } from "../store/user";
import { ref, watch } from "vue";

const userStore = useUserStore();

let profileUrl = ref("profile/" + userStore.user.nickname);

watch(
  () => userStore.user.nickname,
  () => {
    profileUrl.value = "profile/" + userStore.user.nickname;
  }
);
</script>

<style scoped>
img.rounded-avatar.is-small {
  vertical-align: middle;
  border-radius: 5px;
  width: 39px !important;
  height: 39px !important;
  min-width: 39px !important;
  min-height: 39px !important;
  margin-right: 10px;
  max-height: 2.5rem !important;
}

.avatar-nickname {
  color: #ffffff !important;
  margin-right: 50px;
}
</style>
