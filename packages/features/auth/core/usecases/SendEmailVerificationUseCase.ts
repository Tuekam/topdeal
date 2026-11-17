export type SendEmailVerificationResult = {
  status: "verification_email_sent" | "identity_unavailable" | "request_failed";
};

export interface SendEmailVerificationUseCase {
  execute(): Promise<SendEmailVerificationResult>;
}
