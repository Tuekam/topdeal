import type {
  AuthSignInProvider,
  WebSessionGateway,
  BeginAuthRegistrationUseCase,
  CheckRegistrationEligibilityUseCase,
  CompleteAuthProfileFromWebUseCase,
  CompleteEmailVerificationUseCase,
  CompleteGoogleRegistrationUseCase,
  SendEmailVerificationUseCase,
  SignInUseCase,
} from "@topdeal/feature-auth/core";

export type ClientAuthCradle = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
  signInUseCase: SignInUseCase;
  sendEmailVerificationUseCase: SendEmailVerificationUseCase;
  completeEmailVerificationUseCase: CompleteEmailVerificationUseCase;
  completeAuthProfileFromWebUseCase: CompleteAuthProfileFromWebUseCase;
  beginAuthRegistrationUseCase: BeginAuthRegistrationUseCase;
  completeGoogleRegistrationUseCase: CompleteGoogleRegistrationUseCase;
  checkRegistrationEligibilityUseCase: CheckRegistrationEligibilityUseCase;
};
