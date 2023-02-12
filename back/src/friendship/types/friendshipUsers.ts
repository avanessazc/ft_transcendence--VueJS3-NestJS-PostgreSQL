export type FriendshipUser = {
  id?: string;
  nickname?: string;
  email?: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  status_id?: string;
  inv_status?: number;
  who_blocks?: number;
  who_invites?: number;
};

export type FriendshipInv = {
  id?: string;
  from_user_id?: string;
  to_user_id?: string;
  invitation_status_id?: number;
  who_blocks?: number;
  who_invites?: number;
};
