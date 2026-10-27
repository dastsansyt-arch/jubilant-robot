export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type Season = 'Весна' | 'Лето' | 'Осень' | 'Зима';
export type WeatherType = 'Ясно' | 'Дождь' | 'Гроза' | 'Снегопад' | 'Туман' | 'Жара';

export type TurnStepMode = 'day' | 'week' | 'month' | 'year';
export type CurrencyCode = 'USD' | 'EUR';

export type LifeFocus =
  | 'Учёба'
  | 'Карьера'
  | 'Спорт и Сила'
  | 'Бизнес и Политика'
  | 'Инвестиции'
  | 'Медиа и Музыка'
  | 'Уберэкс'
  | 'Раннее развитие'
  | 'Активный малыш'
  | 'Любимчик семьи';
export type SpendingMode = 'Экономный' | 'Баланс' | 'Роскошный';

export type OutfitStyle = 'casual' | 'business' | 'sport' | 'street' | 'luxury';
export type FacialHairId = 'none' | 'stubble' | 'mustache' | 'goatee' | 'beard' | 'full_beard';

export interface AgeGateInfo {
  allowed: boolean;
  minAge: number;
  reason: string;
}

export interface CharacterAppearance {
  id: number; // 1 to 60
  label: string;
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'spiky' | 'long' | 'curly' | 'bob' | 'fade' | 'bun' | 'hood';
  eyeColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  hasGlasses: boolean;
  hasHeadphones: boolean;
  archetypeTag: string;
}

export type RegionGroup =
  | 'Украина (Областные центры)'
  | 'Евросоюз и Европа'
  | 'Курорты мира и Европы'
  | 'СНГ и Восточная Европа'
  | 'Северная и Южная Америка'
  | 'Азия и Ближний Восток';

export interface CityOption {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  regionGroup: RegionGroup;
  currency: CurrencyCode;
  localCurrencyLabel: string;
  relocationCost: number;
  populationInSim: number;
  countrySimPop: number;
  economyMultiplier: number;
  livingCostAnnual: number;
  monthlyRentBase: number;
  monthlyFoodBase: number;
  monthlyUtilitiesBase: number;
  climateBias: WeatherType[];
  skylineStyle: 'latam' | 'euro' | 'asia' | 'nordic' | 'americas';
  defaultNames: string[];
  isResort?: boolean;
}

export interface FamilyMember {
  id: string;
  relation: 'Мать' | 'Отец' | 'Брат / Сестра' | 'Супруг(а)';
  name: string;
  age: number;
  profession: string;
  monthlyIncome: number;
  health: number;
  relationship: number;
  trait: string;
  alive: boolean;
}

export interface Skills {
  intellect: number;      // Наука, IT и аналитика
  strength: number;       // Физическая сила (влияет на габариты героя)
  muscleMass: number;     // Мышечная масса и рельеф (влияет на спрайт)
  charisma: number;       // Харизма, политика, переговоры и сцена
  finance: number;        // Финансы, бизнес, франшизы и инвестиции
  creativity: number;     // Музыка, искусство и медиа
  urbex: number;          // Экстрим, вождение и сталкерство
  fitness: number;        // Выносливость и здоровье
}

export type EducationRegionGroup =
  | 'Украина (Топ-10 ВУЗов)'
  | 'Евросоюз и Великобритания (Топ-10 ВУЗов)'
  | 'РФ и СНГ (Топ-10 ВУЗов)'
  | 'США и Азия (Мировой Топ-10)'
  | 'Среднее образование (Колледжи и Техникумы)';

export type LanguageCode =
  | 'UK' // Украинский
  | 'EN' // Английский
  | 'PL' // Польский
  | 'DE' // Немецкий
  | 'ES' // Испанский
  | 'FR' // Французский
  | 'IT' // Итальянский
  | 'EU' // Европейский (Чешский / Нидерландский / Скандинавский)
  | 'RU' // Русский
  | 'AS'; // Азиатский (Японский / Корейский / Китайский)

