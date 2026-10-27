// CONTENT DATA FOR LIFE SIMULATOR EX

const COUNTRIES = [
  { name: "Украина", flag: "🇺🇦", currency: "₴", avgSalary: 18000, costIndex: 1.0, cities: ["Киев", "Харьков", "Одесса", "Львов", "Днепр"] },
  { name: "Польша", flag: "🇵🇱", currency: "zł", avgSalary: 6500, costIndex: 2.8, cities: ["Варшава", "Краков", "Вроцлав", "Гданьск"] },
  { name: "Германия", flag: "🇩🇪", currency: "€", avgSalary: 3800, costIndex: 5.2, cities: ["Берлин", "Мюнхен", "Гамбург", "Франкфурт"] },
  { name: "Великобритания", flag: "🇬🇧", currency: "£", avgSalary: 2900, costIndex: 6.1, cities: ["Лондон", "Манчестер", "Бирмингем"] },
  { name: "Испания", flag: "🇪🇸", currency: "€", avgSalary: 2400, costIndex: 3.9, cities: ["Мадрид", "Барселона", "Валенсия"] },
  { name: "Франция", flag: "🇫🇷", currency: "€", avgSalary: 2900, costIndex: 5.0, cities: ["Париж", "Лион", "Марсель"] },
  { name: "Чехия", flag: "🇨🇿", currency: "Kč", avgSalary: 45000, costIndex: 3.2, cities: ["Прага", "Брно", "Острава"] },
  { name: "Канада", flag: "🇨🇦", currency: "CA$", avgSalary: 5200, costIndex: 5.5, cities: ["Торонто", "Ванкувер", "Монреаль"] },
  { name: "США", flag: "🇺🇸", currency: "$", avgSalary: 6800, costIndex: 6.8, cities: ["Нью-Йорк", "Лос-Анджелес", "Чикаго"] }
];

const UNIVERSITIES = [
  // Украина
  { id: "uni_knu", name: "Киевский национальный университет им. Тараса Шевченко", country: "Украина", city: "Киев", minGPA: 8.5, tuition: 35000, scholarshipThreshold: 10.0, requiredLanguage: "uk", program: "Информационные технологии и кибернетика", rank: "#1 в Украине" },
  { id: "uni_kpi", name: "НТУУ «Киевский политехнический институт»", country: "Украина", city: "Киев", minGPA: 8.8, tuition: 38000, scholarshipThreshold: 10.2, requiredLanguage: "uk", program: "Компьютерная и программная инженерия", rank: "#2 в Украине" },
  { id: "uni_lnu", name: "Львовский национальный университет им. Ивана Франко", country: "Украина", city: "Львов", minGPA: 8.2, tuition: 30000, scholarshipThreshold: 9.8, requiredLanguage: "uk", program: "Международные отношения и право", rank: "#3 в Украине" },
  { id: "uni_knure", name: "Харьковский университет радиоэлектроники (ХНУРЭ)", country: "Украина", city: "Харьков", minGPA: 8.4, tuition: 32000, scholarshipThreshold: 10.0, requiredLanguage: "uk", program: "Искусственный интеллект и Big Data", rank: "#4 в Украине" },
  { id: "uni_kma", name: "Национальный университет «Киево-Могилянская академия»", country: "Украина", city: "Киев", minGPA: 9.2, tuition: 48000, scholarshipThreshold: 10.5, requiredLanguage: "uk", program: "Экономика, бизнес и финансы", rank: "#5 в Украине" },
  // Польша
  { id: "uni_uw", name: "Варшавский университет (Uniwersytet Warszawski)", country: "Польша", city: "Варшава", minGPA: 8.0, tuition: 12000, scholarshipThreshold: 10.0, requiredLanguage: "pl", program: "Европейское право и менеджмент", rank: "#1 в Польше" },
  { id: "uni_uj", name: "Ягеллонский университет (Uniwersytet Jagielloński)", country: "Польша", city: "Краков", minGPA: 8.2, tuition: 11000, scholarshipThreshold: 10.1, requiredLanguage: "pl", program: "Биомедицина и фундаментальные науки", rank: "#2 в Польше" },
  { id: "uni_pw", name: "Варшавская политехника (Politechnika Warszawska)", country: "Польша", city: "Варшава", minGPA: 8.5, tuition: 14000, scholarshipThreshold: 10.3, requiredLanguage: "pl", program: "Робототехника и мехатроника", rank: "#3 в Польше" },
  { id: "uni_pwr", name: "Вроцлавская политехника (Politechnika Wrocławska)", country: "Польша", city: "Вроцлав", minGPA: 7.8, tuition: 10000, scholarshipThreshold: 9.7, requiredLanguage: "pl", program: "Автомобильный инжиниринг", rank: "#4 в Польше" },
  // Германия
  { id: "uni_tum", name: "Мюнхенский технический университет (TUM)", country: "Германия", city: "Мюнхен", minGPA: 9.5, tuition: 1500, scholarshipThreshold: 10.8, requiredLanguage: "de", program: "Аэрокосмические технологии и AI", rank: "#1 в Германии" },
  { id: "uni_lmu", name: "Университет Людвига-Максимилиана (LMU Munich)", country: "Германия", city: "Мюнхен", minGPA: 9.0, tuition: 1200, scholarshipThreshold: 10.4, requiredLanguage: "de", program: "Клиническая медицина и нейробиология", rank: "#2 в Германии" },
  { id: "uni_heidelberg", name: "Гейдельбергский университет (Universität Heidelberg)", country: "Германия", city: "Гейдельберг", minGPA: 8.8, tuition: 3000, scholarshipThreshold: 10.2, requiredLanguage: "de", program: "Фармацевтика и молекулярная биофизика", rank: "#3 в Германии" },
  { id: "uni_huberlin", name: "Берлинский университет им. Гумбольдта", country: "Германия", city: "Берлин", minGPA: 8.4, tuition: 1100, scholarshipThreshold: 9.9, requiredLanguage: "de", program: "Философия, социология и политология", rank: "#4 в Германии" },
  // Великобритания
  { id: "uni_oxford", name: "Оксфордский университет (University of Oxford)", country: "Великобритания", city: "Оксфорд", minGPA: 10.5, tuition: 28000, scholarshipThreshold: 11.8, requiredLanguage: "en", program: "Философия, политика и экономика (PPE)", rank: "#1 в мире" },
  { id: "uni_cambridge", name: "Кембриджский университет (University of Cambridge)", country: "Великобритания", city: "Кембридж", minGPA: 10.6, tuition: 30000, scholarshipThreshold: 11.9, requiredLanguage: "en", program: "Теоретическая физика и математика", rank: "#2 в мире" },
  { id: "uni_imperial", name: "Имперский колледж Лондона (Imperial College)", country: "Великобритания", city: "Лондон", minGPA: 10.0, tuition: 32000, scholarshipThreshold: 11.5, requiredLanguage: "en", program: "Прикладная инженерия и Data Science", rank: "#3 в Великобритании" },
  { id: "uni_lse", name: "Лондонская школа экономики (LSE)", country: "Великобритания", city: "Лондон", minGPA: 9.8, tuition: 26000, scholarshipThreshold: 11.2, requiredLanguage: "en", program: "Инвестиционный банкинг и макроэкономика", rank: "#4 в Великобритании" },
  { id: "uni_ucl", name: "Университетский колледж Лондона (UCL)", country: "Великобритания", city: "Лондон", minGPA: 9.2, tuition: 25000, scholarshipThreshold: 10.9, requiredLanguage: "en", program: "Архитектура и градостроительство", rank: "#5 в Великобритании" },
  // Испания
  { id: "uni_ucm", name: "Мадридский университет Комплутенсе", country: "Испания", city: "Мадрид", minGPA: 7.8, tuition: 3500, scholarshipThreshold: 9.6, requiredLanguage: "es", program: "Аудиовизуальные медиа и журналистика", rank: "#1 в Испании" },
  { id: "uni_ub", name: "Барселонский университет (Universitat de Barcelona)", country: "Испания", city: "Барселона", minGPA: 8.1, tuition: 4000, scholarshipThreshold: 9.8, requiredLanguage: "es", program: "Биомедицинские исследования", rank: "#2 в Испании" },
  { id: "uni_upc", name: "Политехнический университет Каталонии (UPC)", country: "Испания", city: "Барселона", minGPA: 8.3, tuition: 4200, scholarshipThreshold: 10.0, requiredLanguage: "es", program: "Телекоммуникации и кибербезопасность", rank: "#3 в Испании" },
  // Франция
  { id: "uni_sorbonne", name: "Сорбонна (Sorbonne Université)", country: "Франция", city: "Париж", minGPA: 8.9, tuition: 2800, scholarshipThreshold: 10.5, requiredLanguage: "fr", program: "Французская литература и классическое право", rank: "#1 во Франции" },
  { id: "uni_polytechnique", name: "Политехническая школа (École Polytechnique)", country: "Франция", city: "Париж", minGPA: 10.2, tuition: 15000, scholarshipThreshold: 11.4, requiredLanguage: "fr", program: "Высшая математика и квантовая физика", rank: "#2 во Франции" },
  // Чехия
  { id: "uni_charles", name: "Карлов университет (Univerzita Karlova)", country: "Чехия", city: "Прага", minGPA: 8.0, tuition: 75000, scholarshipThreshold: 10.0, requiredLanguage: "cs", program: "Общая медицина и фармацевтика", rank: "#1 в Чехии" },
  { id: "uni_cvut", name: "Чешский технический университет (ČVUT)", country: "Чехия", city: "Прага", minGPA: 8.2, tuition: 85000, scholarshipThreshold: 10.1, requiredLanguage: "cs", program: "Кибернетика, софт и электроника", rank: "#2 в Чехии" },
  // Канада
  { id: "uni_toronto", name: "Университет Торонто (University of Toronto)", country: "Канада", city: "Торонто", minGPA: 9.4, tuition: 38000, scholarshipThreshold: 11.0, requiredLanguage: "en", program: "Machine Learning и нейробиология", rank: "#1 в Канаде" },
  { id: "uni_ubc", name: "Университет Британской Колумбии (UBC)", country: "Канада", city: "Ванкувер", minGPA: 9.0, tuition: 34000, scholarshipThreshold: 10.7, requiredLanguage: "en", program: "Экологический инжиниринг и урбанистика", rank: "#2 в Канаде" },
  // США
  { id: "uni_harvard", name: "Гарвардский университет (Harvard University)", country: "США", city: "Бостон", minGPA: 10.8, tuition: 55000, scholarshipThreshold: 11.9, requiredLanguage: "en", program: "Гарвардская школа права и бизнеса", rank: "#1 в США" },
  { id: "uni_stanford", name: "Стэнфордский университет (Stanford University)", country: "США", city: "Пало-Альто", minGPA: 10.9, tuition: 58000, scholarshipThreshold: 11.95, requiredLanguage: "en", program: "Венчурные технологии, стартапы и AI", rank: "#2 в США" },
  { id: "uni_mit", name: "Массачусетский технологический институт (MIT)", country: "США", city: "Бостон", minGPA: 11.0, tuition: 60000, scholarshipThreshold: 12.0, requiredLanguage: "en", program: "Квантовые вычисления и робототехника", rank: "#3 в США" },
  { id: "uni_columbia", name: "Колумбийский университет (Columbia University)", country: "США", city: "Нью-Йорк", minGPA: 10.4, tuition: 56000, scholarshipThreshold: 11.7, requiredLanguage: "en", program: "Финансовая инженерия и журналистика", rank: "#4 в США" },
  { id: "uni_berkeley", name: "Калифорнийский университет в Беркли (UC Berkeley)", country: "США", city: "Беркли", minGPA: 10.1, tuition: 44000, scholarshipThreshold: 11.5, requiredLanguage: "en", program: "Электротехника и программные системы", rank: "#5 в США" }
];

