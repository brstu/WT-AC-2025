// Хранилище подкастов и эпизодов в памяти
export const podcasts = [
  {
    id: 1,
    title: "TechBit - Технологии и инновации",
    author: "Алексей Петров",
    description: "Еженедельный подкаст о последних новинках в мире технологий, гаджетах и IT-индустрии. Обзоры, интервью с экспертами и прогнозы на будущее.",
    coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
    category: "Technology",
    createdAt: "2024-01-15T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Crime Junkie - Истории преступлений",
    author: "Мария Смирнова",
    description: "Увлекательные истории о реальных преступлениях, расследованиях и судебных процессах. Каждый эпизод - новое дело.",
    coverUrl: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=400",
    category: "True Crime",
    createdAt: "2023-11-20T12:30:00.000Z"
  },
  {
    id: 3,
    title: "Comedy Club Podcast",
    author: "Иван Комиков и Ко",
    description: "Лучшие стендап-выступления, импровизации и юмористические скетчи от команды профессиональных комиков.",
    coverUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400",
    category: "Comedy",
    createdAt: "2024-03-05T09:15:00.000Z"
  },
  {
    id: 4,
    title: "Здоровье 360",
    author: "Доктор Елена Волкова",
    description: "Научно обоснованные советы о здоровье, питании, спорте и психологическом благополучии от практикующего врача.",
    coverUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
    category: "Health & Wellness",
    createdAt: "2024-02-10T14:00:00.000Z"
  }
];

