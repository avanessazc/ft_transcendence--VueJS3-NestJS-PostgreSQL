<template>
  <img :src="guest_avatar" alt="Guest Avatar" class="rounded-avatar" />
</template>

<script lang="ts">
export default {
  name: "AvatarImg",
};
</script>

<script setup lang="ts">
import { ref, defineProps, onBeforeMount } from "vue";
import axios from "axios";
import { watch } from "vue";
const props = defineProps(["nickname"]);
const guest_avatar = ref("");

onBeforeMount(async () => {
  const response = await axios.post(
    "/messages/get-avatar-by-nickname",
    { nickname: props.nickname },
    { withCredentials: true }
  );
  if (response && response.data) guest_avatar.value = response.data;
});

watch(
  () => props.nickname,
  async () => {
    const response = await axios.post(
      "/messages/get-avatar-by-nickname",
      { nickname: props.nickname },
      { withCredentials: true }
    );
    if (response && response.data) guest_avatar.value = response.data;
  }
);
</script>

<style scoped>
.rounded-avatar {
  border-radius: 20px;
  width: 88px;
  height: 88px;
  min-width: 88px !important;
  min-height: 88px !important;
  display: flex;
  margin: 8px;
}
</style>
