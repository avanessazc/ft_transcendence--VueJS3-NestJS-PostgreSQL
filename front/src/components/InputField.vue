<template>
  <div>
    <p class="control has-icons-left">
      <input
        :class="Class"
        :type="Type"
        :placeholder="Placeholder"
        :Autocomplete="Autocomplete"
        :value="Value"
        @input="$emit('update:modelValue', $event.target.value)"
        @change="$emit('deleteErrorMessages', $event.target.value)"
        :disabled="disabled"
      />
      <span class="icon is-small is-left">
        <i :class="IconClass"></i>
      </span>
    </p>
  </div>
</template>

<script>
import "../assets/ts/bulmats.ts";
export default {
  name: "InputField",
  props: [
    "Type",
    "Placeholder",
    "IconClass",
    "Value",
    "Class",
    "disabled",
    "Autocomplete",
  ],
};
</script>

<style scoped>
@import "../css/mystyles.css";

.transparent-bg-color {
  background-color: transparent;
}

.white-input-color {
  color: #ffffff;
}

.margin-bottom-data {
  margin-bottom: 30px;
}
</style>
