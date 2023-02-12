<template>
  <div class="users-box">
    <div class="users-text">Users</div>
    <div class="users-list">
      <div
        v-for="(user, index) in user_list"
        :key="index"
        class="user-nickname"
      >
        <div>
          <div>
            <a
              v-if="
                user_list[index].who_invites == null ||
                (user_list[index].who_invites == 1 &&
                  user_list[index].channel_id != chan_id)
              "
              class="white"
            >
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-envelope"></i>
                <span class="tooltiptext">Send invitation</span>
              </div>
            </a>
            <a
              v-else-if="
                user_list[index].who_invites == 1 &&
                user_list[index].channel_id == chan_id
              "
              class="white"
            >
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-paper-plane"></i>
                <span class="tooltiptext">Invitation has been sent</span>
              </div>
            </a>
            <a v-else-if="user_list[index].who_invites == 2" class="white">
              <div class="icon is-medium is-left tooltip">
                <i class="fas fa-envelope-square"></i>
                <span class="tooltiptext">You have an invitation</span>
              </div>
            </a>
            <b
              ><a
                v-if="
                  user_list[index].who_invites == null ||
                  (user_list[index].who_invites == 1 &&
                    user_list[index].channel_id != chan_id)
                "
                @click="send_invitation(user_list[index].id)"
                class="white"
                >{{ user_list[index].nickname }}</a
              >
              <a v-else class="white-no-hover">{{
                user_list[index].nickname
              }}</a></b
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { defineProps, watchEffect } from "vue";
import { ref } from "vue";
import { socket } from "../services/socketio.service";
import axios from "axios";
import { useUserStore } from "../store/user";

const props = defineProps<{
  ChannelName: string;
}>();

const chan_id = ref();
const userStore = useUserStore();
const user_list = ref();

const send_invitation = async function (user_id: string) {
  await axios.post(
    "private-channel-invitation/create",
    {
      from_id: userStore.user.id,
      to_id: user_id,
      status: 1,
      channel_id: chan_id.value,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  socket.emit("updateUsersToInviteToPC", {});
  socket.emit("updatePrivateChannelInvitationList", {});
  await userStore.update_achievements(userStore.user.id, 5);
  socket.emit("updateAchievements", {});
};

const get_user_list_to_invite = async function (
  user_id: string,
  channel_id: string
) {
  {
    try {
      const res = await axios.get(
        "private-channel-invitation/users/" + user_id + "/" + channel_id,
        {
          withCredentials: true,
        }
      );
      if (res && res.data) {
        const tmp = res.data;
        user_list.value = tmp;
      }
    } catch (err) {
      console.log("private-channel-invitation/users/");
    }
  }
};
watchEffect(async () => {
  try {
    const response = await axios.get(
      "/messages/get-chan-id/" + props.ChannelName,
      {
        withCredentials: true,
      }
    );
    if (response && response.data) {
      chan_id.value = response.data;
      user_list.value = get_user_list_to_invite(
        userStore.user.id,
        chan_id.value
      );
    }
  } catch (err) {
    console.log("/messages/get-chan-id/");
  }
});

socket.on("update-private-channel-invitation-list", async () => {
  try {
    const response = await axios.get(
      "/messages/get-chan-id/" + props.ChannelName,
      {
        withCredentials: true,
      }
    );
    if (response && response.data) {
      chan_id.value = response.data;
      user_list.value = get_user_list_to_invite(
        userStore.user.id,
        chan_id.value
      );
    }
  } catch (err) {
    console.log("update-private-channel-invitation-list");
  }
});
</script>

<style scoped>
@import "../css/mystyles.css";

.users-box {
  border-radius: 15px;
  color: #ffffff;
  background-color: rgba(255, 178, 176, 0.2);
  height: 33%;
  margin: 0.5rem;
}

.users-text {
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

.user-nickname {
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

.users-list {
  height: 73%;
  flex-grow: 0;
  overflow-y: scroll;
}
.users-list::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.users-list::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}

.white {
  position: relative;
  top: 2px;
  color: #ffffff !important;
}
.white-no-hover {
  position: relative;
  top: 2px;
  color: #ffffff !important;
}
.white:hover {
  color: #f557c5 !important;
}

.margin5 {
  margin-left: 15px;
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

.pong-inv {
  width: 25px;
  height: 25px;
  color: #e0e0e0;
}
</style>
