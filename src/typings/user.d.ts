export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  membership?: {
    name: string;
    quota: number;
  };
  usedQuota?: number;
}
