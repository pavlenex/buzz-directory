const beeCount = 14;

export function BeeDrift() {
  return (
    <div className="bee-drift-field" aria-hidden="true">
      {Array.from({ length: beeCount }, (_, index) => (
        <span key={index}>🐝</span>
      ))}
    </div>
  );
}
