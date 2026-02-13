import axios from "axios";
import { API_BASE } from "./env.js";
import { getAuth } from "firebase/auth";

export const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
