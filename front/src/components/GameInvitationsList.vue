<template>
  <div :class="show_scroll_bar()">
    <table class="table row-spacing transparent-bg-color table-center">
      <tbody>
        <tr v-for="(match, index) in pending_matches" :key="index">
          <td class="cell">
            <div>{{ match.id.substr(0, 3) }}</div>
          </td>
          <td>
            <div class="">
              <img
                :src="`${match.from_player_avatar}`"
                :alt="`${match.from_player_avatar}`"
                class="rounded-avatar-inv"
              />
            </div>
          </td>
          <td class="cell">
            <div>{{ match.from_player_nickname }}</div>
          </td>
          <td class="cell">
            <div>{{ match.score_from_player }}</div>
          </td>
          <td class="cell"><div>VS</div></td>
          <td class="cell">
            <div>{{ match.to_player_nickname }}</div>
          </td>
          <td class="cell">
            <div>{{ match.score_to_player }}</div>
          </td>
          <td>
            <div class="">
              <img
                :src="`${match.to_player_avatar}`"
                :alt="`${match.to_player_avatar}`"
                class="rounded-avatar-inv"
              />
            </div>
          </td>
          <td class="cell">
            <a @click="showMatch(match)">
              <div class="white">
                <span>{{ match.actions }}</span>
              </div>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, Ref, ref, defineEmits } from "vue";
import router from "../router";
import { socket } from "../services/socketio.service";
import { useUserStore } from "../store/user";
import { usePendingGamesStore } from "../store/pendingGames";
import { setUserStatus } from "../utils/setUserStatus.ts";
import { Match } from "../types";

const userStore = useUserStore();
const pendingGamesStore = usePendingGamesStore();
const emits = defineEmits(["closeWindow"]);
const pending_matches: Ref<Match[]> = ref([] as Match[]);

onMounted(async () => {
  try {
    await pendingGamesStore.update(userStore.user.id);
    pending_matches.value = pendingGamesStore.pending_matches;
  } catch (err) {
    console.log("pendingGamesStore.update(userStore.user.id)");
  }
});

socket.on("update-pong-pending-games", async () => {
  try {
    await pendingGamesStore.update(userStore.user.id);
    pending_matches.value = pendingGamesStore.pending_matches;
  } catch (err) {
    console.log("update-pong-pending-games");
  }
});

const show_scroll_bar = function () {
  if (pending_matches.value.length > 5) {
    return "pending-games";
  } else {
    return "";
  }
};

const showMatch = async (match: Match) => {
  emits("closeWindow", true);
  if (match.actions == "Go") {
    await setUserStatus(userStore.user.id, 2);
    socket.emit("updateUsers", {});
    socket.emit("updateFriends", {});
  }
  router.push({
    name: "pong",
    params: { match_id: match.id },
  });
};
</script>

<style scoped>
@import "../css/mystyles.css";

td {
  text-align: center;
}

.rounded-avatar-inv {
  border-radius: 20px;
  width: 40px;
  height: 40px;
  max-height: 40px !important;
}

.table-center,
th {
  text-align: center !important;
  margin-right: auto;
  margin-left: auto;
  color: #ffffff !important;
}

.row-spacing {
  border-collapse: separate !important;
  border-spacing: 0 15px !important;
}

.transparent-bg-color {
  background-color: transparent;
}
.cell {
  display: table-cell !important;
  vertical-align: middle !important;
}

table,
tr,
td,
tbody,
th {
  border-color: transparent !important;
}
.pending-games {
  display: inline-block;
  height: 450px !important;
  flex-grow: 0;
  overflow-y: scroll;
}
.pending-games::-webkit-scrollbar {
  scrollbar-color: #6969dd #e0e0e0;
  scrollbar-width: thin;
  background-color: #e4e4e4;
  border-radius: 100px;
}

.pending-games::-webkit-scrollbar-thumb {
  background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%);
  box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  border-radius: 100px;
}

.white {
  position: relative;
  top: 2px;
  /* font-size: 1rem; */
  color: #ffffff !important;
}
.white:hover {
  color: #f557c5 !important;
}
</style>
