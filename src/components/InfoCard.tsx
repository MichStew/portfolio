import type { CSSProperties } from 'react';

type InfoCardProps = {
  title: string;
  organization?: string;
  dateRange?: string;
  location?: string;
  description: string;
  imagePlaceholders?: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  variant?: 'default' | 'personal';
  delay?: number;
};

export default function InfoCard({
  title,
  organization,
  dateRange,
  location,
  description,
  imagePlaceholders,
  imageSrc,
  imageAlt,
  imageCaption,
  variant = 'default',
  delay = 0,
}: InfoCardProps) {
  const style = {
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;

  return (
    <article
      className={`info-card info-card--${variant}`}
      data-reveal
      style={style}
    >
      <div className="info-card__header">
        {(organization || location || dateRange) ? (
          <div className="info-card__meta">
            {organization ? (
              <span className="info-card__organization">{organization}</span>
            ) : null}
            {location ? <span className="info-card__location">{location}</span> : null}
            {dateRange ? <span className="info-card__date">{dateRange}</span> : null}
          </div>
        ) : null}
        <h3>{title}</h3>
      </div>
      <p className="info-card__description">{description}</p>
      {imageSrc ? (
        <div className="info-card__media">
          <div className="info-card__media-frame">
            <img
              className="info-card__media-image"
              src={imageSrc}
              alt={imageAlt ?? title}
            />
          </div>
          {imageCaption ? (
            <p className="info-card__media-caption">{imageCaption}</p>
          ) : null}
        </div>
      ) : imagePlaceholders && imagePlaceholders.length > 0 ? (
        <div className="info-card__media" aria-label="Image placeholders">
          {imagePlaceholders.map((placeholder) => (
            <div
              key={placeholder}
              className="info-card__media-placeholder"
              aria-hidden="true"
            >
              <span>{placeholder}</span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
