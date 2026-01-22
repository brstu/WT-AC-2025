// lib/api.ts

export type Course = {
  course_id: string;
  title: string;
  description: string;
  school: string;
  department?: string;
  level: string;
  instructors: string[];
  terms: string[];
  duration?: string;
  language: string;
  prerequisites?: string;
};

const mockCourses: Course[] = [
  {
    course_id: "cs50",
    title: "CS50: Introduction to Computer Science",
    description: `<p>Введение в интеллектуальные основы информатики и искусство программирования. Курс охватывает абстракцию, алгоритмы, структуры данных, инкапсуляцию, управление ресурсами, безопасность, разработку ПО и веб-программирование.</p>
    <p>Языки включают C, Python, SQL, JavaScript, CSS и HTML. Задачи вдохновлены реальными приложениями из таких областей, как финансы, криптография, игры и биология.</p>`,
    school: "Harvard University",
    department: "Computer Science",
    level: "Вводный",
    instructors: ["David J. Malan"],
    terms: ["Осень 2025", "Весна 2026"],
    duration: "11 недель",
    language: "Английский (с субтитрами на русском)",
    prerequisites: "Нет",
  },
  {
    course_id: "justice",
    title: "Justice",
    description: `<p>Классический курс Майкла Сэндела о моральной и политической философии. Рассматриваются основные теории справедливости: утилитаризм, либертарианство, философия Аристотеля, Канта, Ролза и другие.</p>
    <p>Через обсуждение реальных дилемм (трамвайная проблема, каннибалы в море, ценность жизни) студенты учатся критически мыслить о справедливости в обществе.</p>`,
    school: "Harvard University",
    department: "Philosophy",
    level: "Вводный",
    instructors: ["Michael Sandel"],
    terms: ["Весна 2025"],
    duration: "12 недель",
    language: "Английский",
  },
  {
    course_id: "stat110",
    title: "Statistics 110: Probability",
    description: `<p>Глубокое и увлекательное введение в теорию вероятностей. Курс покрывает комбинаторику, условную вероятность, теорему Байеса, случайные величины, распределения, математическое ожидание, дисперсию и многое другое.</p>
    <p>Известен своими яркими примерами из лотерей, карточных игр, генетики и медицины.</p>`,
    school: "Harvard University",
    department: "Statistics",
    level: "Средний",
    instructors: ["Joe Blitzstein"],
    terms: ["Осень 2025"],
    duration: "13 недель",
    language: "Английский",
  },
  {
    course_id: "entrepreneurship",
    title: "Entrepreneurship in Emerging Economies",
    description: `<p>Курс исследует, как предпринимательство и инновации могут решать сложные социальные проблемы в развивающихся экономиках. Студенты анализируют реальные кейсы из Африки, Азии и Латинской Америки.</p>`,
    school: "Harvard Business School",
    level: "Средний",
    instructors: ["Tarun Khanna"],
    terms: ["Весна 2026"],
    duration: "6 недель",
    language: "Английский",
  },
  {
    course_id: "python",
    title: "Introduction to Programming with Python",
    description: `<p>Практический курс по программированию на Python для начинающих. Вы научитесь писать программы, работать с данными, создавать функции, обрабатывать файлы и решать реальные задачи.</p>`,
    school: "Harvard University",
    department: "Computer Science",
    level: "Вводный",
    instructors: ["John Doe"],
    terms: ["Лето 2025"],
    duration: "9 недель",
    language: "Русский (дублированный)",
  },
  // Добавь ещё курсов по желанию!
];

export const fetchCourses = async (query: string = "", page: number = 1) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // имитация сети

  let filtered = mockCourses;
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = mockCourses.filter(
      c =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        (c.department && c.department.toLowerCase().includes(lowerQuery))
    );
  }

  const size = 30;
  const start = (page - 1) * size;
  const results = filtered.slice(start, start + size);

  return {
    results,
    pagination: {
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / size),
      size,
    },
  };
};

export const fetchCourseById = async (id: string): Promise<Course> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const course = mockCourses.find(c => c.course_id.toLowerCase() === id.toLowerCase());
  if (!course) throw new Error("Курс не найден");
  return course;
};