export interface User {
  username: string;
  nickname: string;
  avatar?: string;
  membership?: {
    name: string;
    quota: number;
  };
  usedQuota?: number;
}