const CAREERS = [
  {
    id: "programmer",
    title: "Программист",
    category: "IT & Tech",
    icon: "💻",
    baseSalary: 45000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Junior Разработчик", salaryMult: 0.7, req: { intellect: 25, knowledge: 20 } },
      { level: 2, title: "Middle Разработчик", salaryMult: 1.0, req: { intellect: 40, knowledge: 35 } },
      { level: 3, title: "Senior Разработчик", salaryMult: 1.5, req: { intellect: 55, knowledge: 50 } },
      { level: 4, title: "Tech Lead команды", salaryMult: 2.2, req: { intellect: 70, charisma: 40 } },
      { level: 5, title: "Chief Technology Officer (CTO)", salaryMult: 3.5, req: { intellect: 85, finance: 50, charisma: 55 } }
    ]
  },
  {
    id: "doctor",
    title: "Врач",
    category: "Медицина",
    icon: "🩺",
    baseSalary: 38000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Врач-интерн", salaryMult: 0.6, req: { intellect: 35, knowledge: 45 } },
      { level: 2, title: "Врач-терапевт", salaryMult: 1.0, req: { intellect: 45, knowledge: 55 } },
      { level: 3, title: "Ведущий хирург / диагност", salaryMult: 1.6, req: { intellect: 60, strength: 30 } },
      { level: 4, title: "Заведующий отделением", salaryMult: 2.3, req: { intellect: 70, relations: 50 } },
      { level: 5, title: "Главный врач клиники", salaryMult: 3.2, req: { intellect: 80, charisma: 60, finance: 50 } }
    ]
  },
  {
    id: "lawyer",
    title: "Юрист",
    category: "Право",
    icon: "⚖️",
    baseSalary: 40000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Помощник юриста", salaryMult: 0.6, req: { charisma: 30, intellect: 30 } },
      { level: 2, title: "Корпоративный юрист", salaryMult: 1.0, req: { charisma: 45, intellect: 45 } },
      { level: 3, title: "Старший судебный адвокат", salaryMult: 1.7, req: { charisma: 60, intellect: 60 } },
      { level: 4, title: "Партнёр юридической фирмы", salaryMult: 2.5, req: { charisma: 75, finance: 50 } },
      { level: 5, title: "Управляющий партнёр / Судья", salaryMult: 3.8, req: { charisma: 85, relations: 70 } }
    ]
  },
  {
    id: "teacher",
    title: "Учитель",
    category: "Образование",
    icon: "📚",
    baseSalary: 22000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Учитель-стажёр", salaryMult: 0.7, req: { knowledge: 30, relations: 30 } },
      { level: 2, title: "Школьный преподаватель", salaryMult: 1.0, req: { knowledge: 45, relations: 45 } },
      { level: 3, title: "Старший методист", salaryMult: 1.4, req: { knowledge: 60, intellect: 50 } },
      { level: 4, title: "Заместитель директора школы", salaryMult: 1.9, req: { relations: 65, charisma: 50 } },
      { level: 5, title: "Директор престижного лицея", salaryMult: 2.7, req: { relations: 75, charisma: 65, finance: 40 } }
    ]
  },
  {
    id: "engineer",
    title: "Инженер",
    category: "Инженерия",
    icon: "⚙️",
    baseSalary: 35000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Младший инженер", salaryMult: 0.7, req: { intellect: 30, knowledge: 30 } },
      { level: 2, title: "Инженер-конструктор", salaryMult: 1.0, req: { intellect: 45, knowledge: 45 } },
      { level: 3, title: "Ведущий инженер проекта", salaryMult: 1.5, req: { intellect: 60, knowledge: 60 } },
      { level: 4, title: "Главный инженер завода", salaryMult: 2.2, req: { intellect: 75, charisma: 45 } },
      { level: 5, title: "Вице-президент по инжинирингу", salaryMult: 3.4, req: { intellect: 85, finance: 60 } }
    ]
  },
  {
    id: "businessman",
    title: "Бизнесмен",
    category: "Бизнес",
    icon: "💼",
    baseSalary: 42000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Самозанятый коммерсант", salaryMult: 0.7, req: { finance: 30, charisma: 30 } },
      { level: 2, title: "Владелец малого бизнеса", salaryMult: 1.2, req: { finance: 45, charisma: 45 } },
      { level: 3, title: "Серийный предприниматель", salaryMult: 2.0, req: { finance: 65, intellect: 55 } },
      { level: 4, title: "Глава отраслевого холдинга", salaryMult: 3.2, req: { finance: 80, charisma: 70 } },
      { level: 5, title: "Венчурный олигарх / Инвестор", salaryMult: 5.0, req: { finance: 90, relations: 80 } }
    ]
  },
  {
    id: "designer",
    title: "Дизайнер",
    category: "Творчество",
    icon: "🎨",
    baseSalary: 32000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Junior Графический дизайнер", salaryMult: 0.7, req: { creativity: 30, intellect: 25 } },
      { level: 2, title: "UI/UX Продуктовый дизайнер", salaryMult: 1.0, req: { creativity: 45, intellect: 40 } },
      { level: 3, title: "Ведущий арт-директор", salaryMult: 1.6, req: { creativity: 65, charisma: 45 } },
      { level: 4, title: "Креативный директор агентства", salaryMult: 2.3, req: { creativity: 80, charisma: 65 } },
      { level: 5, title: "Основатель всемирной дизайн-студии", salaryMult: 3.6, req: { creativity: 90, finance: 60 } }
    ]
  },
  {
    id: "journalist",
    title: "Журналист",
    category: "Медиа",
    icon: "📰",
    baseSalary: 26000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Новостной репортёр", salaryMult: 0.7, req: { charisma: 30, knowledge: 25 } },
      { level: 2, title: "Специальный корреспондент", salaryMult: 1.0, req: { charisma: 45, intellect: 40 } },
      { level: 3, title: "Автор журналистских расследований", salaryMult: 1.6, req: { charisma: 60, intellect: 55 } },
      { level: 4, title: "Шеф-редактор медиахолдинга", salaryMult: 2.3, req: { charisma: 75, relations: 60 } },
      { level: 5, title: "Главный редактор мирового издания", salaryMult: 3.5, req: { charisma: 85, relations: 75 } }
    ]
  },
  {
    id: "actor",
    title: "Актёр",
    category: "Искусство",
    icon: "🎭",
    baseSalary: 28000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Актёр массовки и рекламы", salaryMult: 0.6, req: { charisma: 40, creativity: 35 } },
      { level: 2, title: "Театральный актёр второго плана", salaryMult: 1.0, req: { charisma: 55, creativity: 50 } },
      { level: 3, title: "Звезда телесериалов", salaryMult: 1.8, req: { charisma: 70, creativity: 65 } },
      { level: 4, title: "Главная звезда блокбастеров", salaryMult: 3.0, req: { charisma: 85, creativity: 80 } },
      { level: 5, title: "Лауреат кинопремий и продюсер", salaryMult: 5.5, req: { charisma: 95, finance: 70 } }
    ]
  },
  {
    id: "politician",
    title: "Политик",
    category: "Госслужба",
    icon: "🏛️",
    baseSalary: 45000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Помощник депутата", salaryMult: 0.7, req: { charisma: 45, relations: 40 } },
      { level: 2, title: "Депутат городского совета", salaryMult: 1.2, req: { charisma: 60, relations: 55 } },
      { level: 3, title: "Мэр крупного города", salaryMult: 2.0, req: { charisma: 75, intellect: 60 } },
      { level: 4, title: "Депутат парламента / Министр", salaryMult: 3.2, req: { charisma: 85, relations: 75 } },
      { level: 5, title: "Глава правительства / Президент", salaryMult: 5.0, req: { charisma: 95, relations: 90 } }
    ]
  },
  {
    id: "military",
    title: "Военный",
    category: "Силовые структуры",
    icon: "🎖️",
    baseSalary: 32000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Рядовой контрактник", salaryMult: 0.7, req: { strength: 40, health: 60 } },
      { level: 2, title: "Сержант взвода", salaryMult: 1.0, req: { strength: 55, intellect: 35 } },
      { level: 3, title: "Капитан роты", salaryMult: 1.5, req: { strength: 70, intellect: 50 } },
      { level: 4, title: "Полковник / Комбриг", salaryMult: 2.2, req: { strength: 75, relations: 60 } },
      { level: 5, title: "Генерал Генерального штаба", salaryMult: 3.4, req: { strength: 80, charisma: 75 } }
    ]
  },
  {
    id: "chef",
    title: "Повар",
    category: "Гастрономия",
    icon: "🍳",
    baseSalary: 25000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Помощник на кухне", salaryMult: 0.6, req: { creativity: 25, strength: 20 } },
      { level: 2, title: "Повар горячего цеха", salaryMult: 1.0, req: { creativity: 40, strength: 35 } },
      { level: 3, title: "Су-шеф ресторана", salaryMult: 1.5, req: { creativity: 60, intellect: 40 } },
      { level: 4, title: "Шеф-повар авторского ресторана", salaryMult: 2.4, req: { creativity: 80, charisma: 50 } },
      { level: 5, title: "Обладатель звёзд Мишлен", salaryMult: 4.2, req: { creativity: 95, charisma: 75 } }
    ]
  },
  {
    id: "architect",
    title: "Архитектор",
    category: "Инженерия",
    icon: "📐",
    baseSalary: 36000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Архитектор-чертежник", salaryMult: 0.7, req: { creativity: 35, intellect: 35 } },
      { level: 2, title: "Ведущий архитектор проектов", salaryMult: 1.1, req: { creativity: 55, intellect: 50 } },
      { level: 3, title: "Руководитель архитектурного бюро", salaryMult: 1.8, req: { creativity: 70, charisma: 55 } },
      { level: 4, title: "Главный архитектор мегаполиса", salaryMult: 2.8, req: { creativity: 85, relations: 70 } },
      { level: 5, title: "Лауреат Притцкеровской премии", salaryMult: 4.5, req: { creativity: 95, intellect: 85 } }
    ]
  },
  {
    id: "accountant",
    title: "Бухгалтер",
    category: "Финансы",
    icon: "📊",
    baseSalary: 30000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Младший бухгалтер", salaryMult: 0.7, req: { finance: 35, intellect: 30 } },
      { level: 2, title: "Ведущий бухгалтер по налогам", salaryMult: 1.0, req: { finance: 50, intellect: 45 } },
      { level: 3, title: "Главный бухгалтер компании", salaryMult: 1.6, req: { finance: 65, intellect: 60 } },
      { level: 4, title: "Финансовый аудитор / Контролёр", salaryMult: 2.3, req: { finance: 80, intellect: 70 } },
      { level: 5, title: "Финансовый директор корпорации (CFO)", salaryMult: 3.6, req: { finance: 90, charisma: 65 } }
    ]
  },
  {
    id: "psychologist",
    title: "Психолог",
    category: "Медицина & Life",
    icon: "🧠",
    baseSalary: 28000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Консультант психологической службы", salaryMult: 0.7, req: { relations: 35, charisma: 30 } },
      { level: 2, title: "Частнопрактикующий психолог", salaryMult: 1.1, req: { relations: 50, charisma: 45 } },
      { level: 3, title: "Семейный психотерапевт", salaryMult: 1.7, req: { relations: 65, intellect: 55 } },
      { level: 4, title: "VIP-коуч топ-менеджеров", salaryMult: 2.6, req: { relations: 80, charisma: 75 } },
      { level: 5, title: "Автор бестселлеров и клиники психотерапии", salaryMult: 4.0, req: { relations: 90, charisma: 85 } }
    ]
  },
  {
    id: "banker",
    title: "Банкир",
    category: "Финансы",
    icon: "🏦",
    baseSalary: 42000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Кредитный специалист отделения", salaryMult: 0.7, req: { finance: 40, intellect: 35 } },
      { level: 2, title: "Управляющий отделением банка", salaryMult: 1.2, req: { finance: 55, charisma: 45 } },
      { level: 3, title: "Инвестиционный банкир", salaryMult: 2.0, req: { finance: 75, intellect: 65 } },
      { level: 4, title: "Член правления банка", salaryMult: 3.2, req: { finance: 85, relations: 75 } },
      { level: 5, title: "Президент банковского конгломерата", salaryMult: 5.2, req: { finance: 95, relations: 90 } }
    ]
  },
  {
    id: "marketer",
    title: "Маркетолог",
    category: "Медиа & Бизнес",
    icon: "📢",
    baseSalary: 32000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Junior Трафик-менеджер", salaryMult: 0.7, req: { charisma: 30, creativity: 30 } },
      { level: 2, title: "Performance Маркетолог", salaryMult: 1.1, req: { charisma: 45, intellect: 45 } },
      { level: 3, title: "Руководитель отдела маркетинга", salaryMult: 1.7, req: { charisma: 65, finance: 50 } },
      { level: 4, title: "Chief Marketing Officer (CMO)", salaryMult: 2.5, req: { charisma: 80, creativity: 75 } },
      { level: 5, title: "Партнёр международного медиа-агентства", salaryMult: 3.8, req: { charisma: 90, relations: 80 } }
    ]
  },
  {
    id: "scientist",
    title: "Учёный",
    category: "Наука",
    icon: "🔬",
    baseSalary: 30000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Лаборант исследовательского института", salaryMult: 0.7, req: { intellect: 50, knowledge: 45 } },
      { level: 2, title: "Кандидат наук / Старший научный сотрудник", salaryMult: 1.1, req: { intellect: 65, knowledge: 60 } },
      { level: 3, title: "Руководитель научной лаборатории", salaryMult: 1.8, req: { intellect: 80, knowledge: 75 } },
      { level: 4, title: "Профессор и академик университета", salaryMult: 2.6, req: { intellect: 90, charisma: 60 } },
      { level: 5, title: "Лауреат Нобелевской премии", salaryMult: 4.5, req: { intellect: 98, knowledge: 95 } }
    ]
  },
  {
    id: "athlete",
    title: "Спортсмен",
    category: "Спорт",
    icon: "🏃",
    baseSalary: 35000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Юниор молодёжной лиги", salaryMult: 0.6, req: { strength: 50, muscleMass: 40 } },
      { level: 2, title: "Игрок основного состава клуба", salaryMult: 1.2, req: { strength: 65, muscleMass: 55 } },
      { level: 3, title: "Чемпион национальной лиги", salaryMult: 2.2, req: { strength: 80, muscleMass: 70 } },
      { level: 4, title: "Капитан национальной сборной", salaryMult: 3.5, req: { strength: 90, charisma: 65 } },
      { level: 5, title: "Олимпийский чемпион и мировая легенда", salaryMult: 5.5, req: { strength: 98, charisma: 85 } }
    ]
  },
  {
    id: "pilot",
    title: "Пилот",
    category: "Транспорт",
    icon: "✈️",
    baseSalary: 55000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Второй пилот региональных рейсов", salaryMult: 0.7, req: { intellect: 40, health: 70 } },
      { level: 2, title: "Командир ближнемагистрального судна", salaryMult: 1.1, req: { intellect: 55, health: 75 } },
      { level: 3, title: "Капитан трансатлантического лайнера", salaryMult: 1.7, req: { intellect: 70, health: 80 } },
      { level: 4, title: "Шеф-пилот лётного отряда", salaryMult: 2.4, req: { intellect: 80, relations: 65 } },
      { level: 5, title: "Лётчик-испытатель экспериментальной авиации", salaryMult: 3.6, req: { intellect: 90, strength: 75 } }
    ]
  },
  {
    id: "musician",
    title: "Музыкант",
    category: "Искусство",
    icon: "🎸",
    baseSalary: 25000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Уличный и клубный музыкант", salaryMult: 0.6, req: { creativity: 40, charisma: 30 } },
      { level: 2, title: "Гитарист/вокалист инди-группы", salaryMult: 1.0, req: { creativity: 55, charisma: 45 } },
      { level: 3, title: "Сольный исполнитель с радио-хитом", salaryMult: 1.8, req: { creativity: 70, charisma: 65 } },
      { level: 4, title: "Хедлайнер мировых стадионных туров", salaryMult: 3.2, req: { creativity: 85, charisma: 85 } },
      { level: 5, title: "Легенда музыки и продюсер года", salaryMult: 5.0, req: { creativity: 95, finance: 70 } }
    ]
  },
  {
    id: "realtor",
    title: "Риелтор",
    category: "Недвижимость",
    icon: "🏡",
    baseSalary: 32000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Агент по аренде жилья", salaryMult: 0.7, req: { charisma: 35, finance: 25 } },
      { level: 2, title: "Брокер вторичной недвижимости", salaryMult: 1.1, req: { charisma: 50, finance: 40 } },
      { level: 3, title: "Эксперт по элитной недвижимости", salaryMult: 1.9, req: { charisma: 70, finance: 60 } },
      { level: 4, title: "Владелец риелторского агентства", salaryMult: 2.8, req: { charisma: 80, relations: 70 } },
      { level: 5, title: "Крупный девелопер небоскрёбов", salaryMult: 4.5, req: { charisma: 90, finance: 90 } }
    ]
  },
  {
    id: "pharmacist",
    title: "Фармацевт",
    category: "Медицина & Химия",
    icon: "💊",
    baseSalary: 30000,
    requiredEdu: "higher",
    levels: [
      { level: 1, title: "Фармацевт-провизор в аптеке", salaryMult: 0.7, req: { knowledge: 35, intellect: 35 } },
      { level: 2, title: "Заведующий аптечной сетью", salaryMult: 1.1, req: { knowledge: 50, finance: 40 } },
      { level: 3, title: "Специалист по клиническим исследованиям", salaryMult: 1.7, req: { intellect: 65, knowledge: 60 } },
      { level: 4, title: "Разработчик инновационных лекарств", salaryMult: 2.5, req: { intellect: 80, knowledge: 80 } },
      { level: 5, title: "Топ-менеджер глобального фармгиганта", salaryMult: 3.8, req: { intellect: 90, finance: 75 } }
    ]
  },
  {
    id: "photographer",
    title: "Фотограф",
    category: "Творчество",
    icon: "📷",
    baseSalary: 26000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Ассистент фотостудии", salaryMult: 0.6, req: { creativity: 35, charisma: 25 } },
      { level: 2, title: "Коммерческий фотограф портретов", salaryMult: 1.0, req: { creativity: 50, charisma: 40 } },
      { level: 3, title: "Fashion-фотограф глянцевых журналов", salaryMult: 1.7, req: { creativity: 70, charisma: 60 } },
      { level: 4, title: "Автор персональных выставок в Париже", salaryMult: 2.6, req: { creativity: 85, relations: 70 } },
      { level: 5, title: "Культовый фотограф мировых брендов", salaryMult: 4.0, req: { creativity: 95, charisma: 85 } }
    ]
  },
  {
    id: "crypto_trader",
    title: "Криптотрейдер",
    category: "Финансы & Web3",
    icon: "🪙",
    baseSalary: 48000,
    requiredEdu: "none",
    levels: [
      { level: 1, title: "Дневной альткоин-скальпер", salaryMult: 0.7, req: { finance: 45, intellect: 35 } },
      { level: 2, title: "Свинг-трейдер деривативов", salaryMult: 1.2, req: { finance: 60, intellect: 50 } },
      { level: 3, title: "Управляющий частным криптофондом", salaryMult: 2.2, req: { finance: 75, intellect: 65 } },
      { level: 4, title: "Китовый маркетмейкер бирж", salaryMult: 3.5, req: { finance: 88, intellect: 80 } },
      { level: 5, title: "Владелец Web3 венчурного фонда", salaryMult: 5.5, req: { finance: 96, relations: 80 } }
    ]
  }
];

