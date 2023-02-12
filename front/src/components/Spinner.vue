<template>
  <div class="hero-body">
    <div class="container has-text-centered">
      <div class="columns is-centered">
        <div class="column is-half">
          <div id="animation" class="elementToFadeInAndOut">
            <img src="../assets/img/logo_flame.png" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/ts/bulmats.ts";
export default {
  name: "SpinnerLoader",
};
</script>

<style scoped>
.elementToFadeInAndOut {
  -webkit-animation: fadeinout 1s linear forwards infinite;
  animation: fadeinout 1s linear forwards infinite;
}

@-webkit-keyframes fadeinout {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes fadeinout {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
