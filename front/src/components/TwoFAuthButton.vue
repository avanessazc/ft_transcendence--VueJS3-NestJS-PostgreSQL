<template>
  <div>
    <label class="switch">
      <input v-model="checked" type="checkbox" @click="toggle2FA()" />
      <span class="slider"></span>
    </label>
    <span class="twofa">2-Factor Auth</span>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
export default {
  name: "TwoFAuthButton",
  data() {
    return {
      checked: "",
    };
  },
};
</script>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user";
const userStore = useUserStore();
var checked: boolean;
if (userStore.user.two_factor_enabled) checked = true;
const router = useRouter();

const toggle2FA = function () {
  if (userStore.user.two_factor_enabled == false) {
    router.push("/otp/activate");
  } else if (userStore.user.two_factor_enabled == true) {
    router.push("/otp/deactivate");
  }
};
</script>

<style scoped>
.twofa {
  display: inline-block;
  padding-left: 20px;
  color: #d6d5d4;
}

.switch {
  vertical-align: middle;
  position: relative;
  display: inline-block;
  width: 60px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4f4948;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 5px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #e250e5;
}

input:focus + .slider {
  box-shadow: 0 0 1px #e250e5;
}

input:checked + .slider:before {
  -webkit-transform: translateX(32px);
  -ms-transform: translateX(32px);
  transform: translateX(32px);
}
</style>
