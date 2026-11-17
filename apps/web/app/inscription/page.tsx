import type { Metadata } from "next";
import { SignUpPageClient } from "./SignUpPageClient";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function SignUpPage() {
  return <SignUpPageClient />;
}
