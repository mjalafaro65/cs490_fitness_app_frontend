import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("REQUEST:", config.method.toUpperCase(), config.url);
    console.log("HEADERS:", config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("ERROR:", error.response?.status);

    if (error.response?.data?.msg === "Token has expired") {
      console.warn("Token expired");

      localStorage.removeItem("token");

      alert("Session expired. Please log in again.");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;