<template>
  <div class="hero-body bg-universe">
    <div class="container has-text-centered">
      <h2 class="title is-2">Ranking</h2>
      <TableRanking :Headers="headers" :Items="items" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TableRanking from "../components/TableRanking.vue";
import "../assets/ts/bulmats.ts";
import { onMounted, Ref, ref } from "vue";
import { Header, Item } from "../types";
import axios from "axios";

const headers: Header[] = [
  { text: "Pos", value: "pos" },
  { text: "Avatar", value: "avatar" },
  { text: "First Name", value: "firstname" },
  { text: "Last Name", value: "surname" },
  { text: "Nickname", value: "nickname" },
  { text: "Points", value: "points" },
  { text: "Actions", value: "actions" },
];

let items: Ref<Item[]> = ref([] as Item[]);

onMounted(async () => {
  try {
    const res = await axios.get("pong/ranking", { withCredentials: true });

    if (res && res.data) {
      items.value = res.data;
    }
    return items;
  } catch (err) {
    console.log("pong/ranking");
  }
});
</script>

<style>
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
</style>
