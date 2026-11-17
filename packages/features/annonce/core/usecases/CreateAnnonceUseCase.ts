import type { CreateAnnonceInput } from "../models/CreateAnnonceInput";

export type CreateAnnonceResult =
  | { status: "created"; annonceId: string }
  | { status: "invalid_input"; field: string };

export interface CreateAnnonceUseCase {
  execute(userId: string, input: CreateAnnonceInput): Promise<CreateAnnonceResult>;
}
