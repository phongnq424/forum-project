import { get } from "http";

const tokenHelper = {
  saveToken(token: string) {
    sessionStorage.setItem("token", token);
  },

  getToken(): string | null {
    return sessionStorage.getItem("token");
  },

  removeToken() {
    sessionStorage.removeItem("token");
  },
};

export default tokenHelper;
