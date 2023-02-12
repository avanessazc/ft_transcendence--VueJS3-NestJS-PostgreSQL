export type Achievement = {
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

export type AchievementData = {
  achievements: Array<Achievement>;
};