const PART_TIME_JOBS = [
  { id: "courier", title: "Велокурьер доставки", wage: 3200, req: { strength: 10 }, icon: "🚴" },
  { id: "flyers", title: "Раздача рекламных флаеров", wage: 2400, req: { charisma: 10 }, icon: "📄" },
  { id: "pc_help", title: "Настройка ПК и гаджетов", wage: 4200, req: { intellect: 15 }, icon: "🖥️" },
  { id: "babysitter", title: "Бебиситтер (присмотр за детьми)", wage: 3000, req: { relations: 20 }, icon: "👶" }
];

const BUSINESS_TYPES = [
  { id: "coffee", name: "Кофейня / Фудтрак", cost: 120000, annualProfit: 26000, icon: "☕" },
  { id: "online_shop", name: "Интернет-магазин гаджетов", cost: 70000, annualProfit: 16000, icon: "📦" },
  { id: "it_saas", name: "IT SaaS стартап", cost: 260000, annualProfit: 62000, icon: "🚀" },
  { id: "restaurant", name: "Ресторан авторской кухни", cost: 480000, annualProfit: 110000, icon: "🍽️" },
  { id: "real_estate_agency", name: "Агентство коммерческой недвижимости", cost: 380000, annualProfit: 88000, icon: "🏢" }
];

