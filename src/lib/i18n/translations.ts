export type Language = 'en' | 'be';

export const translations = {
  app: {
    title: {
      en: 'Linux Distro Picker',
      be: 'Выбарнік Linux дыстрыбуцыі',
    },
    loadingDistributions: {
      en: 'Loading distributions...',
      be: 'Ладаваньне дыстрыбуцый...',
    },
    failedToLoad: {
      en: 'Failed to Load Data',
      be: 'Не ўдалося заладаваць даныя',
    },
    noResults: {
      en: 'No distributions match your selected criteria.',
      be: 'Няма дыстрыбутываў, якія адпавядаюць выбраным крытарам.',
    },
    quickQuiz: {
      en: 'Quick Quiz',
      be: 'Хуткі тэст',
    },
    startQuiz: {
      en: 'Start Quick Quiz',
      be: 'Пачаць хуткі тэст',
    },
  },
  filters: {
    title: {
      en: 'Filter by Tags',
      be: 'Фільтраваньне водле тэґаў',
    },
    clearAll: {
      en: 'Clear all filters',
      be: 'Скінуць усе фільтры',
    },
  },
  tags: {
    'gaming-ready': {
      name: {
        en: 'Gaming Ready',
        be: 'Гульнявая',
      },
      description: {
        en: 'Optimized for gaming with good driver support and special apps preinstalled',
        be: 'Аптымізаваная для гульняў з добрай падпорай драйвэраў і спэцыяльнымі перадусталяванымі праґрамамі',
      },
    },
    'lightweight': {
      name: {
        en: 'Lightweight',
        be: 'Лёгкая на рэсурсы',
      },
      description: {
        en: 'Lighter than most of the popular distros to support older hardware',
        be: 'Лёгчэйшая на рэсурсы, ніж большасьць папулярных дыстрыбуцый, каб падпіраць старэйшае апаратнае забясьпечаньне',
      },
    },
    'traditional': {
      name: {
        en: 'Traditional',
        be: 'Традыцыйная',
      },
      description: {
        en: 'Standard release model with periodic version updates',
        be: 'Стандартная мадэль выпуску з перыядычнымі абнавеньнямі і зьменнай сыстэмай',
      },
    },
    'rolling-release': {
      name: {
        en: 'Rolling Release',
        be: 'Няспынна абнаўляльная', // або "плаўныя выданьні"
      },
      description: {
        en: 'Continuously updated distribution with the latest software versions',
        be: 'Няспынна абнаўляльная дыстрыбуцыя з найноўшымі вэрсыямі праґрамнага забясьпечаньня',
      },
    },
    'immutable': {
      name: {
        en: 'Immutable',
        be: 'Нязьменная',
      },
      description: {
        en: 'Distribution with an immutable core and atomic updates',
        be: 'Дыстрыбуцыя зь нязьменным ядром і атамарнымі абнавеньнямі',
      },
    },
  },
  distros: {
    recommended: {
      en: 'Recommended Distros',
      be: 'Рэкамэндаваныя дыстрыбуцыі',
    },
    details: {
      en: 'Distribution Details',
      be: 'Інфармацыя аб дыстрыбуцыі',
    },
    info: {
      en: 'Additional information',
      be: 'Дадатковыя зьвесткі',
    },
    descriptions: {
      mint: {
        en: "Been here for quite a while. Community-driven, stable and familiar. The main edition features the Cinnamon desktop environment. A general-purpose distro, can be used for gaming too, but it doesn't come with special tools pre-installed. Works well even on 10-15 years old computers (with an SSD). If your computer has an HDD or just 2Gb of RAM (potentially Windows 7 era), use the Xfce version of Linux Mint — it has similar hardware requirements to Linux Lite and Xubuntu.",
        be: "Існуе ўжо даўно. Супольнасная, стабільная й звыклая. Галоўнае выданьне зьяўляе ґрафічнае асяродзьдзе Cinnamon. Агульна-прыдатная дыстрыбуцыя, можа выкарыстоўвацца й для гульняў, але яна не пастаўляе спэцыяльных для гэтага праґрам з заводу. Добра функцыянуе нават на кампутарах 10-15-гадовай даўніны (з SSD). Калі ваш кампутар мае HDD або толькі 2ГБ апэратыўнае памяці (мажліва з часоў Windows 7), выберыце выданьне Linux Mint з Xfce — яно мае блізкія апаратныя вымаганьні да Linux Lite і Xubuntu.",
      },
      kubuntu: {
        en: "A well-established and trusted distro, based on Ubuntu with the KDE Plasma desktop environment. It is backed by a huge corporation, Canonical. Similar hardware requirements to Linux Mint.",
        be: "Добра ўґрунтаваная і надзейная дыстрыбуцыя, закладзеная на Ubuntu з ґрафічным асяродзьдзем KDE Plasma. Падпёртая вялікай карпарацыяй — Cannonical. Блізкія апаратныя вымаганьні да Linux Mint.",
      },
      zorin: {
        en: "A polished distro focused on visual appeal, featuring the Gnome desktop environment with 3D animations and various out-of-the-box layouts, including MacOS- and Windows-like ones. Similar hardware requirements to Linux Mint.",
        be: "Выкшталчаная дыстрыбуцыя з увагай на візуальную панаднасьць, якая зьяўляе ґрафічнае асяродзьдзе Gmome з 3D анімацыямі і рознымі гатовымі ўкладамі, сярод якіх ёсьць падобныя да MacOS і Windows. Блізкія апаратныя вымаганьні да Linux Mint.",
      },
      popos: {
        en: "Built by System76, featuring the COSMIC desktop environment (MacOS-like) and focusing on usability. Has an Nvidia version available. Good for creative work and productivity. Has tiling windows support. Not an ideal choice for gaming.",
        be: "Ствароная System76, зьяўляе ґрафічнае асяродзьдзе COSMIC (падобнае да MacOS) і надае ўвагу зручнасьці карыстаньня. Ёсьць вэрсыя для Nvidia. Добрая для творчай работы і прадукцыйнасьці. Забясьпечвае кафляваньне вокнаў. Не ідэальны выбар для гульняў.",
      },
      'kde-linux': {
        en: "A Linux distribution built by KDE. Immutable (using Btrfs snapshots), simple and fast. Yet to be released.",
        be: "дыстрыбуцыя Linux, ствароная KDE. Незьменная (з дапамогай Btrfs здымкаў), простая і хуткая. Яшчэ не выпушчаная.",
      },
      fedora: {
        en: "Perfect for developers. Comes in many editions/spins, including one with the KDE Plasma desktop environment. Choose COSMIC for MacOS look. Fedora is a semi-rolling distribution, making it both stable and up-to-date. Nvidia drivers installation may not be straightforward.",
        be: "Ідэальная для разробнікаў. Пастаўляецца зы многімі выданьнямі/варыянтамі, сярод якіх ёсьць адно з ґрафічным асяродзьдзем KDE Plasma. Выберыце COSMIC для выгляду MacOS. Fedora ёсьць паўняспынна абнаўляльная дыстрыбуцыя, што робіць яе й стабільнай, і актуальнай. Усталяваньне драйвэраў Nvidia можа быць не такім простым.",
      },
      cachyos: {
        en: "An Arch-based rolling distribution optimized for performance, featuring the KDE Plasma desktop environment (among many others). Though not initially gaming-ready, it can be easily set up for gaming by installing a single meta package (cachyos-gaming-meta). The handheld edition, on the other hand, is gaming-ready. A very few bloat. Perfect for tech enthusiasts, who want to have full control over their system. Requires some terminal experience. Similar to EndeavourOS, but it is more preconfigured. However, if you prefer a more barebones Arch experience with fewer customizations, choose EndeavourOS.",
        be: "Дыстрыбуцыя зь няспыннымі абнавеньнямі, закладзеная на Arch і аптымізаваная для прадукцыйнасьці, зьяўляе ґрафічнае асяродзьдзе KDE Plasma (сярод многіх іншых). Хоць і не гатовая для гульняў з заводу, яна можа быць лёгка наладжаная для іх, усталяваўшы адзіны мэта-пакет (cachyos-gaming-meta). Выданьне для партатыўных кансоляў, з іншага боку, гатовае для гульняў. Вельмі мала заграмаджэньня. Ідэальная для тэхнічных аматараў, якія хочуць мець поўны кантроль над сваёй сыстэмай. Вымагае трохі досьведу з тэрміналам. Падобная да EndeavourOS, але болей перадналаджаная. Аднак, калі вы аддаяце перавагу чыстаму Arch бяз лішніх зьмен, выбірайце EndeavourOS.",
      },
      steamos: {
        en: "An official gaming OS from Valve that powers Steam Deck, Steam Machine and other devices like Lenovo Legion Go. Immutable (using its own RAUC and desync technologies), user-friendly and optimized for gaming. Features the KDE Plasma desktop environment. Released for handhelds, but yet to be released for desktops.",
        be: "Афіцыйная гульнявая АС ад Valve, каторая жывіць Steam Deck, Steam Machine і іншыя прылады, як Lenovo Legion Go. Нязьменная (з дапамогай сваіх уласных тэхналёгій RAUC і desync), простая ў карыстаньні і аптымізаваная для гульняў. Зьяўляе ґрафічнае асяродзьдзе KDE Plasma. Выпушчаная для партатыўных кансоляў, але яшчэ не для ПК.",
      },
      bazzite: {
        en: "A gaming immutable (using OSTree) Linux distribution, perfect for both PCs and handhelds (has a special edition for them). A SteamOS alternative. Much more user-friendly than CachyOS (but more bloated). Take a survey on the official website to see if your hardware supports the Linux gaming. If you want your system to be mutable (e.g. edit system files), choose Nobara instead.",
        be: "Нязьменная (з дапамогай OSTree) гульнявая Linux дыстрыбуцыя, ідэальная для ПК і партатыўных кансоляў (мае асобнае выданьне для іх). Альтэрнатыва SteamOS. Значна болей простая ў карыстаньні, ніж CachyOS (але болей заграмаджоная). Прайдзіце апытаньне на афіцыйным сайце, каб даведацца, ці вашае апаратнае забясьпечаньне падпірае Linux гульні. Калі вы хочаце, каб вашая сыстэма была зьменнай (нп., рэдагаваць сыстэмныя файлы), абярыце Nobara.",
      },
      lubuntu: {
        en: "A user-friendly lightweight Ubuntu variant, perfect for computers produced between 2004 and 2011 designed for Windows XP/Vista with 1 or 2Gb of RAM.",
        be: "Лёгкі на рэсурсы й просты для карыстаньня варыянт Ubuntu, ідэальны для кампутараў, выпрадукаваных паміж 2004 і 2001 і прызначаных для Windows XP/Vista з 1 ці 2ГБ апэратыўнае памяці.",
      },
      antiX: {
        en: "Ultra light distro, requires as minimum as 256Mb of RAM to run (more to run apps smoothly). Suitable for ancient computers designed for Windows XP.",
        be: "Надзвычай лёгкая дыстрыбуцыя, вымагае ўсяго 256МБ апэратыўнае памяці (болей для плаўнага запуску праґрам). Прыдатная для антычных кампутараў, прызначаных для Windows XP.",
      },
    },
    userbases: {
      mint: {
        en: "~3-5 million",
        be: "~3-5 мільёнаў",
      },
      kubuntu: {
        en: "~1 million",
        be: "~1 мільён",
      },
      zorin: {
        en: "~2 million",
        be: "~2 мільёны",
      },
      popos: {
        en: "~1-2 million",
        be: "~1-2 мільёны",
      },
      fedora: {
        en: "~2 million",
        be: "~2 мільёны",
      },
      cachyos: {
        en: "~500k (but very fast growing)",
        be: "~500k (але вельмі хутка расьце)",
      },
      steamos: {
        en: "20+ million (on Steam Deck)",
        be: "20+ мільёнаў (на Steam Deck)",
      },
      bazzite: {
        en: "~70k",
        be: "~70k",
      },
      lubuntu: {
        en: "~400k",
        be: "~400k",
      },
      antiX: {
        en: "~100k",
        be: "~100k",
      },
    },
    andMore: {
      en: ", etc.",
      be: " і іншыя",
    },
  },
  panel: {
    basedOn: {
      en: 'Based on:',
      be: 'Закладзеная на:',
    },
    desktop: {
      en: 'Desktop:',
      be: 'Асяродзьдзе:',
    },
    desktops: {
      en: 'Desktops:',
      be: 'Асяродзьдзі:',
    },
    beginnerFriendly: {
      en: 'Beginner friendly:',
      be: 'Для пачаткоўцаў:',
    },
    userbase: {
      en: 'Userbase:',
      be: 'Аўдыторыя:',
    },
    visitWebsite: {
      en: 'Visit Website',
      be: 'Наведаць сайт',
    },
  },
  modal: {
    additionalInfo: {
      en: 'Additional Information',
      be: 'Дадатковая інфармацыя',
    },
    close: {
      en: 'Close',
      be: 'Закрыць',
    },
    gallery: {
      noImages: {
        en: 'No images',
        be: 'Няма выяў',
      },
      previousImage: {
        en: 'Previous image',
        be: 'Папярэдняя выява',
      },
      nextImage: {
        en: 'Next image',
        be: 'Наступная выява',
      },
      closeGallery: {
        en: 'Close gallery',
        be: 'Закрыць ґалерэю',
      },
    },
    additionalContent: {
      intro: {
        en: "This app doesn't include other popular distributions (<i>like, Arch Linux, Ubuntu, Debian, openSUSE, NixOS, Gentoo, Void, EndeavourOS, MX Linux, Nobara, Omarchy, Manjaro, elementaryOS, Solus, and so on</i>), enterprise-level distributions (<i>like, Red Hat, AlmaLinux</i>) and niche distributions (<i>like, Kali, Alpine</i>) as it's intended for complete beginners and aims to simplify the choice.",
        be: "Гэтая аплікацыя не зьмяшчае ўсіх папулярных дыстрыбуцый (<i>як, Arch Linux, Ubuntu, Debian, openSUSE, NixOS, Gentoo, Void, EndeavourOS, MX Linux, Nobara, Omarchy, Manjaro, elementaryOS, Solus і г.д.</i>), карпаратыўных дыстрыбуцый (<i>як, Red Hat, AlmaLinux</i>) і спэцыялізаваных дыстрыбуцый (<i>як, Kali, Alpine</i>), бо яна прызначаная для пачаткоўцаў і мае на мэце спрасьціць выбар.",
      },
      installationTitle: {
        en: "Hints for installation and dual-booting:",
        be: "Парады для ўсталяваньня і сумяшчэньня:",
      },
      hint1: {
        en: "Install Linux on a separate disk as Windows updates may break the Linux installation.",
        be: "Усталюйце Linux на асобным дыску, бо абнавеньні Windows могуць пашкодзіць усталяваньню Linux.",
      },
      hint2: {
        en: "Don't use Windows tools to resize partitions on the disk where Linux is installed for the same reason.",
        be: "Не выкарыстоўвайце прылады Windows для зьмяненьня памеру разьдзелаў на дыску, дзе ўсталяваны Linux, з тае самае прычыны.",
      },
      hint3: {
        en: "Don't forget to create a swap file/partition, especially on systems with limited RAM.",
        be: "Не забудзьце стварыць файл/разьдзел swap, асабліва на сыстэмах зь невялікай колькасьцю апэратыўнае памяці.",
      },
      softwareTitle: {
        en: "Software that I recommend.",
        be: "Рэкамэндаваныя праґрамы.",
      },
      browsers: {
        en: "Browsers: Brave, Helium, Zen.",
        be: "Браўзэры: Brave, Helium, Zen.",
      },
      office: {
        en: "Office: OnlyOffice, LibreOffice.",
        be: "Офіс: OnlyOffice, LibreOffice.",
      },
      torrent: {
        en: "Torrent client: qBittorrent.",
        be: "Торэнт-кліент: qBittorrent.",
      },
      diskAnalyzer: {
        en: "Disk analyzer: Filelight (KDE/Qt), Baobab (Gnome/GTK), gdu (command-line written in Rust).",
        be: "Аналізатар дыска: Filelight (KDE/Qt), Baobab (Gnome/GTK), gdu (тэрмінальная праґрама, напісаная на Rust).",
      },
      localAI: {
        en: "Local AI: LM Studio (I recommend Mistral model).",
        be: "Лакальны ШІ: LM Studio (рэкамэндую мадэль Mistral).",
      },
      softwareSupport: {
        en: "Extended software support: Flatpak (Bazaar or your software center), Distrobox (DistroShelf).",
        be: "Пашыранае праґрамнае забясьпечаньне: Flatpak (Bazaar ці ваш цэнтр ПЗ), Distrobox (DistroShelf).",
      },
      windowsApps: {
        en: "Running Windows apps: Bottles, Winboat.",
        be: "Запуск праґрам Windows: Bottles, Winboat.",
      },
      cleaners: {
        en: "Cleaners: BleachBit, Stacer (not needed for immutable systems).",
        be: "Ачысьнікі: BleachBit, Stacer (не патрэбны для нязьменных сыстэм).",
      },
      backup: {
        en: "System Backup: Timeshift (not needed for immutable systems).",
        be: "Рэзэрвовае капіяваньне: Timeshift (не патрэбны для нязьменных сыстэм).",
      },
      nvidia: {
        en: "Nvidia Shadow Play alternative: GPU Screen Recorder.",
        be: "Альтэрнатыва для Nvidia Shadow Play: GPU Screen Recorder.",
      },
      photoshop: {
        en: "Photoshop alternatives: Photoshop online, Photopea, GIMP, Krita, Affinity (via Bottles), Canva (for simple tasks).",
        be: "Альтэрнатывы для Photoshop: Photoshop online, Photopea, GIMP, Krita, Affinity (праз Bottles), Canva (для простых задач).",
      },
      lightroom: {
        en: "Lightroom alternative: Darktable.",
        be: "Альтэрнатыва для Lightroom: Darktable.",
      },
      illustrator: {
        en: "Illustrator alternative: Inkscape.",
        be: "Альтэрнатыва для Illustrator: Inkscape.",
      },
      premier: {
        en: "Premier Pro alternative: DaVinci Resolve.",
        be: "Альтэрнатыва для Premier Pro: DaVinci Resolve.",
      },
      ventoy: {
        en: "<i>Ventoy</i> for creating a bootable USB drive with multiple Linux distributions.",
        be: "<i>Ventoy</i> для стварэньня запусковай флэшкі з колькімі дыстрыбуцыямі Linux.",
      },
    },
  },
  quiz: {
    title: {
      en: 'Quick Quiz',
      be: 'Хуткі тэст',
    },
    goBack: {
      en: 'Go back',
      be: 'Назад',
    },
    yourRecommendation: {
      en: 'Your Recommendation',
      be: 'Вашая рэкамендацыя',
    },
    restartTest: {
      en: 'Restart Test',
      be: 'Пачаць зноў',
    },
    close: {
      en: 'Close',
      be: 'Закрыць',
    },
    questions: {
      howToUse: {
        en: 'How would you like to use the distribution?',
        be: 'Як вы хочаце выкарыстоўваць дыстрыбуцыю?',
      },
      regularUser: {
        en: 'Just a regular user',
        be: 'Звычайны ўжывец',
      },
      gaming: {
        en: 'I want my distro to be preconfigured for gaming / I want to use it on a handheld',
        be: 'Хачу, каб дыстрыбуцыя была перадналаджаная для гульняў / хачу выкарыстоўваць яе на партатыўнай кансолі',
      },
      developer: {
        en: 'I want to develop on it',
        be: 'Хочу разрабляць на ёй',
      },
      enthusiast: {
        en: "I'm a tech enthusiast who wants a distro that's as flexible and unbloated as possible. I want to have full control over my system, and I enjoy tweaking and using the terminal.",
        be: 'Я тэхнічны аматар, які хоча як мага болей гнуткую і незаграмаджоную дыстрыбуцыю. Хачу мець поўны кантроль над сыстэмай, мне падабаецца наладжваць і карыстацца тэрміналам.',
      },
      recover: {
        en: 'I want to recover my old PC with it',
        be: 'Хочу ажывіць свой стары ПК',
      },
      whichLayout: {
        en: 'Which layout do you prefer?',
        be: 'Які інтэрфэйс вам болей даспадобы?',
      },
      windowsLike: {
        en: 'Windows-like',
        be: 'Як Windows',
      },
      macosLike: {
        en: 'MacOS-like',
        be: 'Як MacOS',
      },
      canEditSystem: {
        en: 'Do you want to be able to edit system files?',
        be: 'Ці вы хочаце мець магчымасьць рэдагаваць сыстэмныя файлы?',
      },
      yes: {
        en: 'Yes',
        be: 'Так',
      },
      dontCare: {
        en: "I don't care about it",
        be: 'Мне ўсё адно',
      },
      howOld: {
        en: 'How old is your computer?',
        be: 'Колькі гадоў вашаму камп\'ютару?',
      },
      sluggish: {
        en: 'Not extremely old, but it feels sluggish',
        be: 'Ня вельмі стары, але функцыянуе марудна',
      },
      before2011: {
        en: 'It was produced before 2011',
        be: 'Выпрудакаваны да 2011 года',
      },
      ancient: {
        en: 'It is truly ancient (2004 or older)',
        be: 'Ен сапраўды антычны (2004 ці старэй)',
      },
    },
    results: {
      regularWindows: {
        en: 'Linux Mint, Kubuntu, or Zorin OS—depending on which design you like more.',
        be: 'Linux Mint, Kubuntu ці Zorin OS - у залежнасьці ад таго, які дызайн вам болей даспадобы.',
      },
      regularMacos: {
        en: "Pop!_OS. If you would like to be able to easily switch between different layouts, go with Zorin OS.",
        be: 'Pop!_OS. Калі вы хочаце мець магчымасьць лёгкага пералучэньня паміж рознымі ўкладамі, абярыце Zorin OS.',
      },
      gamingYes: {
        en: "Nobara. With its mutable system, you'll be able to tweak system files and install any packages you want. If you're comfortable using the terminal, you can also go with CachyOS.",
        be: 'Nobara. З яе зьменнай сыстэмай вы зможаце рэдагаваць сыстэмныя файлы і усталёўваць усякія пакеты. Калі вам зручна карыстацца тэрміналам, можаце таксама выбраць CachyOS.',
      },
      gamingNo: {
        en: "Bazzite. The distribution is available for both PCs and handhelds. You can also go with SteamOS if it supports your handheld (it doesn't officially support PCs yet). CachyOS is the third option for those who enjoy using the terminal.",
        be: 'Bazzite. Гэтая дыстрыбутыцыя даступная для ПК і партатыўных кансоляў. Таксама можаце выбраць SteamOS, калі яна падпірае вашую кансоль (падпоры ПК пакуль няма). CachyOS гэта трэці варыянт для тых, якія любяць карыстацца тэрміналам.',
      },
      developer: {
        en: "Fedora is your ideal choice. It's both stable and offers up-to-date software. Plus, you can choose from various desktop environments to suit your preferences. That said, distros like Linux Mint, Kubuntu, Zorin OS, Pop!_OS, or CachyOS are also viable options.",
        be: 'Fedora гэта ваш ідэальны выбар. Яна й стабільная, і мае актуальнае ПЗ. Да таго ж вы можаце выбраць сярод розных ґрафічных асяродзьдзяў. Але Linux Mint, Kubuntu, Zorin OS, Pop!_OS ці CachyOS таксама практычныя варыянты.',
      },
      enthusiast: {
        en: "Sounds like CachyOS was made for you. Or, if you want something even closer to barebones Arch, EndeavourOS is worth checking out.",
        be: 'Здаецца, CachyOS ствароная для вас. Ці, калі вы хочаце нешта бліжэйшае да голага Arch, варта паспрабаваць EndeavourOS.',
      },
      oldSluggish: {
        en: 'Linux Mint Xfce',
        be: 'Linux Mint Xfce',
      },
      old2011: {
        en: 'Lubuntu',
        be: 'Lubuntu',
      },
      oldAncient: {
        en: 'AntiX',
        be: 'AntiX',
      },
    },
  },
  errors: {
    somethingWentWrong: {
      en: 'Something went wrong',
      be: 'Нешта пайшло ня так',
    },
    tryAgainLater: {
      en: 'Please try again later.',
      be: 'Паспрабуйце позьней.',
    },
    tryAgain: {
      en: 'Try Again',
      be: 'Паспрабаваць яшчэ раз',
    },
  },
  loading: {
    loading: {
      en: 'Loading...',
      be: 'Ладаваньне...',
    },
  },
  theme: {
    toggle: {
      en: 'Toggle dark mode',
      be: 'Улучыць цёмны рэжым',
    },
  },
  language: {
    toggle: {
      en: 'Change language',
      be: 'Зьмяніць мову',
    },
  },
};

export function getTranslation(lang: Language, path: string): string {
  const keys = path.split('.');
  let result: any = translations;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }
  
  if (result && typeof result === 'object' && lang in result) {
    return result[lang];
  }
  
  return typeof result === 'string' ? result : path;
}