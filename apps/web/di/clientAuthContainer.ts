"use client";

import { asClass, createContainer, InjectionMode, type AwilixContainer } from "awilix";
import { FirebaseWebSignInProvider, FetchWebSessionGateway } from "@topdeal/feature-auth/data/client";
import { BeginAuthRegistrationUseCase, CheckRegistrationEligibilityUseCase, CompleteAuthProfileFromWebUseCase, CompleteEmailVerificationUseCase, CompleteGoogleRegistrationUseCase, SendEmailVerificationUseCase, SignInUseCase } from "@topdeal/feature-auth/domain";
import type { ClientAuthCradle } from "./clientAuthTypes";

let containerInstance: AwilixContainer<ClientAuthCradle> | null = null;

export function buildClientAuthContainer(): AwilixContainer<ClientAuthCradle> {
  const container = createContainer<ClientAuthCradle>({ injectionMode: InjectionMode.PROXY });
  container.register({
    signInProvider: asClass(FirebaseWebSignInProvider).singleton(),
    webSessionGateway: asClass(FetchWebSessionGateway).singleton(),
    signInUseCase: asClass(SignInUseCase).singleton(),
    sendEmailVerificationUseCase: asClass(SendEmailVerificationUseCase).singleton(),
    completeEmailVerificationUseCase: asClass(CompleteEmailVerificationUseCase).singleton(),
    completeAuthProfileFromWebUseCase: asClass(CompleteAuthProfileFromWebUseCase).singleton(),
    beginAuthRegistrationUseCase: asClass(BeginAuthRegistrationUseCase).singleton(),
    completeGoogleRegistrationUseCase: asClass(CompleteGoogleRegistrationUseCase).singleton(),
    checkRegistrationEligibilityUseCase: asClass(CheckRegistrationEligibilityUseCase).singleton(),
  });
  return container;
}

export function getClientAuthContainer(): AwilixContainer<ClientAuthCradle> {
  if (!containerInstance) containerInstance = buildClientAuthContainer();
  return containerInstance;
}

export function resolveSignInUseCase(): SignInUseCase {
  return getClientAuthContainer().resolve("signInUseCase");
}

export function resolveSendEmailVerificationUseCase(): SendEmailVerificationUseCase {
  return getClientAuthContainer().resolve("sendEmailVerificationUseCase");
}

export function resolveCompleteEmailVerificationUseCase(): CompleteEmailVerificationUseCase {
  return getClientAuthContainer().resolve("completeEmailVerificationUseCase");
}

export function resolveCompleteAuthProfileFromWebUseCase(): CompleteAuthProfileFromWebUseCase {
  return getClientAuthContainer().resolve("completeAuthProfileFromWebUseCase");
}

export function resolveBeginAuthRegistrationUseCase(): BeginAuthRegistrationUseCase {
  return getClientAuthContainer().resolve("beginAuthRegistrationUseCase");
}

export function resolveCompleteGoogleRegistrationUseCase(): CompleteGoogleRegistrationUseCase {
  return getClientAuthContainer().resolve("completeGoogleRegistrationUseCase");
}

export function resolveCheckRegistrationEligibilityUseCase(): CheckRegistrationEligibilityUseCase {
  return getClientAuthContainer().resolve("checkRegistrationEligibilityUseCase");
}
