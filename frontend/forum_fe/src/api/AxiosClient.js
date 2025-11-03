import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.BARE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `{token}`;
  }
  return config;
});

axiosClient.interceptors.request.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
