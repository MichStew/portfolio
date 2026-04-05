import { useEffect } from 'react';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoCard from './components/InfoCard';
import MetadataBand from './components/MetadataBand';
import ProjectCard from './components/ProjectCard';
import ResearchCard from './components/ResearchCard';
import SiteCursor from './components/SiteCursor';
import SolarSystemSection from './components/SolarSystemSection';
import ScrollProgress from './components/ScrollProgress';
import SectionShell from './components/SectionShell';
import TimelineCard from './components/TimelineCard';
import { primaryNavItems, siteContent } from './data/siteContent';
import { useActiveSection } from './hooks/useActiveSection';
import { useReducedMotion } from './hooks/useReducedMotion';

function setMetaTag(
  selector: string,
  lookupAttribute: 'name' | 'property',
  lookupValue: string,
  content: string,
) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(lookupAttribute, lookupValue);
    document.head.append(tag);
  }

  tag.setAttribute('content', content);
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const activeSection = useActiveSection(
    primaryNavItems.map((item) => item.id),
  );

  useEffect(() => {
    const shareUrl = window.location.href;
    const shareImageUrl = new URL(
      siteContent.socialPreviewImageSrc,
      window.location.origin,
    ).toString();

    document.title = siteContent.socialPreviewTitle;

    setMetaTag(
      'meta[name="description"]',
      'name',
      'description',
      siteContent.seoDescription,
    );
    setMetaTag(
      'meta[property="og:type"]',
      'property',
      'og:type',
      'website',
    );
    setMetaTag(
      'meta[property="og:site_name"]',
      'property',
      'og:site_name',
      siteContent.name,
    );
    setMetaTag(
      'meta[property="og:title"]',
      'property',
      'og:title',
      siteContent.socialPreviewTitle,
    );
    setMetaTag(
      'meta[property="og:description"]',
      'property',
      'og:description',
      siteContent.seoDescription,
    );
    setMetaTag(
      'meta[property="og:url"]',
      'property',
      'og:url',
      shareUrl,
    );
    setMetaTag(
      'meta[property="og:image"]',
      'property',
      'og:image',
      shareImageUrl,
    );
    setMetaTag(
      'meta[property="og:image:alt"]',
      'property',
      'og:image:alt',
      siteContent.socialPreviewImageAlt,
    );
    setMetaTag(
      'meta[name="twitter:card"]',
      'name',
      'twitter:card',
      'summary_large_image',
    );
    setMetaTag(
      'meta[name="twitter:title"]',
      'name',
      'twitter:title',
      siteContent.socialPreviewTitle,
    );
    setMetaTag(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      siteContent.seoDescription,
    );
    setMetaTag(
      'meta[name="twitter:image"]',
      'name',
      'twitter:image',
      shareImageUrl,
    );
    setMetaTag(
      'meta[name="twitter:image:alt"]',
      'name',
      'twitter:image:alt',
      siteContent.socialPreviewImageAlt,
    );

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.append(canonicalLink);
    }

    canonicalLink.setAttribute('href', shareUrl);
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    if (elements.length === 0) {
      return;
    }

    if (reducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className="app-shell">
      <SiteCursor reducedMotion={reducedMotion} />
      <ScrollProgress />
      <Header
        name={siteContent.name}
        navItems={primaryNavItems}
        activeSection={activeSection}
        linkedinUrl={siteContent.linkedinUrl}
        resumeUrl={siteContent.resumeUrl}
        reducedMotion={reducedMotion}
        pageTabs={[]}
        activePage="portfolio"
        onPageChange={() => {}}
        brandTargetId="top"
      />

      <main>
        <Hero name={siteContent.name} reducedMotion={reducedMotion} />

        <SectionShell
          id="work-experience"
          index="01"
          title="Work Experience"
        >
          <div className="timeline">
            {siteContent.workExperience.map((item, index) => (
              <TimelineCard
                key={item.id}
                item={item}
                delay={index * 90}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="research-experience"
          index="02"
          title="Research Experience"
        >
          <div className="research-section">
            <div className="research-grid">
              {siteContent.researchExperience.map((item, index) => (
                <ResearchCard
                  key={item.id}
                  item={item}
                  delay={index * 100}
                />
              ))}
            </div>
            <div className="research-subsection">
              <div className="research-subsection__header" data-reveal>
                <h3 className="research-subsection__title">Continuing Research</h3>
              </div>
              <div className="research-grid research-grid--single">
                {siteContent.researchPapers.map((item, index) => (
                  <ResearchCard
                    key={item.id}
                    item={item}
                    delay={120 + index * 100}
                  />
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="projects"
          index="03"
          title="Projects"
        >
          <div className="projects-grid">
            {siteContent.projects.map((item, index) => (
              <ProjectCard
                key={item.id}
                item={item}
                delay={index * 90}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="extra-curriculars"
          index="04"
          title="Extra-Curriculars"
        >
          <div className="info-grid info-grid--stacked">
            {siteContent.extracurriculars.map((item, index) => (
              <InfoCard
                key={item.id}
                title={item.title}
                organization={item.organization}
                dateRange={item.dateRange}
                location={item.location}
                description={item.description}
                delay={index * 90}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="personal-life"
          index="05"
          title="Personal Life"
        >
          <div className="info-grid info-grid--personal">
            {siteContent.personalLife.map((item, index) => (
              <InfoCard
                key={item.id}
                title={item.title}
                description={item.description}
                imagePlaceholders={item.imagePlaceholders}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                imageCaption={item.imageCaption}
                variant="personal"
                delay={index * 80}
              />
            ))}
          </div>
        </SectionShell>
      </main>

      <MetadataBand
        education={siteContent.education}
        profile={siteContent.profile}
        skills={siteContent.skills}
      />
      <Footer
        name={siteContent.name}
        email={siteContent.email}
        phone={siteContent.phone}
        githubUrl={siteContent.githubUrl}
        linkedinUrl={siteContent.linkedinUrl}
        resumeUrl={siteContent.resumeUrl}
        headshotSrc={siteContent.headshotSrc}
        headshotAlt={siteContent.headshotAlt}
      />
      <SolarSystemSection
        question={siteContent.dayQuestion}
        reducedMotion={reducedMotion}
      />
      <BackToTop reducedMotion={reducedMotion} />
    </div>
  );
}
