import type { Options } from "ky";

/**
 * Options for configuring the API client.
 *
 * Extends the underlying {@link Options} from `ky` with additional
 * client-specific settings, such as controlling whether authentication
 * headers should be sent for a given request.
 */
export interface ApiClientOptions extends Options {
  /**
   * When `true`, the API client must not attach authentication headers
   * (such as bearer tokens or session identifiers) to this request.
   *
   * This is primarily intended for endpoints that are called before a user
   * is authenticated or where credentials must not be sent, such as
   * registration, login, password reset, or public/health-check endpoints.
   */
  skipAuth?: boolean;
}
