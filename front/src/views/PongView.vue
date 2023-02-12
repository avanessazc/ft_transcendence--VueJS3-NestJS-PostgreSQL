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
        <!-- CANVAS -->
        <div
          id="game"
          v-if="match != undefined && match.game_over == false"
          :class="match.start_game == true ? '' : 'zero-opacity'"
          :width="width"
          :height="height"
        >
          <canvas id="pong"></canvas>
        </div>
        <!-- WINNER -->
        <div
          v-if="match != undefined && match.game_over == true"
          class="winner"
        >
          <figure class="image is-128x128 has-text-centered">
            <img
              v-if="match.score.from_score > match.score.to_score"
              :src="match.players.fromPlayer.avatar"
              :alt="match.players.fromPlayer.avatar"
              class="rounded-avatar-player"
            />
            <img
              v-else
              :src="match.players.toPlayer.avatar"
              :alt="match.players.toPlayer.avatar"
              class="rounded-avatar-player"
            />
          </figure>
          <div
            v-if="match.score.from_score > match.score.to_score"
            class="white"
          >
            {{ match.players.fromPlayer.nickname }}
          </div>
          <div v-else class="white">
            {{ match.players.toPlayer.nickname }}
          </div>
        </div>
        <!-- VIEWERS -->
        <div class="viewers">
          <div v-for="(viewer, index) in match.viewers" :key="index">
            <figure
              v-if="viewer.nickname != null"
              class="image is-48x48 has-text-centered tooltip"
            >
              <img
                :src="viewer.avatar"
                :alt="viewer.avatar"
                class="rounded-avatar-viewer"
              /><span class="tooltiptext">{{ viewer.nickname }}</span>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, Ref, ref, defineProps, onUnmounted, watch } from "vue";
import { socket } from "../services/socketio.service";
import { useUserStore } from "../store/user";
import { Player, Viewer, Net, Ball, MatchInfo } from "../types";
import { useRouter } from "vue-router";
import { setUserStatus } from "../utils/setUserStatus.ts";
const router = useRouter();
const userStore = useUserStore();
const props = defineProps<{
  match_id?: string;
}>();

let change_img_flag = 0;
let font_size = 10;
let loop: number;
let canvas: Ref<HTMLCanvasElement> = ref({});
let context: CanvasRenderingContext2D;
const width: Ref<number> = ref(600);
const height: Ref<number> = ref(400);
const bgColor: Ref<string> = ref("rgba(212, 0, 255, 0.3)");
const barWidth: Ref<number> = ref(30);
const barHeight: Ref<number> = ref(100);
let blackhole_width = 50;
let blackhole_height = 50;

// Initializing structure to avoid undefined errors
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
  bgColor: bgColor.value,
  blackhole_frame: 0,
  blackhole_length: 0,
  blackhole_coords: { x: 0, y: 0 },
  nb_frames: 0,
  pause_goal: false,
});

// Monitoring match change
watch(
  () => props.match_id,
  async (currentValue: string, oldValue: string) => {
    socket.emit("leave-match-room", {
      match_id: oldValue,
      user_id: userStore.user.id,
    });
    socket.emit("join-match-room", { match_id: props.match_id });
    await find_match_users(props.match_id);
    if (match.value.pong_map == 1) {
      bgColor.value = "rgba(212, 0, 255, 0.3)";
    } else if (match.value.pong_map == 3) {
      bgColor.value = "#8f2885";
    }
    socket.emit("get-game-status", { match_id: props.match_id });
    // CHECKIN PROCESS FOR NEW COMERS ON THE PONG PAGE: ARE THEY VIEWERS OR PLAYERS?
    if (userStore.user.nickname == match.value.players.fromPlayer.nickname) {
      match.value.players.fromPlayer.in = true; // fromPlayer checks in
      match.value.players.fromPlayer.socket_id = socket.id;
      socket.emit("update-players-arrivals", {
        match_id: match.value.match_id,
        player_id: match.value.players.fromPlayer.player_id,
        playerIn: match.value.players.fromPlayer.in,
        socket_id: match.value.players.fromPlayer.socket_id,
      });
    }
    if (userStore.user.nickname == match.value.players.toPlayer.nickname) {
      match.value.players.toPlayer.in = true; // toPlayer checks in
      match.value.players.toPlayer.socket_id = socket.id;
      socket.emit("update-players-arrivals", {
        match_id: match.value.match_id,
        player_id: match.value.players.toPlayer.player_id,
        playerIn: match.value.players.toPlayer.in,
        socket_id: match.value.players.toPlayer.socket_id,
      });
    }
    if (
      userStore.user.nickname != match.value.players.fromPlayer.nickname &&
      userStore.user.nickname != match.value.players.toPlayer.nickname
    ) {
      const existing_viewer = match.value.viewers.find(
        (element: Viewer) => element.nickname == userStore.user.nickname
      );
      if (!existing_viewer) {
        const new_viewer: Viewer = {
          socket_id: socket.id,
          nickname: userStore.user.nickname,
          avatar: userStore.user.avatar,
          in: true,
        };
        socket.emit("update-viewers-arrivals", {
          match_id: props.match_id,
          new_viewer: new_viewer,
        });
      }
    }
    if (userStore.user.nickname == match.value.players.fromPlayer.nickname) {
      canvas.value.addEventListener("mousemove", getMousePosToPlayer);
    }
    if (userStore.user.nickname == match.value.players.toPlayer.nickname) {
      canvas.value.addEventListener("mousemove", getMousePosFromPlayer);
    }
  }
);

