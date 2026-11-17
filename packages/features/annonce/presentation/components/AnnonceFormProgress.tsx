type AnnonceFormProgressProps = {
  currentStep: 1 | 2;
};

export function AnnonceFormProgress({ currentStep }: AnnonceFormProgressProps) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div aria-label={`Progression : étape ${currentStep} sur 2`} className="flex flex-1 gap-2">
        <span className={`h-1 flex-1 rounded-full ${currentStep >= 1 ? "bg-accent" : "bg-border"}`} />
        <span className={`h-1 flex-1 rounded-full ${currentStep >= 2 ? "bg-accent" : "bg-border"}`} />
      </div>
      <p className="shrink-0 text-sm text-text-secondary">
        Étape <strong className="text-text">{currentStep}</strong> sur 2
      </p>
    </div>
  );
}
