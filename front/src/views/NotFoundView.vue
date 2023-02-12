<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <div class="columns">
        <div class="column is-two-third">
          <h1 class="rainbow">404 - Not Found page</h1>
          <h1 class="rainbow">
            Sorry, We Couldn't Find Any Results For This Search.
          </h1>
        </div>
        <div class="column is-one-third">
          <img src="../assets/img/imgslider2.png" class="z-index20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style>
@import "../css/mystyles.css";
.main-bg {
  background-color: #14141f !important ;
  line-height: 1.2;
}
.rainbow {
  font-weight: 600;
  font-size: 54px;
  background: linear-gradient(178.56deg, #e250e5 5.32%, #4b50e6 94.32%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 10rem;
}
.header {
  margin-top: 10rem;
  font-weight: 600;
  font-size: 54px;
  color: #ffffff;
  text-align: center;
}

.bg-universe {
  z-index: 30;
  background-image: url("../assets/img/imgbg_slider_home2.png") !important;
}

a {
  color: #6d6fbb;
}

a:hover {
  color: #e250e5;
}

.z-index20 {
  z-index: 20;
}

.footer-signature {
  margin-bottom: 1rem;
}
</style>

<!-- <style scoped src="bulma/css/bulma.min.css"></style> -->
