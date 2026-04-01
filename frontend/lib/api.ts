import axios from "axios";

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An error occurred";

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        window.location.href = "/login";
      }

      if (data && data.message) {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(message);
  }
);

export default instance;
