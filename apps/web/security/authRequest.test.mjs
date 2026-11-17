import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedAuthMutation } from "./authRequest.ts";

const expectedOrigin = "https://topdeal.example";

function createRequest(overrides = {}) {
  return new Request(`${expectedOrigin}/api/auth/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: expectedOrigin,
      "sec-fetch-site": "same-origin",
      "x-topdeal-request": "1",
      ...overrides,
    },
  });
}

test("allows a same-origin JSON mutation with the required custom header", () => {
  assert.equal(isAllowedAuthMutation(createRequest(), expectedOrigin), true);
});

test("rejects cross-origin and cross-site mutations", () => {
  assert.equal(
    isAllowedAuthMutation(
      createRequest({ origin: "https://attacker.example" }),
      expectedOrigin,
    ),
    false,
  );
  assert.equal(
    isAllowedAuthMutation(
      createRequest({ "sec-fetch-site": "cross-site" }),
      expectedOrigin,
    ),
    false,
  );
});

test("rejects requests without the JSON content type or custom header", () => {
  assert.equal(
    isAllowedAuthMutation(
      createRequest({ "content-type": "text/plain" }),
      expectedOrigin,
    ),
    false,
  );
  assert.equal(
    isAllowedAuthMutation(
      createRequest({ "x-topdeal-request": undefined }),
      expectedOrigin,
    ),
    false,
  );
});
