import type { Metadata } from "next";
import { SignInPageClient } from "./SignInPageClient";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function SignInPage() {
  return <SignInPageClient />;
}
