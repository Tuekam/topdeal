export type UpdateAnnonceInput = {
  annonceId: string;
  userId: string;
  prix: string;
  quantite: number;
};

export type UpdateAnnonceResult = "updated" | "invalid_input" | "not_found";

export interface UpdateAnnonceUseCase {
  execute(input: UpdateAnnonceInput): Promise<UpdateAnnonceResult>;
}
