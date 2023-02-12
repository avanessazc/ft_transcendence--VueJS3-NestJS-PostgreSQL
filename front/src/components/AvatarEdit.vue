<template>
  <div>
    <div class="profile-avatar-box">
      <figure class="image is-256x256 has-text-centered margin-photo">
        <img
          v-if="imagePreviewURL !== undefined"
          :src="imagePreviewURL"
          :alt="avatarFileName"
        />
        <img
          v-if="avatarFileName !== undefined && imagePreviewURL === undefined"
          :src="`${avatarFileName}`"
          :alt="`${avatarFileName}`"
        />
        <img
          v-if="avatarFileName === undefined && imagePreviewURL === undefined"
          :src="`${AvatarFileName}`"
          :alt="AvatarFileName"
        />
      </figure>
      <div v-if="IsEditBtnOn == true">
        <button
          class="button is-primary is-outlined is-rounded rounded resized-btn margin-btn-photo"
        >
          <input
            type="file"
            name="file"
            id="file"
            class="inputfile resized-btn"
            @change="handleFileUpload($event)"
          />
          <label for="file" class="custom-file-upload"
            ><b>Upload New Photo</b></label
          >
        </button>
        <button
          @click="deleteAvatar"
          class="button is-primary is-outlined is-rounded rounded resized-btn margin-btn-photo"
        >
          <b>Delete</b>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import "../assets/ts/bulmats.ts";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "AvatarEdit",
  props: {
    IsEditBtnOn: {
      type: Boolean,
      required: true,
    },
    AvatarFileName: {
      type: String,
      required: true,
    },
  },
  emits: ["updateNewAvatar", "RemovedAvatar"],
  setup(props, { emit }) {
    const imagePreviewURL = ref();
    const file = ref();
    const avatarFileName = ref();
    const handleFileUpload = (e: Event) => {
      file.value = e.target as HTMLInputElement;
      emit("updateNewAvatar", file.value.files[0]);
      emit("RemovedAvatar", false);
      imagePreviewURL.value = URL.createObjectURL(file.value.files[0]);
    };

    const deleteAvatar = function () {
      avatarFileName.value = "http://localhost:3000/files/defaultAvatar.jpeg";
      file.value = undefined;
      emit("updateNewAvatar", file.value);
      emit("RemovedAvatar", true);
      imagePreviewURL.value = undefined;
    };
    return {
      imagePreviewURL,
      file,
      avatarFileName,
      handleFileUpload,
      deleteAvatar,
    };
  },
});
</script>

<style scoped>
@import "../css/mystyles.css";

.profile-avatar-box {
  background-color: #4f4948;
  border-radius: 20px;
  color: #ffffff;
}
.margin-btn-photo {
  margin-bottom: 12px;
}
.resized-btn {
  width: 90%;
}
</style>
