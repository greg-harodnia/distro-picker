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
  tags: Record<string, { name: string; description: string }>;
  distros: Record<string, {
    description: string;
    userbasePostfix?: string;
  }>;
  modals: {
    distro: {
      basedOn: string;
      desktop: string;
      desktops: string;
      beginnerFriendly: string;
      userbase: string;
      visitWebsite: string;
      andMore: string;
      independent: string;
    };
    additionalInfo: {
      title: string;
      content: string;
    };
    gallery: {
      noImages: string;
      previousImage: string;
      nextImage: string;
    };
    quiz: {
      title: string;
      start: string;
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