const find_match_users = async (match_id: string) => {
  try {
    const res = await axios.get("pong/match/" + match_id, {
      withCredentials: true,
    });
    if (res && res.data) {
      const tmp = res.data[0];
      if (tmp) {
        // Player from
        match.value.match_id = props.match_id;
        match.value.players.fromPlayer.player_id = tmp.from_player_id;
        match.value.players.fromPlayer.nickname = tmp.from_player_nickname;
        match.value.players.fromPlayer.avatar = tmp.from_player_avatar;
        if (match.value.players.fromPlayer.in != true)
          match.value.players.fromPlayer.in = false;
        match.value.players.fromPlayer.pos_x = 0;
        match.value.players.fromPlayer.pos_y =
          canvas.value.height / 2 - barHeight.value / 2;
        match.value.players.fromPlayer.w = barWidth.value;
        match.value.players.fromPlayer.h = barHeight.value;
        match.value.players.fromPlayer.color = "WHITE";
        // Player to
        match.value.players.toPlayer.player_id = tmp.to_player_id;
        match.value.players.toPlayer.nickname = tmp.to_player_nickname;
        match.value.players.toPlayer.avatar = tmp.to_player_avatar;
        match.value.players.toPlayer.in = false;
        match.value.players.toPlayer.pos_x =
          canvas.value.width - barWidth.value;
        match.value.players.toPlayer.pos_y =
          canvas.value.height / 2 - barHeight.value / 2;
        match.value.players.toPlayer.w = barWidth.value;
        match.value.players.toPlayer.h = barHeight.value;
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
        socket.emit("init-match-info-with-players-info", {
          init_match_info: match.value,
        });
      }
    }
  } catch (err) {
    console.log("find_match_users");
  }
};

// start game
watch(
  () => match.value.start_game,
  () => {
    if (match.value.start_game == true) {
      let framePerSecond = 30;
      loop = setInterval(game, 1000 / framePerSecond);
    }
  }
);

// re start game
watch(
  () => match.value.stop_game,
  () => {
    if (match.value.stop_game == true) {
      let img = new Image();
      img.src = "/img/square-pause.png";
      img.onload = function () {
        context.drawImage(
          img,
          width.value / 2 - 20,
          height.value / 2 - 20,
          40,
          40
        );
      };
      clearInterval(loop);
    } else if (match.value.stop_game == false) {
      let framePerSecond = 30;
      loop = setInterval(game, 1000 / framePerSecond);
    }
  }
);

// Game over
watch(
  () => match.value.game_over,
  () => {
    if (match.value.game_over == true) {
      clearInterval(loop);
    }
  }
);
let net: Ref<Net> = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  color: "",
});
let ball: Ref<Ball> = ref({
  x: 0,
  y: 0,
  radius: 0,
  speed: 0,
  velocityX: 0,
  velocityY: 0,
  color: "",
});

const create_net = () => {
  net.value.x = canvas.value.width / 2 - 2 / 2;
  net.value.y = 0;
  net.value.width = 2;
  net.value.height = 10;
  net.value.color = "WHITE";
};
const create_ball = () => {
  ball.value.x = canvas.value.width / 2;
  ball.value.y = canvas.value.height / 2;
  ball.value.radius = 10;
  ball.value.speed = 5;
  ball.value.velocityX = 5;
  ball.value.velocityY = 5;
  ball.value.color = "WHITE";
};

