<template>
  <transition name="pop" appear>
    <div class="vue-modal" v-show="open">
      <div class="vue-modal-inner">
        <div class="vue-modal-content">
          <slot name="content"> </slot>
          <slot></slot>
          <a class="white close-button" @click="$emit('close')">
            <span class="icon is-medium">
              <i class="fa-regular fa-circle-xmark"></i>
            </span>
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
export default {
  name: "ModalOverlay",
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
*,
::before,
::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.vue-modal {
  padding: 5px;
  border-radius: 5px;
  color: #000;
  position: fixed;
  top: 5%;
  width: 85%;
  left: 50%;
  transform: translate(-50%, 25%);
  max-width: 910px;
  height: 600px;
  overflow: hidden;
  background-color: rgba(42, 78, 83, 1);
  z-index: 1 !important;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
}

.close-button {
  position: absolute;
  top: 0px;
  right: 0px;
}

.white {
  color: #ffffff !important;
}

.white:hover {
  color: #f557c5 !important;
}
</style>