export interface LanguageCourseItem {
  id: string;
  langCode: LanguageCode;
  langName: string;
  flagLabel: string;
  targetLevel: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
  cefrLabel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number;
  intellectGain: number;
  charismaGain: number;
  description: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  institutionType: 'Университет' | 'Колледж' | 'Академия' | 'Техникум / Лицей';
  regionGroup: EducationRegionGroup;
  cityOrCountry: string;
  countryCode?: string;
  countryName?: string;
  rankInCountry?: number;
  worldRankLabel?: string;
  durationYears: number;
  tuitionCost: number;
  requiredIntellect: number;
  minSchoolGrade?: number; // e.g., 7.0 to 11.2 (on 12-point scale)
  requiredLanguageCode?: LanguageCode;
  requiredLanguageLevel?: number; // 1=A1 .. 4=B2, 5=C1
  primarySkill: keyof Skills;
  skillBonus: number;
  diplomaLabel: string;
}

export interface HobbyItem {
  id: string;
  name: string;
  category:
    | 'Спорт и Сила'
    | 'Музыка и Сцена'
    | 'IT и Наука'
    | 'Экстрим и Уберэкс'
    | 'Авто и Мото'
    | 'Искусство и Стиль';
  monthlyCost: number;
  skillKey: keyof Skills;
  skillGain: number;
  strengthGain: number;
  muscleGain: number;
  happinessGain: number;
  healthDelta: number;
}

export interface SocialFaction {
  id: string;
  name: string;
  category:
    | 'Криминал и Улица'
    | 'Музыка и Богема'
    | 'Спорт и Автоклуб'
    | 'Бизнес и ИТ'
    | 'Сталкеры и Андеграунд';
  riskPercent: number;
  monthlyBonusOrFee: number;
  respectScore: number;
  perkLabel: string;
  description: string;
}

export interface RealArtist {
  id: string;
  name: string;
  region: 'СНГ' | 'Европа' | 'Америка';
  genre: string;
  ticketPrice: number;
  collabPrice: number;
  fameBoost: number;
}

