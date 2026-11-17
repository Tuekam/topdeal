"use client";

import { useRouter } from "next/navigation";
import { SignUpScreen } from "@topdeal/feature-auth/presentation";
import type { AuthRegistrationResult, BeginAuthRegistrationInput } from "@topdeal/feature-auth/domain";
import {
  resolveBeginAuthRegistrationUseCase,
  resolveCheckRegistrationEligibilityUseCase,
  resolveCompleteAuthProfileFromWebUseCase,
  resolveCompleteGoogleRegistrationUseCase,
  resolveSendEmailVerificationUseCase,
} from "../../di/clientAuthContainer";

export function SignUpPageClient() {
  const router = useRouter();

  async function register(input: BeginAuthRegistrationInput): Promise<AuthRegistrationResult> {
    const result = await resolveBeginAuthRegistrationUseCase().execute(input);
    return result;
  }

  async function completeGoogleRegistration(password: string): Promise<AuthRegistrationResult> {
    return resolveCompleteGoogleRegistrationUseCase().execute(password);
  }

  async function checkEligibility(): Promise<AuthRegistrationResult> {
    return resolveCheckRegistrationEligibilityUseCase().execute();
  }

  async function completeProfile(profile: { givenName: string; familyName: string; telephone: string; birthDate: string }): Promise<AuthRegistrationResult> {
    const result = await resolveCompleteAuthProfileFromWebUseCase().execute(profile);
    if (result.status === "authenticated") {
      router.replace("/");
      router.refresh();
    }
    return result;
  }

  async function sendEmailVerification() {
    return resolveSendEmailVerificationUseCase().execute();
  }

  return (
    <SignUpScreen
      onCheckEligibility={checkEligibility}
      onCompleteGoogleRegistration={completeGoogleRegistration}
      onCompleteProfile={completeProfile}
      onRegister={register}
      onSendEmailVerification={sendEmailVerification}
    />
  );
}
