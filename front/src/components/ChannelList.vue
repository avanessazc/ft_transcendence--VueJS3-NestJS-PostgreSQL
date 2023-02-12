<template>
  <div class="channels-box">
    <div class="channels-text">
      Channels
      <a class="white" @click="createChannel()">
        <div class="tooltip">
          <span class="icon is-medium">
            <i class="fa-solid fa-circle-plus"></i>
          </span>
          <span class="tooltiptext">Create Channel</span>
        </div>
      </a>
    </div>
    <ModalOverlay :open="isOpen" @close="isOpen = !isOpen">
      <template v-slot:content>
        <form id="form" @submit.prevent="submit">
          <div class="columns">
            <div class="column is-half is-offset-one-quarter">
              <div class="inline-block">
                <div class="field max80 display-block justify-content">
                  <h4 class="title is-4 top-margin" v-if="chan_name_edit == ''">
                    Create Channel
                    <p><br /></p>
                  </h4>
                  <h4 class="title is-4 top-margin" v-if="chan_name_edit != ''">
                    Edit Channel {{ chan_name_edit }}
                    <p><br /></p>
                  </h4>
                </div>
                <div class="field max80 display-block justify-content">
                  <InputField
                    Type="text"
                    Placeholder="Channel Name"
                    IconClass="fa-solid fa-fire-flame-curved white-input-color"
                    Class="input transparent-bg-color white-input-color"
                    :Value="formData.chan_name"
                    v-model="formData.chan_name"
                    v-if="chan_name_edit == ''"
                  />

                  <span
                    v-for="error in v$.chan_name.$errors"
                    :key="error.$uid"
                    class="validation-error"
                  >
                    {{ error.$message }}
                  </span>
                </div>
                <div class="field max80 display-block justify-content">
                  <InputField
                    Type="text"
                    Placeholder="Channel Topic"
                    IconClass="fa-solid fa-comment-dots white-input-color"
                    Class="input transparent-bg-color white-input-color"
                    :Value="formData.chan_topic"
                    v-model="formData.chan_topic"
                  />
                  <span
                    v-for="error in v$.chan_topic.$errors"
                    :key="error.$uid"
                    class="validation-error"
                  >
                    {{ error.$message }}
                  </span>
                </div>

                <div
                  class="control has-icons-left margin-extra field max80 justify-content"
                >
                  <div class="select is-primary min100">
                    <select v-model="selected">
                      <option value="" disabled selected>Channel Type</option>
                      <option
                        v-for="(chan_type, index) in chan_types"
                        :key="index"
                        v-bind:value="{
                          id: chan_type.id,
                          text: chan_type.name,
                        }"
                      >
                        {{ chan_type.name }}
                      </option>
                    </select>
                  </div>
                  <div class="icon is-small is-left" v-if="selected.id === 1">
                    <div class="tooltip">
                      <i class="fa-solid fa-lock-open"></i>
                      <span class="tooltiptext">fa-lock-open</span>
                    </div>
                  </div>
                  <div class="icon is-small is-left" v-if="selected.id === 2">
                    <div class="tooltip">
                      <i class="fa-solid fa-clipboard-check"></i>
                      <span class="tooltiptext">Private</span>
                    </div>
                  </div>
                  <div class="icon is-small is-left" v-if="selected.id === 3">
                    <div class="tooltip">
                      <i class="fa-solid fa-lock"></i>
                      <span class="tooltiptext">Protected</span>
                    </div>
                  </div>
                </div>

                <div
                  class="field max80 display-block margin-extra justify-content"
                  v-if="selected.id === 3"
                >
                  <InputField
                    Type="password"
                    Placeholder="Channel Password"
                    Autocomplete="off"
                    IconClass="fa-solid fa-key white-input-color"
                    Class="input transparent-bg-color white-input-color margin-extra"
                    :Value="formData.chan_pwd"
                    v-model="formData.chan_pwd"
                  />
                  <span
                    v-for="error in v$.chan_pwd.$errors"
                    :key="error.$uid"
                    class="validation-error"
                  >
                    {{ error.$message }}
                  </span>
                </div>

                <div
                  class="field max80 display-block margin-extra justify-content"
                  v-if="selected.id === 3"
                >
                  <InputField
                    Type="password"
                    Placeholder="Confirm Password"
                    Autocomplete="off"
                    IconClass="fa-solid fa-key white-input-color"
                    Class="input transparent-bg-color white-input-color margin-extra"
                    :Value="formData.chan_pwd_confirm"
                    v-model="formData.chan_pwd_confirm"
                  />
                  <span
                    v-for="error in v$.chan_pwd_confirm.$errors"
                    :key="error.$uid"
                    class="validation-error"
                  >
                    {{ error.$message }}
                  </span>
                </div>
                <div class="max80 display-block">
                  <br />
                  <button
                    class="button is-primary is-outlined custom"
                    type="submit"
                  >
                    <span v-if="chan_name_edit != ''">Update Channel</span
                    ><span v-if="chan_name_edit == ''">Create Channel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </ModalOverlay>

    <ModalOverlay
      :open="isOpenPasswordProtection"
      @close="isOpenPasswordProtection = !isOpenPasswordProtection"
    >
      <template v-slot:content>
        <form id="pp_form" @submit.prevent="pp_submit">
          <div class="columns">
            <div class="column is-half is-offset-one-quarter">
              <div class="inline-block">
                <div class="field max100 display-block justify-content">
                  <h4 class="title is-4 top-margin">
                    Password-Protected Channel
                    <p><br /></p>
                  </h4>
                </div>
                <div
                  class="field max100 display-block margin-extra justify-content"
                >
                  <InputField
                    Type="password"
                    Placeholder="Channel Password"
                    Autocomplete="off"
                    IconClass="fa-solid fa-key white-input-color"
                    Class="input transparent-bg-color white-input-color margin-extra"
                    :Value="pp_formData.chan_pwd"
                    v-model="pp_formData.chan_pwd"
                  />
                  <span
                    v-for="error in pp_v$.chan_pwd.$errors"
                    :key="error.$uid"
                    class="validation-error"
                  >
                    {{ error.$message }}
                  </span>
                  &nbsp;<br />
                  <span v-if="error_wrong_pwd.error" class="validation-error">
                    {{ error_wrong_pwd.error }}
                  </span>
                </div>
                <div class="max100 display-block">
                  <br />
                  <button
                    class="button is-primary is-outlined custom"
                    type="submit"
                  >
                    Access Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
    </ModalOverlay>
    <div class="channels-list">
      <div
        v-for="(channel, index) in user_channels"
        :key="index"
        class="channel-title"
      >
        <div
          v-if="
            user_channels[index].is_in == 'true' &&
            user_channels[index].user_mode_id != 2
          "
        >
          <div class="channel-title-content">
            <div class="icon is-medium is-left tooltip">
              <i class="fa-solid fa-lockfa-solid fa-satellite-dish"></i>
              <span class="tooltiptext">Member</span>
            </div>

            <div
              v-if="user_channels[index].type_id == 1"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-lock-open"></i>
              <span class="tooltiptext">Public</span>
            </div>

            <div
              v-if="user_channels[index].type_id == 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-clipboard-check"> </i
              ><span class="tooltiptext">Private</span>
            </div>

            <div
              v-if="user_channels[index].type_id == 3"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-lock"> </i>
              <span class="tooltiptext">Protected</span>
            </div>

            <a
              class="white"
              @click="
                editChannel(
                  user_channels[index].title,
                  user_channels[index].channel_id
                )
              "
            >
              <div
                v-if="user_channels[index].user_owner_id == userStore.user.id"
                class="icon is-medium is-left tooltip"
              >
                <i class="fa-solid fa-pencil"> </i
                ><span class="tooltiptext">Edit</span>
              </div>
            </a>

            <div class="ib">
              <b
                ><a
                  class="white"
                  @click="
                    joinChannel(
                      userStore.user.nickname,
                      user_channels[index].title,
                      user_channels[index].type_id
                    )
                  "
                >
                  {{ user_channels[index].title }}</a
                ></b
              >
            </div>
          </div>
        </div>
        <div
          v-if="
            user_channels[index].is_in == 'false' ||
            user_channels[index].user_mode_id == 2
          "
        >
          <div class="channel-title-content">
            <div
              v-if="user_channels[index].type_id == 1"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-lock-open"></i>
              <span class="tooltiptext">Public</span>
            </div>

            <div
              v-if="user_channels[index].user_mode_id == 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-ban"></i>
              <span class="tooltiptext">Banned</span>
            </div>

            <div
              v-if="user_channels[index].type_id == 2"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-clipboard-check"></i
              ><span class="tooltiptext">Private</span>
            </div>
            <div
              v-if="user_channels[index].type_id == 3"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-lock"></i
              ><span class="tooltiptext">Protected</span>
            </div>
            <div
              v-if="user_channels[index].user_owner_id == userStore.user.id"
              class="icon is-medium is-left tooltip"
            >
              <i class="fa-solid fa-pencil"> </i
              ><span class="tooltiptext">Edit</span>
            </div>
            <a
              @click="
                joinChannel(
                  userStore.user.nickname,
                  user_channels[index].title,
                  user_channels[index].type_id
                )
              "
              >{{ user_channels[index].title }}</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { ref } from "vue";
