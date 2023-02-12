<template>
  <div>
    <button
      class="button is-primary is-outlined is-rounded rounded margin-btn-photo"
    >
      <i :class="iconClass"></i> &nbsp;&nbsp; {{ Name }}
    </button>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";

export default {
  name: "RoundedButton",

  props: {
    Name: {
      type: String,
      required: true,
    },
    iconClass: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
@import "../css/mystyles.css";

.margin-btn-photo {
  margin-bottom: 12px;
}
</style>
