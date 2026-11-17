import type { AnnoncePhotoInput } from "../models/AnnoncePhotoInput";
import type { StoredAnnoncePhoto } from "../models/StoredAnnoncePhoto";

export interface AnnoncePhotoStorage {
  store(photo: AnnoncePhotoInput): Promise<StoredAnnoncePhoto>;
  createReadUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
