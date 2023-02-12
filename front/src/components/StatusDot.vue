<template>
  <div class="ring-container tooltip" v-if="props.status_id === 1">
    <div class="circle"></div>
    <span class="tooltiptext">Online</span>
  </div>
  <div class="ring-container tooltip" v-if="props.status_id === 0">
    <div class="red-circle"></div>
    <span class="tooltiptext">Offline</span>
  </div>
  <div class="ring-container tooltip" v-if="props.status_id === 2">
    <div class="pink-circle"></div>
    <span class="tooltiptext">Playing</span>
  </div>
</template>

<script lang="ts">
export default {
  name: "StatusDot",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{
  status_id: number;
}>();
</script>

<style scoped>
.ring-container {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.circle {
  width: 10px;
  height: 10px;
  background-color: #62bd19;
  border-radius: 50%;
  margin-left: 10px;
}

.red-circle {
  width: 10px;
  height: 10px;
  background-color: #ff0000;
  border-radius: 50%;
  margin-left: 10px;
}

.pink-circle {
  width: 10px;
  height: 10px;
  background-color: #ff63c8;
  border-radius: 50%;
  margin-left: 10px;
}

.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip .tooltiptext {
  font-size: 11px;
  visibility: hidden;
  width: 80px;
  background-color: rgba(139, 134, 133, 0.1);
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
