import type { Metadata } from "next";
import { ProfileCompletionScreen } from "@topdeal/feature-auth";
import { BackButton } from "@topdeal/ui";

export const metadata: Metadata = {
  title: "Aperçu du profil Auth",
};

export default function AuthProfilePreviewPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-content px-page-gutter pt-5">
        <p className="text-supporting text-text-secondary" role="note">
          Aperçu uniquement : les informations saisies ne sont pas envoyées ni
          enregistrées.
        </p>
        <BackButton className="mt-2 text-supporting" href="/connexion">
          Retour à la connexion
        </BackButton>
      </div>
      <ProfileCompletionScreen />
    </>
  );
}
