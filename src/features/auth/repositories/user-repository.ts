import { apiClient } from "@/lib/api/client";
import { auth } from "@/lib/firebase";
import type { UserResponse } from "../models/user-response";

export const getUserInfo = async (): Promise<UserResponse> => {
  const token = await auth.currentUser?.getIdToken();
  return await apiClient
    .get("v1/users/info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .json();
};
