"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@topdeal/ui";
import type { AuthRegistrationResult } from "../../core";

type Props = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onRegister: (input: { method: "email_password"; email: string; password: string }) => Promise<AuthRegistrationResult>;
  onGoogle: () => Promise<AuthRegistrationResult>;
};

export function SignUpCredentialsScreen({ isSubmitting, errorMessage, onRegister, onGoogle }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onRegister({
      method: "email_password",
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-start justify-center px-page-gutter pt-[56px] pb-[88px]">
      <section aria-labelledby="sign-up-title" className="w-full max-w-[480px]">
        <Card className="p-8">
          <header>
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight" id="sign-up-title">Inscription</h1>
            <p className="mt-1 text-text-secondary">Créez votre compte TopDeal pour acheter et vendre.</p>
          </header>

          {errorMessage && <p className="mt-5 rounded-notice bg-error-background px-3 py-[11px] text-[13px] leading-[1.5] text-error" role="alert">{errorMessage}</p>}

          <Button className="mt-6 w-full" disabled={isSubmitting} onClick={() => void onGoogle()} variant="secondary">
            {isSubmitting ? "Inscription en cours…" : "Continuer avec Google"}
          </Button>

          <div className="my-6 flex items-center gap-3 text-[13px] text-text-secondary">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span>ou avec votre e-mail</span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={submit}>
            <Input autoComplete="email" label="Adresse e-mail" name="email" placeholder="nom@exemple.com" required type="email" />
            <Input
              autoComplete="new-password"
              className="td-input--with-end-action"
              endAction={<button aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={isPasswordVisible} className="td-input-end-action" onClick={() => setIsPasswordVisible((visible) => !visible)} type="button">{isPasswordVisible ? "Masquer" : "Afficher"}</button>}
              label="Mot de passe"
              name="password"
              placeholder="Choisissez un mot de passe"
              required
              type={isPasswordVisible ? "text" : "password"}
            />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Inscription en cours…" : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-secondary">Vous avez déjà un compte ? <a className="font-medium text-accent underline-offset-4 hover:underline" href="/connexion">Se connecter</a></p>
        </Card>
      </section>
    </main>
  );
}
