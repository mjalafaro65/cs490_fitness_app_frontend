import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

// const api = axios.create({
//   baseURL: "https://nmzn3h98-5000.use.devtunnels.ms/" ,
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;