const INVESTMENT_MARKET = [
  { id: "sp500", name: "Индексный фонд (S&P 500 ETF)", basePrice: 1000, volatility: 0.12, icon: "📈", risk: "Низкий" },
  { id: "tech_stocks", name: "Акции технологических гигантов", basePrice: 2500, volatility: 0.22, icon: "💻", risk: "Средний" },
  { id: "gov_bonds", name: "Государственные облигации", basePrice: 500, volatility: 0.05, icon: "📜", risk: "Минимальный" },
  { id: "crypto", name: "Криптовалютный портфель (BTC/ETH)", basePrice: 1500, volatility: 0.45, icon: "🪙", risk: "Высокий" },
  { id: "gold", name: "Золотые инвестиционные слитки", basePrice: 1200, volatility: 0.08, icon: "🥇", risk: "Защитный" }
];

const HOUSING_CATALOG = [
  { id: "parents", name: "Дом родителей", rent: 0, buyPrice: 0, comfort: 20, icon: "🏡" },
  { id: "dorm", name: "Комната в общежитии", rent: 1500, buyPrice: 0, comfort: 30, icon: "🏢" },
  { id: "studio", name: "Студия в спальном районе", rent: 7500, buyPrice: 950000, comfort: 50, icon: "🛋️" },
  { id: "1br", name: "1-комнатная квартира в центре", rent: 14000, buyPrice: 1900000, comfort: 70, icon: "🏙️" },
  { id: "2br", name: "Просторная 2-комнатная с террасой", rent: 25000, buyPrice: 4200000, comfort: 85, icon: "🌇" },
  { id: "penthouse", name: "Пентхаус с панорамным видом", rent: 65000, buyPrice: 12500000, comfort: 98, icon: "🌆" },
  { id: "villa", name: "Загородная вилла с бассейном", rent: 0, buyPrice: 28000000, comfort: 100, icon: "🏰" }
];

