import { useEffect, useState, type MouseEvent } from 'react';

type NavItem = {
  id: string;
  label: string;
};

type PageTab = {
  id: string;
  label: string;
};

type HeaderProps = {
  name: string;
  navItems: readonly NavItem[];
  activeSection: string;
  linkedinUrl: string;
  resumeUrl: string;
  reducedMotion: boolean;
  pageTabs: readonly PageTab[];
  activePage: string;
  onPageChange: (pageId: string) => void;
  brandTargetId: string;
};

export default function Header({
  name,
  navItems,
  activeSection,
  linkedinUrl,
  resumeUrl,
  reducedMotion,
  pageTabs,
  activePage,
  onPageChange,
  brandTargetId,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);

    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const scrollToId = (id: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    setMenuOpen(false);
  };

  const handleScrollTrigger = (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    id: string,
  ) => {
    event.preventDefault();
    scrollToId(id);
  };

  const handlePageTrigger = (pageId: string) => {
    onPageChange(pageId);
    setMenuOpen(false);
  };

  return (
    <header
      className={`site-header ${scrolled ? 'is-scrolled' : ''} ${
        menuOpen ? 'is-menu-open' : ''
      }`}
    >
      <div
        className={`site-header__bar ${
          pageTabs.length > 1 ? '' : 'site-header__bar--no-page-tabs'
        }`}
      >
        <button
          type="button"
          className="site-header__brand"
          onClick={(event) => handleScrollTrigger(event, brandTargetId)}
          aria-label={`Scroll to top for ${name}`}
        >
          {name}
        </button>

        {pageTabs.length > 1 ? (
          <div className="site-header__page-tabs" aria-label="Page selection">
            {pageTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activePage === tab.id ? 'is-active' : undefined}
                onClick={() => handlePageTrigger(tab.id)}
                aria-pressed={activePage === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <nav className="site-header__nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? 'is-active' : undefined}
              onClick={(event) => handleScrollTrigger(event, item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a href={linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="site-header__resume"
          >
            Resume
          </a>
        </div>

        <button
          type="button"
          className="site-header__menu-button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="mobile-drawer" aria-hidden={!menuOpen}>
        <button
          type="button"
          className="mobile-drawer__backdrop"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
        <div className="mobile-drawer__panel" id="mobile-navigation">
          {pageTabs.length > 1 ? (
            <div className="mobile-drawer__page-tabs" aria-label="Page selection">
              {pageTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={activePage === tab.id ? 'is-active' : undefined}
                  onClick={() => handlePageTrigger(tab.id)}
                  aria-pressed={activePage === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
          <nav className="mobile-drawer__nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? 'is-active' : undefined}
                onClick={(event) => handleScrollTrigger(event, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mobile-drawer__actions">
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={resumeUrl} target="_blank" rel="noreferrer">
              Resume
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
