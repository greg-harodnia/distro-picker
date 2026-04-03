export type Language = 'en' | 'be' | 'uk' | 'pl' | 'ru' | 'zh' | 'ja' | 'vi' | 'ko' | 'th' | 'es' | 'pt' | 'tr' | 'de' | 'fr' | 'it' | 'id';

export type Translations = {
  app: {
    title: string;
    loadingDistributions: string;
    failedToLoad: string;
    noResults: string;
    quickQuiz: string;
    startQuiz: string;
  };
  filters: {
    title: string;
    clearAll: string;
  };
  tags: Record<string, { name: string; description: string }>;
  distros: {
    recommended: string;
    details: string;
    info: string;
    andMore: string;
    descriptions: Record<string, string>;
    userbases: Record<string, string>;
  };
  panel: {
    basedOn: string;
    desktop: string;
    desktops: string;
    beginnerFriendly: string;
    userbase: string;
    visitWebsite: string;
  };
  modal: {
    additionalInfo: string;
    close: string;
    gallery: {
      noImages: string;
      previousImage: string;
      nextImage: string;
    };
    additionalContent: Record<string, string>;
  };
  quiz: {
    title: string;
    goBack: string;
    yourRecommendation: string;
    restartTest: string;
    close: string;
    questions: Record<string, string>;
    results: Record<string, string>;
  };
  errors: {
    somethingWentWrong: string;
    tryAgainLater: string;
    tryAgain: string;
  };
  loading: {
    loading: string;
  };
  theme: {
    toggle: string;
  };
  language: {
    toggle: string;
  };
  independent: string;
};