// listening to the mouse
const getMousePosFromPlayer = function (event: MouseEvent) {
  let rect = canvas.value.getBoundingClientRect();
  let tmp = document.getElementById("game") as HTMLCanvasElement;
  let pos = event.clientY - rect.top;
  pos = (pos / tmp.clientHeight) * canvas.value.height;
  if (pos > canvas.value.height - match.value.players.fromPlayer.h)
    pos = canvas.value.height - match.value.players.fromPlayer.h;
  match.value.players.fromPlayer.pos_y = pos;
};
const getMousePosToPlayer = function (event: MouseEvent) {
  let rect = canvas.value.getBoundingClientRect();
  let tmp = document.getElementById("game") as HTMLCanvasElement;
  let pos = event.clientY - rect.top;
  pos = (pos / tmp.clientHeight) * canvas.value.height;
  if (pos > canvas.value.height - match.value.players.toPlayer.h)
    pos = canvas.value.height - match.value.players.toPlayer.h;
  match.value.players.toPlayer.pos_y = pos;
};

const setup_match = async function () {
  canvas.value = document.getElementById("pong") as HTMLCanvasElement;
  context = canvas.value?.getContext("2d") as CanvasRenderingContext2D;
  canvas.value.width = width.value;
  canvas.value.height = height.value;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.save();
  socket.emit("join-match-room", { match_id: props.match_id });
  socket.on("download-updated-match-info", (data: MatchInfo) => {
    match.value = data;
    bgColor.value = match.value.bgColor;
  });
  socket.on("streaming-fromPlayer-position", (data: Player) => {
    match.value.players.fromPlayer = data;
  });
  socket.on("streaming-toPlayer-position", (data: Player) => {
    match.value.players.toPlayer = data;
  });
  socket.on(
    "streaming-match-ball",
    (data: Ball, score: { from_score: number; to_score: number }) => {
      ball.value = data;
      match.value.score.from_score = score.from_score;
      match.value.score.to_score = score.to_score;
    }
  );
  socket.on("game-over", async (data: boolean) => {
    match.value.game_over = data;
    setTimeout(() => {
      socket.emit("updatePongPendingGames", {});
      socket.emit("updateAchievements", {});
      if (
        userStore.user.nickname != match.value.players.fromPlayer.nickname &&
        userStore.user.nickname != match.value.players.toPlayer.nickname
      ) {
        router.push({
          name: "home",
        });
        clearInterval(loop);
      } else {
        router.push({
          name: "ranking",
        });
        clearInterval(loop);
      }
    }, 4000);
  });
  socket.on("declined-match-invitation", () => {
    router.push({
      name: "home",
    });
  });
  await find_match_users(props.match_id);
  if (
    userStore.user.nickname == match.value.players.fromPlayer.nickname ||
    userStore.user.nickname == match.value.players.toPlayer.nickname
  ) {
    await setUserStatus(userStore.user.id, 2);
    socket.emit("updateUsers", {});
    socket.emit("updateFriends", {});
  }
  if (match.value.pong_map == 1) {
    bgColor.value = "rgba(212, 0, 255, 0.3)";
  } else if (match.value.pong_map == 2) {
    bgColor.value = "#8f2885";
  }
  if (match.value.pong_map == 2) {
    socket.on("nbr-frames-updated", (data: number) => {
      match.value.nb_frames = data;
    });
    socket.on(
      "reset-blackhole",
      (data: {
        blackhole_frame: number;
        blackhole_length: number;
        blackhole_coords: { x: number; y: number };
      }) => {
        match.value.blackhole_frame = data.blackhole_frame;
        match.value.blackhole_length = data.blackhole_length;
        match.value.blackhole_coords = data.blackhole_coords;
      }
    );
  }
  socket.emit("get-game-status", { match_id: props.match_id });
  // CHECKIN PROCESS FOR NEW COMERS ON THE PONG PAGE: ARE THEY VIEWERS OR PLAYERS?
  if (userStore.user.nickname == match.value.players.fromPlayer.nickname) {
    match.value.players.fromPlayer.in = true; // fromPlayer checks in
    match.value.players.fromPlayer.socket_id = socket.id;
    socket.emit("update-players-arrivals", {
      match_id: match.value.match_id,
      player_id: match.value.players.fromPlayer.player_id,
      playerIn: match.value.players.fromPlayer.in,
      socket_id: match.value.players.fromPlayer.socket_id,
    });
  }
  if (userStore.user.nickname == match.value.players.toPlayer.nickname) {
    match.value.players.toPlayer.in = true; // toPlayer checks in
    match.value.players.toPlayer.socket_id = socket.id;
    socket.emit("update-players-arrivals", {
      match_id: match.value.match_id,
      player_id: match.value.players.toPlayer.player_id,
      playerIn: match.value.players.toPlayer.in,
      socket_id: match.value.players.toPlayer.socket_id,
    });
  }
  if (
    userStore.user.nickname != match.value.players.fromPlayer.nickname &&
    userStore.user.nickname != match.value.players.toPlayer.nickname
  ) {
    const existing_viewer = match.value.viewers.find(
      (element: Viewer) => element.nickname == userStore.user.nickname
    );
    if (!existing_viewer) {
      const new_viewer: Viewer = {
        socket_id: socket.id,
        nickname: userStore.user.nickname,
        avatar: userStore.user.avatar,
        in: true,
      };
      socket.emit("update-viewers-arrivals", {
        match_id: props.match_id,
        new_viewer: new_viewer,
      });
    }
  }
  if (userStore.user.nickname == match.value.players.fromPlayer.nickname) {
    canvas.value.addEventListener("mousemove", getMousePosFromPlayer);
  }
  if (userStore.user.nickname == match.value.players.toPlayer.nickname) {
    canvas.value.addEventListener("mousemove", getMousePosToPlayer);
  }
  socket.on("reset-ball", () => {
    resetBall();
    socket.emit("update-match-ball", {
      match_info: match.value,
      ball: ball.value,
    });
  });
  if (match.value.pong_map == 3) {
    socket.on("streaming-bgColor", (data: string) => {
      bgColor.value = data;
      match.value.bgColor = bgColor.value;
    });
  }
  create_net();
  create_ball();
};
onMounted(async () => {
  if (match.value.players.game_over == true) {
    router.push({
      name: "/",
    });
    return;
  }
  setup_match();
});