export interface PetItem {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'corgi' | 'raven' | 'shiba';
  breedLabel: string;
  price: number;
  annualCareCost: number;
  skillBonusLabel: string;
  happinessBonus: number;
  healthBonus: number;
  urbexSafetyBonus: number;
  followerMultiplier: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface HouseItem {
  id: string;
  name: string;
  propertyType: 'Квартира' | 'Дом' | 'Апартаменты' | 'Особняк' | 'Вилла на курорте';
  tier: number;
  price: number;
  monthlyRentIncome: number;
  upkeepAnnual: number;
  skillBonusLabel: string;
  energyRecoveryBonus: number;
  blogGrowthBonus: number;
  prestigeBonus: number;
  roofColor: string;
  wallColor: string;
  floors: number;
}

export type VehicleCategory =
  | 'bicycle'
  | 'motorcycle'
  | 'car'
  | 'suv'
  | 'hypercar'
  | 'yacht'
  | 'helicopter'
  | 'jet';

export interface VehicleItem {
  id: string;
  name: string;
  type: VehicleCategory;
  categoryLabel: string;
  brand: string;
  price: number;
  monthlyUpkeep: number;
  baseHorsepower: number;
  prestigeBonus: number;
  bodyColor: string;
  accentColor: string;
  releaseYear?: number;
}

export interface TuningUpgrade {
  id: string;
  targetType: 'house' | 'vehicle';
  name: string;
  price: number;
  bonusLabel: string;
  prestigeBonus: number;
  horsepowerBonus: number;
  muscleBonus: number;
  happinessBonus: number;
  visualAccentColor?: string;
}

export interface BrandItem {
  id: string;
  brand:
    | 'Nike'
    | 'Adidas'
    | 'Supreme'
    | 'Stone Island'
    | 'The North Face'
    | 'Gucci'
    | 'Balenciaga'
    | 'Rolex'
    | 'Sony';
  name: string;
  slot: 'outerwear' | 'footwear' | 'accessory' | 'gear';
  price: number;
  stylePoints: number;
  weatherProtection: boolean;
  urbexBonus: number;
  charismaBonus: number;
  spriteAccentColor: string;
  badgeText: string;
}

export type CareerCategory =
  | 'urbex'
  | 'tech'
  | 'finance'
  | 'creative'
  | 'science'
  | 'freelance'
  | 'medicine'
  | 'law'
  | 'sports'
  | 'aviation'
  | 'culinary'
  | 'security'
  | 'gov'
  | 'construction'
  | 'energy'
  | 'tourism';

export interface CareerTrack {
  id: string;
  sector: string;
  category: CareerCategory;
  title: string;
  level: number;
  minAge: number;
  requiredSkill: keyof Skills;
  requiredSkillValue: number;
  annualSalary: number;
  stressImpact: number;
  description: string;
  mechanicActionLabel: string;
  mechanicStatLabel: string;
  mechanicBonusMoney: number;
}

export type ProfessionMiniGameType =
  | 'code_matrix'
  | 'precision_reflex'
  | 'deal_negotiation'
  | 'creative_studio';

export interface ProfessionDilemmaOption {
  label: string;
  approach: 'safe' | 'creative' | 'risky';
  kpiDelta: number;
  bonusMultiplier: number;
  stressDelta: number;
  outcomeHint: string;
}

export interface ProfessionShiftCase {
  id: string;
  category: CareerCategory;
  scenarioTitle: string;
  scenarioPrompt: string;
  miniGameType: ProfessionMiniGameType;
  miniGameTitle: string;
  miniGameTargetHint: string;
  options: ProfessionDilemmaOption[];
}

export interface CareerStats {
  totalShiftsWorked: number;
  kpiScore: number;
  specialActionsDone: number;
  promotionsCount: number;
  miniGamesWon: number;
  perfectShifts: number;
  currentCombo: number;
  sectorMetrics: Record<string, number>; // e.g. IT releases, surgeries, court cases won, flights, etc.
}

export type TechGadgetCategory =
  | 'Смартфоны и Флагманы'
  | 'Ноутбуки и Ультрабуки'
  | 'Консоли, VR и Камеры'
  | 'Умная техника и Аудио';

export interface TechGadgetItem {
  id: string;
  name: string;
  brand: string;
  category: TechGadgetCategory;
  price: number;
  intellectBonus: number;
  creativityBonus: number;
  charismaBonus: number;
  kpiBoost: number;
  description: string;
  releaseYear?: number;
}

export type PcSlotType = 'cpu' | 'gpu' | 'ram' | 'ssd' | 'cooling_case' | 'monitor';

export interface PcComponentItem {
  id: string;
  slot: PcSlotType;
  slotLabel: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  price: number;
  perfScore: number;
  powerWatts: number;
  bonusLabel: string;
  releaseYear?: number;
}

export interface BusinessFranchiseItem {
  id: string;
  name: string;
  industry:
    | 'Кофейни и Пекарни'
    | 'Рестораны и FastFood'
    | 'IT и AI-Стартапы'
    | 'Автобизнес и Тюнинг'
    | 'Фитнес и СПА'
    | 'Агрохолдинг и Эко-фермы'
    | 'Строительство и Девелопмент'
    | 'Фармацевтика и Клиники'
    | 'Логистика и Карго'
    | 'Отели и Курорты'
    | 'Медиа-лейбл и Кино'
    | 'Энергетика и Сеть АЗС';
  isFranchise: boolean;
  buyCost: number;
  upgradeCostBase: number;
  monthlyRevenueBase: number;
  monthlyExpensesBase: number;
  employeesBase: number;
  requiredFinanceSkill: number;
  description: string;
}

export interface OwnedBusiness {
  businessId: string;
  level: number; // 1 to 5
  customBranches: number;
}

export interface PoliticalPosition {
  id: string;
  title: string;
  tier: number; // 1 to 8
  minAge: number;
  requiredCharisma: number;
  requiredApproval: number;
  campaignCost: number;
  annualSalary: number;
  influencePerMonth: number;
  description: string;
}

export interface PoliticalReform {
  id: string;
  title: string;
  description: string;
  minTier: number;
  influenceCost: number;
  approvalDelta: number;
  businessYieldBonusPercent: number;
  cityEconomyBoost: number;
}

export interface UrbexSpot {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  requiredUrbexSkill: number;
  weatherBonus: WeatherType;
  baseSubscribersGain: number;
  baseAdRevenue: number;
  injuryRisk: number;
  description: string;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  ticker: string;
  category: 'ИТ-акции' | 'Индекс ETF' | 'Криптовалюта' | 'Облигации' | 'Венчур';
  currentPrice: number;
  annualYieldPercent: number;
  volatility: number;
  ownedUnits: number;
}

export interface NPCFriend {
  id: string;
  name: string;
  role: string;
  trait: string;
  relationship: number;
  avatarSeed: number;
  lastMessage: string;
  metAtAge: number;
}

export interface EventChoice {
  label: string;
  outcomeText: string;
  nextStoryArc?: string;
  healthDelta?: number;
  happinessDelta?: number;
  knowledgeDelta?: number;
  relationsDelta?: number;
  moneyDelta?: number;
  skillKey?: keyof Skills;
  skillDelta?: number;
  followersDelta?: number;
}

export interface LifeEventTemplate {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  weatherCondition?: WeatherType | 'any';
  seasonCondition?: Season | 'any';
  careerCondition?: string | 'any';
  isCustomMod?: boolean;
  choices: EventChoice[];
}

export interface SteroidCycleItem {
  id: string;
  name: string;
  category: 'oral' | 'injectable' | 'hgh' | 'pct';
  price: number;
  strengthGain: number;
  muscleGain: number;
  fitnessGain: number;
  healthDelta: number;
  happinessDelta: number;
  description: string;
}

export interface BadHabitsState {
  smoking: number; // 0 to 100 addiction level
  alcohol: number; // 0 to 100 addiction level
  drugs: number;   // 0 to 100 addiction level
}

export interface HabitActionItem {
  id: string;
  name: string;
  habitType: 'smoking' | 'alcohol' | 'drugs' | 'rehab';
  price: number;
  addictionDelta: number;
  happinessDelta: number;
  healthDelta: number;
  relationsDelta: number;
  description: string;
}

export interface CrimeActionItem {
  id: string;
  name: string;
  category: 'theft' | 'gang_shootout' | 'heist' | 'cyber' | 'racket';
  minPayout: number;
  maxPayout: number;
  baseSuccessChance: number; // 0-100
  wantedGain: number;        // +1 to +3 stars
  healthRiskOnFail: number;
  fineMultOnFail: number;
  requiredStrength: number;
  requiredIntellect: number;
  description: string;
}

export interface BribeActionItem {
  id: string;
  name: string;
  direction: 'give' | 'take';
  costOrReward: number;
  wantedDelta: number;
  riskPercent: number;
  approvalDelta: number;
  description: string;
}

export type CasinoGameType = 'roulette_red' | 'roulette_zero' | 'blackjack' | 'slots_777' | 'high_poker';

export interface NightlifePackageItem {
  id: string;
  name: string;
  tierLabel: string;
  price: number;
  happinessGain: number;
  healthDelta: number;
  charismaGain: number;
  description: string;
}

export interface RomancePartner {
  id: string;
  name: string;
  age: number;
  profession: string;
  personality: string;
  favoriteStyle: string;
  wealthBonusPerMonth: number;
  happinessBonus: number;
  hairColor: string;
  outfitColor: string;
}

export interface ChronicleEntry {
  id: string;
  age: number;
  year: number;
  dateLabel?: string;
  season: Season;
  weather: WeatherType;
  text: string;
  starred: boolean;
  category:
    | 'life'
    | 'weather'
    | 'career'
    | 'urbex'
    | 'npc'
    | 'finance'
    | 'mod'
    | 'family'
    | 'music'
    | 'business'
    | 'politics'
    | 'crime'
    | 'romance';
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetType:
    | 'age'
    | 'followers'
    | 'knowledge'
    | 'wealth'
    | 'friends'
    | 'urbex_raids'
    | 'strength'
    | 'hobbies';
  targetValue: number;
  currentValue: number;
  rewardMoney: number;
  rewardSkillKey: keyof Skills;
  rewardSkillAmount: number;
  completed: boolean;
  claimed: boolean;
}

export interface AiMemoryEntry {
  id: string;
  age: number;
  year: number;
  actionTaken: string;
  consequenceSummary: string;
  tag: 'birth' | 'school' | 'university' | 'career' | 'crime' | 'romance' | 'habit' | 'relocation' | 'choice';
}

export interface AiMemoryState {
  coreBiographySummary: string;
  lastEventId: string | null;
  lastChoiceSummary: string | null;
  entries: AiMemoryEntry[];
}

export interface PlayerState {
  name: string;
  age: number;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  currentYear: number;
  monthOfYear: number; // 1 to 12
  dayOfMonth: number;  // 1 to 30
  turnStep: TurnStepMode;
  yearProgress: number; // 0 to 100
  season: Season;
  weather: WeatherType;
  city: CityOption;
  currency: CurrencyCode;
  appearance: CharacterAppearance;

