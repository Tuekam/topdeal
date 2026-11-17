const DEVELOPMENT_ORIGIN = "http://localhost:3000";

export function getAuthAppOrigin(): string {
  const configuredOrigin =
    process.env.AUTH_APP_ORIGIN ??
    (process.env.NODE_ENV === "development" ? DEVELOPMENT_ORIGIN : undefined);

  if (!configuredOrigin) {
    throw new Error("AUTH_APP_ORIGIN must be configured.");
  }

  const parsedOrigin = new URL(configuredOrigin);

  if (parsedOrigin.origin !== configuredOrigin) {
    throw new Error("AUTH_APP_ORIGIN must contain only an origin.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsedOrigin.protocol !== "https:"
  ) {
    throw new Error("AUTH_APP_ORIGIN must use HTTPS in production.");
  }

  return parsedOrigin.origin;
}

export function isAllowedAuthMutation(
  request: Request,
  expectedOrigin: string,
): boolean {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  return (
    request.method === "POST" &&
    request.headers.get("origin") === expectedOrigin &&
    request.headers.get("sec-fetch-site") === "same-origin" &&
    request.headers.get("x-topdeal-request") === "1" &&
    contentType === "application/json"
  );
}
