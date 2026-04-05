import type { CSSProperties } from 'react';
import type { ResearchExperienceItem } from '../data/siteContent';

type ResearchCardProps = {
  item: ResearchExperienceItem;
  delay?: number;
};

export default function ResearchCard({
  item,
  delay = 0,
}: ResearchCardProps) {
  const style = {
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;

  return (
    <article className="research-card" data-reveal style={style}>
      <div className="research-card__topline">
        <div className="research-card__context">
          <p className="research-card__affiliation">{item.affiliation}</p>
          {item.location ? (
            <span className="research-card__location">{item.location}</span>
          ) : null}
        </div>
        <span className="research-card__date">{item.dateRange}</span>
      </div>
      <h3>{item.title}</h3>
      <p className="research-card__summary">{item.summary}</p>
      <div className="research-card__focus">
        <span>Focus</span>
        <p>{item.focusArea}</p>
      </div>
      {item.imageSrc ? (
        <div className="research-card__media-frame">
          <img
            className="research-card__media-image"
            src={item.imageSrc}
            alt={item.imageAlt ?? item.title}
          />
        </div>
      ) : null}
      <p className="research-card__description">{item.description}</p>
      {item.link ? (
        <a
          className="research-card__link"
          href={item.link}
          target="_blank"
          rel="noreferrer"
        >
          View more
        </a>
      ) : null}
    </article>
  );
}
