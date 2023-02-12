export const getMarvinUrl = () => {
  const rootUrl = process.env.VUE_APP_MARVIN_OAUTH_ROOT;
  const options = {
    redirect_uri: process.env.VUE_APP_MARVIN_OAUTH_CALLBACK_URL,
    client_id: process.env.VUE_APP_MARVIN_CLIENT_ID,
    state: process.env.VUE_APP_MARVIN_OUR_API_STATE,
    response_type: "code",
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};