onUnmounted(async () => {
  socket.emit("leave-match-room", {
    match_id: props.match_id,
    user_id: userStore.user.id,
  });
  clearInterval(loop);
  if (match.value.game_over == true) {
    socket.emit("deleteMatchFromArray", { match_id: props.match_id });
    if (userStore.user.id === match.value.players.fromPlayer.player_id) {
      if (match.value.score.from_score > match.value.score.to_score) {
        await userStore.update_achievements(
          match.value.players.fromPlayer.player_id,
          3
        );
        await userStore.update_achievements(
          match.value.players.fromPlayer.player_id,
          7
        );
      } else if (match.value.score.from_score < match.value.score.to_score) {
        await userStore.update_achievements(
          match.value.players.toPlayer.player_id,
          3
        );
        await userStore.update_achievements(
          match.value.players.toPlayer.player_id,
          7
        );
      }
      socket.emit("updateAchievements", {});
    }
  }
  if (
    userStore.user.nickname == match.value.players.fromPlayer.nickname ||
    userStore.user.nickname == match.value.players.toPlayer.nickname
  ) {
    await setUserStatus(userStore.user.id, 1);
    socket.emit("updateUsers", {});
    socket.emit("updateFriends", {});
  }
});
// PONG FUNCTIONS
const drawRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) => {
  if (context) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }
};
const drawCircle = function (x: number, y: number, r: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
};
const drawNet = function () {
  for (let i = 0; i <= canvas.value.height; i += 15) {
    drawRect(
      net.value.x,
      net.value.y + i,
      net.value.width,
      net.value.height,
      net.value.color
    );
  }
};

