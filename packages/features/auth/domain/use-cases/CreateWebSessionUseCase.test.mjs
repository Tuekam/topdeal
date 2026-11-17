import assert from "node:assert/strict";
import { test } from "node:test";
import { CreateWebSessionUseCase } from "./CreateWebSessionUseCase.ts";
import { AUTH_SESSION_MAX_AGE_MS } from "../sessionPolicy.ts";

function createFixture({ identity, account } = {}) {
  const calls = {
    verifiedToken: null,
    accountLookup: null,
    sessionCookie: null,
  };

  const identityProvider = {
    async verifyIdentityToken(identityToken) {
      calls.verifiedToken = identityToken;
      return identity ?? null;
    },
    async createSessionCookie(identityToken, expiresInMilliseconds) {
      calls.sessionCookie = { identityToken, expiresInMilliseconds };
      return "session-cookie";
    },
  };

  const userRepository = {
    async findByExternalIdentity(externalId) {
      calls.accountLookup = externalId;
      return account ?? null;
    },
  };

  return {
    useCase: new CreateWebSessionUseCase({ identityProvider, userRepository }),
    calls,
  };
}

const verifiedIdentity = {
  externalId: "firebase-user-id",
  email: "buyer@example.test",
  emailVerified: true,
};

const activeAccount = {
  status: "active",
  profileComplete: true,
};

test("rejects an invalid identity before looking up an account", async () => {
  const { useCase, calls } = createFixture();

  const result = await useCase.execute({ identityToken: "invalid-token" });

  assert.deepEqual(result, { status: "unauthenticated" });
  assert.equal(calls.verifiedToken, "invalid-token");
  assert.equal(calls.accountLookup, null);
  assert.equal(calls.sessionCookie, null);
});

test("rejects an unverified email before looking up an account", async () => {
  const { useCase, calls } = createFixture({
    identity: { ...verifiedIdentity, emailVerified: false },
  });

  const result = await useCase.execute({ identityToken: "identity-token" });

  assert.deepEqual(result, { status: "email_unverified" });
  assert.equal(calls.accountLookup, null);
  assert.equal(calls.sessionCookie, null);
});

test("requires an account with a complete profile", async () => {
  const { useCase: missingAccount } = createFixture({
    identity: verifiedIdentity,
  });
  const { useCase: incompleteProfile } = createFixture({
    identity: verifiedIdentity,
    account: { ...activeAccount, profileComplete: false },
  });

  assert.deepEqual(
    await missingAccount.execute({ identityToken: "identity-token" }),
    { status: "registration_required" },
  );
  assert.deepEqual(
    await incompleteProfile.execute({ identityToken: "identity-token" }),
    { status: "profile_required" },
  );
});

test("rejects a suspended account without creating a session", async () => {
  const { useCase, calls } = createFixture({
    identity: verifiedIdentity,
    account: { ...activeAccount, status: "suspended" },
  });

  const result = await useCase.execute({ identityToken: "identity-token" });

  assert.deepEqual(result, { status: "account_unavailable" });
  assert.equal(calls.accountLookup, verifiedIdentity.externalId);
  assert.equal(calls.sessionCookie, null);
});

test("creates a session only for a verified identity and active account", async () => {
  const { useCase, calls } = createFixture({
    identity: verifiedIdentity,
    account: activeAccount,
  });

  const result = await useCase.execute({ identityToken: "identity-token" });

  assert.deepEqual(result, {
    status: "authenticated",
    sessionCookie: "session-cookie",
  });
  assert.deepEqual(calls.sessionCookie, {
    identityToken: "identity-token",
    expiresInMilliseconds: AUTH_SESSION_MAX_AGE_MS,
  });
});
