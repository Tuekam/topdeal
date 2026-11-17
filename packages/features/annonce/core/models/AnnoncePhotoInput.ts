export type AnnoncePhotoInput = {
  originalName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  content: Uint8Array;
};
