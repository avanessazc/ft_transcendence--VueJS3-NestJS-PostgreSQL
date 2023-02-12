<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <h1 class="title is-1">Chat</h1>
      <ModalOverlay :open="isOpen" @close="isOpen = !isOpen">
        <template v-slot:content>
          <div class="columns">
            <div class="column is-half is-offset-one-quarter">
              <div class="inline-block white">
                <h4 class="title is-4 top-margin">Chan Users List</h4>
                <ChanUsersList
                  :chan_name="props.chan_name"
                  v-if="props.chan_name != 'private'"
                />
              </div>
              <div v-if="type_id == 2" class="inline-block white">
                <h4 class="title is-4 top-margin">Invite to join</h4>
                <UsersListToInviteToPC
                  v-if="props.chan_name != null && am_I_admin == 2"
                  :ChannelName="props.chan_name"
                />
              </div>
            </div>
          </div>
        </template>
      </ModalOverlay>
      <div class="columns">
        <div class="column is-one-third has-text-centered">
          <div class="left-box">
            <FriendList :userId="userStore.user.id" />
            <UsersList :userId="userStore.user.id" />
            <ChannelList :userId="userStore.user.id" />
          </div>
        </div>
        <div class="column is-two-thirds has-text-centered">
          <div class="messages-box">
            <div class="info-chat">
              <div class="width-100 topic-box">
                <div
                  class="relative-upper-right"
                  v-if="props.chan_name != 'private'"
                >
                  <a
                    class="white upper-right-left"
                    @click="showChanUsersList()"
                  >
                    <span class="icon is-small">
                      <i class="fa-regular fa-address-book"></i>
                    </span>
                  </a>
                  <a class="white upper-right" @click="leaveChannel()">
                    <span class="icon is-small">
                      <i class="fa-solid fa-right-from-bracket"></i>
                    </span>
                  </a>
                </div>
                <div class="width-40">
                  <div class="flex-centered">
                    <div v-if="!props.nickname" class="width-88">
                      <img
                        src="../assets/img/channel.png"
                        alt="avatarFileName"
                        class="large-rounded-avatar justify-content-start"
                      />
                    </div>
                    <div v-if="props.nickname" class="justify-content-start">
                      <AvatarImg :nickname="props.nickname"></AvatarImg>
                    </div>
                    <div
                      v-if="!props.nickname"
                      class="display-flex justify-content-start"
                    >
                      <h3 class="title is-3 nw">
                        &nbsp;&nbsp;{{ props.chan_name }}
                      </h3>
                    </div>
                    <div v-if="props.nickname">
                      <h3 class="title is-3 nw">
                        &nbsp;&nbsp;<a
                          class="white"
                          @click="router.push('/profile/' + props.nickname)"
                          >{{ props.nickname }}</a
                        >
                      </h3>
                    </div>
                  </div>
                </div>
                <div class="width-60 float-right border-left-bar" v-if="topic">
                  <h5 class="title is-5 ta-left">TOPIC:</h5>
                  {{ topic }}
                </div>
              </div>
            </div>
            <div
              id="msgbox"
              class="messages-container scroll"
              ref="msgbox"
              @scroll="onScroll"
            >
              <!-- Messages -->
              <template v-for="(message, index) in messages" :key="index">
                <div
                  v-if="
                    message.side === 'left' ||
                    (message.side === '' &&
                      userStore.user.id === message.user_id &&
                      message.nickname != 'Chief')
                  "
                  class="bg-light-left p-3 mprt-1 mb-1 rounded-bubble wb left-half"
                >
                  [{{ message.nickname }}]:
                  {{ message.content }}
                  <div class="hour-format">
                    {{ dateFormat(message.created_at, "mmm d, yyyy HH:MM") }}
                  </div>
                </div>
                <div
                  v-if="
                    message.nickname != 'Chief' &&
                    (message.side === 'right' ||
                      (message.side === '' &&
                        userStore.user.id !== message.user_id))
                  "
                  class="bg-light-right p-3 mt-1 mb-1 rounded-bubble wb right-half"
                >
                  [{{ message.nickname }}]:
                  {{ message.content }}
                  <div class="hour-format">
                    {{ dateFormat(message.created_at, "mmm d, yyyy HH:MM") }}
                  </div>
                </div>
                <div
                  v-if="
                    message.nickname == 'Chief' &&
                    (message.side === 'right' || message.side === '')
                  "
                  class="bg-light-right p-3 mt-1 mb-1 rounded-bubble wb right-half"
                >
                  <i>
                    {{ message.content }}
                  </i>
                  <div class="hour-format">
                    {{ dateFormat(message.created_at, "mmm d, yyyy HH:MM") }}
                  </div>
                </div>
                <div style="clear: both"></div>
              </template>
            </div>
            <div
              class="type-message"
              v-if="props.chan_name != 'private' || props.nickname"
            >
              <div class="who-is-typing">
                {{ typingDisplay }}
              </div>
              <div>
                <form class="message-box" @submit.prevent="sendMessage">
                  <input
                    class="input transparent-bg-color message-input-setup"
                    v-model="messageText"
                    placeholder="Type your message..."
                    @input="emitTyping"
                  />
                  <button type="submit">Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, watchEffect } from "vue";
