"use client";

import type { AuthRegistrationResult } from "../../core";
import { PasswordEntryForm } from "./PasswordEntryForm";

type Props = {
  onSubmit: (password: string) => Promise<AuthRegistrationResult>;
};

function getMessage(status: AuthRegistrationResult["status"]): string | null {
  switch (status) {
    case "weak_password": return "Choisissez un mot de passe accepté par Firebase.";
    case "email_already_associated":
    case "email_already_in_use": return "Cette adresse est déjà liée à un compte TopDeal. Connectez-vous à ce compte.";
    case "identity_unavailable":
    case "unauthenticated": return "L’inscription a expiré. Recommencez depuis la page Inscription.";
    case "email_unverified": return "Confirmez votre adresse e-mail pour poursuivre l’inscription.";
    case "registration_eligible": return null;
    case "registration_required": return "Aucun compte TopDeal n’est encore associé à cette adresse.";
    case "profile_required": return "Complétez les informations du profil pour poursuivre l’inscription.";
    case "account_unavailable": return "Cette identité ne peut pas créer de compte TopDeal.";
    case "cancelled": return "La création du compte a été annulée.";
    case "request_failed": return "L’ajout du mot de passe au compte en création a échoué. Réessayez.";
    case "authenticated": return null;
    case "invalid_profile": return "Vérifiez les informations du profil.";
    case "profile_conflict": return "Le numéro saisi est déjà associé à un autre compte.";
    case "password_setup_required": return null;
    case "email_verification_required": return "Confirmez votre adresse e-mail pour poursuivre l’inscription.";
  }
}

export function SetRegistrationPasswordScreen({ onSubmit }: Props) {
  return (
    <PasswordEntryForm
      description="Ce mot de passe sera ajouté au compte créé avec Google. Vous pourrez ensuite utiliser les deux méthodes pour accéder au même compte."
      inputLabel="Mot de passe du compte"
      onSubmit={async (password) => getMessage((await onSubmit(password)).status)}
      submitLabel="Continuer l’inscription"
      submittingLabel="Création du compte en cours…"
      title="Choisissez un mot de passe pour votre compte"
      unexpectedErrorMessage="L’inscription n’a pas abouti. Vérifiez les informations et réessayez."
    />
  );
}
