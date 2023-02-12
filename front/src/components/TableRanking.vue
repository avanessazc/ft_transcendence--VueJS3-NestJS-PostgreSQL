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
      <thead>
        <tr>
          <th v-for="(Header, index) in Headers" :key="index">
            {{ Header.text }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(Item, index) in Items" :key="index">
          <td v-for="(Header, indexColumn) in Headers" :key="indexColumn">
            <div class="cell" v-if="Header.value == 'pos'">
              {{ Item[Header.value] }}
            </div>
            <div class="cell" v-else-if="Header.value == 'avatar'">
              <img
                :src="`${Item[Header.value]}`"
                :alt="`${Item[Header.value]}`"
                class="rounded-avatar-Ranking"
              />
            </div>
            <div class="cell" v-else-if="Header.value == 'points'">
              {{ Item[Header.value] }}
            </div>
            <div class="cell" v-else-if="Header.value == 'actions'">
              <a @click="showProfile(Item)">
                <div class="tooltip">
                  <i class="far fa-eye"></i>
                  <span class="tooltiptext">View profile</span>
                </div>
              </a>
            </div>
            <div class="cell" v-else>
              {{ Item[Header.value] }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
import { onMounted, PropType, ref } from "vue";
import router from "../router";
import { Header, Item } from "../types";
export default {
  props: {
    Headers: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    Items: {
      type: Array as PropType<Item[]>,
      required: true,
    },
  },
  setup() {
    const search = ref();
    const showProfile = (Item: Item) => {
      router.push({
        name: "profile",
        params: { nickname: Item.nickname },
      });
    };
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
    return {
      search,
      showProfile,
    };
  },
};
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

.rounded-avatar-Ranking {
  border-radius: 20px;
  width: 100px;
  height: 100px;
}

table,
tr,
td,
tbody,
th {
  border-color: transparent !important;
}

.cell {
  line-height: 100px;
  height: 100px;
  /* background-color: gray; */
}

tbody > tr {
  background-color: rgba(186, 178, 176, 0.2);
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

.tooltip {
  position: relative;
  display: inline-block;
  /* border-bottom: 1px dotted black; */
}

.tooltip .tooltiptext {
  font-size: 11px;
  visibility: hidden;
  width: 80px;
  /* background-color: black; */
  background-color: rgba(186, 178, 176, 0.2);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  /* Position the tooltip */
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
