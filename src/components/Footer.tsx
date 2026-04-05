type FooterProps = {
  name: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  headshotSrc?: string;
  headshotAlt?: string;
};

export default function Footer({
  name,
  email,
  phone,
  githubUrl,
  linkedinUrl,
  resumeUrl,
  headshotSrc,
  headshotAlt,
}: FooterProps) {
  const year = new Date().getFullYear();
  const phoneHref = `tel:+1${phone.replace(/\D/g, '')}`;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner" data-reveal>
        <div className="site-footer__contact">
          <div className="site-footer__lead">
            <p className="site-footer__eyebrow">Get in touch</p>
            <a className="site-footer__email" href={`mailto:${email}`}>
              {email}
            </a>
            <a className="site-footer__phone" href={phoneHref}>
              {phone}
            </a>
          </div>
        </div>
        {headshotSrc ? (
          <div className="site-footer__portrait">
            <img src={headshotSrc} alt={headshotAlt ?? name} />
          </div>
        ) : null}
        <div className="site-footer__links">
          <a href={linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
        </div>
        <p className="site-footer__credit">
          {name} · {year}
        </p>
      </div>
    </footer>
  );
}
