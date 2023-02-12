<template>
  <div>
    <div>
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        id="searchBox"
        v-model="search"
        placeholder="Search"
        class="search-btn"
      />
    </div>
    <table
      id="tableR"
      class="table row-spacing transparent-bg-color table-center"
    >
      <tbody>
        <tr v-for="(match, index) in matches" :key="index" :class="match.res">
          <td>
            <div class="cell">
              <img
                :src="`${match.from_player_avatar}`"
                :alt="`${match.from_player_avatar}`"
                class="rounded-avatar-matches"
              />
            </div>
          </td>
          <td>
            <div class="cell">
              {{ match.from_player_nickname }}
            </div>
          </td>
          <td>
            <div class="cell-result">
              <div v-if="match.res == 'VICTORY'">
                {{ match.res }} : {{ match.points }} points
              </div>
              <div v-else>{{ match.res }}</div>
              <div>
                {{ match.score_from_player }} - {{ match.score_to_player }}
              </div>
              <div class="hour-format">
                {{ dateFormat(match.start_date, "mmm d, yyyy HH:MM:s") }}
              </div>
            </div>
          </td>
          <td>
            <div class="cell">
              {{ match.to_player_nickname }}
            </div>
          </td>
          <td>
            <div class="cell">
              <img
                :src="`${match.to_player_avatar}`"
                :alt="`${match.to_player_avatar}`"
                class="rounded-avatar-matches"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, ref, watch, defineProps } from "vue";
import axios from "axios";
import dateFormat from "dateformat";
import { socket } from "../services/socketio.service";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const search = ref();
const matches = ref();
const get_matches_data = async () => {
  try {
    const res = await axios.get("pong/matches-history/" + props.userId, {
      withCredentials: true,
    });
    if (res && res.data) {
      matches.value = res.data;
    }
    return matches;
  } catch (err) {
    console.log("pong/matches-history/");
  }
};
watch(
  () => props.userId,
  () => {
    get_matches_data();
  }
);
onMounted(async () => {
  get_matches_data();
});
socket.on("update-profile", async () => {
  try {
    get_matches_data();
  } catch (err) {
    console.log("update-profile");
  }
});
onMounted(async () => {
  var searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("keyup", function () {
      var keyword = search.value;
      keyword = keyword.toUpperCase();
      var table_R = document.getElementById("tableR");
      if (table_R) {
        var all_tr = table_R.getElementsByTagName("tr");
        for (var i = 0; i < all_tr.length; i++) {
          var all_columns = all_tr[i].getElementsByTagName("td");
          for (var j = 0; j < all_columns.length; j++) {
            if (all_columns[j]) {
              var column_value =
                all_columns[j].innerText || all_columns[j].textContent;
              if (column_value) {
                column_value = column_value.toUpperCase();
                if (column_value.indexOf(keyword) > -1) {
                  all_tr[i].style.display = "";
                  break;
                } else {
                  all_tr[i].style.display = "none";
                }
              }
            }
          }
        }
      }
    });
  }
});
</script>

<style scoped>
@import "../css/mystyles.css";

.input-file {
  display: none;
}

.pos-left {
  position: relative;
  float: left;
  margin-bottom: 5px;
}

.pos-right {
  position: relative;
  float: right;
  margin-bottom: 5px;
}

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.resized-btn {
  width: 90%;
}

.profile-avatar-box {
  background-color: #4f4948;
  border-radius: 20px;
  color: #ffffff;
}

.profile-box {
  border-radius: 20px;
  color: #ffffff;
}
.margin-bottom-data {
  margin-bottom: 30px;
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

.table-center,
th {
  text-align: center !important;
  margin-right: auto;
  margin-left: auto;
  color: #ffffff !important;
}

table,
tr,
td,
tbody,
th {
  border-color: transparent !important;
}

.cell {
  line-height: 50px;
  height: 50px;
}
.cell-result {
  line-height: 20px;
  height: 20px;
}

tbody > tr {
  background-color: rgba(186, 178, 176, 0.2);
}

.VICTORY {
  background-color: rgba(156, 184, 170, 0.2);
}

.DEFEAT {
  background-color: rgba(187, 151, 141, 0.2);
}
.row-spacing {
  border-collapse: separate !important;
  border-spacing: 0 15px !important;
}

/* Set border-radius on the top-left and bottom-left of the first table data on the table row */
td:first-child,
th:first-child {
  border-radius: 20px 0 0 20px;
}

/* Set border-radius on the top-right and bottom-right of the last table data on the table row */
td:last-child,
th:last-child {
  border-radius: 0 20px 20px 0;
}

.search-btn {
  background-color: transparent;
  color: #ffffff;
  border: 2px solid rgba(186, 178, 176, 0.2);
  border-radius: 4px;
  width: 30rem;
  line-height: 22px;
}

.search-icon {
  color: #ffffff !important;
  padding-right: 5px;
}
.rounded-avatar-matches {
  border-radius: 20px;
  width: 50px;
  height: 50px;
}

.hour-format {
  font-size: x-small;
}
</style>
