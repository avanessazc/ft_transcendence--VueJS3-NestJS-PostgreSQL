export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  two_factor_enabled: boolean;
  isTwoFactorAuthOK: boolean;
};
