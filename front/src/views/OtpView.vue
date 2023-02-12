<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <form @submit.prevent="submit">
        <div class="columns">
          <div class="column is-half is-offset-one-quarter">
            <h2 class="title is-2">OTP Required</h2>
            <div
              v-if="props.mode == 'activate'"
              class="intro field max50 input-centered"
            >
              Please provide the OTP code to enable 2FA in your account:
              <br /><br />
              <img :src="qrcode.data" v-if="qrcode" class="center" />
            </div>
            <div
              v-if="props.mode == 'authenticate'"
              class="intro field max50 input-centered"
            >
              Please provide the OTP code to finalize the login in 2FA mode to
              your account:
              <br /><br />
              <img :src="qrcode.data" v-if="qrcode" class="center" />
            </div>
            <div
              v-if="props.mode == 'deactivate'"
              class="intro field max50 input-centered"
            >
              Please provide the OTP code to disable 2FA in your account:
            </div>
            <div class="field max50 input-centered">
              <p class="control has-icons-left has-icons-right">
                <input
                  v-model="formData.twoFactorAuthCode"
                  class="input transparent-bg-color white-input-color"
                  type="password"
                  autocomplete="off"
                  placeholder="OTP code"
                />
                <span class="icon is-small is-left">
                  <i class="fas fa-lock"></i>
                </span>
              </p>
              <span
                v-for="error in v$.twoFactorAuthCode.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
            </div>
            <div class="field max50 input-centered">
              <p>&nbsp;</p>
            </div>
            <div class="field max50 input-centered">
              <p>&nbsp;</p>
              <span v-if="errorData.error" class="validation-error">
                {{ errorData.error }}
              </span>
            </div>
            <div class="field max50 input-centered">
              <p>&nbsp;</p>
            </div>

            <div class="max50 input-centered">
              <br />
              <button
                class="button is-primary is-outlined custom"
                type="submit"
                v-if="props.mode == 'activate'"
              >
                Activate 2FA
              </button>
              <button
                class="button is-primary is-outlined custom"
                type="submit"
                v-if="props.mode == 'authenticate'"
              >
                Authenticate in 2FA
              </button>
              <button
                class="button is-primary is-outlined custom"
                type="submit"
                v-if="props.mode == 'deactivate'"
              >
                Deactivate 2FA
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import axios from "axios";
import "../assets/ts/bulmats.ts";
import { defineProps, reactive, ref, onBeforeMount, computed } from "vue";
import { useUserStore } from "../store/user";
import { socket } from "../services/socketio.service";
import { setUserStatus } from "../utils/setUserStatus.ts";
const userStore = useUserStore();

const formData = reactive({
  twoFactorAuthCode: "",
});

const errorData = reactive({
  error: "",
});

const props = defineProps<{
  mode: string;
}>();

const rules = computed(() => {
  return {
    twoFactorAuthCode: { required },
  };
});

const v$ = useVuelidate(rules, formData);
const router = useRouter();

var qrcode = ref("");

onBeforeMount(async () => {
  try {
    if (props.mode == "activate") {
      const response = await axios.post(
        "local/auth/2fa/generate",
        {},
        {
          withCredentials: true,
        }
      );
      qrcode.value = response;
    }
  } catch (err) {
    qrcode.value = err;
    console.log("local/auth/2fa/generate");
  }
});

const submit = async () => {
  const result = await v$.value.$validate();
  if (result) {
    try {
      if (props.mode == "activate") {
        const response = await axios.post("local/auth/2fa/turn-on", formData, {
          withCredentials: true,
        });

        if (response.message === "Request failed with status code 401") {
          throw new Error("Invalid OTP Code - cannot activate 2FA");
        }

        userStore.user.two_factor_enabled = true;
      } else if (props.mode == "deactivate") {
        const response = await axios.post("local/auth/2fa/turn-off", formData, {
          withCredentials: true,
        });

        if (response.message === "Request failed with status code 401") {
          throw new Error("Invalid OTP Code - cannot deactivate 2FA");
        }

        userStore.user.two_factor_enabled = false;
      } else if (props.mode == "authenticate") {
        const response = await axios.post(
          "local/auth/2fa/authenticate",
          formData,
          {
            withCredentials: true,
          }
        );
        if (!response.data) {
          throw new Error("Invalid OTP Code - cannot authenticate in 2FA");
        } else {
          try {
            const response = await axios.get(
              "user/find-by-id-through-access-token/",
              {
                withCredentials: true,
              }
            );
            userStore.user = response.data.user;
            userStore.auth = true;
            axios.defaults.baseURL = "http://localhost:3000/";
            if (userStore.user.id)
              socket.emit("join-server", {
                user_id: userStore.user.id,
              });
            await setUserStatus(userStore.user.id, 1);
            socket.emit("updateUsers", {});
            socket.emit("updateFriends", {});
            //if popup then redirect main window and close popup
            if (window.opener) {
              window.opener.location.href =
                "http://localhost:8080/google/login/success/on";
              window.close();
            } else router.push("/");
          } catch (err) {
            errorData.error = "Invalid email/password.";
          }
        }
        router.push("/google/login/success/on");
      }
      router.push("/");
    } catch (err) {
      errorData.error = "Invalid OTP code.";
      setTimeout(() => {
        errorData.error = "";
      }, 1000);
    }
  }
};
</script>

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
  background-size: cover;
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

.intro {
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 10px;
  text-align: left;
}

.validation-error {
  color: #e250e5;
  font-size: 0.8rem;
  font-weight: 500;
  float: left;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}
</style>
