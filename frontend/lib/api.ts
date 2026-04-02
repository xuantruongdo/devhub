import axios, { AxiosError, AxiosRequestConfig } from "axios";

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // gửi cookie (refresh token nằm trong httpOnly cookie)
});

/**
 * ===============================
 * TYPES
 * ===============================
 */
type FailedQueueItem = {
  resolve: (token?: string) => void;
  reject: (err: any) => void;
};

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean; // flag tránh loop vô hạn
}

/**
 * ===============================
 * REFRESH CONTROL (ANTI RACE CONDITION)
 * ===============================
 */
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

/**
 * Xử lý queue:
 * - Nếu refresh thành công → resolve tất cả request đang chờ
 * - Nếu fail → reject toàn bộ
 */
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

/**
 * ===============================
 * REQUEST INTERCEPTOR
 * ===============================
 * - Gắn accessToken vào header mỗi request
 */
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * ===============================
 * RESPONSE INTERCEPTOR
 * ===============================
 * FLOW:
 * 1. Request fail với 401 (accessToken hết hạn)
 * 2. Nếu chưa retry → gọi API refresh
 * 3. Nếu đang refresh → đẩy request vào queue
 * 4. Nếu refresh thành công:
 *    - lưu accessToken mới
 *    - retry request cũ
 *    - resolve queue
 * 5. Nếu refresh fail:
 *    - clear token
 *    - reject toàn bộ queue
 */
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    /**
     * ===============================
     * HANDLE 401 (UNAUTHORIZED)
     * ===============================
     */
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      /**
       * Nếu đang refresh → đưa request vào queue
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(instance(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        /**
         * ===============================
         * CALL REFRESH TOKEN API
         * ===============================
         * - refreshToken nằm trong httpOnly cookie
         * - không cần gửi body
         */
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.accessToken;

        /**
         * ===============================
         * SAVE NEW TOKEN
         * ===============================
         */
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        /**
         * Update default header cho các request sau
         */
        instance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;

        /**
         * Update request hiện tại
         */
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        /**
         * Resolve queue (retry các request bị pending)
         */
        processQueue(null, newAccessToken);

        /**
         * Retry request cũ
         */
        return instance(originalRequest);
      } catch (err) {
        /**
         * ===============================
         * REFRESH FAIL
         * ===============================
         */
        processQueue(err, null);

        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }

        /**
         * Có thể redirect logout tại đây nếu muốn:
         * window.location.href = "/login";
         */

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    /**
     * ===============================
     * HANDLE ERROR MESSAGE
     * ===============================
     */
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
