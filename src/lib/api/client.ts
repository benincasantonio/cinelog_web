import ky from "ky";
import { beforeRequestInterceptor } from "./interceptors";

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  retry: 2,
  hooks: {
    beforeRequest: [beforeRequestInterceptor],
  },
});
