"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@topdeal/ui";

type ProfileDetails = {
  givenName: string;
  familyName: string;
  telephone: string;
  birthDate: string;
};

type ProfileCompletionScreenProps = {
  onSubmit?: (profile: ProfileDetails) => Promise<{ status: string }>;
  onCancel?: () => void;
};

function getMessage(status: string): string | null {
  switch (status) {
    case "authenticated": return null;
    case "invalid_profile": return "Vérifiez les informations saisies. Vous devez avoir au moins 18 ans.";
    case "profile_conflict": return "Cette adresse e-mail ou ce numéro est déjà associé à un compte.";
    case "email_unverified": return "Vérifiez votre adresse e-mail avant de continuer.";
    case "email_verification_required": return "Vérifiez votre adresse e-mail avant de continuer.";
    case "registration_eligible": return "Complétez les champs obligatoires pour continuer.";
    case "registration_required": return "Créez un compte avant de compléter le profil.";
    case "unauthenticated": return "Votre session de connexion a expiré. Recommencez la connexion.";
    case "email_already_in_use": return "Cette adresse e-mail appartient déjà à un compte TopDeal. Connectez-vous à ce compte.";
    case "account_unavailable": return "Ce compte ne peut pas accéder à TopDeal.";
    case "cancelled": return "La connexion a été annulée.";
    case "request_failed": return "La création du profil n’a pas abouti. Réessayez.";
    case "profile_required": return "Complétez les champs obligatoires pour continuer.";
    case "weak_password": return "Choisissez un mot de passe qui respecte les exigences Firebase.";
    case "email_already_associated": return "Cette adresse e-mail est déjà associée à un autre compte.";
    case "identity_unavailable": return "La connexion Google a expiré. Recommencez pour continuer.";
    default: return "La création du profil n’a pas abouti. Réessayez.";
  }
}

export function ProfileCompletionScreen({ onSubmit, onCancel }: ProfileCompletionScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSubmit || isSubmitting) return;
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await onSubmit({
        givenName: String(form.get("givenName") ?? ""),
        familyName: String(form.get("familyName") ?? ""),
        telephone: String(form.get("telephone") ?? ""),
        birthDate: String(form.get("birthDate") ?? ""),
      });
      setErrorMessage(getMessage(result.status));
    } catch {
      setErrorMessage("La création du profil n’a pas abouti. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-start justify-center px-page-gutter pt-[56px] pb-[88px]">
      <section aria-labelledby="profile-completion-title" className="w-full max-w-[480px]">
        <Card className="p-8">
          <header>
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight" id="profile-completion-title">Complétez votre profil</h1>
            <p className="mt-1 text-text-secondary">Quelques informations sont nécessaires pour finaliser votre compte.</p>
          </header>

          {errorMessage && <p className="mt-5 rounded-notice bg-error-background px-3 py-[11px] text-[13px] leading-[1.5] text-error" role="alert">{errorMessage}</p>}

          <form className="mt-6 space-y-5" onSubmit={submit}>
            <Input autoComplete="given-name" label="Prénom" name="givenName" required />
            <Input autoComplete="family-name" label="Nom" name="familyName" required />
            <Input autoComplete="tel" hint="Ce numéro doit être unique pour chaque compte." label="Téléphone" name="telephone" placeholder="Votre numéro de téléphone" required type="tel" />
            <Input autoComplete="bday" hint="Vous devez avoir au moins 18 ans." label="Date de naissance" name="birthDate" required type="date" />
            <Button className="w-full" disabled={!onSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Enregistrement…" : "Terminer"}
            </Button>
            {onCancel && (
              <Button className="w-full" disabled={isSubmitting} onClick={onCancel} variant="secondary">
                Retour à la connexion
              </Button>
            )}
          </form>
        </Card>
      </section>
    </main>
  );
}
