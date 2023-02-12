<template>
  <div>
    <div class="achievement">
      <div class="achievement-description">
        <div class="achievement-title">
          {{ Title }}
        </div>
        <div class="descrip">
          {{ Description }}
        </div>
      </div>
      <div class="pos-right">
        {{ User_score }} /
        {{ Minimum_score }}
      </div>
    </div>

    <progress
      class="progress is-danger is-small is-blue"
      :value="User_score"
      :max="Minimum_score"
    ></progress>
  </div>
</template>

<script>
import "../assets/ts/bulmats.ts";
export default {
  name: "AchievementBar",
  props: ["Description", "Title", "User_score", "Minimum_score"],
};
</script>

<style scoped>
@import "../css/mystyles.css";

.achievement-title {
  font-size: large;
  font-weight: bold;
  margin-top: 10px;
}
.descrip {
  margin-bottom: 6px;
}

.achievement {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.achievement-description {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
