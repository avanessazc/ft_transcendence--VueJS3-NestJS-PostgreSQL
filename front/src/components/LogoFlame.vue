<template>
  <router-link to="/" class="navbar-item">
    <img src="../assets/img/logo_flame.png" width="31" height="56" />
    <p class="lava-font">LAVA</p>
  </router-link>
</template>

<script lang="ts">
export default {
  name: "LogoFlame",
};
</script>

<style scoped>
.lava-font {
  align-items: text-top;
  margin-top: 0.6rem;
  margin-right: 3rem;
  font-family: Urbanist;
  font-size: 36px;
  color: white;
}
</style>
