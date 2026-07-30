const beeCount = 14;
const tones = ["acid", "pink", "blue", "mint"] as const;

function BeeArtwork() {
  return (
    <svg viewBox="0 0 64 48" role="presentation">
      <ellipse className="bee-wing bee-wing-top" cx="26" cy="15" rx="14" ry="8" />
      <ellipse className="bee-wing bee-wing-bottom" cx="26" cy="33" rx="14" ry="8" />
      <ellipse className="bee-body" cx="35" cy="24" rx="18" ry="12" />
      <path className="bee-stripe" d="M27 13.8c-2 6.4-2 13.9 0 20.4" />
      <path className="bee-stripe" d="M37 12.2c-2 7.7-2 15.9 0 23.6" />
      <circle className="bee-head" cx="53" cy="24" r="8" />
      <circle className="bee-eye" cx="56" cy="21" r="1.8" />
      <path className="bee-stinger" d="m17 24-8-4 2 8Z" />
    </svg>
  );
}

export function BeeDrift() {
  return (
    <div className="bee-drift-field" aria-hidden="true">
      {Array.from({ length: beeCount }, (_, index) => (
        <span
          className={`drift-bee drift-bee-${tones[index % tones.length]}`}
          key={index}
        >
          <BeeArtwork />
        </span>
      ))}
    </div>
  );
}
