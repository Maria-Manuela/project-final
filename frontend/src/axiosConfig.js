import axios from "axios";

export const API_ORIGIN = "https://project-final-rmn2.onrender.com";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Hits Render so a sleeping free instance can start before login/signup. */
export const wakeApi = () => {
  fetch(API_ORIGIN, { method: "GET", mode: "cors" }).catch(() => {});
};

export default api;