import ModalOverlay from "./Modal.vue";
import InputField from "./InputField.vue";
import { reactive, computed } from "vue";
import axios from "axios";
import { watch } from "vue";
import { useRouter } from "vue-router";
import { socket } from "../services/socketio.service";
import {
  required,
  requiredIf,
  minLength,
  maxLength,
  helpers,
  sameAs,
} from "@vuelidate/validators";
import { useUserStore } from "../store/user";
const userStore = useUserStore();
const router = useRouter();

const chan_name_edit = ref("");

const user_channels = ref([] as string[]);
const pp_chan_name = ref("");

function addSeconds(date: Date, seconds: number) {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

const joinChannel = async (
  nickname: string,
  chan_name: string,
  chan_type: number
) => {
  var time_now = new Date();
  var timestamp = new Date(userStore.user.mode_date_hour);
  var updated_timestamp = addSeconds(timestamp, userStore.user.mode_time);
  if (userStore.user.user_mode_id == 2 && updated_timestamp > time_now) return;
  if (chan_type == 3) {
    pp_chan_name.value = chan_name;
    isOpenPasswordProtection.value = true;
  } else if (chan_type == 2) {
    const res = await axios.get(
      "messages/get-user-in-channel/" + userStore.user.id + "/" + chan_name,
      {
        withCredentials: true,
      }
    );
    if (res && res.data) {
      const am_I_in_channel = res.data;
      if (am_I_in_channel.length > 0) {
        socket.emit("join-channel", { nickname, chan_name });
        router.push("/chat/" + chan_name);
        socket.emit("updateChanUsersList");
      }
    }
  } else if (chan_type == 1) {
    socket.emit("join-channel", { nickname, chan_name });
    router.push("/chat/" + chan_name);
    socket.emit("updateChanUsersList");
  }
};

const createChannel = () => {
  document.getElementById("form").reset();
  formData.chan_name = "";
  formData.chan_topic = "";
  formData.chan_pwd = "";
  formData.chan_pwd_confirm = "";
  selected.value.id = 1;
  v$.value.$reset();
  chan_name_edit.value = "";
  isOpen.value = true;
};

const editChannel = async (chan_name: string, channel_id: string) => {
  document.getElementById("form").reset();
  formData.chan_name = "";
  formData.chan_topic = "";
  formData.chan_pwd = "";
  formData.chan_pwd_confirm = "";
  selected.value = [];
  v$.value.$reset();
  chan_name_edit.value = "";
  chan_name_edit.value = chan_name;
  formData.chan_name = chan_name;
  const res = await axios.get("messages/get-chan-details/" + channel_id, {
    withCredentials: true,
  });
  if (res && res.data) {
    formData.chan_topic = await res.data.topic;
    formData.chan_type = await res.data.type_id;
    isOpen.value = true;
    socket.emit("updateTypeChannel", {});
  }
};

const updateListChannels = async () => {
  user_channels.value = [];
  const response = await axios.get(
    "messages/get-member-non-member-channels/" + userStore.user.id,
    {
      withCredentials: true,
    }
  );
  if (response && response.data) {
    user_channels.value = response.data;
  }
};

onMounted(async () => {
  try {
    updateListChannels();
  } catch (err) {
    console.log("updateListChannels");
  }
});

socket.on("update-channels", () => {
  try {
    updateListChannels();
  } catch (err) {
    console.log("update-channels");
  }
});

const error_chan_name_data = reactive({
  error: "",
});

const error_wrong_pwd = reactive({
  error: "",
});

const isOpen = ref(false);
const isOpenPasswordProtection = ref(false);

const selected = ref([] as string[]);

const chan_types = [
  { id: 1, name: "Public" },
  { id: 2, name: "Private" },
  { id: 3, name: "Protected" },
];

const formData = reactive({
  chan_name: "",
  chan_topic: "",
  chan_type: "",
  chan_pwd: "",
  chan_pwd_confirm: "",
});

const pp_formData = reactive({
  chan_pwd: "",
});

const { withAsync } = helpers;
watch(selected, () => {
  formData.chan_type = selected.value.id;
});

const uniqueChanNameRule = async (value: string): Promise<boolean> => {
  try {
    if (chan_name_edit.value == "") {
      const response = await axios.post(
        "messages/check-chan-name",
        { chan_name: value },
        {
          withCredentials: true,
        }
      );

      if (response && response.data && response.data == false) {
        error_chan_name_data.error = "This name is already used.";
        setTimeout(() => {
          error_chan_name_data.error = "";
        }, 4000);
        return false;
      } else return true;
    }
    return true;
  } catch (error) {
    return false;
  }
};

const pp_rules = computed(() => {
  return {
    chan_pwd: {
      required,
    },
  };
});

const NameFormatRule = (value: string): boolean => {
  var regex = /^[a-zA-Z0-9 ]*$/;
  return regex.test(value);
};

const rules = computed(() => {
  return {
    chan_name: {
      required,
      maxLength: maxLength(12),
      uniqueChanNameRule: helpers.withMessage(
        "This name is already used.",
        withAsync(uniqueChanNameRule)
      ),
      NameFormatRule: helpers.withMessage(
        "Invalid Channel name Format: only a-z, A-Z and 0-9 characters are allowed.",
        NameFormatRule
      ),
    },
    chan_topic: {
      required,
      maxLength: maxLength(100),
      NameFormatRule: helpers.withMessage(
        "Invalid Topic Format: only a-z, A-Z and 0-9 characters are allowed.",
        NameFormatRule
      ),
    },
    chan_type: { required },
    chan_pwd: {
      requiredIfProtected: requiredIf(selected.value.id === 3),
      minLength: minLength(8),
    },
    chan_pwd_confirm: {
      sameAs: sameAs(formData.chan_pwd),
    },
  };
});

const pp_v$ = useVuelidate(pp_rules, pp_formData);
const v$ = useVuelidate(rules, formData);

const pp_submit = async () => {
  const result = await pp_v$.value.$validate();
  if (result) {
    try {
      const response = await axios.post(
        "messages/check-chan-pwd",
        {
          pp_formData,
          chan_name: pp_chan_name.value,
          userid: userStore.user.id,
        },
        {
          withCredentials: true,
        }
      );
      const nickname = userStore.user.nickname;
      const chan_name = pp_chan_name.value;
      if (response && response.data && response.data === true) {
        socket.emit("join-channel", { nickname, chan_name });
        socket.emit("updateChannels", {});
        router.push("/chat/" + chan_name);
        document.getElementById("pp_form").reset();
        pp_v$.value.$reset();
        isOpenPasswordProtection.value = false;
      } else if (response && response.data && response.data === false) {
        error_wrong_pwd.error = "Wrong channel password. Please try again.";
        setTimeout(() => {
          error_wrong_pwd.error = "";
        }, 4000);
      }
    } catch (error) {
      console.log("pp_submit");
    }
  }
};
const submit = async () => {
  const result = await v$.value.$validate();
  if (result) {
    try {
      await axios.post(
        "messages/create-channel",
        { formData, userid: userStore.user.id },
        {
          withCredentials: true,
        }
      );
      document.getElementById("form").reset();
      socket.emit("updateChannels", {});
      socket.emit("updateUsersToInviteToPC", {});
      socket.emit("updatePrivateChannelInvitationList", {});
      socket.emit("update-chan-topic", {
        chan_name: chan_name_edit.value,
        chan_topic: formData.chan_topic,
      });

      v$.value.$reset();
      isOpen.value = false;
      await userStore.update_achievements(userStore.user.id, 6);
      socket.emit("updateAchievements", {});
    } catch (error) {
      console.log("submit");
    }
  }
};
</script>

<style scoped>
@import "../css/mystyles.css";

.inline-block {
  display: inline-block;
  justify-content: center;
}

.justify-content {
  justify-content: center;
}

.min100 {
  min-width: 100%;
}
.white {
  position: relative;
  top: 2px;
  font-size: 1rem;
  color: #ffffff !important;
}

.white:hover {
  color: #f557c5 !important;
}

.top-margin {
  margin-top: 20px;
}

.mw-50 {
  width: 50%;
}

.channels-box {
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(0, 178, 176, 0.2);
  height: 33%;
  margin: 0.5rem;
}

.channels-text {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(240, 157, 154, 0.09);
  height: 2rem;
  line-height: 30px;
}

.channel-title {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 8px;
  color: #ffffff;
  background-color: rgba(163, 197, 240, 0.09);
  height: 2rem;
  line-height: 30px;
}

.channel-title-content {
  display: flex;
  justify-content: center;
}
.channels-list {
  height: 75%;
  flex-grow: 0;
  overflow-y: scroll;
}
.channels-list::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.channels-list::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}
.ib {
  display: inline-block;
  /* margin-left: 20px; */
}

