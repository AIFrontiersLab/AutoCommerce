/**
 * Layered atmosphere — dark “neon” or bright airy mesh (no grid squares).
 */
type NeonFrontiersBackdropProps = {
  variant?: "light" | "dark";
};

export function NeonFrontiersBackdrop({ variant = "dark" }: NeonFrontiersBackdropProps) {
  if (variant === "light") {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #f0f8ff 0%, #ecfeff 18%, #e0f2fe 42%, #fdf4ff 72%, #fffbeb 100%)",
          }}
        />
        <div
          className="neon-backdrop-light-drift-a pointer-events-none absolute -inset-[12%]"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(56, 189, 248, 0.45) 0%, rgba(125, 211, 252, 0.2) 40%, transparent 65%)",
          }}
        />
        <div
          className="neon-backdrop-light-drift-b pointer-events-none absolute -inset-[12%]"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 100% 15%, rgba(232, 121, 249, 0.28) 0%, rgba(196, 181, 253, 0.12) 45%, transparent 60%)",
          }}
        />
        <div
          className="neon-backdrop-light-drift-c pointer-events-none absolute -inset-[12%]"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at -5% 85%, rgba(52, 211, 153, 0.22) 0%, rgba(110, 231, 183, 0.1) 48%, transparent 62%)",
          }}
        />
        <div
          className="neon-backdrop-layer-drift-b-delayed pointer-events-none absolute -inset-[12%]"
          style={{
            background:
              "radial-gradient(ellipse 50% 35% at 50% 100%, rgba(251, 191, 36, 0.18) 0%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,rgba(255,255,255,0.85)_0%,transparent_75%)]"
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #243189 0%, #1c2770 22%, #151b52 50%, #121838 78%, #0f1430 100%)",
        }}
      />
      <div
        className="neon-backdrop-layer-drift-a pointer-events-none absolute -inset-[12%] opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 110% 75% at 50% -15%, rgba(56, 189, 248, 0.72) 0%, rgba(34, 211, 238, 0.35) 38%, transparent 62%)",
        }}
      />
      <div
        className="neon-backdrop-layer-drift-b pointer-events-none absolute -inset-[12%]"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 108% 12%, rgba(232, 121, 249, 0.62) 0%, rgba(168, 85, 247, 0.28) 42%, transparent 58%)",
        }}
      />
      <div
        className="neon-backdrop-layer-drift-c pointer-events-none absolute -inset-[12%]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at -8% 88%, rgba(52, 211, 153, 0.5) 0%, rgba(45, 212, 191, 0.22) 45%, transparent 60%)",
        }}
      />
      <div
        className="neon-backdrop-layer-drift-b-delayed pointer-events-none absolute -inset-[12%]"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 108%, rgba(251, 191, 36, 0.38) 0%, transparent 55%)",
        }}
      />
      <div
        className="neon-backdrop-shimmer-band pointer-events-none absolute -inset-y-[45%] inset-x-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 42%, rgba(125, 211, 252, 0.14) 50%, transparent 58%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_0%,rgba(15,20,48,0.45)_100%)]"
        aria-hidden
      />
    </>
  );
}
