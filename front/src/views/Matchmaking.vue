<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <h2 class="title is-2">Pong</h2>
      <div v-if="match.start_game == false">
        <i class="fas fa-hourglass fa-10x fa-spin white margin"></i>
      </div>
      <div v-if="match != undefined">
        <!-- SCORE -->
        <div v-if="match.start_game == true" class="score">
          {{ match.score.from_score }} - {{ match.score.to_score }}
        </div>
        <!-- PLAYERS -->
        <div
          v-if="match.players != undefined && match.game_over == false"
          class="player-avatars"
        >
          <div>
            <figure class="image is-96x96 has-text-centered">
              <img
                :src="match.players.fromPlayer.avatar"
                :alt="match.players.fromPlayer.avatar"
                class="rounded-avatar-player"
              />
            </figure>
            <div
              v-if="match.players.fromPlayer.nickname != 'Chief'"
              class="white"
            >
              {{ match.players.fromPlayer.nickname }}
            </div>
          </div>
          <div>
            <figure class="image is-96x96 has-text-centered">
              <img
                :src="match.players.toPlayer.avatar"
                :alt="match.players.toPlayer.avatar"
                class="rounded-avatar-player"
              />
            </figure>
            <div
              v-if="match.players.toPlayer.nickname != 'Chief'"
              class="white"
            >
              {{ match.players.toPlayer.nickname }}
            </div>
            <div
              v-if="match.players.toPlayer.nickname == 'Chief'"
              class="white"
            >
              Opponent?
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MatchMaking",
};
</script>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, ref, Ref } from "vue";
import axios from "axios";
import { socket } from "../services/socketio.service";
import { MatchInfo } from "../types";
import { useUserStore } from "../store/user";
import { useRouter } from "vue-router";
import { setUserStatus } from "../utils/setUserStatus.ts";
const router = useRouter();
const userStore = useUserStore();

// Initializing structure
let match: Ref<MatchInfo> = ref({
  match_id: "",
  players: {
    fromPlayer: {
      socket_id: "",
      player_id: "",
      nickname: "",
      avatar: "",
      in: false,
      pos_x: 0,
      pos_y: 0,
      w: 0,
      h: 0,
      color: "WHITE",
    },
    toPlayer: {
      socket_id: "",
      player_id: "",
      nickname: "",
      avatar: "",
      in: false,
      pos_x: 0,
      pos_y: 0,
      w: 0,
      h: 0,
      color: "WHITE",
    },
  },
  viewers: [],
  score: {
    from_score: 0,
    to_score: 0,
  },
  start_game: false,
  stop_game: false,
  game_over: false,
  pong_map: 1,
  bgColor: "",
  blackhole_frame: 0,
  blackhole_length: 0,
  blackhole_coords: { x: 0, y: 0 },
  nb_frames: 0,
  pause_goal: false,
});

const find_match_users = async (match_id: string) => {
  try {
    const res = await axios.get("pong/match/" + match_id, {
      withCredentials: true,
    });
    if (res && res.data) {
      const tmp = res.data[0];
      if (tmp) {
        // Player from
        match.value.match_id = match_id;
        match.value.players.fromPlayer.player_id = tmp.from_player_id;
        match.value.players.fromPlayer.nickname = tmp.from_player_nickname;
        match.value.players.fromPlayer.avatar = tmp.from_player_avatar;
        if (match.value.players.fromPlayer.in != true)
          match.value.players.fromPlayer.in = false;
        match.value.players.fromPlayer.pos_x = 0;
        match.value.players.fromPlayer.color = "WHITE";
        // Player to
        match.value.players.toPlayer.player_id = tmp.to_player_id;
        match.value.players.toPlayer.nickname = tmp.to_player_nickname;
        match.value.players.toPlayer.avatar = tmp.to_player_avatar;
        match.value.players.toPlayer.in = false;
        match.value.players.toPlayer.color = "WHITE";
        // viewers
        match.value.viewers = [];
        // score
        match.value.score.from_score = tmp.score_from_player;
        match.value.score.to_score = tmp.score_to_player;
        // controls
        match.value.start_game = false;
        match.value.stop_game = false;
        match.value.game_over = false;
        match.value.pong_map = tmp.pong_map;
      }
    }
  } catch (err) {
    console.log("find_match_users");
  }
};

const ask_matchmaking = async function (
  from_player_id: string,
  to_player_id: string,
  invitation_status_id: number,
  pong_map: number
) {
  const match = await axios.post(
    "pong/match/create",
    {
      id: "",
      from_player_id: from_player_id,
      to_player_id: to_player_id,
      invitation_status_id: invitation_status_id,
      pong_map: pong_map,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  if (match && match.data) {
    await find_match_users(match.data.id);
  }
};

onMounted(async () => {
  socket.on("join-opened-match", async (match_id: string) => {
    await find_match_users(match_id);
    if (match.value.players.fromPlayer.player_id == userStore.user.id) {
      await setUserStatus(userStore.user.id, 2);
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
      router.push({
        name: "pong",
        params: { match_id: match_id },
      });
    }
  });
  const chief = await axios.get("messages/get-chief", {
    withCredentials: true,
  });
  if (chief && chief.data) {
    const res = await axios.post(
      "pong/check-update-match",
      { userId: userStore.user.id, chiefId: chief.data },
      {
        withCredentials: true,
      }
    );
    if (res && res.data && res.data.to_player_id != chief.data) {
      const tmp = res.data;
      socket.emit("updatePongPendingGames", {});
      await find_match_users(res.data.id);
      await setUserStatus(userStore.user.id, 2);
      socket.emit("updateUsers", {});
      socket.emit("updateFriends", {});
      router.push({
        name: "pong",
        params: { match_id: res.data.id },
      });
      socket.emit("joinOpenedMatch", { match_id: res.data.id });
    } else if (!res.data) {
      ask_matchmaking(userStore.user.id, chief.data, 1, 1);
    } else {
      await find_match_users(res.data.id);
    }
  }
});
</script>

<style scoped>
@import "../css/mystyles.css";
#pong-box {
  width: 100%;
  height: auto;
}
#pong {
  background-color: rgba(212, 0, 255, 0.452);
  width: 100%;
  height: auto;
}

.score {
  color: white;
  margin: 0.8rem;
  font-size: 4rem;
}
.rounded-avatar-player {
  border-radius: 20px;
  padding: 0.5rem;
}
.rounded-avatar-viewer {
  border-radius: 20px;
}
.winner {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.viewers {
  width: 20rem;
  height: 7rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.zero-opacity {
  display: none !important;
}
.player-avatars {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1rem;
}
.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip .tooltiptext {
  font-size: 11px;
  visibility: hidden;
  width: 80px;
  background-color: rgba(139, 134, 133, 0.9);
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
.white {
  position: relative;
  top: 2px;
  color: #ffffff !important;
}
.white:hover {
  color: #f557c5 !important;
}
.margin {
  margin: 40px;
}
</style>
