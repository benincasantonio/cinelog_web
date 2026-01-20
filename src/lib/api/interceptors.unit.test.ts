import {
  beforeRequestInterceptor,
  afterResponseInterceptor,
} from "./interceptors";
import { describe, expect, it, vi } from "vitest";
import { KyRequest } from "ky";
import { ApiClientOptions } from "./../models/api-client-options";

vi.mock("../firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
    },
  },
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

describe("interceptors", () => {
  describe("Before Request Interceptor", () => {
    it("should add authentication headers to requests", async () => {
      const options: ApiClientOptions = {
        skipAuth: false,
      };
      const request = {
        headers: new Headers(),
      } as KyRequest;

      await beforeRequestInterceptor(request, options);
      expect(request.headers.get("Authorization")).toBe("Bearer mock-token");
    });

    it("should not add authentication headers if skipAuth is true", async () => {
      const options: ApiClientOptions = {
        skipAuth: true,
      };
      const request = {
        headers: new Headers(),
      } as KyRequest;

      await beforeRequestInterceptor(request, options);
      expect(request.headers.get("Authorization")).toBeNull();
    });
  });

  describe("After Response Interceptor", () => {
    it("should redirect to login page if unauthorized", async () => {
      const options: ApiClientOptions = {
        skipAuth: false,
      };
      const request = {} as Request;
      const response = {
        status: 401,
      } as Response;

      // Mock window.location.href to track the redirect
      let redirectUrl = "";
      Object.defineProperty(window, "location", {
        value: {
          get href() {
            return redirectUrl;
          },
          set href(url: string) {
            redirectUrl = url;
          },
        },
        writable: true,
      });

      await expect(
        afterResponseInterceptor(request, options, response),
      ).rejects.toThrow("Unauthorized");

      expect(redirectUrl).toBe("/login");
    });
  });
});
