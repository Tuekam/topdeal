export interface UpdateAnnonceRepository {
  updatePriceAndQuantity(
    annonceId: string,
    userId: string,
    price: string,
    quantity: number,
  ): Promise<boolean>;
}