export const episodes = [
  // Эпизоды для TechBit (podcastId: 1)
  {
    id: 1,
    podcastId: 1,
    title: "Искусственный интеллект в 2024: Прорывы и перспективы",
    description: "Обсуждаем последние достижения в области ИИ, включая GPT-4, Midjourney и влияние на рынок труда.",
    duration: 2340,
    audioUrl: "https://example.com/audio/techbit-ep1.mp3",
    publishedAt: "2024-01-22T10:00:00.000Z",
    season: 1,
    episodeNumber: 1
  },
  {
    id: 2,
    podcastId: 1,
    title: "Квантовые компьютеры: Будущее уже здесь",
    description: "Интервью с физиком-теоретиком о том, как квантовые технологии изменят криптографию и вычисления.",
    duration: 3120,
    audioUrl: "https://example.com/audio/techbit-ep2.mp3",
    publishedAt: "2024-01-29T10:00:00.000Z",
    season: 1,
    episodeNumber: 2
  },
  {
    id: 3,
    podcastId: 1,
    title: "Обзор новых iPhone 15 Pro: Стоит ли обновляться?",
    description: "Детальный обзор флагманских смартфонов Apple, сравнение с конкурентами и практические советы.",
    duration: 1980,
    audioUrl: "https://example.com/audio/techbit-ep3.mp3",
    publishedAt: "2024-02-05T10:00:00.000Z",
    season: 1,
    episodeNumber: 3
  },
  {
    id: 4,
    podcastId: 1,
    title: "Блокчейн и криптовалюты: Что происходит на рынке",
    description: "Анализ текущего состояния криптовалютного рынка и блокчейн-технологий с экспертом по финтеху.",
    duration: 2700,
    audioUrl: "https://example.com/audio/techbit-ep4.mp3",
    publishedAt: "2024-02-12T10:00:00.000Z",
    season: 1,
    episodeNumber: 4
  },

  // Эпизоды для Crime Junkie (podcastId: 2)
  {
    id: 5,
    podcastId: 2,
    title: "Дело об исчезнувшей балерине",
    description: "История загадочного исчезновения известной балерины в 1990-х годах и попытки раскрыть дело спустя десятилетия.",
    duration: 2880,
    audioUrl: "https://example.com/audio/crime-ep1.mp3",
    publishedAt: "2023-12-01T12:30:00.000Z",
    season: 2,
    episodeNumber: 1
  },
  {
    id: 6,
    podcastId: 2,
    title: "Ограбление века: Как украли 500 миллионов",
    description: "Невероятная история о самом дерзком ограблении банка в истории и о том, как преступников всё-таки поймали.",
    duration: 3300,
    audioUrl: "https://example.com/audio/crime-ep2.mp3",
    publishedAt: "2023-12-08T12:30:00.000Z",
    season: 2,
    episodeNumber: 2
  },
  {
    id: 7,
    podcastId: 2,
    title: "Серийный похититель: Психология преступника",
    description: "Глубокое погружение в психологию серийного преступника с комментариями криминального психолога.",
    duration: 2640,
    audioUrl: "https://example.com/audio/crime-ep3.mp3",
    publishedAt: "2023-12-15T12:30:00.000Z",
    season: 2,
    episodeNumber: 3
  },

  // Эпизоды для Comedy Club (podcastId: 3)
  {
    id: 8,
    podcastId: 3,
    title: "Лучшее из стендапа - Выпуск 1",
    description: "Подборка самых смешных шуток и историй от наших комиков за последний месяц.",
    duration: 1800,
    audioUrl: "https://example.com/audio/comedy-ep1.mp3",
    publishedAt: "2024-03-12T09:15:00.000Z",
    season: 1,
    episodeNumber: 1
  },
  {
    id: 9,
    podcastId: 3,
    title: "Импровизация: Когда всё идёт не по плану",
    description: "Невероятные импровизации на сцене, когда комикам приходится выкручиваться из сложных ситуаций.",
    duration: 2100,
    audioUrl: "https://example.com/audio/comedy-ep2.mp3",
    publishedAt: "2024-03-19T09:15:00.000Z",
    season: 1,
    episodeNumber: 2
  },
  {
    id: 10,
    podcastId: 3,
    title: "Пародии на знаменитостей",
    description: "Комики пародируют известных личностей из мира политики, шоу-бизнеса и спорта.",
    duration: 1920,
    audioUrl: "https://example.com/audio/comedy-ep3.mp3",
    publishedAt: "2024-03-26T09:15:00.000Z",
    season: 1,
    episodeNumber: 3
  },
  {
    id: 11,
    podcastId: 3,
    title: "Истории из жизни комиков",
    description: "Смешные и неловкие ситуации из реальной жизни наших комиков.",
    duration: 2220,
    audioUrl: "https://example.com/audio/comedy-ep4.mp3",
    publishedAt: "2024-04-02T09:15:00.000Z",
    season: 1,
    episodeNumber: 4
  },
  {
    id: 12,
    podcastId: 3,
    title: "Социальная сатира: Смеёмся над проблемами",
    description: "Комики высмеивают актуальные социальные проблемы и абсурдные ситуации современности.",
    duration: 2040,
    audioUrl: "https://example.com/audio/comedy-ep5.mp3",
    publishedAt: "2024-04-09T09:15:00.000Z",
    season: 1,
    episodeNumber: 5
  },

  // Эпизоды для Здоровье 360 (podcastId: 4)
  {
    id: 13,
    podcastId: 4,
    title: "Правда о витаминах: Что действительно работает",
    description: "Доктор Волкова разбирает популярные мифы о витаминах и добавках, основываясь на научных исследованиях.",
    duration: 2460,
    audioUrl: "https://example.com/audio/health-ep1.mp3",
    publishedAt: "2024-02-17T14:00:00.000Z",
    season: 1,
    episodeNumber: 1
  },
  {
    id: 14,
    podcastId: 4,
    title: "Здоровый сон: Как высыпаться и чувствовать себя бодрым",
    description: "Научные методы улучшения качества сна и борьбы с бессонницей без лекарств.",
    duration: 2100,
    audioUrl: "https://example.com/audio/health-ep2.mp3",
    publishedAt: "2024-02-24T14:00:00.000Z",
    season: 1,
    episodeNumber: 2
  },
  {
    id: 15,
    podcastId: 4,
    title: "Питание для мозга: Еда, улучшающая когнитивные функции",
    description: "Какие продукты действительно помогают мозгу работать лучше и как составить оптимальный рацион.",
    duration: 2340,
    audioUrl: "https://example.com/audio/health-ep3.mp3",
    publishedAt: "2024-03-02T14:00:00.000Z",
    season: 1,
    episodeNumber: 3
  },
  {
    id: 16,
    podcastId: 4,
    title: "Стресс и его влияние на организм",
    description: "Как хронический стресс влияет на здоровье и эффективные методы борьбы с ним.",
    duration: 2520,
    audioUrl: "https://example.com/audio/health-ep4.mp3",
    publishedAt: "2024-03-09T14:00:00.000Z",
    season: 1,
    episodeNumber: 4
  }
];

// Счётчики для автоинкремента ID
export let nextPodcastId = 5;
export let nextEpisodeId = 17;

export function incrementPodcastId() {
  return nextPodcastId++;
}

export function incrementEpisodeId() {
  return nextEpisodeId++;
}
