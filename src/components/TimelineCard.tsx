import type { CSSProperties } from 'react';
import type { WorkExperienceItem } from '../data/siteContent';

type TimelineCardProps = {
  item: WorkExperienceItem;
  delay?: number;
};

export default function TimelineCard({
  item,
  delay = 0,
}: TimelineCardProps) {
  const style = {
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;
  const logoImageStyle = item.logoScale
    ? ({
        '--timeline-card-logo-scale': `${item.logoScale}`,
      } as CSSProperties)
    : undefined;

  return (
    <article className="timeline-card" data-reveal style={style}>
      <div className="timeline-card__meta">
        <p className="timeline-card__date">{item.dateRange}</p>
        <p className="timeline-card__location">{item.location}</p>
      </div>
      <div className="timeline-card__body">
        <div className="timeline-card__header">
          <div className="timeline-card__header-copy">
            <h3>{item.role}</h3>
            <p className="timeline-card__company">{item.company}</p>
          </div>
          <div className="timeline-card__logo" aria-hidden="true">
            {item.logoSrc ? (
              <img
                src={item.logoSrc}
                alt={item.logoAlt ?? `${item.company} logo`}
                style={logoImageStyle}
              />
            ) : (
              <span>{item.logoPlaceholder ?? 'Logo'}</span>
            )}
          </div>
        </div>
        <p className="timeline-card__description">{item.description}</p>
      </div>
    </article>
  );
}
