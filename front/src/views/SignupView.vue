<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <form @submit.prevent="submit">
        <div class="columns">
          <div class="column is-half is-offset-one-quarter">
            <h2 class="title is-2">Signup</h2>
            <div class="field max70 input-centered">
              <InputField
                Type="text"
                Placeholder="First name"
                IconClass="fas fa-user white-input-color"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.firstname"
                v-model="formData.firstname"
              />
              <span
                v-for="error in v$.firstname.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
            </div>
            <div class="field max70 input-centered">
              <InputField
                Type="text"
                Placeholder="Surname"
                IconClass="fas fa-user white-input-color"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.surname"
                v-model="formData.surname"
              />
              <span
                v-for="error in v$.surname.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
            </div>
            <div class="field max70 input-centered">
              <InputField
                Type="text"
                Placeholder="Nickname"
                IconClass="fas fa-user-tag"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.nickname"
                v-model="formData.nickname"
              />
              <span
                v-for="error in v$.nickname.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
              <span v-if="error_nickname_data.error" class="validation-error">
                {{ error_nickname_data.error }}
              </span>
            </div>
            <div class="field max70 input-centered">
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
              <span v-if="error_email_data.error" class="validation-error">
                {{ error_email_data.error }}
              </span>
            </div>
            <div class="field max70 input-centered">
              <InputField
                Type="password"
                Placeholder="Password"
                Autocomplete="on"
                IconClass="fas fa-lock"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.password"
                v-model="formData.password"
              />
              <span
                v-for="error in v$.password.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
            </div>
            <div class="field max70 input-centered">
              <InputField
                Type="password"
                Placeholder="Repeat password"
                Autocomplete="on"
                IconClass="fas fa-key"
                Class="input transparent-bg-color white-input-color"
                :Value="formData.password_confirm"
                v-model="formData.password_confirm"
              />
              <div class="field max70">
                <span
                  v-for="error in v$.password_confirm.$errors"
                  :key="error.$uid"
                  class="validation-error"
                >
                  {{ error.$message }}
                </span>
              </div>
            </div>
            <div class="field max70 input-centered">
              <p>&nbsp;</p>
            </div>
            <div class="field max70 input-centered">
              <p>&nbsp;</p>
            </div>
            <div class="field max70 input-centered">
              <p>&nbsp;</p>
            </div>

            <div class="file max70 input-centered">
              <label class="file-label">
                <input
                  class="file-input"
                  type="file"
                  name="resume"
                  @change="handleFileUpload($event)"
                />
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fas fa-upload"></i>
                  </span>
                  <span class="file-label tab"> Avatar file </span>
                </span>
                <span class="file-name max100 min60">
                  {{ formData.avatar.name }}
                </span>
              </label>
            </div>
            <div class="max70 input-centered">
              <span
                v-for="error in v$.avatar.$errors"
                :key="error.$uid"
                class="validation-error"
              >
                {{ error.$message }}
              </span>
              <span v-if="error_image_data.error" class="validation-error">
                {{ error_image_data.error }}
              </span>
            </div>
            <div class="max70 input-centered">
              <br />
              <button
                class="button is-primary is-outlined custom"
                type="submit"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </form>
      <h1><br />or</h1>
      <div class="max70 input-centered">
        <br />
        <a @click="openSignInWindow(getGoogleUrl(), 'google')">
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
import { getGoogleUrl } from "../utils/getGoogleUrl";
import { getMarvinUrl } from "../utils/getMarvinUrl";
import InputField from "../components/InputField.vue";
import "../assets/ts/bulmats.ts";
import { reactive, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { socket } from "../services/socketio.service";
import {
  required,
  helpers,
  email,
  minLength,
  maxLength,
  sameAs,
} from "@vuelidate/validators";
import { useUserStore } from "../store/user";
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
  firstname: "",
  surname: "",
  email: "",
  nickname: "",
  password: "",
  password_confirm: "",
  avatar: {
    name: "",
  },
});

const error_image_data = reactive({
  error: "",
});

const error_nickname_data = reactive({
  error: "",
});

const error_email_data = reactive({
  error: "",
});

const imageSizeRule = (value: File): boolean => {
  if (!value.name) return true;
  var size_limit = 102400;
  return value.size <= size_limit;
};

const imageExtRule = (value: File): boolean => {
  if (!value.name) return true;
  var regex = /\.(jpe?g|png)$/;
  return regex.test(value.name);
};

const NameFormatRule = (value: string): boolean => {
  var regex = /^[a-zA-Z0-9 ]*$/;
  return regex.test(value);
};

const rules = computed(() => {
  return {
    firstname: {
      required,
      maxLength: maxLength(20),
      NameFormatRule: helpers.withMessage(
        "Invalid Firstname Format: only a-z, A-Z and 0-9 characters are allowed.",
        NameFormatRule
      ),
    },
    surname: {
      required,
      maxLength: maxLength(20),
      NameFormatRule: helpers.withMessage(
        "Invalid Surname Format: only a-z, A-Z and 0-9 characters are allowed.",
        NameFormatRule
      ),
    },
    email: {
      required,
      email,
      maxLength: maxLength(30),
    },
    nickname: {
      required,
      minLength: minLength(3),
      maxLength: maxLength(20),
      NameFormatRule: helpers.withMessage(
        "Invalid Nickname Format: only a-z, A-Z and 0-9 characters are allowed.",
        NameFormatRule
      ),
    },
    password: { required, minLength: minLength(8) },
    password_confirm: { required, sameAs: sameAs(formData.password) },
    avatar: {
      imageExtRule: helpers.withMessage(
        "Invalid Image File Extension: should be gif, jpg, jpeg or png.",
        imageExtRule
      ),
      imageSizeRule: helpers.withMessage(
        "Invalid Image Size: should be < 100ko",
        imageSizeRule
      ),
    },
  };
});

const handleFileUpload = (e) => {
  formData.avatar = e.target.files[0];
};

const v$ = useVuelidate(rules, formData);
const router = useRouter();

const submit = async () => {
  const result = await v$.value.$validate();
  if (result) {
    try {
      const response = await axios.post("local/auth/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (axios.isAxiosError(response) && response.response) {
        console.log("axios.isAxiosError= ", response.response);
      } else {
        if (response.data.code === "001") {
          error_nickname_data.error = response.data.message;
        } else if (response.data.code === "002") {
          error_email_data.error = response.data.message;
        } else if (response.data.code === "004") {
          error_image_data.error = response.data.message;
        } else {
          userStore.user = response.data.user;
          userStore.auth = true;
          socket.emit("join-server", {
            user_id: userStore.user.id,
          });
          socket.emit("updateUsers", {});
          socket.emit("updateFriends", {});
          router.push("/");
        }
        setTimeout(() => {
          error_nickname_data.error = "";
          error_email_data.error = "";
          error_image_data.error = "";
        }, 4000);
      }
    } catch (error) {
      console.log("submit - signup");
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

.max70 {
  max-width: 70%;
}

.tab {
  display: table-cell;
}

.max100 {
  max-width: 100%;
}
.min60 {
  display: table-cell;
  width: 100%;
}
.input-centered {
  display: block !important;
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
