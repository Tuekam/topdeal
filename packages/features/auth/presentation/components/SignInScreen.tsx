"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input, useToast } from "@topdeal/ui";
import type { SendEmailVerificationResult, SignInInput, SignInResult } from "../../core";
import { ProfileCompletionScreen } from "./ProfileCompletionScreen";
import { EmailVerificationScreen } from "./EmailVerificationScreen";

export type SignInScreenSubmit = (input: SignInInput) => Promise<SignInResult>;
export type SignInScreenProps = {
  onSubmit: SignInScreenSubmit;
  onSendEmailVerification: () => Promise<SendEmailVerificationResult>;
  onCompleteEmailVerification: () => Promise<SignInResult>;
  onCompleteProfile: (profile: { givenName: string; familyName: string; telephone: string; birthDate: string }) => Promise<SignInResult>;
};

function getMessage(status: SignInResult["status"]): string | null {
  switch (status) {
    case "authenticated": return null;
    case "unauthenticated": return "Adresse e-mail ou mot de passe incorrect.";
    case "invalid_credentials": return "Adresse e-mail ou mot de passe incorrect.";
    case "cancelled": return "La connexion a été annulée.";
    case "email_unverified": return "Vérifiez votre adresse e-mail avant de vous connecter.";
    case "registration_required": return "Aucun compte TopDeal n’est associé à cette connexion. Créez votre compte pour continuer.";
    case "profile_required": return "Votre identité est reconnue, mais votre profil TopDeal doit être complété avant l’accès au compte.";
    case "account_unavailable": return "Ce compte ne peut pas accéder à TopDeal.";
    case "invalid_profile": return "Vérifiez les informations saisies.";
    case "profile_conflict": return "Cette adresse e-mail ou ce numéro est déjà associé à un compte.";
    case "request_failed": return "La connexion n’a pas abouti. Vérifiez la configuration et réessayez.";
    case "weak_password": return "Choisissez un mot de passe qui respecte les exigences Firebase.";
    case "email_already_associated": return "Cette adresse e-mail est déjà associée à un autre compte.";
    case "identity_unavailable": return "La connexion Google a expiré. Recommencez pour continuer.";
  }
}

export function SignInScreen({ onSubmit, onSendEmailVerification, onCompleteEmailVerification, onCompleteProfile }: SignInScreenProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const showToast = useToast();

  async function submit(input: SignInInput) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await onSubmit(input);
      if (result.status === "profile_required") {
        setNeedsProfile(true);
        showToast({ kind: "info", title: "Connexion reconnue", description: "Complétez votre profil pour accéder à TopDeal." });
        return;
      }
      if (result.status === "email_unverified") {
        setNeedsEmailVerification(true);
        showToast({ kind: "info", title: "Vérification requise", description: "Confirmez votre adresse e-mail pour continuer." });
        return;
      }
      const message = getMessage(result.status);
      if (result.status === "authenticated") showToast({ kind: "success", title: "Connexion réussie" });
      else if (message) showToast({ kind: "error", title: "Connexion impossible", description: message });
    } catch {
      showToast({ kind: "error", title: "Connexion impossible", description: "La connexion n’a pas abouti. Réessayez." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function completeEmailVerification(): Promise<SignInResult> {
    const result = await onCompleteEmailVerification();
    if (result.status === "profile_required") {
      setNeedsEmailVerification(false);
      setNeedsProfile(true);
    }
    return result;
  }

  if (needsEmailVerification) {
    return (
      <EmailVerificationScreen
        onContinue={completeEmailVerification}
        onSendVerification={onSendEmailVerification}
      />
    );
  }

  if (needsProfile) {
    return (
      <ProfileCompletionScreen
        onCancel={() => setNeedsProfile(false)}
        onSubmit={onCompleteProfile}
      />
    );
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await submit({
      method: "email_password",
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-start justify-center px-page-gutter pt-[56px] pb-[88px]">
      <section aria-labelledby="sign-in-title" className="w-full max-w-[480px]">
        <Card className="p-8">
          <header>
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight" id="sign-in-title">Connexion</h1>
            <p className="mt-1 text-text-secondary">Connectez-vous pour acheter, vendre et suivre vos commandes.</p>
          </header>

          <Button className="mt-6 w-full" disabled={isSubmitting} onClick={() => void submit({ method: "google" })} variant="secondary">
            {isSubmitting ? "Connexion en cours…" : "Continuer avec Google"}
          </Button>

          <div className="my-6 flex items-center gap-3 text-[13px] text-text-secondary">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span>ou avec votre e-mail</span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={submitEmail}>
            <Input autoComplete="email" label="Adresse e-mail" name="email" placeholder="nom@exemple.com" required type="email" />
            <div>
              <Input
                autoComplete="current-password"
                className="td-input--with-end-action"
                endAction={<button aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={isPasswordVisible} className="td-input-end-action" onClick={() => setIsPasswordVisible((visible) => !visible)} type="button">{isPasswordVisible ? "Masquer" : "Afficher"}</button>}
                label="Mot de passe"
                name="password"
                placeholder="Votre mot de passe"
                required
                type={isPasswordVisible ? "text" : "password"}
              />
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-secondary">Vous n’avez pas encore de compte ? <a className="font-medium text-accent underline-offset-4 hover:underline" href="/inscription">Créer un compte</a></p>
          <p className="mt-4 rounded-notice bg-surface-muted px-3.5 py-3 text-[13px] leading-[1.55] text-text-secondary">TopDeal ne vous demande jamais votre mot de passe par message ou par téléphone.</p>
        </Card>
      </section>
    </main>
  );
}