.max80 {
  max-width: 80%;
}

.max100 {
  max-width: 100%;
}

.bold {
  font-weight: bold;
}
.form-input-wide,
input {
  width: 100% !important;
}

.display-block {
  display: block !important;
}

.margin-extra {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.ml-20 {
  margin-left: 20px;
}

div.select.is-primary select {
  border-color: #ffffff !important;
  background-color: transparent !important;
  color: #919191;
}
div.select.is-primary:not(:hover)::after {
  border-color: #ffffff !important;
}

div.select.is-primary:hover::after {
  border-color: #f557c5 !important;
}

div.select.is-primary.select-items {
  background-color: transparent;
  color: #000000;
}

div.select.is-primary select:focus {
  border-color: #485fc7 !important;
  box-shadow: 0 0 0 0.125em rgba(72, 95, 199, 0.25) !important;
  min-width: 100% !important;
  -moz-box-sizing: border-box !important;
  -webkit-box-sizing: border-box !important;
  box-sizing: border-box !important;
}

.control.has-icons-left .select select {
  min-width: 100% !important;
  -moz-box-sizing: border-box !important;
  -webkit-box-sizing: border-box !important;
  box-sizing: border-box !important;
}

div.select.is-primary select {
  border-color: #485fc7 !important;
  box-shadow: 0 0 0 0.125em rgba(72, 95, 199, 0.25) !important;
  min-width: 100% !important;
}

input,
select {
  -moz-box-sizing: border-box !important;
  -webkit-box-sizing: border-box !important;
  box-sizing: border-box !important;
}

.validation-error {
  color: #e250e5;
  font-size: 0.8rem;
  font-weight: 500;
  float: left;
  text-align: left;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(-50%);
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  font-size: 11px;
  visibility: hidden;
  width: 80px;
  background-color: rgba(186, 178, 176, 0.2);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: 60%;
  left: 60%;
  margin-left: -50px;
  line-height: normal;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