import ModalOverlay from "../components/Modal.vue";
import { useUserStore } from "../store/user";
const userStore = useUserStore();
export default {
  data() {
    return {};
  },
  components: {
    AvatarImg: defineAsyncComponent(
      () => import("../components/AvatarImg.vue")
    ),
  },
  methods: {
    onScroll(e: Event) {
      const { scrollTop, offsetHeight, scrollHeight } = e.target as HTMLElement;
      if (scrollTop + offsetHeight >= scrollHeight - 5) {
        userStore.autoscroll = true;
      } else if (scrollTop + offsetHeight <= scrollHeight - 10) {
        userStore.autoscroll = false;
      }
    },
  },
};
</script>

<script setup lang="ts">
import ChannelList from "../components/ChannelList.vue";
import FriendList from "../components/FriendList.vue";
import UsersList from "../components/UsersList.vue";
import ChanUsersList from "../components/ChanUsersList.vue";
import UsersListToInviteToPC from "../components/UsersListToInviteToPC.vue";
import { onBeforeMount, onMounted, ref, watch, defineProps } from "vue";
import axios from "axios";
import dateFormat from "dateformat";
import { socket } from "../services/socketio.service";
import { useRouter } from "vue-router";

var chan_id: string;
var guest_id: string;
const router = useRouter();

const isOpen = ref(false);

const props = defineProps<{
  chan_name: string;
  nickname: string;
}>();

const am_I_admin = ref();
const am_I_in_channel = ref();
watchEffect(async () => {
  const res = await axios.get(
    "messages/get-user-in-channel/" + userStore.user.id + "/" + props.chan_name,
    {
      withCredentials: true,
    }
  );
  if (res && res.data) {
    am_I_in_channel.value = res.data;
    if (am_I_in_channel.value && am_I_in_channel.value.length > 0) {
      am_I_admin.value = am_I_in_channel.value[0].user_role_id;
    }
  }
});

socket.on("update-admin-in-channel", async (data: string) => {
  const res = await axios.get(
    "messages/get-user-in-channel/" + userStore.user.id + "/" + data,
    {
      withCredentials: true,
    }
  );
  if (res && res.data) {
    am_I_in_channel.value = res.data;
    if (am_I_in_channel.value && am_I_in_channel.value.length > 0) {
      am_I_admin.value = am_I_in_channel.value[0].user_role_id;
    }
  }
});

socket.on("update-type-channel", async () => {
  const res = await axios.get("/messages/get-chan-type/" + props.chan_name, {
    withCredentials: true,
  });
  if (res && res.data) {
    type_id.value = res.data;
  }
});

const type_id = ref();
watchEffect(async () => {
  const res = await axios.get("/messages/get-chan-type/" + props.chan_name, {
    withCredentials: true,
  });
  if (res && res.data) {
    type_id.value = res.data;
  }
});

