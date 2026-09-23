export type Language = 'en' | 'be' | 'ru' | 'es' | 'pt' | 'de' | 'fr' | 'tr';

export type Translations = {
  app: {
    title: string;
    description: string;
    loading: string;
    failedToLoad: string;
    noResults: string;
    distroGridTitle: string;
    close: string;
    filters: {
      title: string;
      clearAll: string;
      bestOnly: string;
    };
    error: string;
    toggles: {
      language: string;
      theme: string;
    };
  };
  tags: Record<string, {
    name: string;
    entries: Record<string, { name: string; description: string }>;
  }>;
  distros: Record<string, {
    description: string;
    userbasePostfix?: string;
    highlights?: string[];
  }>;
  pages: {
    distro: {
      backLink: string;
      recommended: string;
      popular: string;
      hiddenGem: string;
      inDevelopment: string;
      features: string;
      screenshots: string;
      findMyDistro: string;
    };
    blog: {
      navLabel: string;
      title: string;
      publishedOn: string;
      pinned: string;
      readMore: string;
      backToBlog: string;
      backToPicker: string;
      loading: string;
      empty: string;
      views: string;
      likes: string;
      like: string;
      liked: string;
    };
  };
  modals: {
    distro: {
      basedOn: string;
      desktop: string;
      desktops: string;
      easeOfUse: string;
      userbase: string;
      secureBoot: string;
      swapStrategy: string;
      yes: string;
      no: string;
      swap: {
        'swap-partition': string;
        'swap-file': string;
        zram: string;
        none: string;
        'zram-and-swap-file': string;
        'zram-and-swap-partition': string;
      };
      visitWebsite: string;
      andMore: string;
      independent: string;
    };
    gallery: {
      noImages: string;
      previousImage: string;
      nextImage: string;
    };
    quiz: {
      title: string;
      goBack: string;
      yourRecommendation: string;
      restartTest: string;
      question: {
        text: string;
        answers: Array<{
          text: string;
          result?: string;
          question?: {
            text: string;
            answers: Array<{
              text: string;
              result: string;
            }>;
          };
        }>;
      };
    };
    share: {
      title: string;
      text: string;
      copyLink: string;
      copied: string;
    };
  };
};
