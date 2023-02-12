export const getGoogleUrl = () => {
  const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount`;

  const options = {
    redirect_uri: process.env.VUE_APP_GOOGLE_OAUTH_CALLBACK_URL,
    client_id: process.env.VUE_APP_GOOGLE_OAUTH_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};
