import { using } from "@aiszlab/relax/react";
import { User } from "../typings/user";

interface AuthStore {
  me: User | null;
}

const useAuthStore = using<AuthStore>((setStore) => {
  const register = () => {};

  return {
    me: null,
  };
});
