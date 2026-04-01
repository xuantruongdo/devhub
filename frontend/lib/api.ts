import axios from "axios";

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // gửi cookie refresh token
});

// Load access token từ localStorage khi app start
if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// Queue tránh vòng lặp refresh token
let isRefreshing = false;
let failedQueue: {
  resolve: (token?: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || undefined);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 → thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.accessToken;

        // Lưu token mới vào localStorage và cập nhật axios
        localStorage.setItem("accessToken", newAccessToken);
        instance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // refresh token hết hạn
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    let message = "An error occurred";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(message);
  },
);

export default instance;
