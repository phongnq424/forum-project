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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    const statusCode = error.response?.status || "";
    const responseURL = error.request?.responseURL;
    const loginUrl =
      import.meta.env.BARE_URL || "http://localhost:3000/api" + "/auth/login";
    if (statusCode === 401 && responseURL != loginUrl) {
      console.log("Let log in!");
    }

    return Promise.reject(error.response || error);
  }
);

export default axiosClient;

/*
axiosError {
  ...
  ...
  status,
  
  response {
    status: 4xx, 5xx,
    data { message from server, ....}
  },

  request {
    responseURL: endpoint API 
  }

}

*/
