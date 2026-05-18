import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:5000",
// });

const api = axios.create({
  baseURL: "https://cs490-fitness-app-backend-i1ads2w75-mjalafaro65s-projects.vercel.app" ,
});

// const api = axios.create({
//   baseURL: "https://cs490-fitness-app-backend.onrender.com/" ,
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;