const render = function () {
  if (context) {
    if (match.value.pong_map == 2) {
      if (
        match.value.pause_goal == false &&
        userStore.user.nickname == match.value.players.fromPlayer.nickname
      ) {
        match.value.nb_frames++;
        socket.emit("update-nbr-frames", {
          match_id: match.value.match_id,
          nb_frames: match.value.nb_frames,
        });
      }
      if (
        match.value.pause_goal == false &&
        match.value.nb_frames > match.value.blackhole_frame &&
        match.value.nb_frames <
          match.value.blackhole_frame + match.value.blackhole_length
      ) {
        if (change_img_flag == 0) {
          let bh_img0 = new Image();
          bh_img0.src = "/img/blackhole-0.png";
          bh_img0.onload = function () {
            context.drawImage(
              bh_img0,
              match.value.blackhole_coords.x,
              match.value.blackhole_coords.y,
              blackhole_width,
              blackhole_height
            );
          };
        } else if (change_img_flag == 1) {
          let bh_img1 = new Image();
          bh_img1.src = "/img/blackhole-1.png";
          bh_img1.onload = function () {
            context.drawImage(
              bh_img1,
              match.value.blackhole_coords.x,
              match.value.blackhole_coords.y,
              blackhole_width,
              blackhole_height
            );
          };
        } else if (change_img_flag == 2) {
          let bh_img2 = new Image();
          bh_img2.src = "/img/blackhole-2.png";
          bh_img2.onload = function () {
            context.drawImage(
              bh_img2,
              match.value.blackhole_coords.x,
              match.value.blackhole_coords.y,
              blackhole_width,
              blackhole_height
            );
          };
        } else if (change_img_flag == 3) {
          let bh_img3 = new Image();
          bh_img3.src = "/img/blackhole-3.png";
          bh_img3.onload = function () {
            context.drawImage(
              bh_img3,
              match.value.blackhole_coords.x,
              match.value.blackhole_coords.y,
              blackhole_width,
              blackhole_height
            );
          };
        } else if (change_img_flag == 4) {
          let bh_img4 = new Image();
          bh_img4.src = "/img/blackhole-4.png";
          bh_img4.onload = function () {
            context.drawImage(
              bh_img4,
              match.value.blackhole_coords.x,
              match.value.blackhole_coords.y,
              blackhole_width,
              blackhole_height
            );
          };
        }
        if (match.value.nb_frames % 6 == 0) change_img_flag++;
        if (change_img_flag >= 5) change_img_flag = 0;
      }
      if (
        match.value.pause_goal == false &&
        userStore.user.nickname == match.value.players.fromPlayer.nickname &&
        match.value.nb_frames >
          match.value.blackhole_frame + match.value.blackhole_length
      ) {
        match.value.nb_frames = 0;
        socket.emit("update-nbr-frames", {
          match_id: match.value.match_id,
          nb_frames: match.value.nb_frames,
        });
        socket.emit("resetBlackhole", { match_id: match.value.match_id });
      }
    }

    if (match.value.pause_goal == true && font_size <= 60) {
      context.fillStyle = "white";
      context.font = font_size + "pt Helvetica";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Goal", canvas.value.width / 2, canvas.value.height / 2);
      font_size++;
    }
    if (font_size > 60) {
      match.value.pause_goal = false;
      font_size = 10;
      socket.emit("updatePauseGoal", {
        match_id: match.value.match_id,
        pause_goal: match.value.pause_goal,
      });
    }

    drawRect(0, 0, width.value, height.value, bgColor.value);
    drawNet();
    // fromPlayer
    drawRect(
      match.value.players.fromPlayer.pos_x,
      match.value.players.fromPlayer.pos_y,
      match.value.players.fromPlayer.w,
      match.value.players.fromPlayer.h,
      match.value.players.fromPlayer.color
    );
    // toPlayer
    drawRect(
      match.value.players.toPlayer.pos_x,
      match.value.players.toPlayer.pos_y,
      match.value.players.toPlayer.w,
      match.value.players.toPlayer.h,
      match.value.players.toPlayer.color
    );
    // Ball
    if (match.value.pause_goal == false) {
      drawCircle(
        ball.value.x,
        ball.value.y,
        ball.value.radius,
        ball.value.color
      );
    }
  }
};

const collision = function (b: Ball, p: Player) {
  p.top = p.pos_y;
  p.bottom = p.pos_y + p.h;
  p.left = p.pos_x;
  p.right = p.pos_x + p.w;
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;
  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
};

const collision_blackhole = function (b: Ball) {
  let bh: { top: number; bottom: number; left: number; right: number } = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  bh.top = match.value.blackhole_coords.y;
  bh.bottom = match.value.blackhole_coords.y + blackhole_height;
  bh.left = match.value.blackhole_coords.x;
  bh.right = match.value.blackhole_coords.x + blackhole_width;
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;
  return (
    bh.left < b.right &&
    bh.top < b.bottom &&
    bh.right > b.left &&
    bh.bottom > b.top
  );
};

