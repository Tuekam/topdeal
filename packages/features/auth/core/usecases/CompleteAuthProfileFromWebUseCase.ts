import type { CompleteProfileData, WebSessionResult } from "../repositories/WebSessionGateway";

export type CompleteAuthProfileFromWebInput = CompleteProfileData;
export type CompleteAuthProfileFromWebResult = WebSessionResult;

export interface CompleteAuthProfileFromWebUseCase {
  execute(input: CompleteAuthProfileFromWebInput): Promise<CompleteAuthProfileFromWebResult>;
}
