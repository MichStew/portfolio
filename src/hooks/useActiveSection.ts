import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState('');
  const sectionKey = sectionIds.join('|');

  useEffect(() => {
    const sections = sectionKey
      .split('|')
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries.length > 0) {
          const nextId = visibleEntries[0].target.id;
          setActiveSection((current) => (current === nextId ? current : nextId));
          return;
        }

        if (window.scrollY < window.innerHeight * 0.45) {
          setActiveSection('');
        }
      },
      {
        threshold: [0.24, 0.4, 0.58, 0.72],
        rootMargin: '-22% 0px -48% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionKey]);

  return activeSection;
}
