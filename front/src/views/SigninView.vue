<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <form @submit.prevent="submit">
        <div class="columns">
          <div class="column is-half is-offset-one-quarter">
            <h2 class="title is-2">Signin</h2>

            <div class="field max50 input-centered">
              <InputField
                Type="email"
                Placeholder="Email"
                IconClass="fas fa-envelope"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.email"
                v-model="formData.email"
              />
              <span
                v-for="error in v$.email.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
            </div>
            <div class="field max50 input-centered">
              <InputField
                Type="password"
                Placeholder="Password"
                Autocomplete="on"
                IconClass="fas fa-lock"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.password"
                v-model="formData.password"
              />
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
              >
                Signin
              </button>
            </div>
          </div>
        </div>
      </form>
      <h1><br />or</h1>
      <div class="max50 input-centered">
        <br />
        <a @click="openSignInWindow(getGoogleUrl(), 'google-popup')">
          <button class="button mr-5 is-primary is-outlined is-rounded rounded">
            <i class="fab fa-google"></i>
          </button>
        </a>
        <a :href="getMarvinUrl()">
          <button class="button ml-5 is-primary is-outlined is-rounded rounded">
            <b>42</b>
          </button>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputField from "../components/InputField.vue";
import "../assets/ts/bulmats.ts";
import { reactive, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { socket } from "../services/socketio.service";
import { setUserStatus } from "../utils/setUserStatus.ts";
import { useUserStore } from "../store/user";
import { getGoogleUrl } from "../utils/getGoogleUrl";
import { getMarvinUrl } from "../utils/getMarvinUrl";
const userStore = useUserStore();

let windowObjectReference: Window | null;
let previousUrl: string;

const openSignInWindow = (url: string, name: string) => {
  const strWindowFeatures =
    "toolbar=no, menubar=no, width=600, height=700, top=100, left=100";

  if (windowObjectReference === null || windowObjectReference?.closed) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
  } else if (previousUrl !== url) {
    windowObjectReference = window.open(url, name, strWindowFeatures);
    windowObjectReference?.focus();
  } else {
    windowObjectReference?.focus();
  }
  // assign the previous URL
  previousUrl = url;
};

const formData = reactive({
  email: "",
  password: "",
});

const errorData = reactive({
  error: "",
});

const rules = computed(() => {
  return {
    email: { required, email },
    password: { required },
  };
});

const v$ = useVuelidate(rules, formData);
const router = useRouter();

const submit = async () => {
  const result = await v$.value.$validate();
  if (result) {
    const res = await axios.get("user/check-2fa/" + formData.email, {
      withCredentials: true,
    });

    if (res && res.data && res.data.two_factor_enabled == true) {
      const response = await axios.post(
        "local/auth/check-credentials",
        formData,
        {
          withCredentials: true,
        }
      );
      if (axios.isAxiosError(response) && response.response) {
        errorData.error = "Invalid email/password.";
        return;
      }
      if (response.data != undefined && response.data.email) {
        router.push("otp/authenticate");
      } else {
        errorData.error = "Invalid email/password.";
      }
    } else {
      try {
        const response = await axios.post("local/auth/signin", formData, {
          withCredentials: true,
        });

        if (axios.isAxiosError(response) && response.response) {
          errorData.error = "Invalid email/password.";
          userStore.auth = false;
          return;
        } else {
          userStore.user = response.data.user;
          userStore.auth = true;
          axios.defaults.baseURL = "http://localhost:3000/";
          if (response.data.twofa == true) {
            router.push("otp/authenticate");
          } else {
            await setUserStatus(userStore.user.id, 1);
            socket.emit("updateUsers", {});
            socket.emit("updateFriends", {});
            router.push("/");
          }
          if (userStore.user.id)
            socket.emit("join-server", {
              user_id: userStore.user.id,
            });
        }
      } catch (err) {
        console.log("submit sign in");
      }
    }
  }
};
</script>

<style>
@import "../css/mystyles.css";

.white-input-color {
  color: #ffffff;
}

.gray-input-color {
  color: #b8b8b8;
}

.main-bg {
  background-color: #14141f !important ;
  line-height: 1.2;
}
.rainbow {
  font-weight: 600;
  font-size: 54px;
  background: linear-gradient(178.56deg, #fb29ff 5.32%, #4b50e6 94.32%);
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
.transparent-bg-color {
  background-color: transparent;
}

.max50 {
  max-width: 70%;
}
.max100 {
  max-width: 100%;
}

.input-centered {
  display: block;
  margin: auto;
}
.validation-error {
  color: #e250e5;
  font-size: 0.8rem;
  font-weight: 500;
  float: left;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