  // Core 4 stats
  health: number;     // Здоровье (0-100)
  happiness: number;  // Счастье (0-100)
  knowledge: number;  // Знания (0-100)
  relations: number;  // Отношения (0-100)

  // Physical Morphology
  heightCm: number;
  weightKg: number;

  focus: LifeFocus;
  spendingMode: SpendingMode;
  money: number; // Can go negative into debt before bankruptcy!
  isBankrupt: boolean;
  skills: Skills;

  // Family & Narrative Storyline + Persistent Anti-Hallucination AI Memory
  family: FamilyMember[];
  storyArc: string;
  storyHistory: string[];
  aiMemory: AiMemoryState;

  // Education (School Grades, Languages, Numbered Colleges & Top-10 Universities per Country)
  secondarySchoolName: string;
  schoolGradeAvg: number; // 4.0 to 12.0 (12-point scale)
  languages: Record<string, number>; // LanguageCode -> level 0..6 (None, A1, A2, B1, B2, C1, C2)
  localColleges: UniversityProgram[];
  completedEducationIds: string[];
  activeHobbyIds: string[];
  activeFactionId: string | null;
  attendedArtistIds: string[];
  collabArtistIds: string[];

  // Career, Per-Profession Mechanics, Mini-Games & Media
  currentCareerId: string | null;
  careerStats: CareerStats;
  urbexSubscribers: number;
  urbexVideosCount: number;
  urbexRaidsDone: number;

