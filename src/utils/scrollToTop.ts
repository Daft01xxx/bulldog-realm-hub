// Utility to scroll to top of page when navigating
export const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

// Alternative for instant scroll
export const scrollToTopInstant = () => {
  window.scrollTo(0, 0);
};