export type Header = {
  text: string;
  value: keyof Item;
};

export type Item = {
  id?: string;
  email?: string;
  nickname?: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  hash?: string;
  rts?: string;
  two_factor_auth_secret?: string;
  two_factor_enabled?: string;
  points?: string;
  actions?: string;
  hash_confirm?: string;
  pos?: number;
};

export type AchievementData = {
  user_id?: string;
  achievement_id?: number;
  user_score?: number;
  unlocked?: boolean;
  achievement: {
    title?: string;
    description?: string;
    minimum_score?: number;
  };
};

export type UserChannels = {
  channel: {
    title: string;
  };
};
