const MAX_AUTH_REQUEST_BODY_BYTES = 8_192;

export type JsonBodyResult =
  | { status: "valid"; value: unknown }
  | { status: "invalid" }
  | { status: "too_large" };

export async function readAuthJsonBody(request: Request): Promise<JsonBodyResult> {
  const reader = request.body?.getReader();
  if (!reader) return { status: "invalid" };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_AUTH_REQUEST_BODY_BYTES) {
      await reader.cancel();
      return { status: "too_large" };
    }
    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { status: "valid", value: JSON.parse(new TextDecoder().decode(bodyBytes)) };
  } catch (error) {
    if (error instanceof SyntaxError) return { status: "invalid" };
    throw error;
  }
}

export function isBoundedString(value: unknown, maximumLength = MAX_AUTH_REQUEST_BODY_BYTES): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength;
}
