"use client";

import type { AnnoncePhoto } from "../../core/models/AnnoncePhoto";
import { useState } from "react";

type AnnoncePhotoGalleryProps = {
  photos: AnnoncePhoto[];
  annonceTitle: string;
};

export function AnnoncePhotoGallery({ photos, annonceTitle }: AnnoncePhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0] ?? null);

  return (
    <div>
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-card border border-border bg-image-tile lg:aspect-auto lg:h-[490px]">
        {selectedPhoto ? (
          <img
            alt={`${annonceTitle}, photo principale`}
            className="absolute inset-0 h-full w-full object-contain"
            height="490"
            src={selectedPhoto.url}
            width="700"
          />
        ) : (
          <svg aria-hidden="true" className="text-[#A39A91]" fill="none" height="112" viewBox="0 0 100 100" width="112" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25">
            <rect height="84" rx="7" width="38" x="31" y="8" />
            <path d="M43 17h14M46 82h8" />
            <circle cx="50" cy="89" r="1" />
          </svg>
        )}
      </div>

      {photos.length > 1 && (
        <div aria-label="Photos de l’annonce" className="mt-3 flex gap-3 overflow-x-auto pb-1" role="group">
          {photos.map((photo, index) => (
            <button
              aria-label={`Afficher la photo ${index + 1}`}
              aria-pressed={selectedPhoto?.id === photo.id}
              className={`relative h-[68px] w-[82px] shrink-0 overflow-hidden rounded-lg border bg-image-tile ${selectedPhoto?.id === photo.id ? "border-[#8A7D71] ring-1 ring-[#8A7D71]" : "border-border hover:border-input-border"}`}
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              type="button"
            >
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                height="68"
                src={photo.url}
                width="82"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
