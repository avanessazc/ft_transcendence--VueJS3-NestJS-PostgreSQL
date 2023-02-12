<template>
  <form @submit.prevent>
    <div class="hero-body bg-universe">
      <div class="container has-text-centered">
        <h2 class="title is-2">Profile</h2>
        <div class="edit-button">
          <div>
            <RoundedButton
              v-if="
                (userStore.user.id != User.id && friendship == undefined) ||
                (friendship != undefined &&
                  friendship.invitation_status_id != 1 &&
                  friendship.invitation_status_id != 2 &&
                  friendship.invitation_status_id != 4)
              "
              @click="friend_request()"
              Name="Add Friend"
              iconClass="fas fa-user-plus"
            />
            <RoundedButton
              v-if="
                userStore.user.id != User.id &&
                friendship != undefined &&
                friendship.invitation_status_id == 1 &&
                friendship.who_invites == 1
              "
              Name="Sent Friendship Request"
              iconClass="fas fa-paper-plane"
            />
            <RoundedButton
              v-if="
                userStore.user.id != User.id &&
                friendship != undefined &&
                friendship.invitation_status_id == 1 &&
                friendship.who_invites == 2
              "
              Name="Friendship Request"
              iconClass="far fa-envelope"
            />
            <RoundedButton
              v-if="
                userStore.user.id != User.id &&
                friendship != undefined &&
                friendship.invitation_status_id == 4 &&
                friendship.who_blocks == 1
              "
              Name="Blocked"
              iconClass="fas fa-ban"
            />
            <RoundedButton
              v-if="
                userStore.user.id != User.id &&
                friendship != undefined &&
                friendship.invitation_status_id == 2
              "
              Name="Friend"
              iconClass="fas fa-user-friends"
            />
            <RoundedButton
              v-if="userStore.user.id == User.id && edit == false"
              @click="editInfo"
              Name="Edit"
              iconClass="fas fa-pen-alt"
            />
          </div>
          <div>
            <RoundedButton
              v-if="edit == true"
              @click="save"
              Name="Save"
              iconClass="far fa-save"
            />
          </div>
        </div>
        <div class="columns">
          <div class="column is-one-third has-text-centered">
            <AvatarEdit
              v-if="User.avatar !== undefined"
              :IsEditBtnOn="edit"
              :AvatarFileName="User.avatar"
              @updateNewAvatar="UpdateAvatar($event)"
              @RemovedAvatar="RemovedAvatar($event)"
            />
            <span
              v-for="(error, index) in error_data.new_avatar"
              :key="index"
              class="validation-error"
            >
              {{ error }}
            </span>
          </div>
          <div class="margin-top-data"></div>
          <div class="column is-one-third has-text-centered">
            <div class="profile-box">
              <h2 class="title is-5">Account info</h2>
              <div>
                <div class="field input-centered">
                  <InputField
                    id="firstname-input-field"
                    Type="text"
                    Placeholder="First name"
                    IconClass="fas fa-user white-input-color"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.firstname"
                    v-model="User.firstname"
                    :disabled="IsDisabledButton"
                    @deleteErrorMessages="clean_error_data_firstname()"
                  />
                  <span
                    v-for="(error, index) in error_data.firstname"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div class="field input-centered">
                  <InputField
                    id="surname-input-field"
                    Type="text"
                    Placeholder="Last name"
                    IconClass="fas fa-user white-input-color"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.surname"
                    v-model="User.surname"
                    :disabled="IsDisabledButton"
                    @deleteErrorMessages="clean_error_data_surname()"
                  />
                  <span
                    v-for="(error, index) in error_data.surname"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div class="field input-centered">
                  <InputField
                    id="nickname-input-field"
                    Type="text"
                    Placeholder="Nickname"
                    IconClass="fas fa-user-tag"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.nickname"
                    v-model="User.nickname"
                    :disabled="IsDisabledButton"
                    @deleteErrorMessages="clean_error_data_nickname()"
                  />
                  <span
                    v-for="(error, index) in error_data.nickname"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div class="field input-centered">
                  <InputField
                    id="email-input-field"
                    Type="email"
                    Placeholder="Email"
                    IconClass="fas fa-envelope"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.email"
                    v-model="User.email"
                    :disabled="IsDisabledButton"
                    @deleteErrorMessages="clean_error_data_email()"
                  />
                  <span
                    v-for="(error, index) in error_data.email"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div
                  v-if="edit == true"
                  class="footer-signature placed-left margin-top"
                >
                  <a @click="changePassword">Change Password </a>
                </div>
                <div
                  v-if="cp == true && edit == true"
                  class="field input-centered"
                >
                  <InputField
                    id="old-password-input-field"
                    Type="password"
                    Placeholder="Old password"
                    Autocomplete="off"
                    IconClass="fas fa-lock"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.old_password"
                    v-model="User.old_password"
                    @deleteErrorMessages="clean_error_data_old_password()"
                  />
                  <span
                    v-for="(error, index) in error_data.old_password"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div
                  v-if="cp == true && edit == true"
                  class="field input-centered"
                >
                  <InputField
                    id="password-input-field"
                    Type="password"
                    Placeholder="New password"
                    Autocomplete="off"
                    IconClass="fas fa-lock"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.password"
                    v-model="User.password"
                    @deleteErrorMessages="clean_error_data_password()"
                  />
                  <span
                    v-for="(error, index) in error_data.password"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div
                  v-if="cp == true && edit == true"
                  class="field input-centered"
                >
                  <InputField
                    id="password-confirm-input-field"
                    Type="password"
                    Placeholder="Repeat New password"
                    Autocomplete="off"
                    IconClass="fas fa-key"
                    Class="input transparent-bg-color white-input-color"
                    :Value="User.password_confirm"
                    v-model="User.password_confirm"
                    @deleteErrorMessages="clean_error_data_password_confirm()"
                  />
                  <span
                    v-for="(error, index) in error_data.password_confirm"
                    :key="index"
                    class="validation-error"
                  >
                    {{ error }}
                  </span>
                </div>
                <div
                  v-if="edit == true"
                  class="field input-centered margin-top-data"
                >
                  <TwoFAuthButton />
                </div>
              </div>
            </div>
          </div>
          <div class="column is-one-third has-text-centered">
            <div class="profile-box">
              <h2 class="title is-5">Achievements</h2>
              <div
                v-for="(achievement, index) in achievements"
                :key="index"
                class="margin-bottom-data"
              >
                <AchievementBar
                  :Title="achievement.achievement.title"
                  :Description="achievement.achievement.description"
                  :User_score="achievement.user_score"
                  :Minimum_score="achievement.achievement.minimum_score"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="margin-top-data">
          <a class="title is-6" @click="show_match_history()"
            ><i class="fas fa-history"></i> Match History</a
          >
          <div class="margin-top-data">
            <MatchHistory :userId="User.id" v-if="mh == true" />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import TwoFAuthButton from "../components/TwoFAuthButton.vue";
