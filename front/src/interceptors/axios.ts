import axios from "axios";
axios.defaults.baseURL = "http://localhost:3000/";

let refresh = false;

axios.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    try {
      const originalRequest = error.config;
      if (!refresh && error.response && error.response.status === 401) {
        refresh = true;
        const response = await axios.post(
          "local/auth/refresh",
          {},
          { withCredentials: true }
        );
        if (response && response.status === 200) {
          return axios.request(originalRequest);
        }
      }
      refresh = false;
      return error;
    } catch (e) {
      return Promise.reject(e);
    }
  }
);
