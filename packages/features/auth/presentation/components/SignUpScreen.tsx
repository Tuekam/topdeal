"use client";

import { useState } from "react";
import type {
  AuthRegistrationResult,
  BeginAuthRegistrationInput,
  SendEmailVerificationResult,
} from "../../core";
import { SetRegistrationPasswordScreen } from "./SetRegistrationPasswordScreen";
import { EmailVerificationScreen } from "./EmailVerificationScreen";
import { ProfileCompletionScreen } from "./ProfileCompletionScreen";
import { SignUpCredentialsScreen } from "./SignUpCredentialsScreen";

type Props = {
  onRegister: (input: BeginAuthRegistrationInput) => Promise<AuthRegistrationResult>;
  onCompleteGoogleRegistration: (password: string) => Promise<AuthRegistrationResult>;
  onSendEmailVerification: () => Promise<SendEmailVerificationResult>;
  onCheckEligibility: () => Promise<AuthRegistrationResult>;
  onCompleteProfile: (profile: { givenName: string; familyName: string; telephone: string; birthDate: string }) => Promise<AuthRegistrationResult>;
};

function getMessage(status: AuthRegistrationResult["status"]): string | null {
  switch (status) {
    case "email_already_in_use":
    case "email_already_associated": return "Cette adresse est déjà liée à un compte TopDeal. Connectez-vous à ce compte.";
    case "weak_password": return "Choisissez un mot de passe qui respecte les exigences Firebase.";
    case "cancelled": return "L’inscription a été annulée.";
    case "unauthenticated":
    case "identity_unavailable": return "La connexion a expiré. Recommencez l’inscription.";
    case "email_unverified": return "Vérifiez votre adresse e-mail avant de continuer.";
    case "registration_required": return "Cette identité doit être créée depuis le parcours d’inscription.";
    case "profile_required": return "Complétez les informations du profil pour continuer.";
    case "account_unavailable": return "Ce compte ne peut pas accéder à TopDeal.";
    case "invalid_profile": return "Vérifiez les informations saisies et l’âge minimum de 18 ans.";
    case "profile_conflict": return "Ce numéro de téléphone ou cette identité est déjà associé à un compte.";
    case "request_failed": return "L’inscription n’a pas abouti. Réessayez.";
    case "password_setup_required":
    case "email_verification_required":
    case "registration_eligible":
    case "authenticated": return null;
  }
}

export function SignUpScreen({ onRegister, onCompleteGoogleRegistration, onSendEmailVerification, onCheckEligibility, onCompleteProfile }: Props) {
  const [step, setStep] = useState<"credentials" | "password" | "verification" | "profile">("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function run(action: () => Promise<AuthRegistrationResult>) {
    if (isSubmitting) return { status: "request_failed" } as AuthRegistrationResult;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await action();
      if (result.status === "password_setup_required") setStep("password");
      else if (result.status === "email_verification_required" || result.status === "email_unverified") setStep("verification");
      else if (result.status === "registration_eligible") setStep("profile");
      else if (result.status !== "authenticated") setErrorMessage(getMessage(result.status));
      return result;
    } catch {
      setErrorMessage("L’inscription n’a pas abouti. Réessayez.");
      return { status: "request_failed" } as AuthRegistrationResult;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function checkEligibility() {
    const result = await run(onCheckEligibility);
    return result;
  }

  if (step === "password") {
    return <SetRegistrationPasswordScreen onSubmit={(password) => run(() => onCompleteGoogleRegistration(password))} />;
  }

  if (step === "verification") {
    return (
      <EmailVerificationScreen
        description="Firebase vous envoie un lien de confirmation. Après l’avoir ouvert, revenez ici pour continuer votre inscription."
        onContinue={checkEligibility}
        onSendVerification={onSendEmailVerification}
        messages={{
          identityUnavailable: "L’inscription a expiré. Recommencez depuis la page Inscription.",
          emailAlreadyInUse: "Cette adresse est déjà utilisée par un compte TopDeal. Connectez-vous à ce compte.",
          registrationRequired: "Aucun compte n’est encore créé. Recommencez l’inscription.",
          requestFailed: "La vérification de l’inscription n’a pas abouti. Réessayez.",
        }}
        title="Confirmez votre adresse pour vous inscrire"
      />
    );
  }

  if (step === "profile") {
    return <ProfileCompletionScreen onSubmit={onCompleteProfile} />;
  }

  return (
    <SignUpCredentialsScreen
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onGoogle={() => run(() => onRegister({ method: "google" }))}
      onRegister={(input) => run(() => onRegister(input))}
    />
  );
}