watch(
  () => props.nickname,
  async (newValue, oldValue) => {
    if (!newValue && oldValue) messages.value = [];
    if (props.chan_name == "private" && !newValue) messages.value = [];
    if (props.nickname) {
      const response = await axios.get(
        "/messages/get-user-id/" + props.nickname,
        {
          withCredentials: true,
        }
      );
      if (response && response.data) {
        guest_id = response.data;
        const resp = await axios.post(
          "/friendship/check-if-friends/",
          { first_user_id: userStore.user.id, second_user_id: guest_id },
          {
            withCredentials: true,
          }
        );
        if (resp && resp.data == false) {
          router.push("/chat/private");
          messages.value = [];
          return;
        }
        socket.emit(
          "findAllMessagesPrivateChat",
          { main_user_id: userStore.user.id, guest_id: guest_id },
          (response: []) => {
            if (response.length != 0 && response[0].messages !== []) {
              messages.value = response;
              leftRightSort(messages.value);
              setTimeout(() => autofocus(), 100);
            } else messages.value = [];
          }
        );
      }
    }
  }
);

watch(
  () => props.chan_name,
  async () => {
    if (props.chan_name != "private" && props.nickname) {
      const resp = await axios.post(
        "/messages/get-chan-member-status/",
        { chan_name: props.chan_name, cur_user_id: userStore.user.id },
        {
          withCredentials: true,
        }
      );
      if (resp && resp.data != 1) {
        router.push("/chat/private");
        messages.value = [];
        topic.value = "";
        return;
      }
    }
    if (props.chan_name != "private") {
      guest_id = "";
      const res = await axios.get(
        "/messages/get-chan-topic/" + props.chan_name,
        {
          withCredentials: true,
        }
      );
      topic.value = await res.data;
      socket.emit("updateChannels", {});
      const response = await axios.get(
        "/messages/get-chan-id/" + props.chan_name,
        {
          withCredentials: true,
        }
      );
      chan_id = response.data;
      socket.emit("updateChanUsersList");
      socket.emit(
        "findAllChannelMessages",
        { chan_name: props.chan_name, user_id: userStore.user.id },
        (response: []) => {
          if (response.length !== 0) {
            messages.value = response;
            leftRightSort(messages.value);
          } else messages.value = [];

          setTimeout(() => autofocus(), 100);
        }
      );
    } else if (props.chan_name == "private" && props.nickname) {
      socket.emit(
        "findAllMessagesPrivateChat",
        { main_user_id: userStore.user.id, guest_id: nickname.value },
        (response: []) => {
          if (response[0] && response[0].messages !== []) {
            messages.value = response;
            leftRightSort(messages.value);
            setTimeout(() => autofocus(), 100);
          }
        }
      );
    } else if (props.chan_name == "private" && !props.nickname) {
      topic.value = "";
      messages.value = [];
    }
  }
);

const messages = ref([]);
const topic = ref("");
const messageText = ref("");

const nickname = ref(userStore.user.nickname);

const typingDisplay = ref("");

userStore.autoscroll = true;

var showChanUsersList = async () => {
  isOpen.value = true;
};

var leaveChannel = async () => {
  try {
    const leave_response = await axios.post(
      "/messages/leave-channel",
      { user_id: userStore.user.id, channel_id: chan_id },
      {
        withCredentials: true,
      }
    );
    if (leave_response.data.count) {
      router.push("/chat/private");
      socket.emit("out-of-channel", {
        user_id: userStore.user.id,
        chan_name: props.chan_name,
      });
    }
    socket.emit("leaveChannel", {
      chan_id: chan_id,
      chan_name: props.chan_name,
      cur_user_id: userStore.user.id,
      cur_user_nickname: userStore.user.nickname,
    });
    socket.emit("updateChannels", {});
    socket.emit("updatePrivateChannelInvitationList", {});
    messages.value = [];
  } catch (e) {
    console.log("leaveChannel ");
  }
};

