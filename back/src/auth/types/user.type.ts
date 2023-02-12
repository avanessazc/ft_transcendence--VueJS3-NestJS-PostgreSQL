export type User = {
  id?: string;
  email?: string;
  nickname?: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  hash?: string;
  two_factor_auth_secret?: string;
  two_factor_enabled?: boolean;
};

export type GoogleUser = {
  id: string;
  email: string;
  nickname: string;
  firstName: string;
  lastName: string;
  picture: string;
  password?: string;
};

export type MarvinUser = {
  id: string;
  email: string;
  nickname: string;
  first_name: string;
  last_name: string;
  image: {
    link: string;
  };
  password?: string;
};
