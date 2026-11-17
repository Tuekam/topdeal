import type { Metadata } from "next";
import Link from "next/link";
import { ProfileCompletionScreen } from "@topdeal/feature-auth";

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
        <Link
          className="mt-2 inline-block text-supporting text-text-secondary underline"
          href="/connexion"
        >
          Retour à la connexion
        </Link>
      </div>
      <ProfileCompletionScreen />
    </>
  );
}