onBeforeMount(() => {
  if (props.chan_name != "private") {
    guest_id = "";
    socket.emit(
      "findAllChannelMessages",
      { chan_name: props.chan_name, user_id: userStore.user.id },
      (response: []) => {
        if (response.length !== []) {
          messages.value = response;
          leftRightSort(messages.value);
        }
        setTimeout(() => autofocus(), 100);
      }
    );
  } else if (props.chan_name == "private" && props.nickname) {
    socket.emit(
      "findAllMessagesPrivateChat",
      { main_user_id: userStore.user.id, guest_id: nickname.value },
      (response: []) => {
        if (response.length !== []) {
          messages.value = response;
          leftRightSort(messages.value);
          setTimeout(() => autofocus(), 100);
        }
      }
    );
  }

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("out-of-channel", (d: [user_id: string, chan_name: string]) => {
    if (userStore.user.id == d.user_id && props.chan_name == d.chan_name) {
      isOpen.value = false;
      router.push("/chat/private");
    }
  });

  socket.on(
    "out-of-private-chat",
    async (d: [user_id: string, guest_id: string]) => {
      var response: Response;
      if (props.nickname) {
        response = await axios.get("/messages/get-user-id/" + props.nickname, {
          withCredentials: true,
        });
      }
      var props_id: string;
      if (response && response.data) props_id = response.data;
      if (
        props.chan_name == "private" &&
        ((userStore.user.id == d.user_id && props_id == d.guest_id) ||
          (userStore.user.id == d.guest_id && props_id == d.user_id))
      ) {
        isOpen.value = false;
        router.push("/chat/private");
      }
    }
  );

  socket.on(
    "update-chan-topic",
    (d: [chan_name: string, chan_topic: string]) => {
      if (topic.value != d.chan_topic) topic.value = d.chan_topic;
    }
  );

  socket.on("update-messages", () => {
    if (props.chan_name != "private") {
      socket.emit(
        "findAllChannelMessages",
        { chan_name: props.chan_name, user_id: userStore.user.id },
        (response: []) => {
          if (response.length !== 0) {
            messages.value = response;
            leftRightSort(messages.value);
          } else messages.value = [];

          setTimeout(() => autofocus(), 100);
        }
      );
    }
  });

  socket.on(
    "message",
    async (
      message: [
        user_id: string,
        nickname: string,
        content: string,
        side: string,
        chan_id: string,
        chan_name: string,
        guest_id: string
      ]
    ) => {
      const res = await axios.get(
        "friendship/status/" + userStore.user.id + "/" + message.user_id,
        {
          withCredentials: true,
        }
      );
      let sender_status = 0;
      if (res && res.data[0]) {
        if (res.data[0].who_blocks == 1)
          sender_status = res.data[0].invitation_status_id;
      }

      if (
        message.chan_name == props.chan_name &&
        !props.nickname &&
        sender_status != 4
      ) {
        messages.value.push(message);
        setTimeout(() => autofocus(), 100);
      } else if (
        (guest_id == message.guest_id ||
          message.guest_id == userStore.user.id) &&
        ((message.user_id == guest_id &&
          message.guest_id == userStore.user.id) ||
          (message.user_id == userStore.user.id &&
            message.guest_id == guest_id))
      ) {
        messages.value.push(message);
        setTimeout(() => autofocus(), 100);
      }
    }
  );

  socket.on("typing", async ({ chan_name, nickname, isTyping }) => {
    const resp = await axios.get("messages/get-user-id/" + nickname, {
      withCredentials: true,
    });
    let typing_user_id = resp.data;
    const res = await axios.get(
      "friendship/status/" + userStore.user.id + "/" + typing_user_id,
      {
        withCredentials: true,
      }
    );
    let sender_status = 0;
    if (res && res.data[0]) {
      if (res.data[0].who_blocks == 1)
        sender_status = res.data[0].invitation_status_id;
    }

    if (chan_name === props.chan_name) {
      if (isTyping && sender_status != 4) {
        typingDisplay.value = `${nickname} is typing...`;
      } else {
        typingDisplay.value = "";
      }
    }
  });

  socket.on(
    "private-chat-typing",
    ({ typing_user_id, typing_user_nickname, recipient_id, isTyping }) => {
      if (userStore.user.id == recipient_id && guest_id == typing_user_id) {
        if (isTyping) {
          typingDisplay.value = `${typing_user_nickname} is typing...`;
        } else {
          typingDisplay.value = "";
        }
      }
    }
  );
});

