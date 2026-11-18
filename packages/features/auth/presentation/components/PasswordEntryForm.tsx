"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input, useToast } from "@topdeal/ui";

type Props = {
  title: string;
  description: string;
  inputLabel: string;
  submitLabel: string;
  submittingLabel: string;
  unexpectedErrorMessage: string;
  onSubmit: (password: string) => Promise<string | null>;
};

export function PasswordEntryForm({ title, description, inputLabel, submitLabel, submittingLabel, unexpectedErrorMessage, onSubmit }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const message = await onSubmit(String(form.get("password") ?? ""));
      if (message) showToast({ kind: "error", title: "Mot de passe non enregistré", description: message });
      else showToast({ kind: "success", title: "Mot de passe enregistré" });
    } catch {
      showToast({ kind: "error", title: "Mot de passe non enregistré", description: unexpectedErrorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content items-start justify-center px-page-gutter pt-[56px] pb-[88px]">
      <section aria-labelledby="password-entry-title" className="w-full max-w-[480px]">
        <Card className="p-8">
          <header>
            <h1 className="text-[30px] leading-[1.2] font-semibold tracking-tight" id="password-entry-title">{title}</h1>
            <p className="mt-1 text-text-secondary">{description}</p>
          </header>
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <Input
              autoComplete="new-password"
              className="td-input--with-end-action"
              endAction={<button aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={isPasswordVisible} className="td-input-end-action" onClick={() => setIsPasswordVisible((visible) => !visible)} type="button">{isPasswordVisible ? "Masquer" : "Afficher"}</button>}
              label={inputLabel}
              name="password"
              placeholder="Choisissez un mot de passe"
              required
              type={isPasswordVisible ? "text" : "password"}
            />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
