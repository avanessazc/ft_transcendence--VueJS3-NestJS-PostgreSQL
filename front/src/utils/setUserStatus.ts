import axios from "axios";

export const setUserStatus = async (
  user_id: string,
  user_status_code: number
) => {
  await axios.patch(
    "user/set-status/",
    { user_id: user_id, status_code: user_status_code },
    {
      withCredentials: true,
    }
  );
};