const autofocus = () => {
  var elem = document.getElementById("msgbox");
  if (userStore.autoscroll && elem) elem.scrollTop = elem.scrollHeight;
};

onMounted(async () => {
  if (!props.nickname) {
    const response = await axios.get(
      "/messages/get-chan-id/" + props.chan_name,
      {
        withCredentials: true,
      }
    );
    chan_id = response.data;
  } else if (props.nickname) {
    guest_id = await axios.get("/messages/get-user-id/" + props.nickname, {
      withCredentials: true,
    });
  }
});

function addSeconds(date: Date, seconds: number) {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

const sendMessage = async () => {
  var time_now = new Date();
  var timestamp = new Date(userStore.user.mode_date_hour);
  var updated_timestamp = addSeconds(timestamp, userStore.user.mode_time);
  if (userStore.user.user_mode_id == 3 && updated_timestamp > time_now) {
    socket.emit("YouAreMuted", {
      chan_name: props.chan_name,
      chan_id: chan_id,
      muted_user_id: userStore.user.id,
      muted_user_mode_time: userStore.user.mode_time,
    });
    messageText.value = "";
    return;
  }
  var recip_id: string;
  if (props.chan_name == "private" && guest_id) {
    recip_id = guest_id;
  } else if (props.chan_name != "private" && !guest_id) {
    recip_id = userStore.user.id;
  } else recip_id = "";
  socket.emit(
    "createMessage",
    {
      user_id: userStore.user.id,
      nickname: nickname.value,
      content: messageText.value,
      chan_name: props.chan_name,
      chan_id: chan_id,
      side: "",
      guest_id: recip_id,
    },
    () => {
      messageText.value = "";
    }
  );
};

const emitTyping = () => {
  if (props.chan_name != "private") {
    socket.emit("typing", { chan_name: props.chan_name, isTyping: true });
    let timeout = setTimeout(() => {
      socket.emit("typing", { chan_name: props.chan_name, isTyping: false });
    }, 2000);
  } else if (props.chan_name == "private" && props.nickname) {
    socket.emit("private-chat-typing", {
      typing_user_id: userStore.user.id,
      typing_user_nickname: userStore.user.nickname,
      recipient_id: guest_id,
      isTyping: true,
    });
    let timeout = setTimeout(() => {
      socket.emit("private-chat-typing", {
        typing_user_id: userStore.user.id,
        typing_user_nickname: userStore.user.nickname,
        recipient_id: guest_id,
        isTyping: false,
      });
    }, 2000);
  }
};

const leftRightSort = (
  messages: {
    user_id: string;
    nickname: string;
    content: string;
    chan_name: string;
    chan_id: string;
    side: "";
    guest_id: string;
  }[]
) => {
  for (var message of messages) {
    if (userStore.user.id == message.user_id && message.nickname != "Chief")
      message.side = "left";
    else message.side = "right";
  }
};
</script>

<style scoped>
@import "../css/mystyles.css";
.messages-box {
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(186, 178, 176, 0.2);
  height: 35rem;
  min-width: 700px;
}

.upper-right-left {
  position: absolute;
  top: 10px;
  right: 40px;
}
.upper-right {
  position: absolute;
  top: 10px;
  right: 10px;
}

.left-box {
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(186, 178, 176, 0.2);
  height: 35rem;
  display: flex;
  flex-direction: column;
}

.relative-upper-right {
  position: relative;
  float: right;
  z-index: 1;
}

.info-chat {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(0, 176, 44, 0.02);
  height: 7rem;
  display: flex;
  align-items: center;
}
.messages-container {
  flex-grow: 1;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(143, 100, 178, 0.081);
}

.width-88 {
  width: 88px !important;
  min-width: 88px;
}
.type-message {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-radius: 15px;
  color: #ffffff;
  height: 5rem;
}

.message-box {
  display: flex;
}
.message-input-setup {
  color: #ffffff;
  height: 3rem;
}
.transparent-bg-color {
  background-color: rgba(209, 131, 14, 0.04);
}

.who-is-typing {
  margin-bottom: 4px;
  height: 15px;
  font-size: 13px;
}

.large-rounded-avatar {
  border-radius: 20px;
  width: 5.5rem !important;
  height: 5.5rem !important;
  margin: 8px;
}

.online-status {
  border: 5px solid rgb(226, 80, 229);
}

.offline-status {
  border: 5px solid rgb(219, 203, 248);
}

.inAgame-status {
  border: 5px solid rgb(252, 116, 5);
}

div.scroll {
  margin: 4px, 4px;
  padding: 4px;
  overflow-x: hidden;
  overflow: hidden;
  overflow-y: auto;
  text-align: justify;
}

.width-40 {
  width: 40%;
  max-width: 40%;
  min-width: 40%;
}

.width-60 {
  margin-left: 10%;
  width: 50%;
  max-width: 50%;
  min-width: 50%;
  float: right;
}

.messages-container {
  overflow-y: scroll;
}
.messages-container::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.messages-container::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}