const resetBall = function () {
  if (match.value.pong_map == 2) {
    match.value.nb_frames = 0;
    socket.emit("update-nbr-frames", {
      match_id: match.value.match_id,
      nb_frames: match.value.nb_frames,
    });
  }
  ball.value.x = canvas.value.width / 2;
  ball.value.y = canvas.value.height / 2;
  ball.value.speed = 5;
};

let breathing_space = ball.value.radius + 20;

const randomResetBall = function () {
  match.value.nb_frames = 0;
  socket.emit("update-nbr-frames", {
    match_id: match.value.match_id,
    nb_frames: match.value.nb_frames,
  });
  ball.value.y = Math.random() * (canvas.value.height - breathing_space);
  ball.value.speed = ball.value.speed * 1.2;
  if (ball.value.velocityX > 0) {
    ball.value.x = Math.max(
      Math.max(
        Math.random() * (canvas.value.width - barWidth.value - breathing_space),
        canvas.value.width / 2 + 1
      ),
      match.value.blackhole_coords.x + blackhole_width
    );
  } else {
    ball.value.x = Math.max(
      Math.min(
        Math.random() * (canvas.value.width / 2),
        match.value.blackhole_coords.x
      ),
      barWidth.value + breathing_space
    );
  }
};

const update = function () {
  if (
    match.value.pause_goal == false &&
    userStore.user.nickname == match.value.players.fromPlayer.nickname
  ) {
    ball.value.x += ball.value.velocityX;
    ball.value.y += ball.value.velocityY;
    if (
      match.value.pong_map == 2 &&
      match.value.nb_frames > match.value.blackhole_frame &&
      match.value.nb_frames <
        match.value.blackhole_frame + match.value.blackhole_length
    ) {
      if (
        match.value.pause_goal == false &&
        match.value.nb_frames > match.value.blackhole_frame &&
        match.value.nb_frames <
          match.value.blackhole_frame + match.value.blackhole_length &&
        collision_blackhole(ball.value)
      ) {
        randomResetBall();
        if (
          userStore.user.nickname == match.value.players.fromPlayer.nickname
        ) {
          socket.emit("update-match-ball", {
            match_info: match.value,
            ball: ball.value,
          });
        }
        return;
      }
    }
    // Ball collides with bottom and top walls
    if (
      ball.value.y + ball.value.radius > canvas.value.height ||
      ball.value.y - ball.value.radius < 0
    ) {
      if (ball.value.y + ball.value.radius > canvas.value.height)
        ball.value.y = canvas.value.height - ball.value.radius;
      else if (ball.value.y - ball.value.radius < 0)
        ball.value.y = ball.value.radius;
      ball.value.velocityY = -ball.value.velocityY;
    }
    // paddle hit
    let player: Player =
      ball.value.x < canvas.value.width / 2
        ? match.value.players.fromPlayer
        : match.value.players.toPlayer;
    if (match.value.pause_goal == false && collision(ball.value, player)) {
      let collidePoint = ball.value.y - (player.pos_y + player.h / 2);
      collidePoint = collidePoint / (player.h / 2); // Normalization
      let angleRad = collidePoint * (Math.PI / 4);
      let direction = ball.value.x < canvas.value.width / 2 ? 1 : -1;
      ball.value.velocityX = direction * ball.value.speed * Math.cos(angleRad);
      ball.value.velocityY = ball.value.speed * Math.sin(angleRad);
      ball.value.speed += 0.4;
      if (
        userStore.user.nickname == match.value.players.fromPlayer.nickname &&
        match.value.pong_map == 3
      ) {
        bgColor.value = "#" + Math.floor(Math.random() * 16777215).toString(16);
        socket.emit("update-bgColor", {
          match_info: match.value,
          bgColor: bgColor.value,
        });
      }
    }
  }

  socket.emit("update-fromPlayer-position", {
    match_info: match.value,
    fromPlayer: match.value.players.fromPlayer,
  });
  socket.emit("update-toPlayer-position", {
    match_info: match.value,
    toPlayer: match.value.players.toPlayer,
  });
  if (
    match.value.pause_goal == false &&
    userStore.user.nickname == match.value.players.fromPlayer.nickname
  ) {
    socket.emit("update-match-ball", {
      match_info: match.value,
      ball: ball.value,
    });
  }
};

const game = function () {
  if (match.value.stop_game == false && match.value.game_over == false) {
    create_net();
    update();
    render();
  }
};
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
