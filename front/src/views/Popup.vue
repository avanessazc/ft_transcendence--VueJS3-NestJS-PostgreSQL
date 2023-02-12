<template><div></div></template>
<script lang="ts">
export default {
  name: "PopUp",
};
</script>
<script setup lang="ts">
import { onMounted } from "vue";
onMounted(async () => {
  window.opener.location.href = "http://localhost:8080/google/login/success/on";
  window.close();
});
</script>