.top-margin {
  margin-top: 20px;
}

.bg-light {
  background-color: rgba(240, 157, 154, 0.04);
}

.bg-light-left {
  background-color: rgba(226, 80, 229, 0.1);
}

.bg-light-right {
  background-color: rgba(240, 157, 154, 0.1);
}

.bg-right-color {
  background-color: rgba(226, 80, 229, 0.1);
}

.p-3 {
  padding: 1rem !important;
}

.mb-1 {
  margin-bottom: 0.25rem !important;
}

.mt-1 {
  margin-top: 0.25rem !important;
}

.rounded-bubble {
  border-radius: 15px;
}

.wb {
  overflow-wrap: break-word;
}

.right-half {
  float: right;
  width: 45%;
}

.left-half {
  float: left;
  width: 45%;
}

.badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.message-box {
  display: flex;
}
.message-input-setup {
  color: #ffffff;
  height: 3rem;
}
.transparent-bg-color {
  background-color: rgba(209, 131, 14, 0.04);
}

.ta-left {
  text-align: left;
}

.who-is-typing {
  margin-bottom: 4px;
}

.hour-format {
  font-size: x-small;
  text-align: right;
}

.topic-box {
  background-color: #8d417f;
  color: #ffffff;
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  opacity: 0.7;
}

.float-left {
  float: left;
}

.float-right {
  display: inline;
  text-align: left;
  position: absolute;
  top: 40px;
  right: 10px;
  overflow: hidden;
}

.border-left-bar {
  border-left-color: #d94efc;
  border-left-width: 5px;
  border-left-style: solid;
  padding-left: 10px;
}

.overflow-auto {
  overflow: auto;
}

.display-flex {
  display: flex;
}

.flex-centered {
  display: flex;
  align-items: center;
}

.vertical-align {
  vertical-align: middle;
}

.topic-caption::before {
  position: absolute;
  content: "";
  width: 4.5px;
  height: 50 px;
  left: 0;
  background-color: #5142fc;
  top: 6px;
}

.justify-content-start {
  justify-content: start;
}

.justify-content-end {
  justify-content: flex-end;
}

.topic-caption {
  display: flex;
  justify-content: flex-end;
}

.nw {
  /* white-space: nowrap; */
  word-break: keep-all;
  overflow: hidden;
}

.topic-title {
  line-height: 26px;
  margin-bottom: 2px;
  font-weight: 700;
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

.width-100 {
  width: 100%;
}

.white {
  position: relative;
  top: 2px;
  color: #ffffff !important;
}
.white:hover {
  color: #f557c5 !important;
}
</style>
