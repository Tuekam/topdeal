"use client";

import { useState } from "react";
import { BackButton, Button, Card } from "@topdeal/ui";
import type { ReactNode } from "react";
type AuthStatusResult = { status: string };
import type { SendEmailVerificationResult } from "../../core";

type EmailVerificationScreenProps = {
  onSendVerification: () => Promise<SendEmailVerificationResult>;
  onContinue: () => Promise<AuthStatusResult>;
  title?: string;
  description?: ReactNode;
  messages?: Partial<EmailVerificationMessages>;
};

type EmailVerificationMessages = {
  identityUnavailable: string;
  emailAlreadyInUse: string;
  registrationRequired: string;
  requestFailed: string;
};

const defaultMessages: EmailVerificationMessages = {
  identityUnavailable: "Votre connexion a expiré. Recommencez la connexion.",
  emailAlreadyInUse: "Cette adresse est déjà liée à un compte TopDeal. Connectez-vous à ce compte.",
  registrationRequired: "Aucun compte TopDeal n’est lié à cette connexion. Créez un compte pour continuer.",
  requestFailed: "La connexion n’a pas abouti. Réessayez.",
};

export function EmailVerificationScreen({ onSendVerification, onContinue, title = "Vérifiez votre adresse e-mail", description = "La vérification de votre adresse est nécessaire pour accéder à votre compte TopDeal.", messages = {} }: EmailVerificationScreenProps) {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const text = { ...defaultMessages, ...messages };

  async function sendVerification() {
    if (isSending || isChecking) return;
    setIsSending(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const result = await onSendVerification();
      if (result.status === "verification_email_sent") {
        setStatusMessage("E-mail envoyé. Ouvrez le lien de vérification, puis revenez ici.");
      } else if (result.status === "identity_unavailable") {
        setErrorMessage(text.identityUnavailable);
      } else {
        setErrorMessage("L’envoi de l’e-mail a échoué. Réessayez dans un instant.");
      }
    } catch {
      setErrorMessage("L’envoi de l’e-mail a échoué. Réessayez dans un instant.");
    } finally {
      setIsSending(false);
    }
  }

  async function checkVerification() {
    if (isSending || isChecking) return;
    setIsChecking(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const result = await onContinue();
      if (result.status === "email_unverified") {
        setErrorMessage("Firebase n’a pas encore confirmé la vérification. Ouvrez le lien reçu, puis réessayez.");
      } else if (result.status === "email_already_in_use") {
        setErrorMessage(text.emailAlreadyInUse);
      } else if (result.status === "registration_required") {
        setErrorMessage(text.registrationRequired);
      } else if (result.status !== "authenticated" && result.status !== "profile_required" && result.status !== "registration_eligible") {
        setErrorMessage(text.requestFailed);
      }
    } catch {
      setErrorMessage(text.requestFailed);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-start justify-center px-page-gutter pt-[56px] pb-[88px]">
      <section aria-labelledby="email-verification-title" className="w-full max-w-[480px]">
        <Card className="p-8">
          <header>
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight" id="email-verification-title">{title}</h1>
            <p className="mt-1 text-text-secondary">{description}</p>
          </header>

          {statusMessage && <p className="mt-5 rounded-notice bg-surface-muted px-3 py-[11px] text-[13px] leading-[1.5] text-text-secondary" role="status">{statusMessage}</p>}
          {errorMessage && <p className="mt-5 rounded-notice bg-error-background px-3 py-[11px] text-[13px] leading-[1.5] text-error" role="alert">{errorMessage}</p>}

          <div className="mt-6 space-y-3">
            <Button className="w-full" disabled={isSending || isChecking} onClick={() => void checkVerification()}>
              {isChecking ? "Vérification en cours…" : "J’ai vérifié mon adresse"}
            </Button>
            <Button className="w-full" disabled={isSending || isChecking} onClick={() => void sendVerification()} variant="secondary">
              {isSending ? "Envoi en cours…" : "Envoyer l’e-mail de vérification"}
            </Button>
          </div>
          <div className="mt-5 flex justify-center">
            <BackButton className="text-[13px]" href="/connexion">Retour à la connexion</BackButton>
          </div>
        </Card>
      </section>
    </main>
  );
}
