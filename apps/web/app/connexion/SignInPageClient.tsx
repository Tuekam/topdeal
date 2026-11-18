"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInScreen } from "@topdeal/feature-auth/presentation";
import type { SignInInput } from "@topdeal/feature-auth/core";
import { useToast } from "@topdeal/ui";
import {
  resolveCompleteEmailVerificationUseCase,
  resolveCompleteAuthProfileFromWebUseCase,
  resolveSendEmailVerificationUseCase,
  resolveSignInUseCase,
} from "../../di/clientAuthContainer";

export function SignInPageClient() {
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("sessionError") !== "unavailable") return;
    showToast({
      kind: "error",
      title: "Vérification de session indisponible",
      description: "Impossible de vérifier votre session pour le moment. Réessayez plus tard.",
    });
    router.replace("/connexion");
  }, [router, showToast]);

  async function signIn(input: SignInInput) {
    const result = await resolveSignInUseCase().execute(input);
    if (result.status === "authenticated") {
      router.replace("/annonces");
      router.refresh();
    }
    return result;
  }

  async function completeProfile(profile: { givenName: string; familyName: string; telephone: string; birthDate: string }) {
    const result = await resolveCompleteAuthProfileFromWebUseCase().execute(profile);
    if (result.status === "authenticated") {
      router.replace("/annonces");
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
      router.replace("/annonces");
      router.refresh();
    }
    return result;
  }

  return <SignInScreen onSubmit={signIn} onSendEmailVerification={sendEmailVerification} onCompleteEmailVerification={completeEmailVerification} onCompleteProfile={completeProfile} />;
}
