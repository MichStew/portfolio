import type { ReactNode } from 'react';

type SectionShellProps = {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
};

export default function SectionShell({
  id,
  index,
  title,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className="section-shell" aria-label={title}>
      <div className="section-shell__inner">
        <div className="section-shell__header" data-reveal>
          <div className="section-shell__rail">
            <span className="section-shell__index">{index}</span>
            <span className="section-shell__line" aria-hidden="true" />
          </div>
          <div className="section-shell__copy">
            <p className="section-shell__label">{title}</p>
          </div>
        </div>
        <div className="section-shell__content">{children}</div>
      </div>
    </section>
  );
}