const VEHICLES_CATALOG = [
  { id: "bike", name: "Городской велосипед", price: 4500, icon: "🚲", statusBonus: 2 },
  { id: "scooter", name: "Электросамокат Pro", price: 14000, icon: "🛴", statusBonus: 5 },
  { id: "sedan", name: "Подержанный седан", price: 95000, icon: "🚗", statusBonus: 15 },
  { id: "suv", name: "Новый немецкий кроссовер", price: 780000, icon: "🚙", statusBonus: 35 },
  { id: "sportcar", name: "Спорткар Porsche 911", price: 3200000, icon: "🏎️", statusBonus: 65 }
];

const PETS_CATALOG = [
  { id: "hamster", name: "Джунгарский хомяк", price: 400, upkeep: 150, icon: "🐹" },
  { id: "parrot", name: "Волнистый попугай", price: 900, upkeep: 250, icon: "🦜" },
  { id: "cat", name: "Шотландский вислоухий кот", price: 5500, upkeep: 800, icon: "🐱" },
  { id: "dog", name: "Золотистый ретривер", price: 14000, upkeep: 1800, icon: "🐕" }
];

const TECH_GADGETS = [
  { id: "phone_dumb", name: "Кнопочный телефон", price: 600, intellectBonus: 1, icon: "📟" },
  { id: "phone_budget", name: "Бюджетный Android", price: 5000, intellectBonus: 4, icon: "📱" },
  { id: "phone_flagship", name: "Флагманский смартфон", price: 35000, intellectBonus: 10, icon: "📲" },
  { id: "phone_fold", name: "Премиальный складной Fold", price: 75000, intellectBonus: 18, icon: "💎" }
];

const BRANDS_CATALOG = [
  { id: "casual", name: "Повседневная одежда масс-маркет", price: 1200, charismaBonus: 2, icon: "👕" },
  { id: "streetwear", name: "Стильный Streetwear оверсайз", price: 8000, charismaBonus: 8, icon: "🧢" },
  { id: "business_suit", name: "Итальянский деловой костюм", price: 28000, charismaBonus: 18, icon: "👔" },
  { id: "haute_couture", name: "Дизайнерский Haute Couture", price: 95000, charismaBonus: 35, icon: "✨" }
];

const LANGUAGES_DATA = [
  { code: "uk", name: "Украинский", flag: "🇺🇦" },
  { code: "ru", name: "Русский", flag: "🌐" },
  { code: "en", name: "Английский", flag: "🇬🇧" },
  { code: "pl", name: "Польский", flag: "🇵🇱" },
  { code: "de", name: "Немецкий", flag: "🇩🇪" },
  { code: "es", name: "Испанский", flag: "🇪🇸" },
  { code: "fr", name: "Французский", flag: "🇫🇷" },
  { code: "cs", name: "Чешский", flag: "🇨🇿" },
  { code: "it", name: "Итальянский", flag: "🇮🇹" },
  { code: "zh", name: "Китайский", flag: "🇨🇳" }
];

const CRIMES = [
  { id: "pickpocket", name: "Карманная кража в метро", reward: 1200, risk: 15, wantedGain: 1, icon: "👛" },
  { id: "street_race", name: "Нелегальный уличный дрэг-рейсинг", reward: 6000, risk: 25, wantedGain: 1, icon: "🏎️" },
  { id: "cyber_hack", name: "Кибервзлом криптокошельков", reward: 35000, risk: 35, wantedGain: 2, icon: "💻" },
  { id: "contraband", name: "Контрабанда редких предметов", reward: 140000, risk: 50, wantedGain: 3, icon: "📦" }
];

const POLITICAL_TIERS = [
  { rank: 1, title: "Гражданский активист", minCharisma: 30, campaignCost: 5000, influence: 10 },
  { rank: 2, title: "Муниципальный депутат", minCharisma: 45, campaignCost: 25000, influence: 25 },
  { rank: 3, title: "Мэр города", minCharisma: 60, campaignCost: 100000, influence: 50 },
  { rank: 4, title: "Депутат парламента", minCharisma: 75, campaignCost: 350000, influence: 75 },
  { rank: 5, title: "Министр экономики", minCharisma: 88, campaignCost: 1000000, influence: 90 },
  { rank: 6, title: "Президент страны", minCharisma: 95, campaignCost: 3500000, influence: 100 }
];

const FACTIONS = [
  { id: "it_club", name: "IT-сообщество «Silicon Hub»", desc: "+15% к окладу в IT, нетворкинг с фаундерами", req: { intellect: 40 }, icon: "👨‍💻" },
  { id: "golf_club", name: "Элитный Гольф-клуб «Monaco»", desc: "Доступ к закрытым сделкам и инвестициям", req: { finance: 50 }, icon: "⛳" },
  { id: "gym_crew", name: "Бойцовский клуб «Титан»", desc: "Ускоренный рост мышц и силы", req: { strength: 45 }, icon: "🥊" },
  { id: "charity", name: "Благотворительный фонд «Добро»", desc: "Высокая репутация и поддержка общества", req: { relations: 60 }, icon: "🤝" }
];

const QUESTS = [
  { id: "quest_gpa", title: "Золотой аттестат", desc: "Закончить школу со средним баллом GPA 9.0+", check: (s) => s.age >= 17 && s.schoolGPA >= 9.0 },
  { id: "quest_first_car", title: "Первые колёса", desc: "Приобрести личное транспортное средство", check: (s) => s.ownedVehicles && s.ownedVehicles.length > 0 },
  { id: "quest_uni", title: "Высшее образование", desc: "Поступить в университет или закончить его", check: (s) => s.education && s.education.length > 0 },
  { id: "quest_career_lvl3", title: "Признанный профи", desc: "Достичь 3-го уровня в любой карьере", check: (s) => s.careerLevel >= 3 },
  { id: "quest_business", title: "Своё дело", desc: "Открыть собственный бизнес", check: (s) => s.businesses && s.businesses.length > 0 },
  { id: "quest_millionaire", title: "Первый миллион", desc: "Накопить более 1,000,000 денег на балансе", check: (s) => s.money >= 1000000 },
  { id: "quest_muscle_70", title: "Атлетическое тело", desc: "Накачать мышечную массу 70%+", check: (s) => s.muscleMass >= 70 },
  { id: "quest_own_house", title: "Собственный очаг", desc: "Купить квартиру или загородную виллу", check: (s) => s.house && s.house !== "parents" && s.house !== "dorm" }
];

