import type { FirebaseWebSignInProvider, FetchWebSessionGateway } from "@topdeal/feature-auth/data/client";
import type { BeginAuthRegistrationUseCase, CheckRegistrationEligibilityUseCase, CompleteAuthProfileFromWebUseCase, CompleteEmailVerificationUseCase, CompleteGoogleRegistrationUseCase, SendEmailVerificationUseCase, SignInUseCase } from "@topdeal/feature-auth/domain";

export type ClientAuthCradle = {
  signInProvider: FirebaseWebSignInProvider;
  webSessionGateway: FetchWebSessionGateway;
  signInUseCase: SignInUseCase;
  sendEmailVerificationUseCase: SendEmailVerificationUseCase;
  completeEmailVerificationUseCase: CompleteEmailVerificationUseCase;
  completeAuthProfileFromWebUseCase: CompleteAuthProfileFromWebUseCase;
  beginAuthRegistrationUseCase: BeginAuthRegistrationUseCase;
  completeGoogleRegistrationUseCase: CompleteGoogleRegistrationUseCase;
  checkRegistrationEligibilityUseCase: CheckRegistrationEligibilityUseCase;
};
