"use client";

import { useRouter } from "next/navigation";
import { SignInScreen } from "@topdeal/feature-auth/presentation";
import type { SignInInput } from "@topdeal/feature-auth/domain";
import {
  resolveCompleteEmailVerificationUseCase,
  resolveCompleteAuthProfileFromWebUseCase,
  resolveSendEmailVerificationUseCase,
  resolveSignInUseCase,
} from "../../di/clientAuthContainer";

export function SignInPageClient() {
  const router = useRouter();

  async function signIn(input: SignInInput) {
    const result = await resolveSignInUseCase().execute(input);
    if (result.status === "authenticated") {
      router.replace("/");
      router.refresh();
    }
    return result;
  }

  async function completeProfile(profile: { givenName: string; familyName: string; telephone: string; birthDate: string }) {
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

  async function completeEmailVerification() {
    const result = await resolveCompleteEmailVerificationUseCase().execute();
    if (result.status === "authenticated") {
      router.replace("/");
      router.refresh();
    }
    return result;
  }

  return <SignInScreen onSubmit={signIn} onSendEmailVerification={sendEmailVerification} onCompleteEmailVerification={completeEmailVerification} onCompleteProfile={completeProfile} />;
}
