import { signOut } from "firebase/auth";
import { type KyRequest } from "ky";
import type { ApiClientOptions } from "@/lib/models/api-client-options";
import { auth } from "../firebase";

export const beforeRequestInterceptor = async (
  request: KyRequest,
  options: ApiClientOptions,
) => {
  if (options.skipAuth) return;

  const user = auth.currentUser;
  if (!user) return;

  const token = await user.getIdToken();

  request.headers.set("Authorization", `Bearer ${token}`);
};

export const afterResponseInterceptor = async (
  _request: Request,
  options: ApiClientOptions,
  response: Response,
) => {
  if (response.status === 401 && !options.skipAuth) {
    await signOut(auth);
    window.location.href = "/login";
  }
};
