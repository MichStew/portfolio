type MetadataBandProps = {
  education: {
    institution: string;
    degree: string;
    dateRange: string;
    location: string;
    logoSrc?: string;
    logoAlt?: string;
  };
  profile: {
    title: string;
    summary: string;
    recognitions: string[];
  };
  skills: {
    technical: string[];
    commercial: string[];
  };
};

export default function MetadataBand({
  education,
  profile,
  skills,
}: MetadataBandProps) {
  return (
    <section className="meta-band" aria-label="Education and skills">
      <div className="meta-band__inner" data-reveal>
        <div className="meta-band__block meta-band__block--education">
          <p className="meta-band__label">Education</p>
          <h2 className="meta-band__title">{education.institution}</h2>
          <p className="meta-band__detail">{education.degree}</p>
          <p className="meta-band__detail">
            {education.dateRange} · {education.location}
          </p>
          {education.logoSrc ? (
            <div className="meta-band__logo">
              <img src={education.logoSrc} alt={education.logoAlt ?? ''} />
            </div>
          ) : null}
        </div>

        <div className="meta-band__block">
          <p className="meta-band__label">Profile</p>
          <h2 className="meta-band__title">{profile.title}</h2>
          <p className="meta-band__detail">{profile.summary}</p>
          <ul className="meta-band__recognitions">
            {profile.recognitions.map((recognition) => (
              <li key={recognition}>{recognition}</li>
            ))}
          </ul>
        </div>

        <div className="meta-band__block">
          <p className="meta-band__label">Core Strengths</p>
          <div className="meta-band__skill-group">
            <p className="meta-band__subhead">Technical</p>
            <ul className="meta-band__skills">
              {skills.technical.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="meta-band__skill-group">
            <p className="meta-band__subhead">Commercial</p>
            <ul className="meta-band__skills">
              {skills.commercial.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
