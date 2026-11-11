import type { ReactNode } from "react";

interface HomeSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function HomeSection({ children, id, title }: HomeSectionProps) {
  const headingId = `home-${id}-title`;

  return (
    <section aria-labelledby={headingId} className="home-section" id={id}>
      <h2 id={headingId}>{title}</h2>
      {children}
    </section>
  );
}