import AchievementBar from "../components/AchievementBar.vue";
import InputField from "../components/InputField.vue";
import AvatarEdit from "../components/AvatarEdit.vue";
import RoundedButton from "../components/RoundedButton.vue";
import MatchHistory from "../components/MatchHistory.vue";
import "../assets/ts/bulmats.ts";
import { computed, defineProps, onMounted, Ref, ref, watch } from "vue";
import { AchievementData } from "../types";
import { useUserStore } from "../store/user";
import axios from "axios";
import { socket } from "../services/socketio.service";
import router from "../router";

const userStore = useUserStore();
const props = defineProps<{
  nickname: string;
}>();

type Users = {
  id: string;
  firstname: string;
  surname: string;
  nickname: string;
  email: string;
  avatar: string;
  new_avatar: File;
  password: string;
  password_confirm: string;
  deleted_avatar: boolean;
  old_password: string;
};

type Friendship = {
  from_id: string;
  to_id: string;
  status: number;
};

let friendship: Ref<Friendship> = ref({} as Friendship);

let User: Ref<Users> = ref({} as Users);

let copy = {
  firstname: "",
  surname: "",
  nickname: "",
  email: "",
  password: "",
  password_confirm: "",
};
const IsloggedUser: Ref<boolean> = ref(false);
let achievements: Ref<AchievementData[]> = ref([] as AchievementData[]);
const edit = ref(false);
const editInfo = function () {
  edit.value = true;
};
const friend_request = async function () {
  await axios.post(
    "friendship/create",
    {
      from_id: userStore.user.id,
      to_id: User.value.id,
      status: 1,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  socket.emit("updateUsers", {});
  socket.emit("updateFriends", {});
  socket.emit("updateInvitationList", {});
  await userStore.update_achievements(userStore.user.id, 2);
  await userStore.update_achievements(User.value.id, 1);
  socket.emit("updateAchievements", {});
};

const friendship_status = async function () {
  if (userStore.user.id && User.value.id) {
    const res = await axios.get(
      "friendship/status/" + userStore.user.id + "/" + User.value.id,
      {
        withCredentials: true,
      }
    );
    if (res && res.data) {
      friendship.value = res.data[0];
    }
  }
};

socket.on("update-friends", async () => {
  try {
    await friendship_status();
  } catch (err) {
    console.log("update-friends");
  }
});

socket.on("update-achievements", async () => {
  await get_achievements();
});

const IsDisabledButton = computed<boolean>(() => {
  if (edit.value == false) return true;
  return false;
});
const cp = ref(false);
const changePassword = function () {
  if (cp.value == false) cp.value = true;
  else if (cp.value == true) cp.value = false;
};

const mh = ref(false);
const show_match_history = function () {
  if (mh.value == false) mh.value = true;
  else if (mh.value == true) mh.value = false;
};

const UpdateAvatar = (value: File) => {
  User.value.new_avatar = value;
};
const RemovedAvatar = (value: boolean) => {
  User.value.deleted_avatar = value;
};
onMounted(() => {
  edit.value = false;
  cp.value = false;
  return {
    edit,
    cp,
  };
});
const dataCopy = () => {
  copy.firstname = User.value.firstname;
  copy.surname = User.value.surname;
  copy.nickname = User.value.nickname;
  copy.email = User.value.email;
  copy.password = User.value.password;
};

const propsNickname = ref(props.nickname);
watch(
  () => props.nickname,
  async () => {
    propsNickname.value = props.nickname;
    await get_user_data();
    await get_achievements();
    await friendship_status();
  }
);

const get_user_data = async () => {
  try {
    const response = await axios.get("user/profile/" + propsNickname.value, {
      withCredentials: true,
    });
    if (
      response.data &&
      response.data.error &&
      response.data.error.code == "006"
    ) {
      router.push({
        name: "profile",
        params: { nickname: userStore.user.nickname },
      });
    } else {
      User.value = response.data.user;
      User.value.old_password = "";
      User.value.password = "";
      User.value.password_confirm = "";
      User.value.deleted_avatar = false;
      if (User.value.avatar == null) {
        User.value.avatar = "http://localhost:3000/files/defaultAvatar.jpeg";
      }
      dataCopy();
      if (userStore.user.id == User.value.id) {
        IsloggedUser.value = true;
      }
      return User;
    }
  } catch (err) {
    console.log("get_user_data");
  }
};
const get_achievements = async () => {
  try {
    const res = await axios.get("achievements/user/" + propsNickname.value, {
      withCredentials: true,
    });
    if (res && res.data) {
      const tmp = res.data;
      if (tmp && tmp[0]) {
        achievements.value = tmp[0].achievements;
      }
    }
    return achievements.value;
  } catch (err) {
    console.log("get_achievements");
  }
};

onMounted(async () => {
  await get_user_data();
  await get_achievements();
  await friendship_status();
});

socket.on("update-profile", async (arg) => {
  try {
    if (propsNickname.value == arg.nickname) {
      propsNickname.value = arg.nickname;
      await get_user_data();
    }
  } catch (err) {
    console.log("update-profile");
  }
});

const has_data_changed = (): boolean => {
  if (
    copy.firstname == User.value.firstname &&
    copy.surname == User.value.surname &&
    copy.nickname == User.value.nickname &&
    copy.email == User.value.email
  ) {
    return false;
  }
  return true;
};
const is_empty = (value: string): boolean => {
  return value === "";
};
const is_right_minlength = (value: string, len: number): boolean => {
  if (value.length >= len) {
    return true;
  }
  return false;
};

const is_right_maxlength = (value: string, len: number): boolean => {
  if (value.length <= len) {
    return true;
  }
  return false;
};

const image_rize_rule = (value: File): boolean => {
  var size_limit = 102400;
  return value.size <= size_limit;
};
const image_ext_Rule = (value: File): boolean => {
  var regex = /\.(jpe?g|png)$/;
  return regex.test(value.name);
};
const compare = (value1: string, value2: string): boolean => {
  return value1 === value2;
};
const email_rule = (value: string): boolean => {
  var regex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(value);
};

const NameFormatRule = (value: string): boolean => {
  var regex = /^[a-zA-Z0-9 ]*$/;
  return regex.test(value);
};

type Error = {
  firstname: string[];
  surname: string[];
  nickname: string[];
  email: string[];
  password: string[];
  password_confirm: string[];
  old_password: string[];
  new_avatar: string[];
};
const error_data: Ref<Error> = ref({} as Error);
error_data.value.firstname = [];
error_data.value.surname = [];
error_data.value.nickname = [];
error_data.value.email = [];
error_data.value.password = [];
error_data.value.password_confirm = [];
error_data.value.old_password = [];
error_data.value.new_avatar = [];
const data_validations = (): boolean => {
  if (has_data_changed() === true) {
    if (is_empty(User.value.firstname)) {
      error_data.value["firstname"].push("Value is required");
    }
    if (is_right_maxlength(User.value.firstname, 20) == false) {
      error_data.value["firstname"].push(
        "This field should be max 20 characters long"
      );
    }
    if (NameFormatRule(User.value.firstname) === false) {
      error_data.value["firstname"].push(
        "Invalid Firstname Format: only a-z, A-Z and 0-9 characters are allowed."
      );
    }
    if (is_empty(User.value.surname) === true) {
      error_data.value["surname"].push("Value is required");
    }
    if (is_right_maxlength(User.value.surname, 20) == false) {
      error_data.value["surname"].push(
        "This field should be max 20 characters long"
      );
    }
    if (NameFormatRule(User.value.surname) === false) {
      error_data.value["surname"].push(
        "Invalid Surname Format: only a-z, A-Z and 0-9 characters are allowed."
      );
    }
    if (is_empty(User.value.nickname) === true) {
      error_data.value["nickname"].push("Value is required");
    }
    if (is_right_maxlength(User.value.nickname, 20) == false) {
      error_data.value["nickname"].push(
        "This field should be max 20 characters long"
      );
    }
    if (is_right_minlength(User.value.nickname, 3) == false) {
      error_data.value["nickname"].push(
        "This field should be at least 3 characters long"
      );
    }
    if (NameFormatRule(User.value.nickname) === false) {
      error_data.value["nickname"].push(
        "Invalid Nickname Format: only a-z, A-Z and 0-9 characters are allowed."
      );
    }
    if (is_empty(User.value.email) === true) {
      error_data.value["email"].push("Value is required");
    }
    if (is_right_maxlength(User.value.email, 30) == false) {
      error_data.value["email"].push(
        "This field should be max 30 characters long"
      );
    }
    if (email_rule(User.value.email) === false) {
      error_data.value["email"].push("Value is not a valid email address");
    }
    if (
      error_data.value.surname.length == 0 &&
      error_data.value.surname.length == 0 &&
      error_data.value.nickname.length == 0 &&
      error_data.value.email.length == 0
    ) {
      return false;
    }
  }
  return true;
};
const password_change_validations = (): boolean => {
  if (cp.value === true) {
    if (is_empty(User.value.old_password) === true) {
      error_data.value["old_password"].push("Value is required");
    }
    if (is_empty(User.value.password) === true) {
      error_data.value["password"].push("Value is required");
    }
    if (is_right_minlength(User.value.password, 8) == false) {
      error_data.value["password"].push(
        "This field should be at least 8 characters long"
      );
    }
    if (is_right_maxlength(User.value.password, 20) == false) {
      error_data.value["password"].push(
        "This field should be max 20 characters long"
      );
    }
    if (is_empty(User.value.password_confirm) === true) {
      error_data.value["password_confirm"].push("Value is required");
    }
    if (compare(User.value.password, User.value.password_confirm) === false) {
      error_data.value["password_confirm"].push(
        "The value must be equal to the other value"
      );
    }
    if (
      error_data.value.old_password.length == 0 &&
      error_data.value.password.length == 0 &&
      error_data.value.password_confirm.length == 0
    ) {
      return false;
    }
  }
  return true;
};
const image_change_validations = (): boolean => {
  if (
    User.value.deleted_avatar === true ||
    User.value.new_avatar !== undefined
  ) {
    if (User.value.new_avatar !== undefined) {
      if (image_rize_rule(User.value.new_avatar) === false) {
        error_data.value["new_avatar"].push(
          "Invalid Image Size: should be < 100ko"
        );
      }
      if (image_ext_Rule(User.value.new_avatar) === false) {
        error_data.value["new_avatar"].push(
          "Invalid Image File Extension: should be gif, jpg, jpeg or png."
        );
      }
    }
    if (error_data.value.new_avatar.length == 0) {
      return false;
    }
  }
  return true;
};
const clean_error_data = () => {
  error_data.value.firstname = [];
  error_data.value.surname = [];
  error_data.value.nickname = [];
  error_data.value.email = [];
  error_data.value.password = [];
  error_data.value.password_confirm = [];
  error_data.value.old_password = [];
  error_data.value.new_avatar = [];
};
const clean_error_data_firstname = () => {
  const input = document.getElementById("firstname-input-field");
  error_data.value.firstname = [];
  input?.addEventListener("keypress", () => {
    error_data.value.firstname = [];
  });
};
const clean_error_data_surname = () => {
  const input = document.getElementById("surname-input-field");
  error_data.value.surname = [];
  input?.addEventListener("keypress", () => {
    error_data.value.surname = [];
  });
};
const clean_error_data_nickname = () => {
  const input = document.getElementById("nickname-input-field");
  error_data.value.nickname = [];
  input?.addEventListener("keypress", () => {
    error_data.value.nickname = [];
  });
};
const clean_error_data_email = () => {
  const input = document.getElementById("email-input-field");
  error_data.value.email = [];
  input?.addEventListener("keypress", () => {
    error_data.value.email = [];
  });
};
const clean_error_data_old_password = () => {
  const input = document.getElementById("old-password-input-field");
  error_data.value.old_password = [];
  input?.addEventListener("keypress", () => {
    error_data.value.old_password = [];
  });
};
const clean_error_data_password = () => {
  const input = document.getElementById("password-input-field");
  error_data.value.password = [];
  input?.addEventListener("keypress", () => {
    error_data.value.password = [];
  });
};
const clean_error_data_password_confirm = () => {
  const input = document.getElementById("password-confirm-input-field");
  error_data.value.password_confirm = [];
  input?.addEventListener("keypress", () => {
    error_data.value.password_confirm = [];
  });
};
const send_data = async () => {
  try {
    var response;
    if (cp.value == false) {
      User.value.password = "";
      User.value.password_confirm = "";
    }
    if (
      User.value.new_avatar !== undefined &&
      User.value.deleted_avatar == false
    ) {
      response = await axios.patch("users/update/", User.value, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
    } else {
      response = await axios.patch("users/update/", User.value, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
    }
    if (axios.isAxiosError(response) && response.response) {
      console.log("axios.isAxiosError= ", response.response);
    } else {
      if (response.data.code === "001") {
        error_data.value["nickname"].push(response.data.message);
      } else if (response.data.code === "002") {
        error_data.value["email"].push(response.data.message);
      } else if (response.data.code === "003") {
        error_data.value["old_password"].push(response.data.message);
      } else if (response.data.code === "004") {
        error_data.value["new_avatar"].push(
          "The real typemime of the uploaded file does not match the file extension and should be png or jpg."
        );
      } else {
        userStore.user.avatar = response.data.avatar;
        if (userStore.user.avatar == null) {
          userStore.user.avatar =
            "http://localhost:3000/files/defaultAvatar.jpeg";
        }
        userStore.user.nickname = response.data.nickname;
        userStore.user.email = response.data.email;
        userStore.user.firstname = response.data.firstname;
        userStore.user.surname = response.data.surname;
        User.value.avatar = response.data.avatar;
        if (User.value.avatar == null) {
          User.value.avatar = "http://localhost:3000/files/defaultAvatar.jpeg";
        }
        User.value.nickname = response.data.nickname;
        User.value.email = response.data.email;
        User.value.firstname = response.data.firstname;
        User.value.surname = response.data.surname;
        User.value.old_password = "";
        User.value.password = "";
        User.value.password_confirm = "";
        User.value.deleted_avatar = false;
        dataCopy();
        socket.emit("updateUsers", {});
        socket.emit("updateFriends", {});
        socket.emit("updateInvitationList", {});
        socket.emit("updateProfile", {
          email: response.data.email,
          nickname: response.data.nickname,
          firstname: response.data.firstname,
          surname: response.data.surname,
          avatar: response.data.avatar,
        });
        edit.value = false;
      }
    }
  } catch (error) {
    console.log("send_data");
  }
};
const save = async () => {
  clean_error_data();
  if (
    has_data_changed() === true ||
    User.value.deleted_avatar === true ||
    User.value.new_avatar !== undefined ||
    cp.value == true
  ) {
    data_validations();
    password_change_validations();
    image_change_validations();
    if (
      error_data.value.firstname.length == 0 &&
      error_data.value.surname.length == 0 &&
      error_data.value.nickname.length == 0 &&
      error_data.value.email.length == 0 &&
      error_data.value.new_avatar.length == 0
    ) {
      if (
        (cp.value == true &&
          error_data.value.old_password.length == 0 &&
          error_data.value.password.length == 0 &&
          error_data.value.password_confirm.length == 0) ||
        cp.value == false
      ) {
        send_data();
      }
    }
  } else if (
    has_data_changed() === false &&
    User.value.deleted_avatar === false &&
    User.value.new_avatar == undefined &&
    cp.value == false
  ) {
    edit.value = false;
  }
};
</script>

<style>
@import "../css/mystyles.css";
.input-file {
  display: none;
}
.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.profile-box {
  border-radius: 20px;
  color: #ffffff;
}
mar .gin-bottom-data {
  margin-bottom: 30px;
}
.margin-top-data {
  margin-top: 70px !important;
}
.margin-top {
  margin-top: 50px !important;
}
figure > img {
  padding-top: 12px;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  border-radius: 10%;
}
.margin-btn-photo {
  margin-bottom: 12px;
}
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
.edit-button {
  color: #ffffff;
  margin-bottom: 50px;
}
.custom-file-upload {
  width: 100%;
  height: 100%;
}
.placed-left {
  display: block;
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
</style>