const LIFE_DILEMMAS = [
  {
    id: "bully_confrontation",
    minAge: 8,
    maxAge: 16,
    title: "Конфликт со школьным хулиганом",
    description: "Старшеклассник за углом школы требует отдать карманные деньги и угрожает синяками.",
    choices: [
      {
        label: "Дать решительный отпор кулаками",
        req: { stat: "strength", value: 20 },
        successChance: 0.75,
        effectsSuccess: { strength: 3, happiness: 10, relations: 5 },
        effectsFail: { health: -15, happiness: -10 },
        successMsg: "Вы смело дали хулигану отпор! Он убежал, а вас зауважали в классе.",
        failMsg: "Вы храбро полезли в драку, но получили синяк под глазом."
      },
      {
        label: "Договориться словами и отшутиться",
        req: { stat: "charisma", value: 25 },
        successChance: 0.8,
        effectsSuccess: { charisma: 4, intellect: 2, happiness: 5 },
        effectsFail: { happiness: -8, money: -200 },
        successMsg: "Вы остроумно пошутили, компания хулигана рассмеялась, и инцидент был исчерпан.",
        failMsg: "Шутка не зашла, пришлось отдать мелочь из кармана."
      },
      {
        label: "Пожаловаться директору школы",
        req: null,
        successChance: 0.95,
        effectsSuccess: { relations: -5, happiness: -2 },
        effectsFail: { relations: -10 },
        successMsg: "Директор вызвал родителей задиры. Вас оставили в покое, но некоторые обозвали ябедой.",
        failMsg: "Директора не оказалось на месте."
      }
    ]
  },
  {
    id: "exam_cheating",
    minAge: 12,
    maxAge: 18,
    title: "Шпаргалка на итоговом экзамене",
    description: "Экзамен оказался чрезвычайно сложным. У вас в рукаве припрятана идеальная шпаргалка.",
    choices: [
      {
        label: "Рискнуть и списать со шпаргалки",
        req: { stat: "intellect", value: 25 },
        successChance: 0.7,
        effectsSuccess: { gpa: 0.8, happiness: 8 },
        effectsFail: { gpa: -1.2, happiness: -15, relations: -10 },
        successMsg: "Вы виртуозно списали все формулы и получили отличную оценку!",
        failMsg: "Учитель заметил движение рукава! Шпаргалку изъяли, вам влепили двойку."
      },
      {
        label: "Писать честно только своими силами",
        req: null,
        successChance: 0.9,
        effectsSuccess: { knowledge: 4, intellect: 2 },
        effectsFail: { happiness: -4 },
        successMsg: "Вы написали работу достойно и без угрызений совести.",
        failMsg: "Работа оказалась сложнее, чем вы думали, балл не самый высокий."
      }
    ]
  },
  {
    id: "first_crush_confession",
    minAge: 12,
    maxAge: 18,
    title: "Признание в первой влюбленности",
    description: "Человек, который вам давно безумно нравится, сидит один в школьном дворе под деревом.",
    choices: [
      {
        label: "Подойти и искренне признаться в чувствах",
        req: { stat: "charisma", value: 30 },
        successChance: 0.75,
        effectsSuccess: { happiness: 20, charisma: 5, relations: 10 },
        effectsFail: { happiness: -12, charisma: 2 },
        successMsg: "Вам ответили взаимностью! Это прекрасное теплое чувство окрыляет вас.",
        failMsg: "Вам вежливо сказали: «Давай просто дружить». Немного больно, но вы проявили смелость."
      },
      {
        label: "Подарить тайную записку с конфетой",
        req: { stat: "creativity", value: 20 },
        successChance: 0.85,
        effectsSuccess: { happiness: 10, creativity: 3 },
        effectsFail: { happiness: -4 },
        successMsg: "Записка вызвала искреннюю улыбку! Между вами завязалось теплое общение.",
        failMsg: "Записку перехватили одноклассники и подняли на смех."
      }
    ]
  },
  {
    id: "garage_peer_pressure",
    minAge: 13,
    maxAge: 19,
    title: "Подозрительная компания за гаражами",
    description: "Старшие знакомые предлагают попробовать украсть сигареты или вскрыть заброшенный ларек.",
    choices: [
      {
        label: "Категорически отказаться и уйти",
        req: { stat: "intellect", value: 20 },
        successChance: 0.9,
        effectsSuccess: { happiness: 4, relations: -4 },
        effectsFail: { relations: -8 },
        successMsg: "Вы твердо сказали «нет» и пошли домой. Позже эту компанию задержала полиция.",
        failMsg: "Над вами посмеялись, но вы сохранили чистую совесть."
      },
      {
        label: "Поддаться уговорам ради авторитета",
        req: null,
        successChance: 0.4,
        effectsSuccess: { money: 500, relations: 8 },
        effectsFail: { health: -10, happiness: -15, money: -1500 },
        successMsg: "Всё обошлось без свидетелей, компания признала вас своим.",
        failMsg: "Сработала сигнализация! Пришлось убегать, вас оштрафовали через родителей."
      }
    ]
  },
  {
    id: "street_fight_bystander",
    minAge: 15,
    maxAge: 35,
    title: "Уличная драка на ваших глазах",
    description: "Поздним вечером двое пьяных хулиганов пристают к беззащитному прохожему.",
    choices: [
      {
        label: "Вмешаться и защитить прохожего",
        req: { stat: "strength", value: 45 },
        successChance: 0.7,
        effectsSuccess: { strength: 4, relations: 12, happiness: 15 },
        effectsFail: { health: -25, happiness: -10 },
        successMsg: "Вы ловким ударом нейтрализовали зачинщика. Спасённый прохожий горячо благодарил вас!",
        failMsg: "Силы оказались неравны, вы получили травму, но хулиганы в итоге скрылись."
      },
      {
        label: "Вызвать полицию и привлечь внимание шумом",
        req: { stat: "intellect", value: 30 },
        successChance: 0.85,
        effectsSuccess: { intellect: 3, happiness: 8 },
        effectsFail: { happiness: -5 },
        successMsg: "Вы закричали о полиции и включили фонарь. Нападавшие испугались и бросились наутёк.",
        failMsg: "Полиция ехала долго, но крики всё же заставили хулиганов отступить."
      }
    ]
  },
  {
    id: "first_job_dilemma",
    minAge: 14,
    maxAge: 20,
    title: "Неожиданное предложение подработки",
    description: "Соседский предприниматель предлагает разгружать фуры или помогать вести складской учёт.",
    choices: [
      {
        label: "Пойти на тяжёлую физработу на склад",
        req: { stat: "strength", value: 25 },
        successChance: 0.85,
        effectsSuccess: { money: 4500, strength: 4, muscleMass: 3 },
        effectsFail: { health: -10, money: 2000 },
        successMsg: "Вы отлично потрудились, заработали хорошие деньги и укрепили мускулы!",
        failMsg: "Спина гудит от тяжестей, но первые честные деньги уже в кармане."
      },
      {
        label: "Предложить автоматизировать учёт через Excel",
        req: { stat: "intellect", value: 30 },
        successChance: 0.8,
        effectsSuccess: { money: 7000, intellect: 5, finance: 4 },
        effectsFail: { money: 2500, intellect: 2 },
        successMsg: "Сосед в восторге от вашей таблицы и выплатил вам щедрый бонус!",
        failMsg: "Учёт удалось наладить лишь частично, но вам всё равно заплатили."
      }
    ]
  },
  {
    id: "hacker_forum_invite",
    minAge: 15,
    maxAge: 30,
    title: "Приглашение на закрытый даркнет-форум",
    description: "Анонимный контакт в Telegram прислал ключ доступа к хакерскому сообществу с базами данных.",
    choices: [
      {
        label: "Изучить методы кибербезопасности во благо",
        req: { stat: "intellect", value: 45 },
        successChance: 0.8,
        effectsSuccess: { intellect: 8, knowledge: 8, happiness: 5 },
        effectsFail: { happiness: -8 },
        successMsg: "Вы изучили уязвимости, прокачали навыки реверс-инжиниринга и белого хакинга!",
        failMsg: "Форум оказался заблокирован спецслужбами, но вы успели сохранить конспекты."
      },
      {
        label: "Попытаться заработать на серых схемах",
        req: { stat: "finance", value: 30 },
        successChance: 0.5,
        effectsSuccess: { money: 45000, finance: 6 },
        effectsFail: { money: -20000, happiness: -20 },
        successMsg: "Схема сработала, баланс вашего криптокошелька солидно пополнился!",
        failMsg: "Вас подставили свои же сообщники! Вы потеряли деньги и чуть не попались киберполиции."
      }
    ]
  },
  {
    id: "university_bribe",
    minAge: 18,
    maxAge: 25,
    title: "Намёк профессора на «благодарность» за зачёт",
    description: "Строгий преподаватель открыто намекает, что без покупки его методички за 200$ зачёт не сдать.",
    choices: [
      {
        label: "Вызубрить предмет досконально и сдать с комиссией",
        req: { stat: "intellect", value: 50 },
        successChance: 0.85,
        effectsSuccess: { knowledge: 8, intellect: 5, relations: 5 },
        effectsFail: { happiness: -10, health: -5 },
        successMsg: "Вы блестяще ответили на все каверзные вопросы! Комиссия поставила высший балл.",
        failMsg: "Профессор всё равно придирался, но в итоге тройку поставил."
      },
      {
        label: "Заплатить требуемую сумму ради спокойствия",
        req: null,
        successChance: 1.0,
        effectsSuccess: { money: -6000, happiness: -4 },
        effectsFail: {},
        successMsg: "Зачёт поставлен в зачётку без лишних нервов, но осадок остался.",
        failMsg: ""
      }
    ]
  },
  {
    id: "startup_angel_investment",
    minAge: 20,
    maxAge: 55,
    title: "Рискованный раунд в стартап друга",
    description: "Близкий приятель разрабатывает мобильное AI-приложение и ищет ангельские инвестиции в 10,000$.",
    choices: [
      {
        label: "Инвестировать солидную сумму в долю стартапа",
        req: { stat: "finance", value: 45 },
        successChance: 0.55,
        effectsSuccess: { money: 85000, finance: 10, relations: 15 },
        effectsFail: { money: -35000, relations: -5 },
        successMsg: "Стартап взлетел в App Store! Ваша доля принесла многократную прибыль!",
        failMsg: "Продукт не нашёл рынка и закрылся через полгода. Деньги сгорели."
      },
      {
        label: "Помочь бесплатно советом и экспертной консультацией",
        req: { stat: "intellect", value: 40 },
        successChance: 0.9,
        effectsSuccess: { relations: 10, charisma: 4 },
        effectsFail: {},
        successMsg: "Друг искренне благодарен за дельные советы по продуктовой стратегии.",
        failMsg: ""
      }
    ]
  },
  {
    id: "corporate_whistleblower",
    minAge: 22,
    maxAge: 65,
    title: "Корпоративная махинация руководства",
    description: "Вы случайно обнаружили, что бухгалтерия занижает налоги и проводит фиктивные закупки.",
    choices: [
      {
        label: "Сообщить в службу внутреннего контроля и регуляторам",
        req: { stat: "intellect", value: 55 },
        successChance: 0.75,
        effectsSuccess: { charisma: 10, relations: 15, happiness: 10 },
        effectsFail: { relations: -20, happiness: -15 },
        successMsg: "Аудит подтвердил нарушения. Руководство сменили, а вас повысили за честность!",
        failMsg: "Начальство замяло дело, а вас сделали крайним и уволили с волчьим билетом."
      },
      {
        label: "Промолчать и сосредоточиться на своей работе",
        req: null,
        successChance: 0.9,
        effectsSuccess: { happiness: -2 },
        effectsFail: { happiness: -6 },
        successMsg: "Вы не стали лезть в чужие дела и спокойно сохранили свою должность.",
        failMsg: "Чувство несправедливости немного гложет изнутри."
      }
    ]
  },
  {
    id: "crypto_insider_tip",
    minAge: 18,
    maxAge: 45,
    title: "Инсайдерский слив по новому мем-токену",
    description: "Знакомый крипто-разработчик шепнул, что через 2 часа токен пампят топ-инфлюенсеры.",
    choices: [
      {
        label: "Зайти на всю котлету",
        req: { stat: "finance", value: 40 },
        successChance: 0.5,
        effectsSuccess: { money: 120000, finance: 8, happiness: 15 },
        effectsFail: { money: -40000, happiness: -20 },
        successMsg: "Токен вырос на 400%! Вы успели зафиксировать прибыль на самом пике!",
        failMsg: "Классический Rug Pull! Разработчики слили ликвидность, токен упал в ноль."
      },
      {
        label: "Инвестировать лишь символическую сумму для проверки",
        req: null,
        successChance: 0.7,
        effectsSuccess: { money: 5000, happiness: 4 },
        effectsFail: { money: -2000 },
        successMsg: "Небольшая сделка принесла приятный бонус к обеду без лишних нервов.",
        failMsg: "Потеряли пару сотен, но зато избежали катастрофы."
      }
    ]
  },
  {
    id: "family_loan_request",
    minAge: 20,
    maxAge: 65,
    title: "Родственник просит крупную сумму взаймы",
    description: "Двоюродный брат просит деньги якобы на открытие автосервиса, но прошлые долги он не вернул.",
    choices: [
      {
        label: "Твёрдо отказать и предложить помочь с бизнес-планом",
        req: { stat: "finance", value: 35 },
        successChance: 0.85,
        effectsSuccess: { finance: 3, intellect: 3, relations: -5 },
        effectsFail: { relations: -15 },
        successMsg: "Вы сберегли свои деньги. Брат немного обиделся, но деньги целы.",
        failMsg: "Разгорелся семейный скандал из-за вашего отказа."
      },
      {
        label: "Одолжить деньги под расписку",
        req: null,
        successChance: 0.35,
        effectsSuccess: { relations: 10, money: 5000 },
        effectsFail: { money: -25000, relations: -10 },
        successMsg: "Удивительно, но автосервис пошёл в гору, и долг вам вернули с процентами!",
        failMsg: "Брат прогорел через два месяца. Деньги растворились в воздухе."
      }
    ]
  },
  {
    id: "burnout_crisis",
    minAge: 23,
    maxAge: 65,
    title: "Тяжёлое профессиональное выгорание",
    description: "Бесконечные дедлайны и переработки довели вас до апатии: будильник вызывает дрожь.",
    choices: [
      {
        label: "Взять отпуск за свой счёт и уехать на природу",
        req: null,
        successChance: 0.9,
        effectsSuccess: { health: 15, happiness: 20, money: -8000 },
        effectsFail: { happiness: 5 },
        successMsg: "Неделя тишины в горах вернула вкус к жизни и ясный ум!",
        failMsg: "Отпуск помог, хотя мысли о работе всё ещё мелькали."
      },
      {
        label: "Заглушить усталость энергетиками и продолжать пахать",
        req: { stat: "strength", value: 40 },
        successChance: 0.4,
        effectsSuccess: { money: 15000, health: -10 },
        effectsFail: { health: -20, happiness: -20 },
        successMsg: "Дедлайн закрыт ценой колоссального перенапряжения.",
        failMsg: "Организм не выдержал: нервный срыв и больничный лист."
      }
    ]
  },
  {
    id: "romantic_ultimatum",
    minAge: 20,
    maxAge: 45,
    title: "Романтический ультиматум",
    description: "Партнёр жалуется, что вы постоянно заняты карьерой, и требует уделять больше времени семье.",
    choices: [
      {
        label: "Отрегулировать баланс жизни и устроить романтический отпуск",
        req: { stat: "relations", value: 50 },
        successChance: 0.85,
        effectsSuccess: { happiness: 15, relations: 20, money: -12000 },
        effectsFail: { relations: -5 },
        successMsg: "Ваш союз окреп! Партнёр чувствует заботу и любовь.",
        failMsg: "Поездка прошла с мелкими спорами, но напряжение спало."
      },
      {
        label: "Заявить, что карьера сейчас важнее всего",
        req: { stat: "finance", value: 50 },
        successChance: 0.6,
        effectsSuccess: { careerLevel: 1, relations: -25 },
        effectsFail: { relations: -40, happiness: -15 },
        successMsg: "Вы продвинулись на работе, но дома воцарился холод.",
        failMsg: "Отношения дали трещину, дело идёт к расставанию."
      }
    ]
  },
  {
    id: "stray_dog_rescue",
    minAge: 6,
    maxAge: 80,
    title: "Замёрзший бездомный щенок у подъезда",
    description: "Холодной осенью под лестницей скулит крошечный промокший щенок с умными глазами.",
    choices: [
      {
        label: "Забрать щенка домой и отогреть",
        req: null,
        successChance: 0.9,
        effectsSuccess: { happiness: 25, relations: 10, money: -1500 },
        effectsFail: { happiness: 5 },
        successMsg: "Малыш стал преданным другом! Ваш дом наполнился радостью.",
        failMsg: "Родители сначала ворчали, но щенок покорил сердца всех."
      },
      {
        label: "Отнести в проверенный приют и купить корм",
        req: null,
        successChance: 0.95,
        effectsSuccess: { happiness: 8, money: -800 },
        effectsFail: {},
        successMsg: "Приют позаботился о щенке, вскоре ему нашли хороших хозяев.",
        failMsg: ""
      }
    ]
  },
  {
    id: "political_rally",
    minAge: 16,
    maxAge: 65,
    title: "Массовый митинг на центральной площади",
    description: "Тысячи граждан вышли на площадь с требованием свободы слова и снижения налогов.",
    choices: [
      {
        label: "Выйти в первые ряды и произнести речь",
        req: { stat: "charisma", value: 55 },
        successChance: 0.7,
        effectsSuccess: { charisma: 12, relations: 15, happiness: 15 },
        effectsFail: { health: -15, happiness: -15 },
        successMsg: "Ваша речь зажгла толпу! Видео набрало миллионы просмотров.",
        failMsg: "Митинг разогнал спецназ, вы провели ночь в отделении полиции."
      },
      {
        label: "Наблюдать со стороны и вести прямой эфир",
        req: { stat: "intellect", value: 35 },
        successChance: 0.9,
        effectsSuccess: { charisma: 5, intellect: 3 },
        effectsFail: {},
        successMsg: "Вы сняли объективный репортаж и набрали новых подписчиков.",
        failMsg: ""
      }
    ]
  },
  {
    id: "art_forgery_offer",
    minAge: 22,
    maxAge: 70,
    title: "Сомнительная картина на закрытом аукционе",
    description: "Теневой коллекционер предлагает продать через вас полотно неизвестного происхождения за 50,000$.",
    choices: [
      {
        label: "Провести независимую экспертизу подлинности",
        req: { stat: "intellect", value: 50 },
        successChance: 0.85,
        effectsSuccess: { intellect: 6, relations: 10 },
        effectsFail: { money: -5000 },
        successMsg: "Экспертиза выявила искусную подделку! Вы спасли свою репутацию.",
        failMsg: "Экспертиза стоила денег, но результат оказался спорным."
      },
      {
        label: "Согласиться на сделку и забрать комиссионные",
        req: { stat: "finance", value: 40 },
        successChance: 0.45,
        effectsSuccess: { money: 180000, finance: 8 },
        effectsFail: { money: -100000, happiness: -25 },
        successMsg: "Покупатель остался доволен, вы получили огромные комиссионные!",
        failMsg: "Афера вскрылась! Интерпол объявил картину в розыск, вы понесли колоссальные убытки."
      }
    ]
  },
  {
    id: "gambling_night_spree",
    minAge: 21,
    maxAge: 65,
    title: "Закрытый VIP-турнир по покеру",
    description: "Состоятельные знакомые пригласили вас за стол высоких ставок в подпольном клубе.",
    choices: [
      {
        label: "Использовать математический расчёт вероятностей",
        req: { stat: "intellect", value: 60 },
        successChance: 0.75,
        effectsSuccess: { money: 85000, intellect: 5, happiness: 15 },
        effectsFail: { money: -30000, happiness: -10 },
        successMsg: "Холодный математический расчёт принёс вам победу и банк турнира!",
        failMsg: "Блеф соперника на ривере стоил вам солидного стека фишек."
      },
      {
        label: "Играть ва-банк на чистой интуиции",
        req: { stat: "charisma", value: 50 },
        successChance: 0.4,
        effectsSuccess: { money: 150000, charisma: 8 },
        effectsFail: { money: -50000, happiness: -20 },
        successMsg: "Невероятная удача! Вы собрали флеш-рояль на последней карте!",
        failMsg: "Удача отвернулась: проигрыш всей суммы ставок."
      }
    ]
  },
  {
    id: "health_checkup_warning",
    minAge: 30,
    maxAge: 75,
    title: "Предупреждение кардиолога",
    description: "На ежегодном медосмотре врач обнаружил повышенное давление и настаивает на смене режима.",
    choices: [
      {
        label: "Купить абонемент в бассейн и перейти на средиземноморскую диету",
        req: null,
        successChance: 0.9,
        effectsSuccess: { health: 18, happiness: 10, money: -6000 },
        effectsFail: { health: 5 },
        successMsg: "Через пару месяцев давление пришло в норму, самочувствие на высоте!",
        failMsg: "Диета даётся с трудом, но здоровье стабилизировалось."
      },
      {
        label: "Ограничиться таблетками и продолжать привычный ритм",
        req: null,
        successChance: 0.6,
        effectsSuccess: { health: 2 },
        effectsFail: { health: -15, happiness: -10 },
        successMsg: "Таблетки пока удерживают показатели в допустимых границах.",
        failMsg: "Симптомы усилились, пришлось лечь в стационар."
      }
    ]
  },
  {
    id: "legacy_inheritance_dispute",
    minAge: 25,
    maxAge: 60,
    title: "Спор вокруг наследства старинного дома",
    description: "Дедушка завещал старинную усадьбу, но дальние родственники грозят оспорить завещание через суд.",
    choices: [
      {
        label: "Нанять сильного адвоката и отстоять свои права",
        req: { stat: "finance", value: 45 },
        successChance: 0.8,
        effectsSuccess: { money: 350000, relations: -10, intellect: 4 },
        effectsFail: { money: -40000, relations: -20 },
        successMsg: "Суд подтвердил законность завещания! Усадьба перешла вам.",
        failMsg: "Тяжба затянулась, судебные издержки съели часть наследства."
      },
      {
        label: "Предложить мирный раздел имущества поровну",
        req: { stat: "relations", value: 40 },
        successChance: 0.9,
        effectsSuccess: { money: 150000, relations: 15 },
        effectsFail: { money: 80000 },
        successMsg: "Родственники оценили благородство, семья сохранила теплые связи.",
        failMsg: "Осадок остался, но деньги поделены честно."
      }
    ]
  },
  {
    id: "foreign_job_headhunter",
    minAge: 23,
    maxAge: 50,
    title: "Оффер от хедхантера в Берлин",
    description: "Немецкая корпорация предлагает переезд в Берлин с удвоением оклада и оплатой жилья.",
    choices: [
      {
        label: "Принять предложение и переехать в Германию",
        req: { stat: "intellect", value: 50 },
        successChance: 0.85,
        effectsSuccess: { money: 65000, intellect: 8, charisma: 5 },
        effectsFail: { happiness: -10 },
        successMsg: "Вы успешно релоцировались! Европейский опыт открыл новые горизонты.",
        failMsg: "Адаптация далась непросто из-за языка, но карьера пошла вверх."
      },
      {
        label: "Остаться дома и потребовать повышения на текущей работе",
        req: { stat: "charisma", value: 45 },
        successChance: 0.75,
        effectsSuccess: { money: 25000, relations: 10 },
        effectsFail: { happiness: -5 },
        successMsg: "Руководство испугалось потерять вас и существенно подняло зарплату!",
        failMsg: "Вам отказали в прибавке, но вы остались в привычном кругу друзей."
      }
    ]
  },
  {
    id: "tax_audit_investigation",
    minAge: 22,
    maxAge: 70,
    title: "Внезапная проверка налоговой инспекции",
    description: "Налоговая инспекция запросила происхождение средств на ваших банковских счетах.",
    choices: [
      {
        label: "Предоставить идеальные декларации с аудитором",
        req: { stat: "finance", value: 50 },
        successChance: 0.9,
        effectsSuccess: { finance: 5, intellect: 4, happiness: 5 },
        effectsFail: { money: -15000 },
        successMsg: "Инспектор не нашёл ни единого нарушения и снял все претензии!",
        failMsg: "Обнаружились мелкие недоимки, пришлось заплатить небольшой штраф."
      },
      {
        label: "Попытаться замять дело через теневые связи",
        req: { stat: "relations", value: 60 },
        successChance: 0.55,
        effectsSuccess: { relations: 5, money: -20000 },
        effectsFail: { money: -75000, wantedLevel: 1, happiness: -20 },
        successMsg: "Связи помогли, проверка закрыта без последствий.",
        failMsg: "Посредник оказался под наблюдением! Вас оштрафовали по полной программе."
      }
    ]
  }
];