  // Business & Franchises
  ownedBusinesses: OwnedBusiness[];

  // Politics & Governance
  politicalPositionId: string | null;
  approvalRating: number;       // 0 to 100%
  politicalInfluence: number;   // Political capital points
  enactedReformIds: string[];

  // Real Estate, Vehicles, Smartphones, Laptops, Tech & Custom PC Build
  activePetId: string | null;
  ownedPetIds: string[];
  activeHouseId: string;
  ownedHouseIds: string[];
  rentedOutHouseIds: string[];
  installedHouseTuningIds: string[];

  activeVehicleId: string | null;
  ownedVehicleIds: string[];
  installedVehicleTuningIds: string[];

  activeSmartphoneId: string | null;
  activeLaptopId: string | null;
  ownedTechGadgetIds: string[];
  customPcBuild: Record<PcSlotType, string | null>;

  equippedBrandIds: string[];
  ownedBrandIds: string[];

  // Sports Pharmacology (Steroids), Bad Habits, Crime, Bribes, Casino & Romance
  steroidCyclesUsed: number;
  habits: BadHabitsState;
  wantedLevel: number;          // 0 to 5 stars
  bribesTakenCount: number;
  heistsCompleted: number;
  casinoNetProfit: number;
  activePartnerId: string | null;
  partnerRelationship: number;  // 0 to 100
  isMarried: boolean;

  // Realistic Monthly Expenses Breakdown
  monthlyExpenses: {
    food: number;
    utilities: number;
    rentOrUpkeep: number;
    transport: number;
    hobbiesAndFaction: number;
    total: number;
  };

  // Portfolio & NPCs
  investments: Record<string, number>;
  friends: NPCFriend[];
  chronicle: ChronicleEntry[];
  activePendingEvent: LifeEventTemplate | null;
  quests: DailyQuest[];
  customMods: LifeEventTemplate[];
  offlineAiMode: boolean;
  isAlive: boolean;
  causeOfEnd?: string;

  // === NEW FIELDS v2.0 ===

  // Stress & Burnout
  stress: number;               // 0-100

  // Tax scrutiny & shadow economy
  taxScrutiny: number;          // 0-100
  shadowIncome: number;         // accumulated illegal income
  
  // Blog / Social media
  blogPostsCount: number;
  blogAdRevenue: number;        // monthly ad revenue $

  // Parental system (ages 0-17)
  pocketMoneyPerMonth: number;
  petRequestCooldown: number;   // turns before next pet request
  hasInjury: boolean;           // temporary injury visual
  injuryTurnsLeft: number;

  // Extended appearance customization
  hairstyleId: string;
  facialHairId: FacialHairId;
  hasMask: boolean;
  tattooLevel: number;          // 0-3
  outfitStyle: OutfitStyle;

  // Seasonal event tracking
  lastSeasonalEventYear: number;
  birthdayEventFiredThisYear: boolean;
}


