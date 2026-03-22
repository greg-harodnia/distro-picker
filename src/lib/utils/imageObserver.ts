let sharedObserver: IntersectionObserver | null = null;
let observedElements = new WeakMap<Element, string>();

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const src = observedElements.get(target);
            if (src) {
              target.src = src;
              sharedObserver?.unobserve(target);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01
      }
    );
  }
  return sharedObserver;
}

export function observeImage(imgElement: HTMLImageElement, src: string): () => void {
  const observer = getSharedObserver();
  observedElements.set(imgElement, src);
  observer.observe(imgElement);
  
  return () => {
    observer.unobserve(imgElement);
    observedElements.delete(imgElement);
  };
}

export function disconnectObserver(): void {
  if (sharedObserver) {
    sharedObserver.disconnect();
    sharedObserver = null;
    observedElements = new WeakMap();
  }
}
