import { useEffect, useState } from 'react';

type BackToTopProps = {
  reducedMotion: boolean;
};

export default function BackToTop({
  reducedMotion,
}: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 720);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
    >
      <span className="back-to-top__icon" aria-hidden="true" />
      <span className="back-to-top__label">Top</span>
    </button>
  );
}
