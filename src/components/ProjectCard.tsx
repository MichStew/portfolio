import type { CSSProperties } from 'react';
import type { ProjectItem } from '../data/siteContent';

type ProjectCardProps = {
  item: ProjectItem;
  delay?: number;
};

function FpgaI2cDiagram() {
  return (
    <div className="project-card__diagram">
      <svg
        viewBox="0 0 360 220"
        role="img"
        aria-label="Destiny-style FPGA diagram showing a bit-banged I2C controller driving SDA and SCL"
      >
        <path
          className="project-diagram__frame"
          d="M24 18H132L142 8H218L228 18H336V202H24V18Z"
        />
        <path
          className="project-diagram__panel"
          d="M28 42H100L114 56V110L100 124H28V42Z"
        />
        <path
          className="project-diagram__panel"
          d="M258 28H332V142L320 154H258L244 140V42L258 28Z"
        />
        <circle className="project-diagram__ring" cx="180" cy="92" r="38" />
        <circle
          className="project-diagram__ring project-diagram__ring--inner"
          cx="180"
          cy="92"
          r="24"
        />
        <path
          className="project-diagram__accent"
          d="M180 42A50 50 0 0 1 230 92"
        />
        <path
          className="project-diagram__accent project-diagram__accent--faint"
          d="M130 92A50 50 0 0 1 180 42"
        />
        <path className="project-diagram__link" d="M114 83H140" />
        <path className="project-diagram__link" d="M218 92H244" />
        <path className="project-diagram__link" d="M180 130V150" />
        <path className="project-diagram__bus-guide" d="M44 160H326" />
        <path className="project-diagram__bus-guide" d="M44 188H326" />
        <polyline
          className="project-diagram__bus"
          points="44,160 78,160 78,146 94,146 94,160 110,160 110,146 126,146 126,160 142,160 142,146 158,146 158,160 174,160 174,146 190,146 190,160 326,160"
        />
        <polyline
          className="project-diagram__bus"
          points="44,174 56,174 56,188 92,188 92,174 128,174 128,188 164,188 164,174 200,174 200,188 302,188 302,174 326,174"
        />
        <circle className="project-diagram__node" cx="266" cy="62" r="2.5" />
        <circle className="project-diagram__node" cx="266" cy="82" r="2.5" />
        <circle className="project-diagram__node" cx="266" cy="102" r="2.5" />
        <circle className="project-diagram__node" cx="266" cy="122" r="2.5" />
        <text className="project-diagram__label" x="40" y="58">
          FPGA
        </text>
        <text className="project-diagram__label" x="40" y="72">
          FABRIC
        </text>
        <text className="project-diagram__small" x="40" y="90">
          GPIO DRIVE
        </text>
        <text className="project-diagram__small" x="40" y="102">
          STATE FLOW
        </text>
        <text className="project-diagram__small" x="40" y="114">
          ACK SAMPLE
        </text>
        <text
          className="project-diagram__label project-diagram__label--center"
          x="180"
          y="88"
          textAnchor="middle"
        >
          I2C
        </text>
        <text
          className="project-diagram__small project-diagram__small--center"
          x="180"
          y="103"
          textAnchor="middle"
        >
          BIT-BANGED
        </text>
        <text className="project-diagram__label" x="276" y="44">
          FLOW
        </text>
        <text className="project-diagram__small" x="276" y="66">
          START
        </text>
        <text className="project-diagram__small" x="276" y="86">
          ADDR + RW
        </text>
        <text className="project-diagram__small" x="276" y="106">
          ACK WINDOW
        </text>
        <text className="project-diagram__small" x="276" y="126">
          DATA / STOP
        </text>
        <text className="project-diagram__small" x="28" y="164">
          SCL
        </text>
        <text className="project-diagram__small" x="28" y="192">
          SDA
        </text>
        <text className="project-diagram__small" x="250" y="206">
          OPEN-DRAIN BUS MAP
        </text>
      </svg>
    </div>
  );
}

export default function ProjectCard({
  item,
  delay = 0,
}: ProjectCardProps) {
  const style = {
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;
  const isI2cPhoto = item.id === 'fpga-i2c';
  const isRiscvPhoto = item.id === 'riscv-processor';
  const mediaFrameClassName = isI2cPhoto
    ? 'project-card__media-frame project-card__media-frame--fpga'
    : isRiscvPhoto
      ? 'project-card__media-frame project-card__media-frame--riscv'
    : 'project-card__media-frame';
  const mediaImageClassName = isI2cPhoto
    ? 'project-card__media-image project-card__media-image--fpga'
    : isRiscvPhoto
      ? 'project-card__media-image project-card__media-image--riscv'
    : 'project-card__media-image';

  return (
    <article className="project-card" data-reveal style={style}>
      <div className="project-card__media">
        {item.mediaVariant === 'fpga-i2c-diagram' ? (
          <FpgaI2cDiagram />
        ) : item.imageSrc ? (
          item.mediaHref ? (
            <a
              className="project-card__media-link"
              href={item.mediaHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${item.title}`}
            >
              <img
                className={mediaImageClassName}
                src={item.imageSrc}
                alt={item.imageAlt ?? item.title}
              />
            </a>
          ) : (
            <div className={mediaFrameClassName}>
              <img
                className={mediaImageClassName}
                src={item.imageSrc}
                alt={item.imageAlt ?? item.title}
              />
            </div>
          )
        ) : (
          item.imagePlaceholders.map((placeholder) => (
            <div
              key={placeholder}
              className="project-card__media-placeholder"
              aria-hidden="true"
            >
              <span>{placeholder}</span>
            </div>
          ))
        )}
      </div>
      <div className="project-card__body">
        <div className="project-card__meta">
          <span>{item.context}</span>
          {item.dateRange ? <span>{item.dateRange}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}
