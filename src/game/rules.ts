import {
  PlayerState,
  Season,
  WeatherType,
  CityOption,
  CharacterAppearance,
  DailyQuest,
  EventChoice,
  LifeEventTemplate,
  UrbexSpot,
  TurnStepMode,
  CurrencyCode,
  BusinessFranchiseItem,
  PoliticalPosition,
  PoliticalReform,
  TechGadgetItem,
  PcComponentItem,
  PcSlotType,
  SteroidCycleItem,
  HabitActionItem,
  CrimeActionItem,
  BribeActionItem,
  CasinoGameType,
  NightlifePackageItem,
  RomancePartner,
  LanguageCourseItem,
  UniversityProgram,
  AiMemoryEntry,
  AgeGateInfo,
  WardrobeItem,
  LifeFocus,
  BackgroundLocationId,
  ProactiveNpcChatThread,
} from './types';
import {
  buildMilitaryFrontlineEvents,
  buildItDevEvents,
  buildBloggingMediaEvents,
  buildBusinessCorporateEvents,
  buildEducationStudyEvents,
} from './roleEventsCatalog';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  PETS_CATALOG,
  HOUSES_CATALOG,
  BRANDS_CATALOG,
  WARDROBE_CATALOG,
  CAREERS_CATALOG,
  INITIAL_INVESTMENTS,
  INITIAL_FRIENDS,
  CORE_EVENTS_CATALOG,
} from './catalogs';
import {
  generateFamilyForCity,
  generateSecondaryEducationForCity,
  HOBBIES_80,
  FACTIONS_26,
  VEHICLES_CATALOG,
  TUNING_CATALOG,
  BUSINESS_CATALOG,
  POLITICAL_POSITIONS,
  POLITICAL_REFORMS,
  PROFESSION_SHIFT_CASES,
  TECH_GADGETS_CATALOG,
  PC_COMPONENTS_CATALOG,
  ROMANCE_PARTNERS_CATALOG,
  PEER_PRESSURE_EVENTS_CATALOG,
  getNativeLanguageForCountry,
  LANGUAGE_NAMES,
  CEFR_LEVEL_LABELS,
} from './worldData';

export const SEASONS_ORDER: Season[] = ['Весна', 'Лето', 'Осень', 'Зима'];

export function clampStat(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function formatMoney(amount: number, currency: CurrencyCode = 'USD'): string {
  const sym = currency === 'EUR' ? '€' : '$';
  const abs = Math.abs(Math.round(amount)).toLocaleString('ru-RU');
  return amount < 0 ? `-${sym}${abs}` : `${sym}${abs}`;
}

export function createInitialQuests(): DailyQuest[] {
  return [
    {
      id: 'q_strength_45',
      title: 'Атлетическая форма и рельеф',
      description: 'Поднимите показатель Силы или Мышечной массы до 45 единиц через спорт и хобби.',
      targetType: 'strength',
      targetValue: 45,
      currentValue: 24,
      rewardMoney: 900,
      rewardSkillKey: 'strength',
      rewardSkillAmount: 10,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_knowledge_70',
      title: 'Высшая квалификация',
      description: 'Поднимите показатель Знаний до 70 единиц в школе или университете.',
      targetType: 'knowledge',
      targetValue: 70,
      currentValue: 58,
      rewardMoney: 800,
      rewardSkillKey: 'intellect',
      rewardSkillAmount: 10,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_wealth_10k',
      title: 'Финансовая подушка безопасности',
      description: 'Накопите 10 000 единиц личного капитала и активов.',
      targetType: 'wealth',
      targetValue: 10000,
      currentValue: 1200,
      rewardMoney: 2000,
      rewardSkillKey: 'finance',
      rewardSkillAmount: 12,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_urbex_1k',
      title: 'Медийный прорыв (1 000 подписчиков)',
      description: 'Наберите 1 000 подписчиков в вашем блоге или музыкальном проекте.',
      targetType: 'followers',
      targetValue: 1000,
      currentValue: 140,
      rewardMoney: 1100,
      rewardSkillKey: 'charisma',
      rewardSkillAmount: 10,
      completed: false,
      claimed: false,
    },
  ];
}

export function calculateMonthlyBusinessSummary(state: PlayerState) {
  let totalRevenue = 0;
  let totalPayrollAndTax = 0;
  let totalEmployees = 0;

  const reformYieldBonus = state.enactedReformIds.reduce((sum, refId) => {
    const r = POLITICAL_REFORMS.find((item) => item.id === refId);
    return sum + (r ? r.businessYieldBonusPercent : 0);
  }, 0);

  const skillMultiplier = 1 + state.skills.finance / 220 + reformYieldBonus / 100;

  for (const owned of state.ownedBusinesses) {
    const catalogItem = BUSINESS_CATALOG.find((b) => b.id === owned.businessId);
    if (!catalogItem) continue;
    const scale = (1 + (owned.level - 1) * 0.45) * owned.customBranches;
    const rev = Math.round(catalogItem.monthlyRevenueBase * scale * skillMultiplier * state.city.economyMultiplier);
    const exp = Math.round(catalogItem.monthlyExpensesBase * scale * state.city.economyMultiplier);
    totalRevenue += rev;
    totalPayrollAndTax += exp;
    totalEmployees += catalogItem.employeesBase * owned.customBranches + (owned.level - 1) * 3;
  }

  return {
    totalRevenue,
    totalPayrollAndTax,
    netMonthlyProfit: totalRevenue - totalPayrollAndTax,
    totalEmployees,
  };
}

export function calculateMonthlyExpenses(state: {
  age: number;
  city: CityOption;
  spendingMode: PlayerState['spendingMode'];
  activeHouseId: string;
  installedHouseTuningIds: string[];
  activeVehicleId: string | null;
  activeHobbyIds: string[];
  activeFactionId: string | null;
  season?: Season;
}) {
  const house = HOUSES_CATALOG.find((h) => h.id === state.activeHouseId) || HOUSES_CATALOG[0];
  const vehicle = VEHICLES_CATALOG.find((v) => v.id === state.activeVehicleId) || null;
  const spendMult =
    state.spendingMode === 'Экономный' ? 0.65 : state.spendingMode === 'Баланс' ? 1.0 : 1.75;

  const isAdult = state.age >= 18;
  const livesWithParents = house.id === 'parents_home';

  const food = isAdult
    ? Math.round(state.city.monthlyFoodBase * spendMult)
    : livesWithParents
    ? 0
    : Math.round(state.city.monthlyFoodBase * 0.25 * spendMult);

  const hasSmartHome = state.installedHouseTuningIds.includes('tune_home_smart');
  const winterHeatingMult = state.season === 'Зима' ? 1.35 : 1.0;
  const rawUtilities =
    isAdult || !livesWithParents
      ? Math.round(
          state.city.monthlyUtilitiesBase *
            house.floors *
            (hasSmartHome ? 0.6 : 1.0) *
            winterHeatingMult
        )
      : 0;

  const rentOrUpkeep =
    livesWithParents
      ? isAdult
        ? Math.round(state.city.monthlyRentBase * 0.6)
        : 0
      : Math.round(house.upkeepAnnual / 12);

  const transport = vehicle ? vehicle.monthlyUpkeep : isAdult ? 45 : livesWithParents ? 0 : 15;

  const hobbiesCost =
    state.age >= 6
      ? state.activeHobbyIds.reduce((sum, id) => {
          const h = HOBBIES_80.find((item) => item.id === id);
          return sum + (h ? h.monthlyCost : 0);
        }, 0)
      : 0;

  const faction = state.age >= 14 ? FACTIONS_26.find((f) => f.id === state.activeFactionId) : undefined;
  const factionFee = faction && faction.monthlyBonusOrFee < 0 ? Math.abs(faction.monthlyBonusOrFee) : 0;

  const hobbiesAndFaction = hobbiesCost + factionFee;
  const total = food + rawUtilities + rentOrUpkeep + transport + hobbiesAndFaction;

  return {
    food,
    utilities: rawUtilities,
    rentOrUpkeep,
    transport,
    hobbiesAndFaction,
    total,
  };
}

export function createInitialPlayerState(
  customCity?: CityOption,
  customAppearance?: CharacterAppearance,
  customName?: string,
  customBirthYear = 2008,
  customBirthMonth = 5,
  customBirthDay = 15,
  startingAge = 0
): PlayerState {
  const city = customCity || CITIES_CATALOG[0];
  const appearance = customAppearance || CHARACTER_APPEARANCES[0];
  const name = customName?.trim() || city.defaultNames[0];
  const family = generateFamilyForCity(city, name);
  const secEdu = generateSecondaryEducationForCity(city, startingAge);
  const nativeLang = getNativeLanguageForCountry(city.countryCode);

  const initialSeason: Season =
    customBirthMonth >= 3 && customBirthMonth <= 5
      ? 'Весна'
      : customBirthMonth >= 6 && customBirthMonth <= 8
      ? 'Лето'
      : customBirthMonth >= 9 && customBirthMonth <= 11
      ? 'Осень'
      : 'Зима';

  const initialLanguages: Record<string, number> = {
    UK: nativeLang === 'UK' ? 4 : 0,
    EN: nativeLang === 'EN' ? 4 : 1,
    PL: nativeLang === 'PL' ? 4 : 0,
    DE: nativeLang === 'DE' ? 4 : 0,
    ES: nativeLang === 'ES' ? 4 : 0,
    FR: nativeLang === 'FR' ? 4 : 0,
    IT: nativeLang === 'IT' ? 4 : 0,
    EU: nativeLang === 'EU' ? 4 : 0,
    RU: nativeLang === 'RU' ? 4 : 1,
    AS: nativeLang === 'AS' ? 4 : 0,
  };

  const currentYear = customBirthYear + startingAge;

  const hasPet = Math.random() < 0.015; // 1.5% chance for a family pet at birth

  const baseState: PlayerState = {
    name,
    age: startingAge,
    birthYear: customBirthYear,
    birthMonth: customBirthMonth,
    birthDay: customBirthDay,
    currentYear,
    monthOfYear: customBirthMonth,
    dayOfMonth: customBirthDay,
    turnStep: 'year',
    yearProgress: 0,
    season: initialSeason,
    weather: 'Ясно',
    city,
    currency: city.currency,
    appearance,

    health: 96,
    happiness: 96,
    knowledge: startingAge === 0 ? 15 : 58,
    relations: 85,

    heightCm: startingAge === 0 ? 52 : Math.round(60 + startingAge * 8),
    weightKg: startingAge === 0 ? 4 : Math.round(8 + startingAge * 3),

    focus: startingAge < 6 ? 'Раннее развитие' : 'Учёба',
    spendingMode: 'Баланс',
    money: startingAge === 0 ? 0 : startingAge < 18 ? 300 : 1500,
    isBankrupt: false,
    skills: {
      intellect: startingAge === 0 ? 12 : 28,
      strength: startingAge === 0 ? 10 : 24,
      muscleMass: startingAge === 0 ? 10 : 20,
      charisma: startingAge === 0 ? 16 : 24,
      finance: startingAge === 0 ? 10 : 18,
      creativity: startingAge === 0 ? 18 : 26,
      urbex: startingAge === 0 ? 10 : 18,
      fitness: startingAge === 0 ? 20 : 32,
    },

    family,
    storyArc: 'Глава I: Рождение и первые шаги в семье',
    storyHistory: [`Рождение ${customBirthDay}.${customBirthMonth}.${customBirthYear} в г. ${city.name} (${city.country})`],
    aiMemory: {
      coreBiographySummary: `${name} родился(лась) ${customBirthDay}.${customBirthMonth}.${customBirthYear} в г. ${city.name} (${city.country}). Мать: ${family[0].name} (${family[0].profession}), отец: ${family[1].name} (${family[1].profession}).`,
      lastEventId: null,
      lastChoiceSummary: 'Жизнь только началась в кругу семьи.',
      entries: [
        {
          id: 'mem_birth',
          age: startingAge,
          year: currentYear,
          actionTaken: `Рождение в г. ${city.name} (${city.country})`,
          consequenceSummary: `Семья окружила вас заботой. Родной язык: ${LANGUAGE_NAMES[nativeLang].name}.`,
          tag: 'birth',
        },
      ],
    },

    secondarySchoolName: secEdu.secondarySchoolName,
    schoolGradeAvg: 8.8,
    languages: initialLanguages,
    localColleges: secEdu.localColleges,
    completedEducationIds: [],
    activeHobbyIds: startingAge >= 6 ? ['hobby_1'] : [],
    activeFactionId: null,
    attendedArtistIds: [],
    collabArtistIds: [],

    currentCareerId: null,
    careerStats: {
      totalShiftsWorked: 0,
      kpiScore: 50,
      specialActionsDone: 0,
      promotionsCount: 0,
      miniGamesWon: 0,
      perfectShifts: 0,
      currentCombo: 0,
      sectorMetrics: {},
    },
    urbexSubscribers: startingAge >= 12 ? 140 : 0,
    urbexVideosCount: startingAge >= 16 ? 2 : 0,
    urbexRaidsDone: 0,

    ownedBusinesses: [],

    politicalPositionId: null,
    approvalRating: 15,
    politicalInfluence: 10,
    enactedReformIds: [],

    activePetId: hasPet ? 'dog_lucky' : null,
    ownedPetIds: hasPet ? ['dog_lucky'] : [],
    activeHouseId: 'parents_home',
    ownedHouseIds: ['parents_home'],
    rentedOutHouseIds: [],
    installedHouseTuningIds: [],

    activeVehicleId: null,
    ownedVehicleIds: [],
    installedVehicleTuningIds: [],

    activeSmartphoneId: startingAge >= 12 ? 'phone_redmi_note13' : null,
    activeLaptopId: null,
    ownedTechGadgetIds: startingAge >= 12 ? ['phone_redmi_note13'] : [],
    customPcBuild: {
      cpu: null,
      gpu: null,
      ram: null,
      ssd: null,
      cooling_case: null,
      monitor: null,
    },

    equippedBrandIds: [],
    ownedBrandIds: [],

    steroidCyclesUsed: 0,
    habits: {
      smoking: 0,
      alcohol: 0,
      drugs: 0,
    },
    wantedLevel: 0,
    bribesTakenCount: 0,
    heistsCompleted: 0,
    casinoNetProfit: 0,
    activePartnerId: null,
    partnerRelationship: 0,
    isMarried: false,

    monthlyExpenses: {
      food: 50,
      utilities: 0,
      rentOrUpkeep: 0,
      transport: 15,
      hobbiesAndFaction: 70,
      total: 135,
    },

    investments: {
      sp500_etf: 0,
      ai_tech_stock: 0,
      crypto_btc: 0,
      gov_bonds: 0,
    },
    friends: INITIAL_FRIENDS.map((f) => ({ ...f })),
    chronicle: [
      {
        id: 'init_1',
        age: startingAge,
        year: currentYear,
        dateLabel: `${customBirthDay}.${customBirthMonth}.${currentYear}`,
        season: initialSeason,
        weather: 'Ясно',
        text: `Рождение и начало пути в г. ${city.name} (${city.country})! Ваши родители: мать ${family[0].name} (${family[0].profession}) и отец ${family[1].name} (${family[1].profession}).`,
        starred: true,
        category: 'family',
      },
      {
        id: 'init_2',
        age: startingAge,
        year: currentYear,
        dateLabel: `${currentYear} г.`,
        season: initialSeason,
        weather: 'Ясно',
        text: hasPet
          ? `В вашей детской комнате всегда тепло, а верный питомец Lucky охраняет ваш сон.`
          : `В вашей детской комнате всегда тепло. Родители заботятся о вас.`,
        starred: false,
        category: 'life',
      },
    ],
    activePendingEvent: null,
    quests: createInitialQuests(),
    customMods: [],
    offlineAiMode: true,
    isAlive: true,

    // === NEW FIELDS v2.0 ===
    stress: 0,
    taxScrutiny: 0,
    shadowIncome: 0,
    blogPostsCount: 0,
    blogAdRevenue: 0,
    pocketMoneyPerMonth: 0,
    petRequestCooldown: 0,
    hasInjury: false,
    injuryTurnsLeft: 0,
    hairstyleId: appearance.hairStyle,
    facialHairId: 'none' as const,
    hasMask: false,
    tattooLevel: 0,
    outfitStyle: 'casual' as const,
    ownedWardrobeIds: [],
    equippedSuitId: null,
    equippedAccessoryId: null,
    equippedWatchId: null,
    equippedGlassesId: null,
    militaryServiceActive: false,
    frontlineActive: false,
    activeIllnesses: [],
    debtDelinquencyTurns: 0,
    lastSeasonalEventYear: -1,
    birthdayEventFiredThisYear: false,
  };

  baseState.monthlyExpenses = calculateMonthlyExpenses(baseState);
  return baseState;
}

export function getNextSeasonAndWeather(
  currentSeason: Season,
  city: CityOption,
  seedNumber: number
): { season: Season; weather: WeatherType } {
  const idx = SEASONS_ORDER.indexOf(currentSeason);
  const nextSeason = SEASONS_ORDER[(idx + 1) % SEASONS_ORDER.length];

  if (nextSeason === 'Зима' && city.climateBias.includes('Снегопад')) {
    return { season: nextSeason, weather: seedNumber % 2 === 0 ? 'Снегопад' : 'Туман' };
  }
  if (nextSeason === 'Лето' && city.climateBias.includes('Жара')) {
    return { season: nextSeason, weather: seedNumber % 2 === 0 ? 'Жара' : 'Ясно' };
  }
  const weatherPool = city.climateBias;
  const nextWeather = weatherPool[Math.abs(seedNumber) % weatherPool.length];
  return { season: nextSeason, weather: nextWeather };
}

export function calculateActiveBonuses(state: PlayerState) {
  const pet = state.activePetId
    ? PETS_CATALOG.find((p) => p.id === state.activePetId) || null
    : null;
  const house = HOUSES_CATALOG.find((h) => h.id === state.activeHouseId) || HOUSES_CATALOG[0];
  const vehicle = VEHICLES_CATALOG.find((v) => v.id === state.activeVehicleId) || null;
  const equippedBrands = BRANDS_CATALOG.filter((b) => state.equippedBrandIds.includes(b.id));
  const houseTunings = TUNING_CATALOG.filter((t) => state.installedHouseTuningIds.includes(t.id));
  const vehicleTunings = TUNING_CATALOG.filter((t) => state.installedVehicleTuningIds.includes(t.id));

  const hasWeatherProtection = equippedBrands.some((b) => b.weatherProtection);
  const brandUrbexBonus = equippedBrands.reduce((acc, b) => acc + b.urbexBonus, 0);
  const brandCharismaBonus = equippedBrands.reduce((acc, b) => acc + b.charismaBonus, 0);
  const brandStylePoints = equippedBrands.reduce((acc, b) => acc + b.stylePoints, 0);

  const tuningPrestige =
    houseTunings.reduce((s, t) => s + t.prestigeBonus, 0) +
    vehicleTunings.reduce((s, t) => s + t.prestigeBonus, 0) +
    (vehicle ? vehicle.prestigeBonus : 0);

  const vehicleTotalHp = vehicle
    ? vehicle.baseHorsepower + vehicleTunings.reduce((s, t) => s + t.horsepowerBonus, 0)
    : 0;

  const homeMuscleBonus = houseTunings.reduce((s, t) => s + t.muscleBonus, 0);

  const rentalAnnualIncome = state.rentedOutHouseIds.reduce((sum, houseId) => {
    const h = HOUSES_CATALOG.find((item) => item.id === houseId);
    return sum + (h ? h.monthlyRentIncome * 12 : 0);
  }, 0);

  const ownedWardrobeSet = new Set(state.ownedWardrobeIds || []);
  const equippedSuit =
    state.equippedSuitId && ownedWardrobeSet.has(state.equippedSuitId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedSuitId) || null
      : null;
  const equippedAccessory =
    state.equippedAccessoryId && ownedWardrobeSet.has(state.equippedAccessoryId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedAccessoryId) || null
      : null;
  const equippedWatch =
    state.equippedWatchId && ownedWardrobeSet.has(state.equippedWatchId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedWatchId) || null
      : null;
  const equippedGlasses =
    state.equippedGlassesId && ownedWardrobeSet.has(state.equippedGlassesId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedGlassesId) || null
      : null;

  const activeWardrobeItems = [
    equippedSuit,
    equippedAccessory,
    equippedWatch,
    equippedGlasses,
  ].filter(Boolean) as WardrobeItem[];

  const wardrobeCharismaBonus = activeWardrobeItems.reduce((s, w) => s + w.charismaBonus, 0);
  const wardrobeFinanceBonus = activeWardrobeItems.reduce((s, w) => s + w.financeBonus, 0);
  const wardrobeStrengthBonus = activeWardrobeItems.reduce((s, w) => s + w.strengthBonus, 0);
  const wardrobeStatusBonus = activeWardrobeItems.reduce((s, w) => s + w.statusBonus, 0);

  return {
    pet,
    petHealthBonus: pet ? pet.healthBonus : 0,
    petHappinessBonus: pet ? pet.happinessBonus : 0,
    petUrbexSafetyBonus: pet ? pet.urbexSafetyBonus : 0,
    petFollowerMultiplier: pet ? pet.followerMultiplier : 1.0,
    house,
    vehicle,
    equippedBrands,
    houseTunings,
    vehicleTunings,
    hasWeatherProtection,
    brandUrbexBonus,
    brandCharismaBonus: brandCharismaBonus + wardrobeCharismaBonus,
    brandStylePoints: brandStylePoints + wardrobeStatusBonus,
    tuningPrestige: tuningPrestige + wardrobeStatusBonus,
    vehicleTotalHp,
    homeMuscleBonus: homeMuscleBonus + wardrobeStrengthBonus,
    rentalAnnualIncome,
    equippedSuit,
    equippedAccessory,
    equippedWatch,
    equippedGlasses,
    wardrobeCharismaBonus,
    wardrobeFinanceBonus,
    wardrobeStrengthBonus,
    wardrobeStatusBonus,
  };
}

export function calculatePortfolioValue(investments: Record<string, number>): number {
  let total = 0;
  for (const asset of INITIAL_INVESTMENTS) {
    const units = investments[asset.id] || 0;
    total += units * asset.currentPrice;
  }
  return Math.round(total);
}

export function calculateAnnualInvestmentYield(
  investments: Record<string, number>,
  financeSkill: number
): number {
  let totalYield = 0;
  const skillBoost = 1 + financeSkill / 200;
  for (const asset of INITIAL_INVESTMENTS) {
    const units = investments[asset.id] || 0;
    if (units > 0) {
      const value = units * asset.currentPrice;
      totalYield += value * (asset.annualYieldPercent / 100) * skillBoost;
    }
  }
  return Math.round(totalYield);
}

export function syncQuestsProgress(state: PlayerState): DailyQuest[] {
  const totalNetWorth = state.money + calculatePortfolioValue(state.investments);
  return state.quests.map((q) => {
    let currentValue = q.currentValue;
    if (q.targetType === 'followers') currentValue = state.urbexSubscribers;
    if (q.targetType === 'knowledge') currentValue = state.knowledge;
    if (q.targetType === 'urbex_raids') currentValue = state.urbexRaidsDone;
    if (q.targetType === 'wealth') currentValue = totalNetWorth;
    if (q.targetType === 'age') currentValue = state.age;
    if (q.targetType === 'friends') currentValue = state.friends.length;
    if (q.targetType === 'strength') currentValue = Math.max(state.skills.strength, state.skills.muscleMass);
    if (q.targetType === 'hobbies') currentValue = state.activeHobbyIds.length;

    const completed = currentValue >= q.targetValue;
    return {
      ...q,
      currentValue,
      completed,
    };
  });
}

// Custom PC Build & Tech Gadgets Summary Calculator
export function calculateCustomPcStats(state: PlayerState) {
  const slots: PcSlotType[] = ['cpu', 'gpu', 'ram', 'ssd', 'cooling_case', 'monitor'];
  let totalPerfScore = 0;
  let totalPowerWatts = 0;
  let completedSlotsCount = 0;

  for (const s of slots) {
    const compId = state.customPcBuild[s];
    if (!compId) continue;
    const comp = PC_COMPONENTS_CATALOG.find((c) => c.id === compId);
    if (comp) {
      totalPerfScore += comp.perfScore;
      totalPowerWatts += comp.powerWatts;
      completedSlotsCount++;
    }
  }

  const isFullRig = completedSlotsCount === 6;
  const fullRigMultiplier = isFullRig ? 1.25 : 1.0;
  const finalPerfScore = Math.round(totalPerfScore * fullRigMultiplier);

  const techKpiBoost = state.ownedTechGadgetIds.reduce((sum, gid) => {
    const item = TECH_GADGETS_CATALOG.find((t) => t.id === gid);
    return sum + (item ? item.kpiBoost : 0);
  }, 0);

  return {
    totalPerfScore: finalPerfScore,
    totalPowerWatts,
    completedSlotsCount,
    isFullRig,
    estimatedFps4k: Math.min(360, Math.round(finalPerfScore * 0.65)),
    techKpiBoost,
    totalCareerTechMultiplier: Number((1 + (finalPerfScore + techKpiBoost * 3) / 600).toFixed(2)),
  };
}

// Per-Profession Special Mechanic Action
export function executeProfessionSpecialAction(state: PlayerState): {
  nextState: PlayerState;
  summaryText: string;
} {
  const career = CAREERS_CATALOG.find((c) => c.id === state.currentCareerId);
  if (!career) {
    return {
      nextState: state,
      summaryText: 'Сначала устройтесь на работу в разделе «Профессии», чтобы выполнять отраслевые проекты!',
    };
  }

  const pcStats = calculateCustomPcStats(state);
  const bonusMoney = Math.round(
    career.mechanicBonusMoney *
      state.city.economyMultiplier *
      (1 + state.careerStats.kpiScore / 200) *
      pcStats.totalCareerTechMultiplier
  );
  const metricKey = career.mechanicStatLabel;
  const prevCount = state.careerStats.sectorMetrics[metricKey] || 0;
  const nextCount = prevCount + 1;

  const nextSkills = {
    ...state.skills,
    [career.requiredSkill]: clampStat(state.skills[career.requiredSkill] + 4),
  };

  const summaryText = `[${career.sector}] Выполнено: «${career.mechanicActionLabel}»! Премия: +${formatMoney(bonusMoney, state.currency)}, KPI +4, ${metricKey}: ${nextCount}.`;

  const nextState: PlayerState = {
    ...state,
    money: state.money + bonusMoney,
    happiness: clampStat(state.happiness + 4),
    skills: nextSkills,
    careerStats: {
      ...state.careerStats,
      kpiScore: clampStat(state.careerStats.kpiScore + 4),
      specialActionsDone: state.careerStats.specialActionsDone + 1,
      sectorMetrics: {
        ...state.careerStats.sectorMetrics,
        [metricKey]: nextCount,
      },
    },
    chronicle: [
      {
        id: `prof_act_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: true,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return { nextState, summaryText };
}

// Interactive Profession Work Case Dilemma Choice (3 Tactical Approaches)
export function resolveProfessionDilemmaChoice(
  state: PlayerState,
  optionIndex: number
): {
  nextState: PlayerState;
  summaryText: string;
} {
  const career = CAREERS_CATALOG.find((c) => c.id === state.currentCareerId);
  if (!career) {
    return {
      nextState: state,
      summaryText: 'Сначала выберите профессию ниже, чтобы принимать тактические решения на смене!',
    };
  }

  const shiftCase =
    PROFESSION_SHIFT_CASES.find((sc) => sc.category === career.category) ||
    PROFESSION_SHIFT_CASES[0];
  const option = shiftCase.options[optionIndex] || shiftCase.options[0];
  const pcStats = calculateCustomPcStats(state);

  const skillVal = state.skills[career.requiredSkill];
  const riskySuccess =
    option.approach !== 'risky' ||
    skillVal + state.careerStats.kpiScore * 0.4 + pcStats.totalPerfScore * 0.1 >=
      career.requiredSkillValue;

  const effectiveMult = riskySuccess ? option.bonusMultiplier : 0.45;
  const effectiveKpiDelta = riskySuccess ? option.kpiDelta : -3;
  const payout = Math.round(
    career.mechanicBonusMoney *
      effectiveMult *
      state.city.economyMultiplier *
      pcStats.totalCareerTechMultiplier
  );

  const metricKey = career.mechanicStatLabel;
  const prevCount = state.careerStats.sectorMetrics[metricKey] || 0;
  const nextCount = prevCount + (riskySuccess ? 2 : 1);
  const nextCombo = riskySuccess ? state.careerStats.currentCombo + 1 : 0;

  const summaryText = riskySuccess
    ? `[Кейс смены: ${shiftCase.scenarioTitle}] ${option.outcomeHint} Выплата: +${formatMoney(payout, state.currency)} (Серия побед: ${nextCombo}×)`
    : `[Кейс смены: ${shiftCase.scenarioTitle}] Рискованный манёвр столкнулся со сложностями (KPI -3, выплата +${formatMoney(payout, state.currency)}). Прокачайте навык и технику!`;

  const nextState: PlayerState = {
    ...state,
    money: state.money + payout,
    health: clampStat(state.health - Math.max(0, option.stressDelta - 2)),
    happiness: clampStat(state.happiness + (riskySuccess ? 6 : -2)),
    skills: {
      ...state.skills,
      [career.requiredSkill]: clampStat(state.skills[career.requiredSkill] + (riskySuccess ? 5 : 2)),
    },
    careerStats: {
      ...state.careerStats,
      totalShiftsWorked: state.careerStats.totalShiftsWorked + 1,
      kpiScore: clampStat(state.careerStats.kpiScore + effectiveKpiDelta),
      specialActionsDone: state.careerStats.specialActionsDone + 1,
      perfectShifts: state.careerStats.perfectShifts + (riskySuccess && option.approach === 'risky' ? 1 : 0),
      currentCombo: nextCombo,
      sectorMetrics: {
        ...state.careerStats.sectorMetrics,
        [metricKey]: nextCount,
      },
    },
    chronicle: [
      {
        id: `prof_case_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: riskySuccess,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return { nextState, summaryText };
}

// Interactive Profession Mini-Game Completion Handler
export function resolveProfessionMiniGameResult(
  state: PlayerState,
  accuracyPercent: number // 0 to 100
): {
  nextState: PlayerState;
  summaryText: string;
} {
  const career = CAREERS_CATALOG.find((c) => c.id === state.currentCareerId);
  if (!career) {
    return {
      nextState: state,
      summaryText: 'Сначала устройтесь на работу, чтобы проходить мини-игры смены!',
    };
  }

  const pcStats = calculateCustomPcStats(state);
  const clampedAcc = clampStat(accuracyPercent, 25, 100);
  const isPerfect = clampedAcc >= 85;
  const mult = (clampedAcc / 50) * (isPerfect ? 1.45 : 1.0) * pcStats.totalCareerTechMultiplier;
  const payout = Math.round(career.mechanicBonusMoney * mult * state.city.economyMultiplier);
  const kpiGain = isPerfect ? 10 : clampedAcc >= 60 ? 6 : 3;

  const metricKey = career.mechanicStatLabel;
  const prevCount = state.careerStats.sectorMetrics[metricKey] || 0;
  const nextCount = prevCount + (isPerfect ? 3 : 1);

  const summaryText = `[Мини-игра профессии: Точность ${clampedAcc}%] ${
    isPerfect ? 'БЕЗУПРЕЧНОЕ ИСПОЛНЕНИЕ!' : 'Отличный результат!'
  } Премия: +${formatMoney(payout, state.currency)}, KPI +${kpiGain}, ${metricKey}: ${nextCount}.`;

  const nextState: PlayerState = {
    ...state,
    money: state.money + payout,
    happiness: clampStat(state.happiness + (isPerfect ? 8 : 4)),
    skills: {
      ...state.skills,
      [career.requiredSkill]: clampStat(state.skills[career.requiredSkill] + (isPerfect ? 6 : 3)),
    },
    careerStats: {
      ...state.careerStats,
      kpiScore: clampStat(state.careerStats.kpiScore + kpiGain),
      miniGamesWon: state.careerStats.miniGamesWon + 1,
      perfectShifts: state.careerStats.perfectShifts + (isPerfect ? 1 : 0),
      currentCombo: state.careerStats.currentCombo + 1,
      sectorMetrics: {
        ...state.careerStats.sectorMetrics,
        [metricKey]: nextCount,
      },
    },
    chronicle: [
      {
        id: `prof_mg_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: isPerfect,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return { nextState, summaryText };
}

// Regenerate Randomized Numbered Colleges in the Player's City
export function regenerateLocalColleges(state: PlayerState, seedOffset: number): PlayerState {
  const secEdu = generateSecondaryEducationForCity(state.city, seedOffset);
  return {
    ...state,
    secondarySchoolName: secEdu.secondarySchoolName,
    localColleges: secEdu.localColleges,
  };
}

// Buy Smartphone, Laptop, Console, Camera or Tech Gadget
export function buyOrEquipTechGadget(state: PlayerState, item: TechGadgetItem): PlayerState {
  if (!getAgeGate('tech_gadget', state.age).allowed) {
    return state;
  }
  const owned = state.ownedTechGadgetIds.includes(item.id);
  if (!owned && state.money < item.price) {
    return state;
  }

  const isPhone = item.category === 'Смартфоны и Флагманы';
  const isLaptop = item.category === 'Ноутбуки и Ультрабуки';

  if (owned) {
    return {
      ...state,
      activeSmartphoneId: isPhone ? item.id : state.activeSmartphoneId,
      activeLaptopId: isLaptop ? item.id : state.activeLaptopId,
    };
  }

  const nextState: PlayerState = {
    ...state,
    money: state.money - item.price,
    happiness: clampStat(state.happiness + 7),
    knowledge: clampStat(state.knowledge + item.intellectBonus),
    skills: {
      ...state.skills,
      intellect: clampStat(state.skills.intellect + item.intellectBonus),
      creativity: clampStat(state.skills.creativity + item.creativityBonus),
      charisma: clampStat(state.skills.charisma + item.charismaBonus),
    },
    careerStats: {
      ...state.careerStats,
      kpiScore: clampStat(state.careerStats.kpiScore + item.kpiBoost),
    },
    ownedTechGadgetIds: [...state.ownedTechGadgetIds, item.id],
    activeSmartphoneId: isPhone ? item.id : state.activeSmartphoneId,
    activeLaptopId: isLaptop ? item.id : state.activeLaptopId,
    chronicle: [
      {
        id: `tech_buy_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `Покупка техники (${item.category}): «${item.name}» за ${formatMoney(item.price, state.currency)} (+${item.intellectBonus} Интеллект, +${item.creativityBonus} Креатив, +${item.kpiBoost} KPI).`,
        starred: true,
        category: 'finance',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return nextState;
}

// Install / Upgrade Component in Custom PC Builder
export function installPcComponent(state: PlayerState, comp: PcComponentItem): PlayerState {
  if (!getAgeGate('pc_build', state.age).allowed) {
    return state;
  }
  if (state.customPcBuild[comp.slot] === comp.id || state.money < comp.price) {
    return state;
  }

  const nextBuild: Record<PcSlotType, string | null> = {
    ...state.customPcBuild,
    [comp.slot]: comp.id,
  };

  const nextState: PlayerState = {
    ...state,
    money: state.money - comp.price,
    happiness: clampStat(state.happiness + 5),
    skills: {
      ...state.skills,
      intellect: clampStat(state.skills.intellect + comp.tier * 2),
      creativity: clampStat(state.skills.creativity + comp.tier * 2),
    },
    customPcBuild: nextBuild,
    chronicle: [
      {
        id: `pc_part_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Сборка ПК — ${comp.slotLabel}] Установлен компонент «${comp.name}» (Tier ${comp.tier}/5, +${comp.perfScore} мощн.) за ${formatMoney(comp.price, state.currency)}!`,
        starred: comp.tier >= 4,
        category: 'finance',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return nextState;
}

// Business & Franchise Purchase / Upgrade / Branch Expansion
export function buyOrUpgradeBusiness(
  state: PlayerState,
  item: BusinessFranchiseItem,
  mode: 'buy' | 'upgrade' | 'branch'
): PlayerState {
  if (!getAgeGate('business', state.age).allowed) {
    return state;
  }
  const existing = state.ownedBusinesses.find((b) => b.businessId === item.id);

  if (mode === 'buy') {
    if (existing || state.money < item.buyCost || state.skills.finance < item.requiredFinanceSkill) {
      return state;
    }
    const nextState: PlayerState = {
      ...state,
      money: state.money - item.buyCost,
      skills: {
        ...state.skills,
        finance: clampStat(state.skills.finance + 5),
      },
      ownedBusinesses: [
        ...state.ownedBusinesses,
        { businessId: item.id, level: 1, customBranches: 1 },
      ],
      storyArc: `Глава: Владелец бизнеса «${item.name}»`,
      chronicle: [
        {
          id: `biz_buy_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `Вы приобрели ${item.isFranchise ? 'франшизу' : 'предприятие'} «${item.name}» (${item.industry}) за ${formatMoney(item.buyCost, state.currency)}!`,
          starred: true,
          category: 'business',
        },
        ...state.chronicle,
      ],
    };
    nextState.quests = syncQuestsProgress(nextState);
    return nextState;
  }

  if (!existing) return state;

  if (mode === 'upgrade') {
    const cost = Math.round(item.upgradeCostBase * existing.level);
    if (existing.level >= 5 || state.money < cost) return state;
    return {
      ...state,
      money: state.money - cost,
      ownedBusinesses: state.ownedBusinesses.map((b) =>
        b.businessId === item.id ? { ...b, level: b.level + 1 } : b
      ),
      chronicle: [
        {
          id: `biz_upg_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `Модернизация бизнеса «${item.name}» до Уровня ${existing.level + 1}/5 (-${formatMoney(cost, state.currency)}). Выручка выросла!`,
          starred: false,
          category: 'business',
        },
        ...state.chronicle,
      ],
    };
  }

  // Open new branch
  const branchCost = Math.round(item.buyCost * 0.75);
  if (state.money < branchCost) return state;
  return {
    ...state,
    money: state.money - branchCost,
    ownedBusinesses: state.ownedBusinesses.map((b) =>
      b.businessId === item.id ? { ...b, customBranches: b.customBranches + 1 } : b
    ),
    chronicle: [
      {
        id: `biz_br_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `Открыт новый филиал сети «${item.name}» (всего филиалов: ${existing.customBranches + 1})!`,
        starred: true,
        category: 'business',
      },
      ...state.chronicle,
    ],
  };
}

// Politics & Governance Actions
export function runPoliticalCampaignAction(
  state: PlayerState,
  actionType: 'rally' | 'tv_debate' | 'charity_fund'
): PlayerState {
  if (!getAgeGate('politics', state.age).allowed) {
    return state;
  }
  const cost = actionType === 'rally' ? 800 : actionType === 'tv_debate' ? 2200 : 4500;
  if (state.money < cost) return state;

  const approvalGain = actionType === 'rally' ? 5 : actionType === 'tv_debate' ? 10 : 15;
  const influenceGain = actionType === 'rally' ? 12 : actionType === 'tv_debate' ? 25 : 40;
  const label =
    actionType === 'rally'
      ? 'Городской митинг и встреча с избирателями'
      : actionType === 'tv_debate'
      ? 'Выступление в прайм-тайм на теледебатах'
      : 'Благотворительный фонд поддержки больниц и школ';

  return {
    ...state,
    money: state.money - cost,
    approvalRating: clampStat(state.approvalRating + approvalGain),
    politicalInfluence: state.politicalInfluence + influenceGain,
    skills: {
      ...state.skills,
      charisma: clampStat(state.skills.charisma + 4),
    },
    chronicle: [
      {
        id: `pol_act_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Политика] ${label}: народный рейтинг +${approvalGain}% (теперь ${clampStat(state.approvalRating + approvalGain)}%), полит. капитал +${influenceGain}.`,
        starred: false,
        category: 'politics',
      },
      ...state.chronicle,
    ],
  };
}

export function electPoliticalPosition(state: PlayerState, pos: PoliticalPosition): PlayerState {
  if (
    !getAgeGate('politics', state.age).allowed ||
    state.age < pos.minAge ||
    state.skills.charisma < pos.requiredCharisma ||
    state.approvalRating < pos.requiredApproval ||
    state.money < pos.campaignCost ||
    state.politicalPositionId === pos.id
  ) {
    return state;
  }

  return {
    ...state,
    money: state.money - pos.campaignCost,
    politicalPositionId: pos.id,
    politicalInfluence: state.politicalInfluence + pos.influencePerMonth * 2,
    storyArc: `Глава: ${pos.title} (${state.city.country})`,
    chronicle: [
      {
        id: `pol_elect_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `ПОБЕДА НА ВЫБОРАХ! Вы официально вступили в должность «${pos.title}» в г. ${state.city.name} (${state.city.country})!`,
        starred: true,
        category: 'politics',
      },
      ...state.chronicle,
    ],
  };
}

export function enactPoliticalReform(state: PlayerState, reform: PoliticalReform): PlayerState {
  if (!getAgeGate('politics', state.age).allowed) {
    return state;
  }
  const currentPos = POLITICAL_POSITIONS.find((p) => p.id === state.politicalPositionId);
  const currentTier = currentPos ? currentPos.tier : 0;
  if (
    currentTier < reform.minTier ||
    state.politicalInfluence < reform.influenceCost ||
    state.enactedReformIds.includes(reform.id)
  ) {
    return state;
  }

  const updatedCity: CityOption = {
    ...state.city,
    economyMultiplier: Number((state.city.economyMultiplier + reform.cityEconomyBoost).toFixed(2)),
  };

  return {
    ...state,
    city: updatedCity,
    politicalInfluence: state.politicalInfluence - reform.influenceCost,
    approvalRating: clampStat(state.approvalRating + reform.approvalDelta),
    enactedReformIds: [...state.enactedReformIds, reform.id],
    chronicle: [
      {
        id: `pol_ref_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Государственная реформа] Принят закон «${reform.title}»! Рейтинг доверия +${reform.approvalDelta}%, доходность бизнеса +${reform.businessYieldBonusPercent}%.`,
        starred: true,
        category: 'politics',
      },
      ...state.chronicle,
    ],
  };
}

// Deterministic pro-rating helper so 360 days / 48 weeks / 12 months sum to the exact annual integer amount
export function proRateAnnualInt(
  annualAmount: number,
  step: TurnStepMode,
  monthOfYear: number,
  dayOfMonth: number
): number {
  if (annualAmount === 0) return 0;
  if (step === 'year') return Math.round(annualAmount);
  const m = Math.max(1, Math.min(12, monthOfYear));
  const d = Math.max(1, Math.min(30, dayOfMonth));
  if (step === 'month') {
    return Math.round((m * annualAmount) / 12) - Math.round(((m - 1) * annualAmount) / 12);
  }
  if (step === 'week') {
    const weekIdx = (m - 1) * 4 + Math.min(3, Math.floor((d - 1) / 7));
    return Math.round(((weekIdx + 1) * annualAmount) / 48) - Math.round((weekIdx * annualAmount) / 48);
  }
  const dayIdx = (m - 1) * 30 + (d - 1);
  return Math.round(((dayIdx + 1) * annualAmount) / 360) - Math.round((dayIdx * annualAmount) / 360);
}

// Universal turn advancement supporting Day, Week, Month, or Year!
export function advanceTurnByStep(state: PlayerState, stepOverride?: TurnStepMode): PlayerState {
  if (!state.isAlive) return state;

  const step = stepOverride || state.turnStep;
  const yearFraction =
    step === 'day' ? 1 / 30 / 12 : step === 'week' ? 7 / 30 / 12 : step === 'month' ? 1 / 12 : 1;
  const monthsPassed = step === 'year' ? 12 : step === 'month' ? 1 : step === 'week' ? 0.25 : 1 / 30;

  let nextDay = state.dayOfMonth;
  let nextMonth = state.monthOfYear;
  let newYear = state.currentYear;
  let newAge = state.age;
  let yearsIncrement = 0;

  if (step === 'year') {
    newYear += 1;
    newAge += 1;
    yearsIncrement = 1;
  } else {
    if (step === 'day') {
      nextDay += 1;
      if (nextDay > 30) {
        nextDay = 1;
        nextMonth += 1;
      }
    } else if (step === 'week') {
      nextDay += 7;
      if (nextDay > 30) {
        nextDay -= 30;
        nextMonth += 1;
      }
    } else if (step === 'month') {
      nextMonth += 1;
    }

    if (nextMonth > 12) {
      nextMonth -= 12;
      newYear += 1;
    }

    const hasHadBirthdayThisYear =
      nextMonth > state.birthMonth ||
      (nextMonth === state.birthMonth && nextDay >= state.birthDay);
    const calculatedAge = Math.max(0, newYear - state.birthYear - (hasHadBirthdayThisYear ? 0 : 1));
    newAge = Math.max(state.age, calculatedAge);
    yearsIncrement = newAge - state.age;
  }

  // Auto-transition infant focus when reaching school age (6+)
  const INFANT_FOCUSES: LifeFocus[] = ['Раннее развитие', 'Активный малыш', 'Любимчик семьи'];
  const effectiveFocus: LifeFocus =
    newAge >= 6 && INFANT_FOCUSES.includes(state.focus) ? 'Учёба' : state.focus;

  const seasonByMonth: Season =
    nextMonth >= 3 && nextMonth <= 5
      ? 'Весна'
      : nextMonth >= 6 && nextMonth <= 8
      ? 'Лето'
      : nextMonth >= 9 && nextMonth <= 11
      ? 'Осень'
      : 'Зима';

  const { weather } = getNextSeasonAndWeather(
    seasonByMonth,
    state.city,
    newAge * 31 + nextMonth * 7 + nextDay + Math.round(state.money)
  );

  const stateForCalc = { ...state, age: newAge, focus: effectiveFocus, season: seasonByMonth };
  const bonuses = calculateActiveBonuses(stateForCalc);
  const expenses = calculateMonthlyExpenses(stateForCalc);
  const bizSummary = calculateMonthlyBusinessSummary(stateForCalc);
  const pcStats = calculateCustomPcStats(stateForCalc);

  const proRate = (annualAmount: number) => proRateAnnualInt(annualAmount, step, nextMonth, nextDay);

  // HARDCORE SURVIVAL RULE: Health no longer regenerates passively for free!
  let healthDelta = 0;
  let happinessDelta = proRate(bonuses.petHappinessBonus);
  let knowledgeDelta = 0;
  let relationsDelta = 0;
  const newSkills = { ...state.skills };
  let followersGain = 0;
  let nextSchoolGrade = state.schoolGradeAvg;
  const nextLanguages = { ...state.languages };
  const nextIllnesses = Array.isArray(state.activeIllnesses) ? [...state.activeIllnesses] : [];
  let survivalNotes = '';

  // Native language natural acquisition during childhood
  const nativeLang = getNativeLanguageForCountry(state.city.countryCode);
  if (yearsIncrement > 0 && newAge >= 3 && (nextLanguages[nativeLang] || 0) < 5) {
    nextLanguages[nativeLang] = Math.min(6, (nextLanguages[nativeLang] || 3) + 1);
  }

  // Bad habits chronic drain
  const totalAddiction = state.habits.smoking + state.habits.alcohol + state.habits.drugs;
  if (totalAddiction > 40) {
    healthDelta -= proRate(Math.round(totalAddiction / 30));
  }

  // Romance partner bonus
  const activePartner = ROMANCE_PARTNERS_CATALOG.find((p) => p.id === state.activePartnerId);
  let partnerIncome = 0;
  if (activePartner) {
    happinessDelta += proRate(Math.round(activePartner.happinessBonus * 0.4));
    if (state.isMarried || state.partnerRelationship >= 70) {
      partnerIncome = Math.round(activePartner.wealthBonusPerMonth * monthsPassed);
    }
  }

  if (effectiveFocus === 'Учёба') {
    knowledgeDelta += proRate(5);
    newSkills.intellect = clampStat(newSkills.intellect + proRate(4));
    if (newAge >= 6 && newAge <= 18) {
      nextSchoolGrade = Number(Math.min(12.0, nextSchoolGrade + 0.25 * yearFraction).toFixed(2));
    }
  } else if (effectiveFocus === 'Спорт и Сила') {
    const gymBoost = state.activeFactionId === 'fac_5' ? 2 : 1;
    newSkills.strength = clampStat(newSkills.strength + proRate(6 * gymBoost));
    newSkills.muscleMass = clampStat(newSkills.muscleMass + proRate(6 * gymBoost));
    newSkills.fitness = clampStat(newSkills.fitness + proRate(5));
  } else if (effectiveFocus === 'Бизнес и Политика') {
    newSkills.finance = clampStat(newSkills.finance + proRate(5));
    newSkills.charisma = clampStat(newSkills.charisma + proRate(5));
    relationsDelta += proRate(3);
  } else if (effectiveFocus === 'Медиа и Музыка') {
    newSkills.creativity = clampStat(newSkills.creativity + proRate(5));
    newSkills.charisma = clampStat(newSkills.charisma + proRate(4));
    followersGain += Math.round((220 + newSkills.creativity * 14) * bonuses.house.blogGrowthBonus * yearFraction);
  } else if (effectiveFocus === 'Уберэкс') {
    newSkills.urbex = clampStat(newSkills.urbex + proRate(5));
    newSkills.creativity = clampStat(newSkills.creativity + proRate(3));
    followersGain += Math.round(
      (180 + newSkills.urbex * 12) * bonuses.petFollowerMultiplier * bonuses.house.blogGrowthBonus * yearFraction
    );
  } else if (effectiveFocus === 'Карьера') {
    newSkills.intellect = clampStat(newSkills.intellect + proRate(3));
    newSkills.charisma = clampStat(newSkills.charisma + proRate(3));
    knowledgeDelta += proRate(2);
  } else if (effectiveFocus === 'Инвестиции') {
    newSkills.finance = clampStat(newSkills.finance + proRate(5));
    knowledgeDelta += proRate(3);
  } else if (effectiveFocus === 'Раннее развитие') {
    knowledgeDelta += proRate(4);
    newSkills.intellect = clampStat(newSkills.intellect + proRate(5));
    newSkills.charisma = clampStat(newSkills.charisma + proRate(3));
  } else if (effectiveFocus === 'Активный малыш') {
    newSkills.strength = clampStat(newSkills.strength + proRate(4));
    newSkills.fitness = clampStat(newSkills.fitness + proRate(5));
  } else if (effectiveFocus === 'Любимчик семьи') {
    happinessDelta += proRate(6);
    relationsDelta += proRate(6);
    newSkills.charisma = clampStat(newSkills.charisma + proRate(3));
  }

  if (newAge >= 6) {
    for (const hId of state.activeHobbyIds) {
      const h = HOBBIES_80.find((item) => item.id === hId);
      if (h) {
        newSkills[h.skillKey] = clampStat(newSkills[h.skillKey] + proRate(h.skillGain));
        if (h.strengthGain > 0) {
          newSkills.strength = clampStat(newSkills.strength + proRate(h.strengthGain));
        }
        if (h.muscleGain > 0) {
          newSkills.muscleMass = clampStat(newSkills.muscleMass + proRate(h.muscleGain));
        }
        happinessDelta += proRate(h.happinessGain);
        if (h.healthDelta < 0) {
          healthDelta += proRate(h.healthDelta);
        }
      }
    }
  }

  if (bonuses.homeMuscleBonus > 0 && newAge >= 6) {
    newSkills.muscleMass = clampStat(newSkills.muscleMass + proRate(bonuses.homeMuscleBonus));
    newSkills.strength = clampStat(newSkills.strength + proRate(bonuses.homeMuscleBonus));
  }

  const activeFaction = newAge >= 14 ? FACTIONS_26.find((f) => f.id === state.activeFactionId) : undefined;
  let factionIncome = 0;
  let factionNote = '';
  if (activeFaction) {
    if (activeFaction.monthlyBonusOrFee > 0) {
      factionIncome = Math.round(activeFaction.monthlyBonusOrFee * monthsPassed);
    }
    if (activeFaction.riskPercent >= 25 && (newAge + nextMonth) % 3 === 0 && step !== 'day') {
      healthDelta -= 6;
      factionNote = ` Опасная потасовка в круге «${activeFaction.name}» стоила здоровья (-6).`;
    }
  }

  // Stress > 80% drops productivity by 50%!
  const highStressPenaltyMult = (state.stress || 0) > 80 ? 0.5 : 1.0;

  const activeCareer = newAge >= 14 ? CAREERS_CATALOG.find((c) => c.id === state.currentCareerId) : undefined;
  const kpiBonusMult = 1 + (state.careerStats.kpiScore - 50) / 250;
  const annualCareerSalary = activeCareer
    ? Math.round(
        activeCareer.annualSalary *
          state.city.economyMultiplier *
          kpiBonusMult *
          pcStats.totalCareerTechMultiplier *
          highStressPenaltyMult
      )
    : newAge < 18
    ? 0
    : Math.round(1800 * state.city.economyMultiplier * highStressPenaltyMult);

  // Military & Frontline pay
  const monthlyMilitaryPay = state.militaryServiceActive
    ? state.frontlineActive
      ? 2400
      : 950
    : 0;
  const periodMilitaryIncome = Math.round(monthlyMilitaryPay * monthsPassed);

  const activePolPos = newAge >= 21 ? POLITICAL_POSITIONS.find((p) => p.id === state.politicalPositionId) : undefined;
  const annualPolSalary = activePolPos ? Math.round(activePolPos.annualSalary * state.city.economyMultiplier) : 0;
  const gainedInfluence = activePolPos ? proRate(activePolPos.influencePerMonth * 12) : 0;

  const periodCareerIncome =
    Math.round(((annualCareerSalary + annualPolSalary) / 12) * monthsPassed) + periodMilitaryIncome;
  const periodBusinessProfit =
    newAge >= 18 ? Math.round(bizSummary.netMonthlyProfit * monthsPassed * highStressPenaltyMult) : 0;
  const newSubscribers = state.urbexSubscribers + followersGain;
  const periodMediaIncome =
    newAge >= 12
      ? Math.round(((newSubscribers * 0.35 * bonuses.house.blogGrowthBonus) / 12) * monthsPassed)
      : 0;
  const periodDividends =
    newAge >= 18
      ? Math.round((calculateAnnualInvestmentYield(state.investments, newSkills.finance) / 12) * monthsPassed)
      : 0;
  const periodRental = newAge >= 18 ? Math.round((bonuses.rentalAnnualIncome / 12) * monthsPassed) : 0;
  const periodExpenses = Math.round(expenses.total * monthsPassed);

  // Pocket money from parents for ages 7 to 17
  let pocketMoneyMonthly = 0;
  if (newAge >= 7 && newAge < 18) {
    const mother = state.family[0];
    const father = state.family[1];
    const familyIncome = (mother?.monthlyIncome || 0) + (father?.monthlyIncome || 0);
    const gradeMultiplier = Math.max(0.4, nextSchoolGrade / 12);
    pocketMoneyMonthly = Math.round(Math.min(300, Math.max(30, familyIncome * 0.04)) * gradeMultiplier);
  }
  const periodPocketMoney = Math.round(pocketMoneyMonthly * monthsPassed);
  const periodBlogIncome = newAge >= 12 ? Math.round((state.blogAdRevenue || 0) * monthsPassed) : 0;

  let netCashflow =
    periodCareerIncome +
    periodBusinessProfit +
    periodMediaIncome +
    periodDividends +
    periodRental +
    factionIncome +
    partnerIncome +
    periodPocketMoney +
    periodBlogIncome -
    periodExpenses;

  // Tax audit enforcement when taxScrutiny >= 80
  let nextShadowIncome = state.shadowIncome || 0;
  let nextTaxScrutiny = state.taxScrutiny || 0;
  let taxAuditNote = '';
  if (nextTaxScrutiny >= 80 && nextShadowIncome > 0 && monthsPassed >= 1) {
    const taxFine = Math.round(nextShadowIncome * 0.35);
    netCashflow -= taxFine;
    nextShadowIncome = Math.max(0, nextShadowIncome - taxFine);
    nextTaxScrutiny = 30;
    taxAuditNote = ` [НАЛОГОВАЯ ПРОВЕРКА] Налоговая служба выявила теневые доходы и взыскала штраф -${formatMoney(taxFine, state.currency)}!`;
  }

  let nextMoney = Math.round(state.money + netCashflow);

  // === HARDCORE SURVIVAL BLOCK 1: STRESS, DEBT SPIRAL, HUNGER & ILLNESSES ===
  let stressDelta = 0;
  if (activeCareer) stressDelta += proRate(14);
  if (effectiveFocus === 'Учёба' && newAge >= 12) stressDelta += proRate(10);
  if (state.militaryServiceActive) {
    stressDelta += proRate(state.frontlineActive ? 26 : 14);
  }
  if (bonuses.house.energyRecoveryBonus > 0 && !state.frontlineActive) {
    stressDelta -= proRate(Math.round(bonuses.house.energyRecoveryBonus * 1.5));
  }
  if (!activeCareer && !state.militaryServiceActive && newAge >= 18 && nextMoney >= 0) {
    stressDelta -= proRate(8);
  }

  // 1A. Hardcore Debt Loop (Долговая яма): Collectors (+15 Stress), Late Penalties, Eviction
  let nextDelinquencyTurns = state.debtDelinquencyTurns || 0;
  let nextActiveHouseId = state.activeHouseId;
  if (nextMoney < 0 && newAge >= 18) {
    nextDelinquencyTurns += 1;
    const lateFee = Math.max(75, Math.round(Math.abs(nextMoney) * 0.08 * Math.min(2, monthsPassed)));
    nextMoney -= lateFee;
    stressDelta += 15; // Collectors calling every turn!
    happinessDelta -= Math.max(6, proRate(16));
    healthDelta -= Math.max(4, proRate(10));
    survivalNotes += ` 📞 [ДОЛГОВАЯ ЯМА · Просрочка ${nextDelinquencyTurns} х.] Коллекторы оборвали телефон (+15 Стресс, пени -${formatMoney(lateFee, state.currency)})!`;

    if (nextDelinquencyTurns >= 2 && nextActiveHouseId !== 'parents_home') {
      nextActiveHouseId = 'parents_home';
      healthDelta -= 10;
      happinessDelta -= 14;
      survivalNotes += ` 🏚️ За долги счета арестованы, аренда жилья заблокирована — вы лишились крыши над головой (-10 Здоровье, -14 Счастье)!`;
    }
  } else if (nextMoney >= 0) {
    nextDelinquencyTurns = 0;
  }

  // 1B. Hunger / Food Austerity (Голод / Жесткая экономия на еде)
  let hungerWeightPenalty = 0;
  if (state.spendingMode === 'Экономный' && newAge >= 16) {
    const muscleLoss = Math.max(1, Math.round(2 * Math.min(2, monthsPassed)));
    const healthLoss = Math.max(2, Math.round(5 * Math.min(2, monthsPassed)));
    newSkills.muscleMass = clampStat(newSkills.muscleMass - muscleLoss);
    healthDelta -= healthLoss;
    stressDelta += Math.max(4, proRate(8));
    hungerWeightPenalty = 3;
    survivalNotes += ` 🍞 [Голод / Экономия на еде] Дефицит питания истощает организм (-${muscleLoss} Мышцы, -${healthLoss} Здоровье, потеря веса).`;
  }

  // 1C. Winter Pneumonia Risk without warm seasonal protection
  const hasWarmWinterClothes =
    bonuses.hasWeatherProtection ||
    Boolean(state.equippedSuitId) ||
    state.militaryServiceActive ||
    newAge < 6;
  const deterministicRoll = Math.abs(newAge * 37 + nextMonth * 13 + nextDay * 7 + Math.round(nextMoney)) % 100;

  if (
    seasonByMonth === 'Зима' &&
    !hasWarmWinterClothes &&
    !nextIllnesses.includes('Пневмония (переохлаждение зимой)') &&
    deterministicRoll < 45
  ) {
    nextIllnesses.push('Пневмония (переохлаждение зимой)');
    healthDelta -= 10;
    survivalNotes += ` ❄️ [ПНЕВМОНИЯ!] Вы ходили зимой без тёплой одежды по сезону и свалились с тяжёлой пневмонией (-10 Здоровье)!`;
  }

  // 1D. Gym Ligament Tear Risk at low Energy (high Stress >= 60)
  if (
    effectiveFocus === 'Спорт и Сила' &&
    (state.stress || 0) >= 60 &&
    !nextIllnesses.includes('Надрыв связок плеча') &&
    deterministicRoll < 42
  ) {
    nextIllnesses.push('Надрыв связок плеча');
    healthDelta -= 8;
    survivalNotes += ` 🏋️ [ТРАВМА В СПОРТЗАЛЕ!] На фоне низкой Бодрости вы надорвали связки плеча на тяжёлом жиме (-8 Здоровье)!`;
  }

  // 1E. Frontline Combat Wound / Concussion Risk
  if (
    state.militaryServiceActive &&
    state.frontlineActive &&
    !nextIllnesses.includes('Боевая контузия') &&
    deterministicRoll < 35
  ) {
    nextIllnesses.push('Боевая контузия');
    healthDelta -= 12;
    stressDelta += 14;
    survivalNotes += ` 💥 [ПЕРЕДОВАЯ] Близкий прилёт у блиндажа вызвал контузию (-12 Здоровье, +14 Стресс)!`;
  }

  // Ongoing health drain from untreated chronic illnesses / injuries
  if (nextIllnesses.length > 0) {
    const illnessDrain = Math.max(3, Math.round(nextIllnesses.length * 5 * Math.min(2, monthsPassed)));
    healthDelta -= illnessDrain;
    survivalNotes += ` 🤒 Невылеченные недуги (${nextIllnesses.join(', ')}) отнимают силы (-${illnessDrain} Здоровье). Обратитесь в клинику!`;
  }

  const nextStress = clampStat((state.stress || 0) + stressDelta);

  // 1F. Critical Stress > 80%: Panic attacks, Insomnia (-25 Energy), Outbursts on family (-6 Relations)
  let burnoutNote = '';
  if (nextStress > 80) {
    healthDelta -= Math.max(4, proRate(12));
    happinessDelta -= Math.max(6, proRate(16));
    relationsDelta -= 6;
    burnoutNote =
      ' 🧠 [КРИТИЧЕСКИЙ СТРЕСС > 80%!] Панические атаки, бессонница (-25 Энергии/Бодрости), падение продуктивности на 50% и срывы на близких (-6 Отношения)!';
  }

  // Injury visual flag stays active if player has untreated illnesses or injuryTurnsLeft > 0
  let nextInjuryTurns = state.injuryTurnsLeft || 0;
  if (nextInjuryTurns > 0) {
    nextInjuryTurns = Math.max(0, nextInjuryTurns - 1);
  }
  const nextInjury = nextInjuryTurns > 0 || nextIllnesses.length > 0;

  const nextPetCooldown = Math.max(0, (state.petRequestCooldown || 0) - (monthsPassed >= 1 ? 1 : 0));

  // Realistic growth from Age 0 (52cm / 4kg) to Adulthood (179-192cm / 66-118kg)
  const baseHeight =
    newAge === 0
      ? 52
      : newAge < 6
      ? 60 + newAge * 9.5
      : newAge < 18
      ? 115 + (newAge - 6) * 5.2
      : 179;
  const nextHeightCm = Math.round(Math.min(194, baseHeight + (newSkills.strength > 60 ? 3 : 0)));
  const baseWeight =
    newAge === 0
      ? 4
      : newAge < 6
      ? 7 + newAge * 2.5
      : newAge < 18
      ? 22 + (newAge - 6) * 3.6
      : 66;
  const formulaWeightKg = Math.round(
    baseWeight +
      (newAge >= 12 ? newSkills.muscleMass * 0.38 : newSkills.muscleMass * 0.08) -
      hungerWeightPenalty
  );
  const nextWeightKg = Math.max(
    3,
    hungerWeightPenalty > 0 && yearsIncrement === 0
      ? Math.min(formulaWeightKg, state.weightKg - hungerWeightPenalty)
      : formulaWeightKg
  );

  const updatedFamily =
    yearsIncrement > 0
      ? state.family.map((m) => {
          const nextMemberAge = m.age + yearsIncrement;
          const nextMemberHealth = clampStat(m.health - (nextMemberAge > 65 ? 4 : 1));
          return {
            ...m,
            age: nextMemberAge,
            health: nextMemberHealth,
            alive: nextMemberHealth > 0 && nextMemberAge < 96,
          };
        })
      : state.family;

  const nextHealth = clampStat(state.health + healthDelta);
  const nextHappiness = clampStat(state.happiness + happinessDelta);
  const nextKnowledge = clampStat(state.knowledge + knowledgeDelta);
  const nextRelations = clampStat(state.relations + relationsDelta);

  const stepLabel =
    step === 'day'
      ? `День ${nextDay}.${nextMonth}.${newYear}`
      : step === 'week'
      ? `Неделя (${nextDay}.${nextMonth}.${newYear})`
      : step === 'month'
      ? `Месяц ${nextMonth}/${newYear}`
      : `${newYear} год (${newAge} лет)`;

  const cashStr = formatMoney(netCashflow, state.currency);
  const expStr = formatMoney(periodExpenses, state.currency);
  const bizStr =
    periodBusinessProfit > 0 ? ` · Прибыль бизнеса: +${formatMoney(periodBusinessProfit, state.currency)}` : '';

  let milestoneNote = '';
  if (yearsIncrement > 0) {
    if (newAge === 1) milestoneNote = ' Вы сделали свои первые шаги и произнесли первое слово!';
    if (newAge === 6) milestoneNote = ` Вы пошли в 1-й класс («${state.secondarySchoolName}»)! Фокус переключён на «Учёба».`;
    if (newAge === 17)
      milestoneNote = ` Вы окончили школу со средним баллом аттестата ${nextSchoolGrade.toFixed(1)}/12! Открыто поступление в Топ-10 ВУЗов стран мира.`;
  }

  const newEntry = {
    id: `chr_${newAge}_${nextMonth}_${nextDay}_${Date.now()}`,
    age: newAge,
    year: newYear,
    dateLabel: stepLabel,
    season: seasonByMonth,
    weather,
    text: `[${stepLabel}] Погода: ${weather} (${seasonByMonth}). Итог за ход: ${cashStr} (счета: -${expStr}${bizStr}).${milestoneNote}${factionNote}${survivalNotes}${burnoutNote}${taxAuditNote}`,
    starred: Boolean(milestoneNote || burnoutNote || taxAuditNote || survivalNotes),
    category: 'life' as const,
  };

  const isBankrupt = nextMoney <= -12000;
  const isAlive = nextHealth > 0 && newAge < 100 && !isBankrupt;
  const causeOfEnd = !isAlive
    ? isBankrupt
      ? 'Полное финансовое банкротство: долги по счетам превысили критический порог (-12 000).'
      : nextHealth <= 0
      ? 'Критический упадок здоровья от невылеченных травм, болезней и перегрузки организма.'
      : 'Долгая и насыщенная жизнь подошла к столетнему рубежу.'
    : undefined;

  const updatedState: PlayerState = {
    ...state,
    age: newAge,
    focus: effectiveFocus,
    currentYear: newYear,
    monthOfYear: nextMonth,
    dayOfMonth: nextDay,
    yearProgress: step === 'year' ? 0 : Math.round(((nextMonth - 1) / 12) * 100),
    season: seasonByMonth,
    weather,
    health: nextHealth,
    happiness: nextHappiness,
    knowledge: nextKnowledge,
    relations: nextRelations,
    heightCm: nextHeightCm,
    weightKg: nextWeightKg,
    money: nextMoney,
    isBankrupt,
    skills: newSkills,
    schoolGradeAvg: nextSchoolGrade,
    languages: nextLanguages,
    family: updatedFamily,
    activeHouseId: nextActiveHouseId,
    careerStats: {
      ...state.careerStats,
      totalShiftsWorked: state.careerStats.totalShiftsWorked + (activeCareer ? 1 : 0),
    },
    politicalInfluence: state.politicalInfluence + gainedInfluence,
    urbexSubscribers: newSubscribers,
    monthlyExpenses: expenses,
    chronicle: [newEntry, ...state.chronicle],
    activePendingEvent: state.activePendingEvent,
    isAlive,
    causeOfEnd,
    stress: nextStress,
    shadowIncome: nextShadowIncome,
    taxScrutiny: nextTaxScrutiny,
    hasInjury: nextInjury,
    injuryTurnsLeft: nextInjuryTurns,
    activeIllnesses: nextIllnesses,
    debtDelinquencyTurns: nextDelinquencyTurns,
    petRequestCooldown: nextPetCooldown,
    pocketMoneyPerMonth: pocketMoneyMonthly,
  };

  // Check seasonal & holiday events
  const stateWithSeasonal = checkAndGenerateSeasonalEvent(updatedState);

  // 55% Auto-Trigger probability on turn step (with 35-turn non-repeating history)
  const autoRoll =
    Math.abs(newAge * 41 + newYear * 17 + nextMonth * 23 + nextDay * 11 + stateWithSeasonal.chronicle.length * 13) %
    100;
  if (
    !stateWithSeasonal.activePendingEvent &&
    (yearsIncrement > 0 || stateWithSeasonal.militaryServiceActive || autoRoll < 55)
  ) {
    const generatedEv = generateContextualAiLifeEvent(stateWithSeasonal);
    stateWithSeasonal.activePendingEvent = generatedEv;
    const prevUsed = Array.isArray(stateWithSeasonal.usedEventIds) ? stateWithSeasonal.usedEventIds : [];
    stateWithSeasonal.usedEventIds = [...prevUsed.filter((id) => id !== generatedEv.id), generatedEv.id].slice(-35);
  }

  // Proactive Incoming NPC Messenger Chat (NPCs write first!) when age >= 6
  if (!stateWithSeasonal.activeIncomingNpcChat && newAge >= 6 && autoRoll % 3 === 0) {
    const npcThread = pickProactiveNpcChat(stateWithSeasonal);
    stateWithSeasonal.activeIncomingNpcChat = npcThread;
    const prevUsed = Array.isArray(stateWithSeasonal.usedEventIds) ? stateWithSeasonal.usedEventIds : [];
    stateWithSeasonal.usedEventIds = [...prevUsed.filter((id) => id !== npcThread.id), npcThread.id].slice(-35);
  }

  stateWithSeasonal.quests = syncQuestsProgress(stateWithSeasonal);
  return stateWithSeasonal;
}

export function advanceOneYear(state: PlayerState): PlayerState {
  return advanceTurnByStep(state, 'year');
}

export function appendAiMemory(
  state: PlayerState,
  actionTaken: string,
  consequenceSummary: string,
  tag: AiMemoryEntry['tag'] = 'choice'
): PlayerState['aiMemory'] {
  const entry: AiMemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    age: state.age,
    year: state.currentYear,
    actionTaken,
    consequenceSummary,
    tag,
  };
  return {
    ...state.aiMemory,
    lastChoiceSummary: `${actionTaken} -> ${consequenceSummary}`,
    entries: [entry, ...state.aiMemory.entries.slice(0, 19)],
  };
}

// Embedded Anti-Hallucination Persistent AI Event Generator (100% Offline, Multi-Scenario, Non-Repeating, Age & Era Grounded)
export function generateContextualAiLifeEvent(state: PlayerState): LifeEventTemplate {
  const recentEntries = state.aiMemory.entries.slice(0, 2);
  const prevMemory =
    recentEntries.length > 0
      ? recentEntries
          .map((e) => `${e.actionTaken} → ${e.consequenceSummary}`)
          .join(' | ')
      : `Вы живёте в г. ${state.city.name} (${state.city.country}).`;
  const motherName = state.family[0]?.name || 'Мама';
  const fatherName = state.family[1]?.name || 'Папа';
  const siblingName = state.family[2]?.name || 'Старший брат/сестра';
  const recentIds = new Set<string>([
    state.aiMemory.lastEventId || '',
    ...(state.usedEventIds || []).slice(-35),
    ...state.aiMemory.entries.slice(0, 12).map((e) => e.id),
  ]);
  const recentActions = state.aiMemory.entries.slice(0, 4).map((e) => e.actionTaken);
  const pickNonRepeating = (pool: LifeEventTemplate[]): LifeEventTemplate => {
    const fresh = pool.filter(
      (ev) =>
        !recentIds.has(ev.id) &&
        !recentActions.some((act) => act.includes(ev.title))
    );
    const candidates = fresh.length > 0 ? fresh : pool.filter((ev) => ev.id !== state.aiMemory.lastEventId);
    const finalPool = candidates.length > 0 ? candidates : pool;
    const seed =
      state.age * 31 +
      state.currentYear * 7 +
      state.monthOfYear * 13 +
      state.dayOfMonth * 5 +
      state.aiMemory.entries.length * 19 +
      state.chronicle.length * 7;
    const chosen = finalPool[Math.abs(seed) % finalPool.length];
    if (!chosen.description.includes('[Память ИИ:')) {
      return {
        ...chosen,
        description: `[Память ИИ: ${prevMemory}] ${chosen.description}`,
      };
    }
    return chosen;
  };

  // Stage 1A: Infancy & Toddlerhood (Age 0 - 2)
  if (state.age <= 2) {
    const infantPool: LifeEventTemplate[] = [
      {
        id: `ai_infant_blocks_${state.age}`,
        title: `Младенчество (${state.age} лет · ${state.currentYear} г.): Развивающие кубики`,
        description: `[Память ИИ: ${prevMemory}] В детской комнате в г. ${state.city.name} ${motherName} и ${fatherName} раскладывают перед вами яркие кубики и музыкальную книжку.`,
        minAge: 0,
        maxAge: 2,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Тянуться к книжке с картинками и складывать башню (+Знания, +Интеллект)',
            outcomeText: `Вы удивили родителей своей усидчивостью и быстро запомнили цвета и формы!`,
            nextStoryArc: 'Глава: Смышлёный малыш',
            knowledgeDelta: 7,
            happinessDelta: 6,
            skillKey: 'intellect',
            skillDelta: 6,
          },
          {
            label: 'Весело ползать наперегонки и смеяться (+Здоровье, +Счастье, +Выносливость)',
            outcomeText: `Ваша неуёмная энергия наполнила дом в г. ${state.city.name} радостным смехом!`,
            nextStoryArc: 'Глава: Бодрый и крепкий малыш',
            healthDelta: 7,
            happinessDelta: 8,
            skillKey: 'fitness',
            skillDelta: 6,
          },
        ],
      },
      {
        id: `ai_infant_walk_${state.age}`,
        title: `Прогулка в парке г. ${state.city.name} (${state.season}, ${state.weather})`,
        description: `[Память ИИ: ${prevMemory}] Родители вышли с вами на прогулку по скверу г. ${state.city.name}. Вокруг шумят деревья и гуляют другие семьи.`,
        minAge: 0,
        maxAge: 2,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Делать уверенные шаги за руку с папой (+Сила, +Здоровье)',
            outcomeText: `${fatherName} с гордостью поддерживал вас — ваши ножки окрепли на свежем воздухе!`,
            nextStoryArc: 'Глава: Первые уверенные шаги',
            healthDelta: 8,
            relationsDelta: 6,
            skillKey: 'strength',
            skillDelta: 5,
          },
          {
            label: 'Улыбаться прохожим и лепетать первые слова (+Харизма, +Отношения)',
            outcomeText: `Вы очаровали всю семью и соседей своим звонким голосом и улыбкой!`,
            nextStoryArc: 'Глава: Душа семьи с пелёнок',
            happinessDelta: 8,
            relationsDelta: 9,
            skillKey: 'charisma',
            skillDelta: 6,
          },
        ],
      },
      {
        id: `ai_infant_family_evening_${state.age}`,
        title: `Тёплый семейный вечер (${state.age} лет · г. ${state.city.name})`,
        description: `[Память ИИ: ${prevMemory}] Вечером ${motherName}, ${fatherName} и ${siblingName} собрались в гостиной.`,
        minAge: 0,
        maxAge: 2,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Слушать сказку и повторять слоги за мамой (+Знания, +Речь)',
            outcomeText: `${motherName} читала вам сказки, и вы произнесли новое чёткое слово!`,
            nextStoryArc: 'Глава: Раннее развитие речи',
            knowledgeDelta: 8,
            relationsDelta: 7,
            skillKey: 'intellect',
            skillDelta: 5,
          },
          {
            label: 'Играть в прятки с братом/сестрой (+Счастье, +Творчество)',
            outcomeText: `Вы весело хохотали вместе с ${siblingName}, укрепляя семейную дружбу!`,
            nextStoryArc: 'Глава: Дружная семья',
            happinessDelta: 9,
            relationsDelta: 8,
            skillKey: 'creativity',
            skillDelta: 5,
          },
        ],
      },
    ];
    return pickNonRepeating(infantPool);
  }

  // Stage 1B: Preschool Childhood (Age 3 - 5)
  if (state.age <= 5) {
    const preschoolPool: LifeEventTemplate[] = [
      {
        id: `ai_preschool_kindergarten_${state.age}`,
        title: `Детский сад и первые друзья (${state.age} лет · г. ${state.city.name})`,
        description: `[Память ИИ: ${prevMemory}] В детском саду г. ${state.city.name} воспитатель предложил ребятам командную игру и конкурс рисунков.`,
        minAge: 3,
        maxAge: 5,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Нарисовать яркую картину и показать всей группе (+Творчество, +Счастье)',
            outcomeText: `Ваш рисунок повесили на почётном стенде, а ${motherName} сохранила его на память!`,
            nextStoryArc: 'Глава: Юный художник и фантазёр',
            happinessDelta: 8,
            knowledgeDelta: 6,
            skillKey: 'creativity',
            skillDelta: 7,
          },
          {
            label: 'Собрать ребят и построить большую крепость из конструктора (+Харизма, +Интеллект)',
            outcomeText: `Дети выбрали вас капитаном постройки — у вас появились первые верные друзья!`,
            nextStoryArc: 'Глава: Лидер детской группы',
            relationsDelta: 9,
            knowledgeDelta: 7,
            skillKey: 'charisma',
            skillDelta: 7,
          },
        ],
      },
      {
        id: `ai_preschool_yard_${state.age}`,
        title: `Дворовые игры и подготовка к школе (${state.age} лет)`,
        description: `[Память ИИ: ${prevMemory}] ${fatherName} подарил вам детскую энциклопедию с буквами и мяч для игр во дворе.`,
        minAge: 3,
        maxAge: 5,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Учить алфавит и считать в уме с родителями (+Знания, +Интеллект)',
            outcomeText: `К удивлению родителей, вы научились бегло читать простые слова ещё до 1-го класса!`,
            nextStoryArc: 'Глава: Готов к школе на отлично',
            knowledgeDelta: 10,
            happinessDelta: 5,
            skillKey: 'intellect',
            skillDelta: 8,
          },
          {
            label: 'Гонять мяч и подтягиваться на детской лесенке (+Здоровье, +Сила)',
            outcomeText: `Вы стали самым быстрым и ловким ребёнком в своём дворе г. ${state.city.name}!`,
            nextStoryArc: 'Глава: Спортивный характер с детства',
            healthDelta: 8,
            happinessDelta: 7,
            skillKey: 'strength',
            skillDelta: 7,
          },
        ],
      },
      {
        id: `ai_preschool_curiosity_${state.age}`,
        title: `Детское открытие в ${state.season} (${state.age} лет · ${state.currentYear} г.)`,
        description: `[Память ИИ: ${prevMemory}] Во время семейной прогулки по г. ${state.city.name} вы заинтересовались тем, как устроены городские поезда и мосты.`,
        minAge: 3,
        maxAge: 5,
        weatherCondition: 'any',
        seasonCondition: 'any',
        careerCondition: 'any',
        choices: [
          {
            label: 'Засыпать папу вопросами об инженерии и технике (+Интеллект, +Отношения)',
            outcomeText: `${fatherName} подробно рассказал вам о механике и подарил детский набор исследователя!`,
            nextStoryArc: 'Глава: Юный исследователь',
            knowledgeDelta: 9,
            relationsDelta: 7,
            skillKey: 'intellect',
            skillDelta: 7,
          },
          {
            label: 'Устроить весёлый семейный пикник в парке (+Счастье, +Здоровье)',
            outcomeText: `Тёплый день с семьёй оставил незабываемые детские воспоминания!`,
            nextStoryArc: 'Глава: Счастливое детство в семье',
            healthDelta: 6,
            happinessDelta: 10,
            relationsDelta: 8,
            skillKey: 'fitness',
            skillDelta: 5,
          },
        ],
      },
    ];
    return pickNonRepeating(preschoolPool);
  }

  // PRIORITY 1: Military & Frontline Duty (18+ years when in army or at war)
  const activeCareer = state.currentCareerId
    ? CAREERS_CATALOG.find((c) => c.id === state.currentCareerId) || null
    : null;
  const isMilitaryRole =
    state.militaryServiceActive ||
    Boolean(state.frontlineActive) ||
    Boolean(
      activeCareer &&
        (activeCareer.title.toLowerCase().includes('военн') ||
          activeCareer.title.toLowerCase().includes('офицер') ||
          activeCareer.title.toLowerCase().includes('спецназ'))
    );

  if (state.age >= 18 && isMilitaryRole) {
    return pickNonRepeating(buildMilitaryFrontlineEvents(state));
  }

  // PRIORITY 2: IT, Software Engineering & Tech Career/Focus (Age 16+)
  const isItRole =
    state.age >= 16 &&
    Boolean(
      (activeCareer &&
        (activeCareer.category === 'tech_engineering' ||
          activeCareer.sector.toLowerCase().includes('it') ||
          activeCareer.title.toLowerCase().includes('разработ') ||
          activeCareer.title.toLowerCase().includes('программист') ||
          activeCareer.title.toLowerCase().includes('devops') ||
          activeCareer.title.toLowerCase().includes('data'))) ||
        (state.customPcBuild.cpu && state.customPcBuild.gpu && state.focus === 'Карьера')
    );

  if (isItRole) {
    return pickNonRepeating(buildItDevEvents(state));
  }

  // PRIORITY 3: Business Empire, Resell & Corporate Management (Age 18+)
  const isBusinessRole =
    state.age >= 18 &&
    (state.ownedBusinesses.length > 0 ||
      state.focus === 'Бизнес и Политика' ||
      state.focus === 'Инвестиции' ||
      Boolean(activeCareer && activeCareer.category === 'finance_exec'));

  if (isBusinessRole) {
    return pickNonRepeating(buildBusinessCorporateEvents(state));
  }

  // PRIORITY 4: Blogging, Urbex & Media Production (Age 12+)
  const isBloggingMediaRole =
    state.age >= 12 &&
    (state.focus === 'Медиа и Музыка' ||
      state.focus === 'Уберэкс' ||
      (state.blogPostsCount || 0) >= 2 ||
      state.urbexSubscribers >= 800 ||
      Boolean(activeCareer && activeCareer.category === 'creative_media'));

  if (isBloggingMediaRole) {
    return pickNonRepeating(buildBloggingMediaEvents(state));
  }

  // PRIORITY 5: Education — School, College & University (Age 6–24 or Focus 'Учёба')
  if (state.age >= 6 && (state.age <= 17 || state.focus === 'Учёба')) {
    const eduEvents = buildEducationStudyEvents(state);
    if (state.age <= 11) {
      return pickNonRepeating([
        ...eduEvents.filter((e) => state.age >= e.minAge && state.age <= e.maxAge),
      ]);
    }
    if (state.age <= 17) {
      return pickNonRepeating([
        ...eduEvents.filter((e) => state.age >= e.minAge && state.age <= e.maxAge),
        ...PEER_PRESSURE_EVENTS_CATALOG.filter(
          (ev) => state.age >= ev.minAge && state.age <= ev.maxAge
        ),
      ]);
    }
    return pickNonRepeating(eduEvents);
  }

  // Stage 3: General Adult Life (18+) — Grounded in Career, Business, Romance, Urbex & Catalog Events
  const careerTitle = activeCareer?.title || 'Свободный специалист';
  const mult = state.city.economyMultiplier;

  const adultDynamicPool: LifeEventTemplate[] = [
    ...state.customMods.filter((ev) => state.age >= ev.minAge && state.age <= ev.maxAge),
    ...buildItDevEvents(state).slice(0, 3),
    ...buildBusinessCorporateEvents(state).slice(0, 3),
    ...buildBloggingMediaEvents(state).slice(0, 3),
    ...CORE_EVENTS_CATALOG.filter((ev) => state.age >= ev.minAge && state.age <= ev.maxAge),
    {
      id: `ai_adult_contract_${state.age}`,
      title: `Деловой прорыв в г. ${state.city.name} (${state.currentYear} г. · ${careerTitle})`,
      description: `[Память ИИ: ${prevMemory}] Благодаря вашей репутации (${careerTitle}) международные партнёры в г. ${state.city.name} предлагают возглавить стратегическое направление.`,
      minAge: 18,
      maxAge: 100,
      weatherCondition: 'any',
      seasonCondition: 'any',
      careerCondition: 'any',
      choices: [
        {
          label: 'Блестяще провести переговоры и подписать контракт (+Капитал, +Финансы)',
          outcomeText: `Сделка закрыта на ваших условиях! Ваш счёт пополнился солидным бонусом.`,
          nextStoryArc: `Глава: Лидер индустрии в г. ${state.city.name}`,
          happinessDelta: 8,
          knowledgeDelta: 6,
          moneyDelta: Math.round(1850 * mult),
          skillKey: 'finance',
          skillDelta: 8,
        },
        {
          label: 'Превратить проект в громкое медийное шоу (+Крупный гонорар, +Харизма, +Фанаты)',
          outcomeText: `О вашем смелом решении написали главные паблики г. ${state.city.name}!`,
          nextStoryArc: `Глава: Медийный триумф в г. ${state.city.name}`,
          happinessDelta: 10,
          relationsDelta: 8,
          moneyDelta: Math.round(2300 * mult),
          followersDelta: 850,
          skillKey: 'charisma',
          skillDelta: 8,
        },
      ],
    },
  ];

  return pickNonRepeating(adultDynamicPool);
}

export function relocateToCity(state: PlayerState, targetCity: CityOption): PlayerState {
  if (!getAgeGate('relocate', state.age).allowed) {
    return state;
  }
  if (state.money < targetCity.relocationCost || state.city.id === targetCity.id) {
    return state;
  }

  const secEdu = generateSecondaryEducationForCity(targetCity, state.age);

  const nextState: PlayerState = {
    ...state,
    city: targetCity,
    currency: targetCity.currency,
    secondarySchoolName: secEdu.secondarySchoolName,
    localColleges: secEdu.localColleges,
    money: state.money - targetCity.relocationCost,
    activeHouseId: state.activeHouseId,
    ownedHouseIds: state.ownedHouseIds,
    aiMemory: appendAiMemory(
      state,
      `Переезд в г. ${targetCity.name} (${targetCity.country})`,
      `Смена страны и среды жизни на ${targetCity.name}.`,
      'relocation'
    ),
    chronicle: [
      {
        id: `reloc_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `Международный переезд! Вы переехали в г. ${targetCity.name}, ${targetCity.country} (билеты и обустройство: -${formatMoney(targetCity.relocationCost, state.currency)}). Основная валюта: ${targetCity.currency}.`,
        starred: true,
        category: 'life',
      },
      ...state.chronicle,
    ],
  };

  nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
  return nextState;
}

export function applyEventChoice(
  state: PlayerState,
  event: LifeEventTemplate,
  choice: EventChoice
): PlayerState {
  const newSkills = { ...state.skills };
  if (choice.skillKey && choice.skillDelta) {
    newSkills[choice.skillKey] = clampStat(newSkills[choice.skillKey] + choice.skillDelta);
    if (choice.skillKey === 'strength') {
      newSkills.muscleMass = clampStat(newSkills.muscleMass + Math.round(choice.skillDelta * 0.8));
    }
  }

  // If peer pressure smoking/alcohol event chosen, update habits
  const nextHabits = { ...state.habits };
  if (event.id === 'ev_peer_smoke_garage' && (choice.healthDelta || 0) < 0) {
    nextHabits.smoking = clampStat(nextHabits.smoking + 18);
  }
  if (event.id === 'ev_peer_party_alcohol' && (choice.healthDelta || 0) < 0) {
    nextHabits.alcohol = clampStat(nextHabits.alcohol + 18);
    nextHabits.drugs = clampStat(nextHabits.drugs + 12);
  }

  let nextSchoolGrade = state.schoolGradeAvg;
  if (state.age >= 6 && state.age <= 18 && (choice.knowledgeDelta || 0) > 0) {
    nextSchoolGrade = Number(Math.min(12.0, nextSchoolGrade + 0.4).toFixed(1));
  }

  const nextStoryArc = choice.nextStoryArc || state.storyArc;
  const nextHistory = choice.nextStoryArc
    ? [choice.nextStoryArc, ...state.storyHistory]
    : state.storyHistory;

  const updatedMemory = appendAiMemory(
    state,
    `Событие «${event.title}» -> Выбор: «${choice.label}»`,
    choice.outcomeText,
    'choice'
  );
  updatedMemory.lastEventId = event.id;

  const rawMoneyDelta = choice.moneyDelta || 0;
  const effectiveMoneyDelta =
    state.age < 6 ? 0 : state.age < 14 && rawMoneyDelta < 0 ? Math.max(-state.money, rawMoneyDelta) : rawMoneyDelta;
  const effectiveFollowersDelta = state.age < 12 ? 0 : choice.followersDelta || 0;

  let extraHealthDelta = choice.healthDelta || 0;
  let extraInjuryNote = '';
  const nextIllnesses = Array.isArray(state.activeIllnesses) ? [...state.activeIllnesses] : [];
  let nextHasInjury = state.hasInjury;
  let nextInjuryTurns = state.injuryTurnsLeft;

  if (choice.injuryRiskPercent && choice.injuryRiskPercent > 0) {
    const roll = Math.abs(state.age * 29 + state.dayOfMonth * 11 + state.chronicle.length * 7) % 100;
    if (roll < choice.injuryRiskPercent) {
      const illnessName = choice.illnessToAdd || 'Травма после рискованного решения';
      if (!nextIllnesses.includes(illnessName)) {
        nextIllnesses.push(illnessName);
      }
      extraHealthDelta -= 12;
      nextHasInjury = true;
      nextInjuryTurns = Math.max(nextInjuryTurns, 3);
      extraInjuryNote = ` ⚠️ [ПОЛУЧЕНА ТРАВМА: ${illnessName} (-12 Здоровье)]`;
    }
  }

  const nextMilitaryActive = choice.clearMilitaryService ? false : state.militaryServiceActive;
  const nextFrontlineActive = choice.clearMilitaryService ? false : Boolean(state.frontlineActive);

  const nextState: PlayerState = {
    ...state,
    health: clampStat(state.health + extraHealthDelta),
    happiness: clampStat(state.happiness + (choice.happinessDelta || 0)),
    knowledge: clampStat(state.knowledge + (choice.knowledgeDelta || 0)),
    relations: clampStat(state.relations + (choice.relationsDelta || 0)),
    stress: clampStat((state.stress || 0) + (choice.stressDelta || 0)),
    money: state.money + effectiveMoneyDelta,
    urbexSubscribers: Math.max(0, state.urbexSubscribers + effectiveFollowersDelta),
    skills: newSkills,
    habits: nextHabits,
    schoolGradeAvg: nextSchoolGrade,
    storyArc: nextStoryArc,
    storyHistory: nextHistory,
    aiMemory: updatedMemory,
    activePendingEvent: null,
    hasInjury: nextHasInjury,
    injuryTurnsLeft: nextInjuryTurns,
    activeIllnesses: nextIllnesses,
    militaryServiceActive: nextMilitaryActive,
    frontlineActive: nextFrontlineActive,
    chronicle: [
      {
        id: `ev_${state.age}_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Сюжет: ${event.title}] ${choice.outcomeText}${extraInjuryNote}${
          choice.nextStoryArc ? ` -> Новая глава: «${choice.nextStoryArc}»` : ''
        }`,
        starred: true,
        category: event.isCustomMod ? 'mod' : 'life',
      },
      ...state.chronicle,
    ],
  };

  nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
  nextState.quests = syncQuestsProgress(nextState);
  return nextState;
}

export function executeUrbexExpedition(
  state: PlayerState,
  spot: UrbexSpot
): {
  nextState: PlayerState;
  success: boolean;
  subscribersGained: number;
  revenueGained: number;
  summaryText: string;
} {
  const urbexGate = getAgeGate('urbex', state.age);
  if (!urbexGate.allowed) {
    return {
      nextState: state,
      success: false,
      subscribersGained: 0,
      revenueGained: 0,
      summaryText: urbexGate.reason,
    };
  }

  const bonuses = calculateActiveBonuses(state);
  const weatherMatch = state.weather === spot.weatherBonus ? 1.35 : 1.0;
  const totalUrbexPower =
    state.skills.urbex + bonuses.brandUrbexBonus + bonuses.petUrbexSafetyBonus;

  const success = totalUrbexPower >= spot.requiredUrbexSkill * 0.75;
  const mult = bonuses.petFollowerMultiplier * bonuses.house.blogGrowthBonus * weatherMatch;

  const subscribersGained = success
    ? Math.round(spot.baseSubscribersGain * mult)
    : Math.round(spot.baseSubscribersGain * 0.25);

  const revenueGained = success
    ? Math.round(spot.baseAdRevenue * mult * (1 + bonuses.brandCharismaBonus / 100))
    : 50;

  const healthDelta = success ? -2 : -Math.max(4, Math.round(spot.injuryRisk / 3));
  const summaryText = success
    ? `Экспедиция на объект «${spot.name}» прошла успешно! +${subscribersGained.toLocaleString('ru-RU')} подписчиков и ${formatMoney(revenueGained, state.currency)}.`
    : `Вылазка на «${spot.name}» оказалась опасной: охрана помешала съёмке (+${subscribersGained} подписчиков, здоровье ${healthDelta}).`;

  const nextState: PlayerState = {
    ...state,
    health: clampStat(state.health + healthDelta),
    happiness: clampStat(state.happiness + (success ? 8 : -3)),
    money: state.money + revenueGained,
    urbexSubscribers: state.urbexSubscribers + subscribersGained,
    urbexVideosCount: state.urbexVideosCount + 1,
    urbexRaidsDone: state.urbexRaidsDone + (success ? 1 : 0),
    skills: {
      ...state.skills,
      urbex: clampStat(state.skills.urbex + (success ? 6 : 2)),
      creativity: clampStat(state.skills.creativity + 3),
    },
    chronicle: [
      {
        id: `urbex_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: success,
        category: 'urbex',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return {
    nextState,
    success,
    subscribersGained,
    revenueGained,
    summaryText,
  };
}

// School Extra Study / Tutoring / Olympiad (Boosts schoolGradeAvg for Top-10 University Admission)
export function studySchoolExtra(
  state: PlayerState,
  mode: 'homework' | 'tutor' | 'olympiad'
): PlayerState {
  if (!getAgeGate('school', state.age).allowed || state.age > 18) {
    return state;
  }
  const cost = mode === 'homework' ? 0 : mode === 'tutor' ? 180 : 350;
  if (state.money < cost) return state;

  const gradeBoost = mode === 'homework' ? 0.3 : mode === 'tutor' ? 0.7 : 1.1;
  const intellectGain = mode === 'homework' ? 3 : mode === 'tutor' ? 6 : 10;
  const nextGrade = Number(Math.min(12.0, state.schoolGradeAvg + gradeBoost).toFixed(1));
  const label =
    mode === 'homework'
      ? 'Углублённая подготовка по школьным предметам'
      : mode === 'tutor'
      ? 'Индивидуальные занятия с репетитором к экзаменам (НМТ / Matura / Abitur / SAT)'
      : 'Победа на всеукраинской / международной предметной олимпиаде';

  return {
    ...state,
    money: state.money - cost,
    schoolGradeAvg: nextGrade,
    knowledge: clampStat(state.knowledge + intellectGain),
    skills: {
      ...state.skills,
      intellect: clampStat(state.skills.intellect + intellectGain),
    },
    aiMemory: appendAiMemory(
      state,
      label,
      `Средний балл аттестата вырос до ${nextGrade}/12, Интеллект +${intellectGain}.`,
      'school'
    ),
    chronicle: [
      {
        id: `sch_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Школа и Экзамены] ${label}! Средний балл аттестата: ${nextGrade}/12 (+${gradeBoost}), Интеллект +${intellectGain}.`,
        starred: mode === 'olympiad',
        category: 'career',
      },
      ...state.chronicle,
    ],
  };
}

export function getLanguageCourseCost(state: { city: CityOption }, course: LanguageCourseItem): number {
  return Math.round(course.price * Math.max(0.7, state.city.economyMultiplier * 0.85));
}

// Language Course Action (Advances CEFR level A1 -> A2 -> B1 -> B2 -> C1 -> C2)
export function takeLanguageCourse(state: PlayerState, course: LanguageCourseItem): PlayerState {
  if (!getAgeGate('language_course', state.age).allowed) {
    return state;
  }
  const currentLvl = state.languages[course.langCode] || 0;
  const effectivePrice = getLanguageCourseCost(state, course);
  if (currentLvl >= 6 || state.money < effectivePrice) {
    return state;
  }

  const nextLvl = Math.min(6, Math.max(course.targetLevel, currentLvl + 1));
  const cefr = CEFR_LEVEL_LABELS[nextLvl] || 'B2';

  return {
    ...state,
    money: state.money - effectivePrice,
    knowledge: clampStat(state.knowledge + course.intellectGain),
    skills: {
      ...state.skills,
      intellect: clampStat(state.skills.intellect + course.intellectGain),
      charisma: clampStat(state.skills.charisma + course.charismaGain),
    },
    languages: {
      ...state.languages,
      [course.langCode]: nextLvl,
    },
    aiMemory: appendAiMemory(
      state,
      `Курс языка: ${course.langName}`,
      `Достигнут уровень владения ${cefr}.`,
      'school'
    ),
    chronicle: [
      {
        id: `lang_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Языковые курсы] Вы прошли ступень курса «${course.langName}»! Ваш уровень: ${cefr} (-${formatMoney(effectivePrice, state.currency)}).`,
        starred: nextLvl >= 4,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };
}

// Check University Admission Requirements (School Grades, Language Level, Intellect & Scholarship)
export function checkUniversityAdmission(state: PlayerState, uni: UniversityProgram) {
  const minGrade = uni.minSchoolGrade || 7.0;
  const reqLang = uni.requiredLanguageCode || 'EN';
  const reqLangLvl = uni.requiredLanguageLevel || 3;
  const playerLangLvl = state.languages[reqLang] || 0;

  const gradeOk = state.schoolGradeAvg >= minGrade;
  const langOk = playerLangLvl >= reqLangLvl || uni.institutionType !== 'Университет';
  const intellectOk = state.skills.intellect >= uni.requiredIntellect;
  const isCollege = uni.institutionType === 'Колледж' || uni.institutionType === 'Техникум / Лицей';
  const ageOk = state.age >= (isCollege ? 14 : 18);

  const hasScholarship =
    uni.institutionType === 'Университет' &&
    state.schoolGradeAvg >= minGrade + 0.9 &&
    playerLangLvl >= reqLangLvl;
  const effectiveTuition = hasScholarship ? 0 : uni.tuitionCost;
  const moneyOk = state.money >= effectiveTuition;

  return {
    canEnroll:
      gradeOk &&
      langOk &&
      intellectOk &&
      ageOk &&
      moneyOk &&
      !state.completedEducationIds.includes(uni.id),
    gradeOk,
    langOk,
    intellectOk,
    ageOk,
    moneyOk,
    hasScholarship,
    effectiveTuition,
    minGrade,
    reqLang,
    reqLangLvl,
    playerLangLvl,
  };
}

export function enrollInUniversityWithCriteria(
  state: PlayerState,
  uni: UniversityProgram
): { nextState: PlayerState; message: string } {
  if (state.completedEducationIds.includes(uni.id)) {
    return { nextState: state, message: 'Вы уже получили этот диплом!' };
  }
  const check = checkUniversityAdmission(state, uni);
  if (!check.ageOk) {
    return { nextState: state, message: 'Ещё рано поступать по возрасту (нужно минимум 14–16 лет)!' };
  }
  if (!check.gradeOk) {
    return {
      nextState: state,
      message: `Недостаточный школьный балл: нужен ${check.minGrade}/12 (у вас ${state.schoolGradeAvg.toFixed(1)}/12). Подтяните оценки в разделе «Школа»!`,
    };
  }
  if (!check.langOk) {
    return {
      nextState: state,
      message: `Для поступления в эту страну нужен язык (${LANGUAGE_NAMES[check.reqLang].name}) уровня ${CEFR_LEVEL_LABELS[check.reqLangLvl]}! Пройдите языковые курсы.`,
    };
  }
  if (!check.intellectOk) {
    return {
      nextState: state,
      message: `Требуется навык Интеллекта ${uni.requiredIntellect} (у вас ${state.skills.intellect}).`,
    };
  }
  if (!check.moneyOk) {
    return {
      nextState: state,
      message: `Не хватает средств на обучение: нужно ${formatMoney(check.effectiveTuition, state.currency)}.`,
    };
  }

  const nextSkills = {
    ...state.skills,
    [uni.primarySkill]: clampStat(state.skills[uni.primarySkill] + uni.skillBonus),
  };

  const scholarshipLabel = check.hasScholarship
    ? 'БЮДЖЕТ / СТИПЕНДИЯ 0$'
    : `Контракт: -${formatMoney(check.effectiveTuition, state.currency)}`;

  const nextState: PlayerState = {
    ...state,
    money: state.money - check.effectiveTuition,
    knowledge: clampStat(state.knowledge + 14),
    skills: nextSkills,
    completedEducationIds: [...state.completedEducationIds, uni.id],
    storyArc: `Глава: Выпускник «${uni.name}»`,
    aiMemory: appendAiMemory(
      state,
      `Окончание ВУЗа «${uni.name}» (${uni.cityOrCountry})`,
      `Получен диплом «${uni.diplomaLabel}» (${scholarshipLabel}).`,
      'university'
    ),
    chronicle: [
      {
        id: `uni_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `Поступление и диплом (${scholarshipLabel}): вы окончили «${uni.name}» и получили квалификацию «${uni.diplomaLabel}» (+${uni.skillBonus} ${uni.primarySkill})!`,
        starred: true,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return {
    nextState,
    message: `Поздравляем! Вы окончили «${uni.name}» (${scholarshipLabel})!`,
  };
}

// Sports Pharmacology & Steroids Cycle
export function useSteroidCycle(state: PlayerState, cycle: SteroidCycleItem): PlayerState {
  if (!getAgeGate('steroids', state.age).allowed) {
    return state;
  }
  if (state.money < cycle.price) return state;

  const nextStrength = clampStat(state.skills.strength + cycle.strengthGain);
  const nextMuscle = clampStat(state.skills.muscleMass + cycle.muscleGain);
  const nextFitness = clampStat(state.skills.fitness + cycle.fitnessGain);
  const nextHealth = clampStat(state.health + cycle.healthDelta);
  const isAlive = nextHealth > 0;

  const nextState: PlayerState = {
    ...state,
    money: state.money - cycle.price,
    health: nextHealth,
    happiness: clampStat(state.happiness + cycle.happinessDelta),
    weightKg: Math.round(state.weightKg + Math.max(0, cycle.muscleGain * 0.45)),
    steroidCyclesUsed:
      cycle.category === 'pct' ? state.steroidCyclesUsed : state.steroidCyclesUsed + 1,
    skills: {
      ...state.skills,
      strength: nextStrength,
      muscleMass: nextMuscle,
      fitness: nextFitness,
    },
    aiMemory: appendAiMemory(
      state,
      `Спортфарма: ${cycle.name}`,
      `Сила ${nextStrength}, Мышцы ${nextMuscle}, Здоровье ${nextHealth}.`,
      'habit'
    ),
    isAlive,
    causeOfEnd: !isAlive
      ? 'Остановка сердца из-за чрезмерной перегрузки стероидами без ПКТ.'
      : state.causeOfEnd,
    chronicle: [
      {
        id: `steroid_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Спортфарма] Применён курс «${cycle.name}»: Сила +${cycle.strengthGain}, Мышцы +${cycle.muscleGain}, Здоровье ${cycle.healthDelta > 0 ? `+${cycle.healthDelta}` : cycle.healthDelta}.`,
        starred: true,
        category: 'life',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return nextState;
}

// Bad Habits & Rehab Action
export function performHabitAction(state: PlayerState, item: HabitActionItem): PlayerState {
  if (!getAgeGate('habit', state.age).allowed) {
    return state;
  }
  if (state.money < item.price) return state;

  const nextHabits = { ...state.habits };
  if (item.habitType === 'rehab') {
    nextHabits.smoking = clampStat(nextHabits.smoking + item.addictionDelta);
    nextHabits.alcohol = clampStat(nextHabits.alcohol + item.addictionDelta);
    nextHabits.drugs = clampStat(nextHabits.drugs + item.addictionDelta);
  } else {
    nextHabits[item.habitType] = clampStat(nextHabits[item.habitType] + item.addictionDelta);
  }

  const nextHealth = clampStat(state.health + item.healthDelta);
  const isAlive = nextHealth > 0;

  return {
    ...state,
    money: state.money - item.price,
    health: nextHealth,
    happiness: clampStat(state.happiness + item.happinessDelta),
    relations: clampStat(state.relations + item.relationsDelta),
    habits: nextHabits,
    aiMemory: appendAiMemory(state, item.name, item.description, 'habit'),
    isAlive,
    causeOfEnd: !isAlive
      ? 'Фатальная интоксикация организма из-за вредных привычек.'
      : state.causeOfEnd,
    chronicle: [
      {
        id: `habit_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Привычки и Тусовки] ${item.name}: Счастье +${item.happinessDelta}, Здоровье ${item.healthDelta > 0 ? `+${item.healthDelta}` : item.healthDelta}.`,
        starred: item.habitType === 'rehab',
        category: 'life',
      },
      ...state.chronicle,
    ],
  };
}

// Crime, Gang Shootouts & Heists
export function executeCrimeAction(
  state: PlayerState,
  crime: CrimeActionItem
): { nextState: PlayerState; success: boolean; summaryText: string } {
  const isMinorCrime = crime.wantedGain <= 1 && crime.minPayout <= 1000;
  const gate = getAgeGate(isMinorCrime ? 'minor_crime' : 'crime', state.age);
  if (!gate.allowed) {
    return {
      nextState: state,
      success: false,
      summaryText: gate.reason,
    };
  }

  const skillBoost =
    Math.max(0, state.skills.strength - crime.requiredStrength) * 0.4 +
    Math.max(0, state.skills.intellect - crime.requiredIntellect) * 0.4;
  const effectiveChance = clampStat(crime.baseSuccessChance + skillBoost - state.wantedLevel * 5, 15, 95);
  const roll = ((state.age * 37 + state.money + Date.now()) % 100) + 1;
  const success = roll <= effectiveChance;

  const payout = Math.round(
    ((crime.minPayout + crime.maxPayout) / 2) * state.city.economyMultiplier
  );
  const fine = Math.round(crime.minPayout * crime.fineMultOnFail);

  const nextWanted = Math.min(5, state.wantedLevel + crime.wantedGain);
  const nextHealth = success ? state.health : clampStat(state.health - crime.healthRiskOnFail);
  const summaryText = success
    ? `[КРИМИНАЛ — УСПЕХ!] «${crime.name}»: вы сорвали куш +${formatMoney(payout, state.currency)}! Уровень розыска: ${'★'.repeat(nextWanted)}.`
    : `[КРИМИНАЛ — ОБЛАВА!] «${crime.name}»: операция сорвалась в перестрелке! Потеряно -${formatMoney(fine, state.currency)} на отход и адвокатов, Здоровье -${crime.healthRiskOnFail}.`;

  const nextState: PlayerState = {
    ...state,
    money: success ? state.money + payout : state.money - fine,
    health: nextHealth,
    happiness: clampStat(state.happiness + (success ? 10 : -8)),
    wantedLevel: nextWanted,
    heistsCompleted: success ? state.heistsCompleted + 1 : state.heistsCompleted,
    shadowIncome: success ? (state.shadowIncome || 0) + payout : state.shadowIncome,
    taxScrutiny: success ? clampStat((state.taxScrutiny || 0) + 8) : state.taxScrutiny,
    hasInjury: !success ? true : state.hasInjury,
    injuryTurnsLeft: !success ? 3 : state.injuryTurnsLeft,
    aiMemory: appendAiMemory(state, `Криминал: ${crime.name}`, summaryText, 'crime'),
    isAlive: nextHealth > 0,
    causeOfEnd:
      nextHealth <= 0 ? 'Гибель в криминальной перестрелке с полицией и ОПГ.' : state.causeOfEnd,
    chronicle: [
      {
        id: `crime_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: true,
        category: 'crime',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return { nextState, success, summaryText };
}

// Bribes: Give Bribe (Clear Wanted Stars) or Take Bribe (Instant Cash + Corruption Risk)
export function executeBribeAction(
  state: PlayerState,
  bribe: BribeActionItem
): { nextState: PlayerState; summaryText: string } {
  const gate = getAgeGate('bribe', state.age);
  if (!gate.allowed) {
    return { nextState: state, summaryText: gate.reason };
  }

  if (bribe.direction === 'give') {
    if (state.money < bribe.costOrReward) {
      return { nextState: state, summaryText: 'Недостаточно наличных для взятки!' };
    }
    const nextWanted = Math.max(0, state.wantedLevel + bribe.wantedDelta);
    const summaryText = `[Взятка принята] ${bribe.name} (-${formatMoney(bribe.costOrReward, state.currency)}). Розыск снижен до ${nextWanted}/5 звёзд.`;
    return {
      nextState: {
        ...state,
        money: state.money - bribe.costOrReward,
        wantedLevel: nextWanted,
        aiMemory: appendAiMemory(state, bribe.name, summaryText, 'crime'),
        chronicle: [
          {
            id: `bribe_${Date.now()}`,
            age: state.age,
            year: state.currentYear,
            season: state.season,
            weather: state.weather,
            text: summaryText,
            starred: true,
            category: 'crime',
          },
          ...state.chronicle,
        ],
      },
      summaryText,
    };
  }

  // Taking a bribe / kickback
  const reward = Math.round(bribe.costOrReward * state.city.economyMultiplier);
  const nextWanted = Math.min(5, state.wantedLevel + bribe.wantedDelta);
  const summaryText = `[Откат в конверте] Вы взяли взятку: «${bribe.name}» (+${formatMoney(reward, state.currency)}). Риск розыска: ${nextWanted}/5★.`;

  return {
    nextState: {
      ...state,
      money: state.money + reward,
      shadowIncome: (state.shadowIncome || 0) + reward,
      taxScrutiny: clampStat((state.taxScrutiny || 0) + 10),
      wantedLevel: nextWanted,
      bribesTakenCount: state.bribesTakenCount + 1,
      approvalRating: clampStat(state.approvalRating + bribe.approvalDelta),
      aiMemory: appendAiMemory(state, bribe.name, summaryText, 'crime'),
      chronicle: [
        {
          id: `bribe_take_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: summaryText,
          starred: true,
          category: 'crime',
        },
        ...state.chronicle,
      ],
    },
    summaryText,
  };
}

// VIP Casino Games (Roulette, Blackjack 21, Slots 777, High-Roller Poker)
export function playCasinoGame(
  state: PlayerState,
  gameType: CasinoGameType,
  betAmount: number
): { nextState: PlayerState; won: boolean; netDelta: number; summaryText: string } {
  const gate = getAgeGate('casino', state.age);
  if (!gate.allowed) {
    return {
      nextState: state,
      won: false,
      netDelta: 0,
      summaryText: gate.reason,
    };
  }
  if (betAmount <= 0 || state.money < betAmount) {
    return {
      nextState: state,
      won: false,
      netDelta: 0,
      summaryText: 'Недостаточно средств для ставки в казино!',
    };
  }

  const roll = Math.random() * 100;
  let winChance = 48;
  let multiplier = 2;
  let gameTitle = 'Рулетка (Красное/Чёрное)';

  if (gameType === 'roulette_zero') {
    winChance = 8;
    multiplier = 18;
    gameTitle = 'Рулетка (Ставка на Зеро 0)';
  } else if (gameType === 'blackjack') {
    winChance = 51 + Math.min(8, state.skills.intellect / 15);
    multiplier = 2.2;
    gameTitle = 'Блэкджек 21 за VIP-столом';
  } else if (gameType === 'slots_777') {
    winChance = 28;
    multiplier = 4.5;
    gameTitle = 'Слоты «Три Семёрки 777 Jackpot»';
  } else if (gameType === 'high_poker') {
    winChance = 46 + Math.min(12, state.skills.charisma / 12);
    multiplier = 2.8;
    gameTitle = 'Закрытый Техасский Холдем Покер';
  }

  const won = roll <= winChance;
  const netDelta = won ? Math.round(betAmount * (multiplier - 1)) : -betAmount;
  const summaryText = won
    ? `[КАЗИНО — ВЫИГРЫШ!] ${gameTitle}: ваша ставка ${formatMoney(betAmount, state.currency)} сыграла (x${multiplier})! Чистый выигрыш: +${formatMoney(netDelta, state.currency)}!`
    : `[КАЗИНО] ${gameTitle}: крупье забирает ставку -${formatMoney(betAmount, state.currency)}.`;

  const nextState: PlayerState = {
    ...state,
    money: state.money + netDelta,
    happiness: clampStat(state.happiness + (won ? 10 : -4)),
    casinoNetProfit: state.casinoNetProfit + netDelta,
    shadowIncome: won && netDelta >= 1000 ? (state.shadowIncome || 0) + netDelta : state.shadowIncome,
    taxScrutiny: won && netDelta >= 1000 ? clampStat((state.taxScrutiny || 0) + 5) : state.taxScrutiny,
    chronicle: [
      {
        id: `cas_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: summaryText,
        starred: won && netDelta >= 2000,
        category: 'finance',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return { nextState, won, netDelta, summaryText };
}

// Nightlife & Escorts Service
export function enjoyNightlifePackage(
  state: PlayerState,
  pkg: NightlifePackageItem
): PlayerState {
  if (!getAgeGate('nightlife', state.age).allowed) {
    return state;
  }
  if (state.money < pkg.price) return state;

  return {
    ...state,
    money: state.money - pkg.price,
    happiness: clampStat(state.happiness + pkg.happinessGain),
    health: clampStat(state.health + pkg.healthDelta),
    skills: {
      ...state.skills,
      charisma: clampStat(state.skills.charisma + pkg.charismaGain),
    },
    chronicle: [
      {
        id: `night_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Ночная жизнь — ${pkg.tierLabel}] ${pkg.name} (-${formatMoney(pkg.price, state.currency)}): Счастье +${pkg.happinessGain}, Харизма +${pkg.charismaGain}.`,
        starred: false,
        category: 'romance',
      },
      ...state.chronicle,
    ],
  };
}

// Love, Romance, Gifts & Marriage
export function interactRomancePartner(
  state: PlayerState,
  partner: RomancePartner,
  action: 'start_dating' | 'romantic_date' | 'luxury_gift' | 'marry' | 'breakup'
): { nextState: PlayerState; summaryText: string } {
  const baseGate = getAgeGate('romance', state.age);
  if (!baseGate.allowed) {
    return { nextState: state, summaryText: baseGate.reason };
  }
  if (action === 'luxury_gift' || action === 'marry') {
    const adultGate = getAgeGate('romance_adult', state.age);
    if (!adultGate.allowed) {
      return { nextState: state, summaryText: adultGate.reason };
    }
  }

  if (action === 'breakup') {
    const summaryText = `Вы расстались с ${partner.name}. Начинается новый этап личной жизни.`;
    return {
      nextState: {
        ...state,
        activePartnerId: null,
        partnerRelationship: 0,
        isMarried: false,
        aiMemory: appendAiMemory(state, `Расставание с ${partner.name}`, summaryText, 'romance'),
        chronicle: [
          {
            id: `rom_brk_${Date.now()}`,
            age: state.age,
            year: state.currentYear,
            season: state.season,
            weather: state.weather,
            text: summaryText,
            starred: false,
            category: 'romance',
          },
          ...state.chronicle,
        ],
      },
      summaryText,
    };
  }

  const isTeen = state.age < 18;
  const cost =
    action === 'start_dating'
      ? isTeen
        ? 20
        : 100
      : action === 'romantic_date'
      ? isTeen
        ? 40
        : 240
      : action === 'luxury_gift'
      ? 1200
      : 4500;

  if (state.money < cost) {
    return {
      nextState: state,
      summaryText: `Не хватает средств (${formatMoney(cost, state.currency)})!`,
    };
  }

  const relDelta =
    action === 'start_dating'
      ? 45
      : action === 'romantic_date'
      ? 16
      : action === 'luxury_gift'
      ? 28
      : 35;

  const nextRel =
    state.activePartnerId === partner.id
      ? clampStat(state.partnerRelationship + relDelta)
      : clampStat(relDelta);

  const isMarrying = action === 'marry';
  const summaryText =
    action === 'start_dating'
      ? `Вы познакомились и начали встречаться с ${partner.name} (${partner.profession})!`
      : action === 'romantic_date'
      ? isTeen
        ? `Прогулка в парке и кино с ${partner.name}: симпатия и доверие укрепились (${nextRel}/100)!`
        : `Романтический ужин при свечах с ${partner.name}: любовь и доверие укрепились (${nextRel}/100)!`
      : action === 'luxury_gift'
      ? `Вы подарили ${partner.name} ювелирное украшение Cartier! Восторг и страсть (${nextRel}/100)!`
      : `СВАДЬБА! Вы и ${partner.name} сыграли роскошную свадьбу! Теперь ваш семейный бюджет пополняется на +${formatMoney(partner.wealthBonusPerMonth, state.currency)}/мес.`;

  const updatedFamily =
    isMarrying && !state.family.some((f) => f.id === `spouse_${partner.id}`)
      ? [
          ...state.family,
          {
            id: `spouse_${partner.id}`,
            name: partner.name,
            relation: 'Супруг(а)' as const,
            age: partner.age,
            profession: partner.profession,
            monthlyIncome: partner.wealthBonusPerMonth,
            relationship: 98,
            health: 96,
            trait: partner.personality,
            alive: true,
          },
        ]
      : state.family;

  return {
    nextState: {
      ...state,
      money: state.money - cost,
      activePartnerId: partner.id,
      partnerRelationship: nextRel,
      isMarried: isMarrying ? true : state.isMarried,
      happiness: clampStat(state.happiness + partner.happinessBonus),
      relations: clampStat(state.relations + 12),
      family: updatedFamily,
      storyArc: isMarrying ? `Глава: Счастливый брак с ${partner.name}` : state.storyArc,
      aiMemory: appendAiMemory(state, `Отношения с ${partner.name}`, summaryText, 'romance'),
      chronicle: [
        {
          id: `rom_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `[Любовь] ${summaryText}`,
          starred: true,
          category: 'romance',
        },
        ...state.chronicle,
      ],
    },
    summaryText,
  };
}

export function generateOfflineNpcDialogue(
  state: PlayerState,
  npcId: string,
  userMessageOrAction: string
): {
  reply: string;
  moodReaction: string;
  relationDelta: number;
  happinessDelta: number;
} {
  const npc = state.friends.find((f) => f.id === npcId) || state.friends[0];
  const npcName = npc?.name || 'Друг';
  const bonuses = calculateActiveBonuses(state);
  const latestEntry = state.aiMemory.entries[0];
  const prevEntry = state.aiMemory.entries[1];
  const lastMem = latestEntry
    ? `${latestEntry.actionTaken} (${latestEntry.consequenceSummary})`
    : state.storyArc;
  const priorChatTurn = npc?.dialogueHistory
    ? [...npc.dialogueHistory].reverse().find((t) => t.sender === 'player')
    : undefined;
  const chatMemoryPrefix = priorChatTurn
    ? `Помню, как ты недавно говорил: «${priorChatTurn.text.slice(0, 48)}». `
    : prevEntry
    ? `Ещё с тех пор, как было «${prevEntry.actionTaken.slice(0, 45)}», я знал, что ты пойдёшь далеко! `
    : '';
  const wardrobeOrBrand =
    bonuses.equippedSuit && state.age >= 18
      ? ` Твой образ («${bonuses.equippedSuit.name}») внушает уважение!`
      : bonuses.equippedBrands.length > 0 && state.age >= 10
      ? ` Кстати, твой прикид (${bonuses.equippedBrands[0].brand}) выглядит топово!`
      : '';

  const lower = userMessageOrAction.toLowerCase();
  const variantIdx =
    Math.abs(
      state.age * 11 +
        state.dayOfMonth * 7 +
        state.monthOfYear * 5 +
        userMessageOrAction.length * 13 +
        (npc?.relationship || 50) +
        (npc?.dialogueHistory?.length || 0) * 17
    ) % 3;

  // Early childhood mode (Ages 0 - 5)
  if (state.age <= 5) {
    const childReplies = [
      `${chatMemoryPrefix}Посмотри, какая классная игрушка! В г. ${state.city.name} сегодня отличная погода (${state.weather}), пойдём играть во двор вместе с родителями!`,
      `${chatMemoryPrefix}Давай строить большую башню из кубиков! Твоя мама и папа говорят, что ты растёшь очень смышлёным (${state.age} лет, память ДО: «${lastMem}»).`,
      `${chatMemoryPrefix}Ура! Давай бегать наперегонки на площадке в г. ${state.city.name}!`,
    ];
    return {
      reply: childReplies[variantIdx],
      moodReaction: `Радостно смеётся (${npcName})`,
      relationDelta: 7,
      happinessDelta: 7,
    };
  }

  // Topic 1: Sport, Gym, Muscles, Workout
  if (
    lower.includes('спорт') ||
    lower.includes('зал') ||
    lower.includes('тренир') ||
    lower.includes('мышц') ||
    lower.includes('кач') ||
    lower.includes('турник')
  ) {
    const sportReplies = [
      `${chatMemoryPrefix}Отличная идея, ${state.name}! С твоей Силой (${state.skills.strength}/100) и Мышцами (${state.skills.muscleMass}/100) мы сегодня побьём рабочий вес на жиме в г. ${state.city.name}!${wardrobeOrBrand}`,
      `${chatMemoryPrefix}Я уже собрал спортивную сумку! Помню твой путь ДО («${lastMem}») — после такой тренировки рельеф и выносливость вырастут на глазах.`,
      `${chatMemoryPrefix}Давай устроим жёсткое кардио и базу! В такую погоду (${state.weather}) спортзал в г. ${state.city.name} — лучшее место для прокачки.`,
    ];
    return {
      reply: sportReplies[variantIdx],
      moodReaction: 'Готов к тренировке 💪',
      relationDelta: 8,
      happinessDelta: 7,
    };
  }

  // Topic 2: Urbex, Rooftops, Bunkers, Extreme
  if (
    lower.includes('уберэкс') ||
    lower.includes('заброш') ||
    lower.includes('рейд') ||
    lower.includes('крыш') ||
    lower.includes('бункер') ||
    lower.includes('сталк')
  ) {
    if (state.age < 16) {
      return {
        reply: `${chatMemoryPrefix}Слушай, ${state.name}, серьёзные ночные вылазки на охраняемые объекты открываются с 16 лет! А пока (после «${lastMem}») давай прокачаем выносливость и поснимаем городские влоги в г. ${state.city.name}.`,
        moodReaction: 'Советует подготовиться',
        relationDelta: 5,
        happinessDelta: 4,
      };
    }
    const urbexReplies = [
      `${chatMemoryPrefix}Фонари и экшн-камера заряжены! Помню твоё дело ДО («${lastMem}»). В г. ${state.city.name} сегодня ${state.weather} — идеальное прикрытие для нового рейда (навык Уберэкса: ${state.skills.urbex}, подписчиков: ${state.urbexSubscribers.toLocaleString('ru-RU')}).`,
      `${chatMemoryPrefix}У меня есть схема закрытого объекта на окраине г. ${state.city.name}! Если снимем этот выпуск, твой блог взлетит в тренды.${wardrobeOrBrand}`,
      `${chatMemoryPrefix}Охрана там строгая, но с твоей физподготовкой (Сила: ${state.skills.strength}) мы пройдём незаметно и снимем лучший материал сезона!`,
    ];
    return {
      reply: urbexReplies[variantIdx],
      moodReaction: 'Проверяет снаряжение 🔦',
      relationDelta: 9,
      happinessDelta: 7,
    };
  }

  // Topic 3: Investments, Money, Business, Finance
  if (
    lower.includes('инвест') ||
    lower.includes('деньг') ||
    lower.includes('бизнес') ||
    lower.includes('акци') ||
    lower.includes('капитал') ||
    lower.includes('заработ')
  ) {
    const finReplies = [
      `${chatMemoryPrefix}Сейчас у тебя на счету ${formatMoney(state.money, state.currency)}, а навык Финансов — ${state.skills.finance}/100. Помню твои решения ДО («${lastMem}»): в г. ${state.city.name} выгодно комбинировать дивидендные фонды и открытие собственной франшизы!`,
      `${chatMemoryPrefix}Учитывая твой путь («${lastMem}») и ежемесячные счета (${formatMoney(state.monthlyExpenses.total, state.currency)}/мес), советую держать финансовую подушку и реинвестировать прибыль бизнеса.`,
      `${chatMemoryPrefix}Помню твои шаги ДО («${lastMem}»): в ${state.currentYear} году в г. ${state.city.name} быстрее всего растут IT-активы и коммерческая недвижимость. Главное — следи за вниманием налоговой (${state.taxScrutiny || 0}%)!`,
    ];
    return {
      reply: finReplies[variantIdx],
      moodReaction: 'Делится финансовой стратегией 📈',
      relationDelta: 7,
      happinessDelta: 5,
    };
  }

  // Topic 4: School, University, Exams, Languages
  if (
    lower.includes('школ') ||
    lower.includes('вуз') ||
    lower.includes('учеб') ||
    lower.includes('универ') ||
    lower.includes('экзам') ||
    lower.includes('язык')
  ) {
    const eduReplies = [
      `${chatMemoryPrefix}Твой средний балл аттестата — ${state.schoolGradeAvg.toFixed(1)}/12, а Интеллект — ${state.skills.intellect}/100! Помню, что было ДО («${lastMem}»): если подтянуть иностранный язык до B2/C1, ты легко поступишь на грант в Топ-10 ВУЗов Европы или Украины.`,
      `${chatMemoryPrefix}Помню твои успехи («${lastMem}»). В г. ${state.city.name} диплом престижного факультета открывает доступ к самым высокооплачиваемым профессиям!`,
      `${chatMemoryPrefix}Давай вместе подготовимся к олимпиаде! Высокий аттестат сэкономит тысячи долларов на обучении в университете.`,
    ];
    return {
      reply: eduReplies[variantIdx],
      moodReaction: 'Поддерживает в учёбе 🎓',
      relationDelta: 8,
      happinessDelta: 6,
    };
  }

  // Topic 5: Career, Work, Politics
  if (
    lower.includes('работ') ||
    lower.includes('карьер') ||
    lower.includes('зарплат') ||
    lower.includes('полит') ||
    lower.includes('выбор')
  ) {
    const careerTitle =
      CAREERS_CATALOG.find((c) => c.id === state.currentCareerId)?.title || 'поиск призвания';
    return {
      reply: `${chatMemoryPrefix}Твоя текущая сфера (${careerTitle}) и опыт ДО («${lastMem}») в г. ${state.city.name} дают отличную базу! Выполняй спецдействия смены и собирай мощный ПК, чтобы поднять множитель дохода.${wardrobeOrBrand}`,
      moodReaction: 'Уважает ваш профессионализм 💼',
      relationDelta: 7,
      happinessDelta: 6,
    };
  }

  // Topic 6: Romance, Family, Life, Default
  const generalReplies = [
    `${chatMemoryPrefix}Рад тебя слышать, ${state.name}! Я хорошо помню, через что мы прошли ДО («${lastMem}»). В ${state.currentYear} году в г. ${state.city.name} (${state.season}, ${state.weather}) у нас впереди ещё больше крутых историй!${wardrobeOrBrand}`,
    `${chatMemoryPrefix}Ты отлично держишься, ${state.name}! Текущая глава твоей жизни («${state.storyArc}») и прошлые шаги («${lastMem}») вдохновляют всех наших друзей в г. ${state.city.name}.`,
    `${chatMemoryPrefix}В г. ${state.city.name} сегодня ${state.weather}, но с таким другом, как ты (${state.age} лет, Харизма ${state.skills.charisma}/100), любое дело по плечу! Помню твой выбор ДО: «${lastMem}».`,
  ];

  return {
    reply: generalReplies[variantIdx],
    moodReaction: `Помнит вашу биографию и диалоги (${npcName})`,
    relationDelta: 7,
    happinessDelta: 6,
  };
}

export function validateAndCreateCustomMod(input: {
  title: string;
  description: string;
  weatherCondition: WeatherType | 'any';
  seasonCondition: Season | 'any';
  choiceALabel: string;
  choiceAOutcome: string;
  choiceBLabel: string;
  choiceBOutcome: string;
}): { valid: boolean; error?: string; event?: LifeEventTemplate } {
  const title = input.title.trim();
  const description = input.description.trim();
  const choiceALabel = input.choiceALabel.trim();
  const choiceBLabel = input.choiceBLabel.trim();

  if (title.length < 3) {
    return { valid: false, error: 'Введите название события (минимум 3 символа).' };
  }
  if (description.length < 10) {
    return { valid: false, error: 'Введите описание сценария (минимум 10 символов).' };
  }
  if (!choiceALabel || !choiceBLabel) {
    return { valid: false, error: 'Заполните оба варианта выбора для игрока.' };
  }

  const event: LifeEventTemplate = {
    id: `mod_${Date.now()}`,
    title,
    description,
    minAge: 0,
    maxAge: 99,
    weatherCondition: input.weatherCondition,
    seasonCondition: input.seasonCondition,
    careerCondition: 'any',
    isCustomMod: true,
    choices: [
      {
        label: choiceALabel,
        outcomeText:
          input.choiceAOutcome.trim() ||
          'Ваше решение изменило ход вашей истории и укрепило навыки!',
        nextStoryArc: `Авторский путь: ${title}`,
        happinessDelta: 8,
        knowledgeDelta: 5,
        moneyDelta: 500,
        skillKey: 'strength',
        skillDelta: 6,
        followersDelta: 300,
      },
      {
        label: choiceBLabel,
        outcomeText:
          input.choiceBOutcome.trim() ||
          'Вы выбрали расчётливый путь и укрепили финансовую базу.',
        nextStoryArc: `Стратегический выбор: ${title}`,
        healthDelta: 5,
        relationsDelta: 6,
        moneyDelta: 350,
        skillKey: 'finance',
        skillDelta: 6,
      },
    ],
  };

  return { valid: true, event };
}

// =================== AGE GATE UTILITIES ===================

export function getAgeGate(action: string, age: number): AgeGateInfo {
  const gates: Record<string, { minAge: number; reason: string }> = {
    'school':           { minAge: 6,  reason: 'Школа начинается с 6 лет' },
    'college':          { minAge: 14, reason: 'Колледж доступен с 14 лет (после 9 класса)' },
    'university':       { minAge: 18, reason: 'ВУЗы доступны с 18 лет' },
    'career':           { minAge: 18, reason: 'Взрослая карьера доступна с 18 лет' },
    'part_time_job':    { minAge: 14, reason: 'Подростковые подработки доступны с 14 лет' },
    'business':         { minAge: 18, reason: 'Бизнес и франшизы доступны с 18 лет' },
    'politics':         { minAge: 21, reason: 'Политика и выборы доступны с 21 года' },
    'investment':       { minAge: 18, reason: 'Биржа и инвестиции доступны с 18 лет' },
    'house_buy':        { minAge: 18, reason: 'Покупка недвижимости доступна с 18 лет' },
    'vehicle_buy':      { minAge: 18, reason: 'Покупка авто доступна с 18 лет' },
    'motorcycle_buy':   { minAge: 16, reason: 'Мотоцикл и скутер доступны с 16 лет' },
    'bicycle_buy':      { minAge: 6,  reason: 'Велосипед доступен с 6 лет' },
    'crime':            { minAge: 18, reason: 'Криминал — строго с 18 лет!' },
    'minor_crime':      { minAge: 16, reason: 'Мелкие правонарушения — с 16 лет' },
    'bribe':            { minAge: 18, reason: 'Взятки и откаты — с 18 лет!' },
    'casino':           { minAge: 18, reason: 'Казино 777 — строго с 18 лет!' },
    'steroids':         { minAge: 18, reason: 'Стероиды — только с 18 лет!' },
    'habit':            { minAge: 14, reason: 'Вредные привычки и тусовки — с 14 лет' },
    'nightlife':        { minAge: 18, reason: 'Клуб 18+ — только совершеннолетним' },
    'romance':          { minAge: 12, reason: 'Первая симпатия открывается с 12 лет' },
    'romance_adult':    { minAge: 18, reason: 'Взрослые свидания и брак — с 18 лет' },
    'urbex':            { minAge: 16, reason: 'Экстрим и Уберэкс доступны с 16 лет' },
    'hobby_basic':      { minAge: 6,  reason: 'Хобби и секции доступны с 6 лет' },
    'hobby_extreme':    { minAge: 16, reason: 'Экстремальные хобби доступны с 16 лет' },
    'faction':          { minAge: 14, reason: 'Социальные круги и группировки доступны с 14 лет' },
    'language_course':  { minAge: 6,  reason: 'Языковые курсы доступны с 6 лет' },
    'tech_gadget':      { minAge: 12, reason: 'Гаджеты и смартфоны с 12 лет' },
    'pc_build':         { minAge: 12, reason: 'Сборка ПК доступна с 12 лет' },
    'pet_request':      { minAge: 4,  reason: 'Попросить питомца можно с 4 до 17 лет' },
    'blog_post':        { minAge: 12, reason: 'Блог и соцсети с 12 лет' },
    'artist_concert':   { minAge: 10, reason: 'Концерты доступны с 10 лет' },
    'artist_collab':    { minAge: 14, reason: 'Музыкальные фиты доступны с 14 лет' },
    'relocate':         { minAge: 18, reason: 'Самостоятельный переезд — с 18 лет' },
  };
  const gate = gates[action];
  if (!gate) return { allowed: true, minAge: 0, reason: '' };
  return {
    allowed: age >= gate.minAge,
    minAge: gate.minAge,
    reason: gate.reason,
  };
}

// =================== PARENTAL CONSENT SYSTEM ===================

export function calculateParentalConsentChance(
  state: PlayerState,
  requestType: 'pet' | 'hobby' | 'course' | 'gadget' | 'sport',
  cost: number
): number {
  const mother = state.family[0];
  const father = state.family[1];
  if (!mother && !father) return 0.35;

  const familyIncome = ((mother?.monthlyIncome || 0) + (father?.monthlyIncome || 0));
  const canAfford = cost <= 0 || familyIncome >= cost * 1.5 ? 1 : familyIncome >= cost ? 0.7 : 0.3;
  const relationScore = state.relations / 100;
  const gradeBonus = state.schoolGradeAvg >= 9.5 ? 0.25 : state.schoolGradeAvg >= 7.5 ? 0.12 : -0.15;

  const motherTrait = mother?.trait || '';
  const motherTraitBonus = motherTrait.includes('Заботлив') ? 0.22 :
    motherTrait.includes('Дисциплин') ? (requestType === 'sport' || requestType === 'course' ? 0.18 : 0.05) :
    motherTrait.includes('Строг') ? -0.12 : 0.05;

  const fatherTrait = father?.trait || '';
  const fatherTraitBonus = fatherTrait.includes('Заботлив') ? 0.18 :
    fatherTrait.includes('Дисциплин') ? (requestType === 'sport' || requestType === 'gadget' ? 0.2 : 0.08) :
    fatherTrait.includes('Строг') ? -0.15 : 0.05;

  const requestTypeBonus = requestType === 'sport' ? 0.12 : requestType === 'course' ? 0.15 : requestType === 'pet' ? -0.05 : 0;

  const chance = Math.min(0.95, Math.max(0.08,
    (relationScore * 0.4 + 0.2) * canAfford + gradeBonus + motherTraitBonus + fatherTraitBonus + requestTypeBonus
  ));

  return Number(chance.toFixed(2));
}

export function askParentsForPet(state: PlayerState): { nextState: PlayerState; result: 'success' | 'fail'; message: string } {
  if (state.age < 4 || state.age >= 18) {
    return { nextState: state, result: 'fail', message: 'Попросить родителей завести питомца можно с 4 до 17 лет.' };
  }
  if (state.activePetId) {
    return { nextState: state, result: 'fail', message: 'У вашей семьи уже есть питомец!' };
  }
  if ((state.petRequestCooldown || 0) > 0) {
    return { nextState: state, result: 'fail', message: `Родители просили подождать ещё ${state.petRequestCooldown} ход(а).` };
  }

  const chance = calculateParentalConsentChance(state, 'pet', 0);
  const success = Math.random() < chance;

  if (success) {
    const nextState: PlayerState = {
      ...state,
      activePetId: 'dog_lucky',
      ownedPetIds: state.ownedPetIds.includes('dog_lucky') ? state.ownedPetIds : [...state.ownedPetIds, 'dog_lucky'],
      happiness: clampStat(state.happiness + 20),
      relations: clampStat(state.relations + 10),
      petRequestCooldown: 0,
      chronicle: [
        {
          id: `pet_ok_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `🎉 Родители согласились! Вы уговорили маму и папу завести щенка Lucky! В доме теперь звучит радостный лай, а у вас появился лучший друг. (+Счастье, +Отношения)`,
          starred: true,
          category: 'family',
        },
        ...state.chronicle,
      ],
    };
    return { nextState, result: 'success', message: 'Родители согласились! Щенок Lucky теперь ваш верный друг!' };
  } else {
    const nextState: PlayerState = {
      ...state,
      petRequestCooldown: 2,
      happiness: clampStat(state.happiness - 4),
      chronicle: [
        {
          id: `pet_refuse_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `Вы подошли к родителям с просьбой завести питомца, но отец покачал головой: «Это большая ответственность и расходы. Поговорим позже». (Шанс был ${Math.round(chance * 100)}%).`,
          starred: false,
          category: 'family',
        },
        ...state.chronicle,
      ],
    };
    return { nextState, result: 'fail', message: `Родители пока отказали (шанс был ${Math.round(chance * 100)}%). Улучшите отношения или оценки в школе!` };
  }
}

export function askParentsToPayFor(
  state: PlayerState,
  itemName: string,
  cost: number,
  requestType: 'hobby' | 'course' | 'gadget' | 'sport',
  onSuccess: (s: PlayerState) => PlayerState
): { nextState: PlayerState; result: 'success' | 'fail'; message: string } {
  if (state.age >= 18) {
    if (state.money >= cost) {
      return {
        nextState: onSuccess({ ...state, money: state.money - cost }),
        result: 'success',
        message: `Куплено за свой счёт: ${itemName} (-$${cost})`,
      };
    }
    return { nextState: state, result: 'fail', message: 'Недостаточно личных средств!' };
  }

  const chance = calculateParentalConsentChance(state, requestType, cost);
  const success = Math.random() < chance;

  if (success) {
    const updated = onSuccess(state);
    return {
      nextState: {
        ...updated,
        relations: clampStat(updated.relations + 4),
        chronicle: [
          {
            id: `parent_pay_${Date.now()}`,
            age: state.age,
            year: state.currentYear,
            season: state.season,
            weather: state.weather,
            text: `Родители с радостью согласились оплатить «${itemName}» ($${cost})! Они гордятся вашим стремлением развиваться.`,
            starred: true,
            category: 'family',
          },
          ...updated.chronicle,
        ],
      },
      result: 'success',
      message: `Родители оплатили: ${itemName}!`,
    };
  }

  if (state.money >= cost) {
    const updated = onSuccess({ ...state, money: state.money - cost });
    return {
      nextState: {
        ...updated,
        chronicle: [
          {
            id: `parent_pocket_${Date.now()}`,
            age: state.age,
            year: state.currentYear,
            season: state.season,
            weather: state.weather,
            text: `Родители отказались оплачивать «${itemName}», но вы оплатили его из своих карманных денег (-$${cost}).`,
            starred: false,
            category: 'family',
          },
          ...updated.chronicle,
        ],
      },
      result: 'success',
      message: `Родители отказали, но вы оплатили из накопленных карманных денег!`,
    };
  }

  return {
    nextState: {
      ...state,
      chronicle: [
        {
          id: `parent_refuse_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `Родители отказались оплачивать «${itemName}». Отец сказал: «Сейчас лишних денег нет, подтяни школьный аттестат». (Шанс был ${Math.round(chance * 100)}%).`,
          starred: false,
          category: 'family',
        },
        ...state.chronicle,
      ],
    },
    result: 'fail',
    message: `Родители отказали (шанс был ${Math.round(chance * 100)}%). Повысьте оценки или накопите карманные деньги.`,
  };
}

// =================== SEASONAL EVENTS ===================

export function checkAndGenerateSeasonalEvent(state: PlayerState): PlayerState {
  let nextState = { ...state };

  // Birthday
  if (
    state.monthOfYear === state.birthMonth &&
    !state.birthdayEventFiredThisYear
  ) {
    nextState = {
      ...nextState,
      happiness: clampStat(nextState.happiness + 15),
      relations: clampStat(nextState.relations + 8),
      birthdayEventFiredThisYear: true,
      chronicle: [
        {
          id: `bday_${Date.now()}`,
          age: nextState.age,
          year: nextState.currentYear,
          season: nextState.season,
          weather: nextState.weather,
          text: `🎂 С Днём Рождения! Вам исполнилось ${nextState.age} лет! Семья подарила подарки и теплые пожелания. (+15 к Счастью)`,
          starred: true,
          category: 'life',
        },
        ...nextState.chronicle,
      ],
    };
  }

  // Reset birthday flag if month changed
  if (state.monthOfYear !== state.birthMonth && state.birthdayEventFiredThisYear) {
    nextState.birthdayEventFiredThisYear = false;
  }

  // New Year (January)
  if (
    state.monthOfYear === 1 &&
    state.lastSeasonalEventYear !== state.currentYear
  ) {
    nextState = {
      ...nextState,
      happiness: clampStat(nextState.happiness + 12),
      lastSeasonalEventYear: nextState.currentYear,
      chronicle: [
        {
          id: `ny_${Date.now()}`,
          age: nextState.age,
          year: nextState.currentYear,
          season: nextState.season,
          weather: nextState.weather,
          text: `🎆 С Новым ${nextState.currentYear} Годом! Праздничные салюты освещают город ${nextState.city.name}. Время строить планы на будущее!`,
          starred: true,
          category: 'life',
        },
        ...nextState.chronicle,
      ],
    };
  }

  return nextState;
}

// =================== BLOG & SOCIAL MEDIA ===================

export function publishBlogPost(
  state: PlayerState,
  postTheme: 'urbex' | 'fitness' | 'lifestyle' | 'travel'
): { nextState: PlayerState; summaryText: string } {
  const blogGate = getAgeGate('blog_post', state.age);
  if (!blogGate.allowed) {
    return { nextState: state, summaryText: blogGate.reason };
  }
  if (!state.activeSmartphoneId) {
    return { nextState: state, summaryText: 'Для публикации постов в соцсетях необходим смартфон!' };
  }

  const charismaBonus = state.skills.charisma / 100;
  const baseGain = postTheme === 'urbex' ? 240 : postTheme === 'fitness' ? 160 : postTheme === 'travel' ? 280 : 120;
  const subscribersGained = Math.round(baseGain * (1 + charismaBonus) * (1 + state.urbexRaidsDone * 0.02));
  const adRevenueDelta = Math.max(15, Math.round(subscribersGained * 0.05));

  const themeText: Record<string, string> = {
    urbex: 'ночную сталкерскую вылазку и тайны заброшек',
    fitness: 'свою тренировку и трансформацию мускулатуры',
    lifestyle: 'свой стиль жизни, гаджеты и покупки',
    travel: 'путешествие и атмосферу города',
  };

  const summaryText = `Пост про ${themeText[postTheme]} вызвал бурный интерес: +${subscribersGained.toLocaleString('ru-RU')} подписчиков!`;

  return {
    nextState: {
      ...state,
      urbexSubscribers: state.urbexSubscribers + subscribersGained,
      blogPostsCount: (state.blogPostsCount || 0) + 1,
      blogAdRevenue: (state.blogAdRevenue || 0) + adRevenueDelta,
      skills: {
        ...state.skills,
        charisma: clampStat(state.skills.charisma + 2),
        creativity: clampStat(state.skills.creativity + 2),
      },
      chronicle: [
        {
          id: `blog_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `📱 [Соцсети и Блог] Вы выложили новый пост про ${themeText[postTheme]}. +${subscribersGained.toLocaleString('ru-RU')} читателей! Рекламный доход вырос до $${(state.blogAdRevenue + adRevenueDelta).toLocaleString('ru-RU')}/мес.`,
          starred: false,
          category: 'urbex',
        },
        ...state.chronicle,
      ],
    },
    summaryText,
  };
}

// =================== STRESS & BURNOUT ===================

export function addStress(state: PlayerState, amount: number): PlayerState {
  const newStress = clampStat((state.stress || 0) + amount);
  if (newStress >= 85 && (state.stress || 0) < 85) {
    return {
      ...state,
      stress: newStress,
      health: clampStat(state.health - 18),
      happiness: clampStat(state.happiness - 22),
      chronicle: [
        {
          id: `burnout_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `😵 [СИНДРОМ ВЫГОРАНИЯ!] Перегрузка на работе и учёбе истощила силы! Здоровье (-18) и Счастье (-22) резко упали. Вам срочно требуется отдых или поездка на курорт!`,
          starred: true,
          category: 'life',
        },
        ...state.chronicle,
      ],
    };
  }
  return { ...state, stress: newStress };
}

// =================== TAX SCRUTINY & MONEY LAUNDERING ===================

export function launderMoney(
  state: PlayerState,
  amount: number
): { nextState: PlayerState; summaryText: string } {
  if (state.ownedBusinesses.length === 0) {
    return { nextState: state, summaryText: 'Для легализации теневого капитала необходим действующий бизнес или франшиза!' };
  }
  const availableShadow = state.shadowIncome || 0;
  if (availableShadow <= 0) {
    return { nextState: state, summaryText: 'У вас нет теневых средств для отмывания.' };
  }
  const toLaunder = Math.min(amount, availableShadow);
  const taxCommission = Math.round(toLaunder * 0.18); // 18% laundering commission
  if (state.money < taxCommission) {
    return { nextState: state, summaryText: `Недостаточно средств для оплаты комиссии за легализацию (${formatMoney(taxCommission, state.currency)})!` };
  }
  const cleanProfit = toLaunder - taxCommission;

  const nextState: PlayerState = {
    ...state,
    shadowIncome: availableShadow - toLaunder,
    taxScrutiny: Math.max(0, (state.taxScrutiny || 0) - 25),
    money: state.money - taxCommission,
    chronicle: [
      {
        id: `launder_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🏦 [Легализация капитала] Через бизнес-счета легализовано ${formatMoney(cleanProfit, state.currency)} теневых средств (удержана комиссия 18%: -${formatMoney(taxCommission, state.currency)}). Внимание налоговой службы спало!`,
        starred: true,
        category: 'business',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    summaryText: `Легализовано ${formatMoney(cleanProfit, state.currency)} (комиссия -${formatMoney(taxCommission, state.currency)}). Внимание налоговой снизилось на 25%.`,
  };
}

// =================== VACATION & RESORT RELIEF ===================

export function takeVacation(
  state: PlayerState,
  targetResortCity: CityOption
): { nextState: PlayerState; summaryText: string } {
  const cost = 1200;
  if (state.money < cost) {
    return { nextState: state, summaryText: 'Недостаточно средств для поездки в отпуск ($1 200)!' };
  }

  const nextState: PlayerState = {
    ...state,
    money: state.money - cost,
    stress: Math.max(0, (state.stress || 0) - 45),
    health: clampStat(state.health + 12),
    happiness: clampStat(state.happiness + 20),
    chronicle: [
      {
        id: `vacation_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🏖️ [Отпуск на курорте] Вы провели незабываемое время в ${targetResortCity.name} (${targetResortCity.country})! Стресс снят, организм полон свежих сил.`,
        starred: true,
        category: 'life',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    summaryText: `Отпуск в ${targetResortCity.name} удался! Стресс снижен на 45 единиц, +Счастье и +Здоровье.`,
  };
}

// =================== SAVE NORMALIZATION & MIGRATION ===================

export function normalizeLoadedPlayerState(raw: PlayerState): PlayerState {
  const fallback = createInitialPlayerState(
    raw?.city || CITIES_CATALOG[0],
    raw?.appearance || CHARACTER_APPEARANCES[0],
    raw?.name || CITIES_CATALOG[0].defaultNames[0],
    raw?.birthYear || 2008,
    raw?.birthMonth || 5,
    raw?.birthDay || 15
  );

  const age = typeof raw?.age === 'number' && !Number.isNaN(raw.age) ? Math.max(0, raw.age) : 0;
  const infantFocuses: LifeFocus[] = ['Раннее развитие', 'Активный малыш', 'Любимчик семьи'];
  let focus: LifeFocus = raw?.focus || (age <= 5 ? 'Раннее развитие' : 'Учёба');
  if (age <= 5 && !infantFocuses.includes(focus)) {
    focus = 'Раннее развитие';
  } else if (age >= 6 && infantFocuses.includes(focus)) {
    focus = 'Учёба';
  }

  const merged: PlayerState = {
    ...fallback,
    ...raw,
    age,
    focus,
    skills: {
      ...fallback.skills,
      ...(raw?.skills || {}),
    },
    habits: {
      ...fallback.habits,
      ...(raw?.habits || {}),
    },
    careerStats: {
      ...fallback.careerStats,
      ...(raw?.careerStats || {}),
    },
    aiMemory: {
      ...fallback.aiMemory,
      ...(raw?.aiMemory || {}),
      entries: Array.isArray(raw?.aiMemory?.entries)
        ? raw.aiMemory.entries.filter(
            (e) =>
              e &&
              typeof e.actionTaken === 'string' &&
              typeof e.consequenceSummary === 'string'
          )
        : fallback.aiMemory.entries,
    },
    languages: {
      ...fallback.languages,
      ...(raw?.languages || {}),
    },
    stress: typeof raw?.stress === 'number' ? clampStat(raw.stress) : 0,
    shadowIncome: typeof raw?.shadowIncome === 'number' ? Math.max(0, raw.shadowIncome) : 0,
    taxScrutiny: typeof raw?.taxScrutiny === 'number' ? clampStat(raw.taxScrutiny) : 0,
    pocketMoneyPerMonth:
      typeof raw?.pocketMoneyPerMonth === 'number' ? Math.max(0, raw.pocketMoneyPerMonth) : 0,
    petRequestCooldown:
      typeof raw?.petRequestCooldown === 'number' ? Math.max(0, raw.petRequestCooldown) : 0,
    blogPostsCount: typeof raw?.blogPostsCount === 'number' ? Math.max(0, raw.blogPostsCount) : 0,
    blogAdRevenue: typeof raw?.blogAdRevenue === 'number' ? Math.max(0, raw.blogAdRevenue) : 0,
    outfitStyle: raw?.outfitStyle || 'casual',
    hairstyleId: raw?.hairstyleId || raw?.appearance?.hairStyle || 'short',
    facialHairId: raw?.facialHairId || 'none',
    hasMask: false, // tactical mask free-toggle removed
    ownedWardrobeIds: Array.isArray(raw?.ownedWardrobeIds) ? raw.ownedWardrobeIds : [],
    equippedSuitId:
      raw?.equippedSuitId && Array.isArray(raw?.ownedWardrobeIds) && raw.ownedWardrobeIds.includes(raw.equippedSuitId)
        ? raw.equippedSuitId
        : null,
    equippedAccessoryId:
      raw?.equippedAccessoryId && Array.isArray(raw?.ownedWardrobeIds) && raw.ownedWardrobeIds.includes(raw.equippedAccessoryId)
        ? raw.equippedAccessoryId
        : null,
    equippedWatchId:
      raw?.equippedWatchId && Array.isArray(raw?.ownedWardrobeIds) && raw.ownedWardrobeIds.includes(raw.equippedWatchId)
        ? raw.equippedWatchId
        : null,
    equippedGlassesId:
      raw?.equippedGlassesId && Array.isArray(raw?.ownedWardrobeIds) && raw.ownedWardrobeIds.includes(raw.equippedGlassesId)
        ? raw.equippedGlassesId
        : null,
    militaryServiceActive: Boolean(raw?.militaryServiceActive),
    frontlineActive: Boolean(raw?.frontlineActive),
    activeIllnesses: Array.isArray(raw?.activeIllnesses) ? raw.activeIllnesses : [],
    debtDelinquencyTurns:
      typeof raw?.debtDelinquencyTurns === 'number' ? Math.max(0, raw.debtDelinquencyTurns) : 0,
    offlineAiMode: raw?.offlineAiMode !== undefined ? Boolean(raw.offlineAiMode) : true,
  };

  merged.monthlyExpenses = calculateMonthlyExpenses(merged);
  merged.quests = syncQuestsProgress(merged);
  return merged;
}

// =================== WARDROBE STORE & AUTO-CONTEXT ENGINE ===================

export function resolveCharacterAutoContext(state: PlayerState): {
  contextMode: 'infant' | 'toddler' | 'school' | 'military' | 'adult';
  contextLabel: string;
  outfitCategory: 'infant' | 'toddler' | 'school' | 'military' | 'casual' | 'street' | 'sport' | 'business' | 'luxury';
  suitColor: string;
  tieColor: string;
  handItem: 'none' | 'toy' | 'backpack' | 'rifle' | 'sport_bag' | 'briefcase' | 'dual_cases';
  hasWatch: boolean;
  hasGlasses: boolean;
  hasHelmetAndVest: boolean;
} {
  // Rule 1 (Priority): Automatic Age & Military Context
  if (state.age <= 2) {
    return {
      contextMode: 'infant',
      contextLabel: '0–2 года: Младенец (детский комбинезон, без аксессуаров)',
      outfitCategory: 'infant',
      suitColor: '#7FA6C4',
      tieColor: '#B84A39',
      handItem: 'none',
      hasWatch: false,
      hasGlasses: false,
      hasHelmetAndVest: false,
    };
  }
  if (state.age <= 6) {
    return {
      contextMode: 'toddler',
      contextLabel: '3–6 лет: Дошкольник (футболка и шорты, игрушка в руке)',
      outfitCategory: 'toddler',
      suitColor: '#D98A4E',
      tieColor: '#B84A39',
      handItem: 'toy',
      hasWatch: false,
      hasGlasses: false,
      hasHelmetAndVest: false,
    };
  }
  if (state.age <= 17) {
    return {
      contextMode: 'school',
      contextLabel: '7–17 лет: Школьник (худи/рубашка, школьный рюкзак)',
      outfitCategory: 'school',
      suitColor: '#3B5B76',
      tieColor: '#B84A39',
      handItem: 'backpack',
      hasWatch: false,
      hasGlasses: Boolean(state.equippedGlassesId && state.ownedWardrobeIds?.includes(state.equippedGlassesId)),
      hasHelmetAndVest: false,
    };
  }

  const activeCareer = state.currentCareerId
    ? CAREERS_CATALOG.find((c) => c.id === state.currentCareerId)
    : null;
  const isMilitaryCareer =
    state.militaryServiceActive ||
    (activeCareer &&
      (activeCareer.title.toLowerCase().includes('военн') ||
        activeCareer.title.toLowerCase().includes('офицер') ||
        activeCareer.title.toLowerCase().includes('спецназ') ||
        activeCareer.sector.toLowerCase().includes('армия')));

  if (isMilitaryCareer) {
    return {
      contextMode: 'military',
      contextLabel: 'Служба / На фронте: Военная форма, бронежилет, шлем и автомат в руках',
      outfitCategory: 'military',
      suitColor: '#4B5320',
      tieColor: '#3A4018',
      handItem: 'rifle',
      hasWatch: true,
      hasGlasses: false,
      hasHelmetAndVest: true,
    };
  }

  // Rule 2: Peaceful Adult Life (18+) — ONLY purchased & equipped items from Wardrobe Store!
  const ownedSet = new Set(state.ownedWardrobeIds || []);
  const equippedSuit =
    state.equippedSuitId && ownedSet.has(state.equippedSuitId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedSuitId) || null
      : null;
  const equippedAcc =
    state.equippedAccessoryId && ownedSet.has(state.equippedAccessoryId)
      ? WARDROBE_CATALOG.find((w) => w.id === state.equippedAccessoryId) || null
      : null;
  const hasWatch = Boolean(state.equippedWatchId && ownedSet.has(state.equippedWatchId));
  const hasGlasses = Boolean(state.equippedGlassesId && ownedSet.has(state.equippedGlassesId));

  const outfitCategory = equippedSuit ? equippedSuit.category : 'casual';
  const suitColor = equippedSuit?.suitColor || state.appearance?.shirtColor || '#4A5568';
  const tieColor = equippedSuit?.tieColor || '#B84A39';
  const handItem = equippedAcc?.handItemType || 'none';

  const suitName = equippedSuit ? equippedSuit.name : 'Базовая повседневная одежда';
  const accName = equippedAcc ? ` + ${equippedAcc.name}` : ' (руки свободны)';

  return {
    contextMode: 'adult',
    contextLabel: `Гардероб (18+): ${suitName}${accName}`,
    outfitCategory,
    suitColor,
    tieColor,
    handItem,
    hasWatch,
    hasGlasses,
    hasHelmetAndVest: false,
  };
}

export function buyOrEquipWardrobeItem(
  state: PlayerState,
  item: WardrobeItem
): { nextState: PlayerState; message: string } {
  if (state.age < item.minAge) {
    return {
      nextState: state,
      message: `Этот предмет гардероба доступен с ${item.minAge} лет!`,
    };
  }

  if (state.militaryServiceActive) {
    return {
      nextState: state,
      message: 'Во время военной службы действует уставная форма (бронежилет и автомат). Демобилизуйтесь для смены гражданского гардероба!',
    };
  }

  const ownedIds = state.ownedWardrobeIds || [];
  const isOwned = ownedIds.includes(item.id);

  // If already owned, toggle equip/unequip in its slot
  if (isOwned) {
    const nextState: PlayerState = { ...state };
    if (item.slot === 'suit') {
      const unequip = state.equippedSuitId === item.id;
      nextState.equippedSuitId = unequip ? null : item.id;
      nextState.outfitStyle = unequip ? 'casual' : item.category;
      return {
        nextState,
        message: unequip ? `Снято: «${item.name}»` : `Надето из гардероба: «${item.name}»`,
      };
    }
    if (item.slot === 'hand_accessory') {
      const unequip = state.equippedAccessoryId === item.id;
      nextState.equippedAccessoryId = unequip ? null : item.id;
      return {
        nextState,
        message: unequip ? `Убрано из рук: «${item.name}»` : `Взято в руки: «${item.name}»`,
      };
    }
    if (item.slot === 'watch') {
      const unequip = state.equippedWatchId === item.id;
      nextState.equippedWatchId = unequip ? null : item.id;
      return {
        nextState,
        message: unequip ? `Часы сняты: «${item.name}»` : `Надеты часы: «${item.name}»`,
      };
    }
    if (item.slot === 'glasses') {
      const unequip = state.equippedGlassesId === item.id;
      nextState.equippedGlassesId = unequip ? null : item.id;
      return {
        nextState,
        message: unequip ? `Очки сняты: «${item.name}»` : `Надеты очки: «${item.name}»`,
      };
    }
  }

  // Strict Rule: Cannot equip if not purchased! Must have enough money to buy.
  if (state.money < item.price) {
    return {
      nextState: state,
      message: `Недостаточно средств для покупки «${item.name}» (${formatMoney(item.price, state.currency)})! Некупленные вещи нельзя надеть.`,
    };
  }

  const nextOwned = [...ownedIds, item.id];
  const nextState: PlayerState = {
    ...state,
    money: state.money - item.price,
    ownedWardrobeIds: nextOwned,
    equippedSuitId: item.slot === 'suit' ? item.id : state.equippedSuitId,
    equippedAccessoryId: item.slot === 'hand_accessory' ? item.id : state.equippedAccessoryId,
    equippedWatchId: item.slot === 'watch' ? item.id : state.equippedWatchId,
    equippedGlassesId: item.slot === 'glasses' ? item.id : state.equippedGlassesId,
    outfitStyle: item.slot === 'suit' ? item.category : state.outfitStyle,
    skills: {
      ...state.skills,
      charisma: clampStat(state.skills.charisma + item.charismaBonus),
      finance: clampStat(state.skills.finance + item.financeBonus),
      strength: clampStat(state.skills.strength + item.strengthBonus),
    },
    happiness: clampStat(state.happiness + 4),
    chronicle: [
      {
        id: `wardrobe_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `👔 [Гардероб и Аксессуары] Вы приобрели и надели «${item.name}» за ${formatMoney(item.price, state.currency)} (${item.bonusLabel}).`,
        starred: true,
        category: 'finance',
      },
      ...state.chronicle,
    ],
  };

  nextState.quests = syncQuestsProgress(nextState);
  return {
    nextState,
    message: `Куплено и надето: «${item.name}» (${item.bonusLabel})!`,
  };
}

export function toggleMilitaryService(state: PlayerState): {
  nextState: PlayerState;
  message: string;
} {
  if (state.age < 18) {
    return {
      nextState: state,
      message: 'Срочная служба и военный контракт доступны только с 18 лет!',
    };
  }
  const nextActive = !state.militaryServiceActive;
  const nextState: PlayerState = {
    ...state,
    militaryServiceActive: nextActive,
    frontlineActive: nextActive ? Boolean(state.frontlineActive) : false,
    skills: nextActive
      ? {
          ...state.skills,
          strength: clampStat(state.skills.strength + 5),
          fitness: clampStat(state.skills.fitness + 5),
        }
      : state.skills,
    chronicle: [
      {
        id: `mil_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: nextActive
          ? `🪖 [Военная служба] Вы поступили на службу (база / учебная часть). Выдана уставная форма оливкового цвета, бронежилет, шлем и табельный автомат.`
          : `🎖️ [Демобилизация] Вы завершили службу и вернулись к мирной гражданской жизни и своему гардеробу.`,
        starred: true,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    message: nextActive
      ? 'Вы на военной службе: автоматически экипированы форма, бронежилет и автомат!'
      : 'Вы демобилизовались и вернулись к гражданскому гардеробу.',
  };
}

export function toggleFrontlineDeployment(state: PlayerState): {
  nextState: PlayerState;
  message: string;
} {
  if (state.age < 18) {
    return {
      nextState: state,
      message: 'Отправка на передовую доступна только с 18 лет!',
    };
  }
  const nextFrontline = !state.frontlineActive;
  const nextState: PlayerState = {
    ...state,
    militaryServiceActive: true,
    frontlineActive: nextFrontline,
    chronicle: [
      {
        id: `frontline_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: nextFrontline
          ? `💥 [ПЕРЕДОВАЯ / БЛИНДАЖ] Ваше подразделение переброшено на первую линию! Боевые выплаты повышены до $2 400/мес, работают фронтовые сценарии.`
          : `⛺ [Ротация на базу] Ваше подразделение выведено из блиндажей в расположение военной базы на переформирование.`,
        starred: true,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    message: nextFrontline
      ? 'Вы на передовой (блиндаж и окопы): боевые выплаты и фронтовые события активны!'
      : 'Ротация на военную базу (казарма и плац).',
  };
}

/**
 * Medical Clinic Treatment (Private Clinic vs Free Public Hospital)
 * Health does not regenerate passively — players must treat illnesses & injuries here!
 */
export function treatIllnessOrInjury(
  state: PlayerState,
  mode: 'private_clinic' | 'public_hospital'
): { nextState: PlayerState; message: string } {
  const illnesses = Array.isArray(state.activeIllnesses) ? state.activeIllnesses : [];
  if (state.health >= 98 && illnesses.length === 0 && !state.hasInjury) {
    return {
      nextState: state,
      message: 'Вы полностью здоровы и не нуждаетесь в госпитализации!',
    };
  }

  if (mode === 'private_clinic') {
    const cost = Math.max(450, Math.round(950 * state.city.economyMultiplier));
    if (state.money < cost) {
      return {
        nextState: state,
        message: `Недостаточно средств для частной клиники (${formatMoney(cost, state.currency)})! Доступна бесплатная госбольница.`,
      };
    }

    const nextState: PlayerState = {
      ...state,
      money: state.money - cost,
      health: clampStat(state.health + 30),
      stress: clampStat((state.stress || 0) - 22),
      hasInjury: false,
      injuryTurnsLeft: 0,
      activeIllnesses: [],
      chronicle: [
        {
          id: `clinic_priv_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `🏥 [Частная клиника — ${formatMoney(cost, state.currency)}] Пройдена комплексная терапия и реабилитация! Все травмы и болезни полностью вылечены (+30 Здоровье, -22 Стресс).`,
          starred: true,
          category: 'life',
        },
        ...state.chronicle,
      ],
    };
    return {
      nextState,
      message: `Частная клиника: полное исцеление всех недугов (+30 Здоровье, -22 Стресс)!`,
    };
  }

  // Free Public Hospital (Бесплатная медицина: долго и с 30% риском осложнений)
  const roll = Math.abs(state.age * 19 + state.dayOfMonth * 7 + state.chronicle.length * 13) % 100;
  const hasComplication = roll < 30;

  if (hasComplication) {
    const nextIllnesses = illnesses.includes('Врачебное осложнение после госбольницы')
      ? illnesses
      : [...illnesses, 'Врачебное осложнение после госбольницы'];
    const nextState: PlayerState = {
      ...state,
      health: clampStat(state.health - 5),
      stress: clampStat((state.stress || 0) + 12),
      activeIllnesses: nextIllnesses,
      chronicle: [
        {
          id: `clinic_pub_fail_${Date.now()}`,
          age: state.age,
          year: state.currentYear,
          season: state.season,
          weather: state.weather,
          text: `🚑 [Бесплатная госбольница] Очереди в коридоре и халатность привели к осложнению (-5 Здоровье, +12 Стресс)! Рекомендуется частная клиника.`,
          starred: true,
          category: 'life',
        },
        ...state.chronicle,
      ],
    };
    return {
      nextState,
      message: 'Осложнение в бесплатной больнице (-5 Здоровье, +12 Стресс)!',
    };
  }

  const remainingIllnesses = illnesses.slice(1);
  const nextState: PlayerState = {
    ...state,
    health: clampStat(state.health + 12),
    stress: clampStat((state.stress || 0) + 4),
    hasInjury: remainingIllnesses.length > 0,
    injuryTurnsLeft: remainingIllnesses.length > 0 ? 1 : 0,
    activeIllnesses: remainingIllnesses,
    chronicle: [
      {
        id: `clinic_pub_ok_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🩺 [Бесплатная поликлиника] После долгой очереди врачи оказали базовую помощь (+12 Здоровье).`,
        starred: false,
        category: 'life',
      },
      ...state.chronicle,
    ],
  };
  return {
    nextState,
    message: 'Бесплатная поликлиника: +12 Здоровье (снят 1 острый недуг).',
  };
}

/**
 * Block 3: Dynamic Contextual Background Location Resolver
 */
export function resolveCharacterLocationScene(state: PlayerState): {
  locationId: BackgroundLocationId;
  locationTitle: string;
  locationSubtitle: string;
} {
  const activeCareer = state.currentCareerId
    ? CAREERS_CATALOG.find((c) => c.id === state.currentCareerId) || null
    : null;

  // 1. Frontline Dugout / Trench
  if (state.militaryServiceActive && state.frontlineActive) {
    return {
      locationId: 'frontline_dugout',
      locationTitle: '🪖 Передовая / Укреплённый блиндаж',
      locationSubtitle: 'Брёвна в 3 наката, масксеть, ящики БК и полевая рация',
    };
  }

  // 2. Military Base / Barracks
  if (
    state.militaryServiceActive ||
    (activeCareer &&
      (activeCareer.title.toLowerCase().includes('военн') ||
        activeCareer.title.toLowerCase().includes('офицер') ||
        activeCareer.title.toLowerCase().includes('спецназ')))
  ) {
    return {
      locationId: 'military_base',
      locationTitle: '🪖 Военная база / Казарма и плац',
      locationSubtitle: 'Армейские палатки, периметр с вышкой и военный грузовик',
    };
  }

  // 3. Childhood & Teen Bedroom in Parents' Home (0–17 years)
  if (state.age <= 17) {
    return {
      locationId: 'parents_room',
      locationTitle: '🏠 Дом родителей / Детская спальня',
      locationSubtitle: `Окно с видом на сезон (${state.season}), шкаф и уютная кровать`,
    };
  }

  // 4. CEO Office / Business Center (Business owners, executives, politicians, or luxury real estate)
  if (
    state.ownedBusinesses.length > 0 ||
    state.politicalPositionId ||
    state.focus === 'Бизнес и Политика' ||
    (activeCareer && activeCareer.category === 'finance_exec')
  ) {
    return {
      locationId: 'ceo_office',
      locationTitle: '🏢 Бизнес-центр / Кабинет CEO',
      locationSubtitle: 'Панорамное окно на мегаполис, кожаное кресло и графики роста',
    };
  }

  // 5. IT Office / Home Blogger Studio
  if (
    state.focus === 'Медиа и Музыка' ||
    state.focus === 'Уберэкс' ||
    state.urbexSubscribers >= 800 ||
    (state.blogPostsCount || 0) >= 2 ||
    Boolean(state.customPcBuild.cpu || state.customPcBuild.gpu) ||
    (activeCareer &&
      (activeCareer.category === 'tech_engineering' || activeCareer.category === 'creative_media'))
  ) {
    return {
      locationId: 'it_blogger_studio',
      locationTitle: '💻 IT-офис / Студия блогера',
      locationSubtitle: 'Широкий стол, 3 монитора с кодом/графиками, микрофон и софтбокс',
    };
  }

  // 6. Default Adult / Student Dorm / Rented Room
  return {
    locationId: 'student_dorm',
    locationTitle: '🛏️ Студенческая общага / Съёмная комната',
    locationSubtitle: 'Кровать, стол с горой конспектов, ноутбук и коробка лапши',
  };
}

/**
 * ============================================================================
 * 1. HARDCORE STAT PROGRESSION (DIMINISHING RETURNS) & PEAK STAT DECAY (85-100)
 * ============================================================================
 * - Level 0–35: grants +1.5..+2.0 (1.8) and 1.0x Energy cost
 * - Level 35–65: grants +0.7..+1.0 (0.85) and +30% Energy cost (1.3x)
 * - Level 65–85: grants +0.2..+0.4 (0.3) if player has supplements/tutor/gear, else +0.1
 * - Level 85–100: peak form, grants +0.1, and decays -1/month without active maintenance
 */
export function calculateDiminishingStatGain(
  currentLevel: number,
  hasBoostEquipOrSupplement: boolean
): {
  statGain: number;
  energyCostMultiplier: number;
  tierLabel: string;
  requiresGearWarning: boolean;
} {
  if (currentLevel < 35) {
    return {
      statGain: 1.8,
      energyCostMultiplier: 1.0,
      tierLabel: 'База (0–35): быстрый прогресс (+1.8)',
      requiresGearWarning: false,
    };
  }
  if (currentLevel < 65) {
    return {
      statGain: 0.85,
      energyCostMultiplier: 1.3,
      tierLabel: 'Средний уровень (35–65): замедление (+0.85, +30% расход сил)',
      requiresGearWarning: false,
    };
  }
  if (currentLevel < 85) {
    if (!hasBoostEquipOrSupplement) {
      return {
        statGain: 0.1,
        energyCostMultiplier: 1.45,
        tierLabel: 'Профи (65–85): плато без спортпита/репетитора/оборудования (+0.1)',
        requiresGearWarning: true,
      };
    }
    return {
      statGain: 0.3,
      energyCostMultiplier: 1.4,
      tierLabel: 'Профи (65–85): спецподготовка со снаряжением (+0.3)',
      requiresGearWarning: false,
    };
  }
  return {
    statGain: 0.1,
    energyCostMultiplier: 1.5,
    tierLabel: 'Пик формы (85–100): предел генетики (+0.1, без поддержки -1/мес)',
    requiresGearWarning: false,
  };
}

export function executeScaledStatTraining(
  state: PlayerState,
  skillKey: keyof PlayerState['skills'],
  actionLabel: string
): {
  nextState: PlayerState;
  gained: number;
  energyCost: number;
  tierLabel: string;
  message: string;
} {
  const currentVal = state.skills[skillKey] || 0;
  const hasBoost = Boolean(
    state.steroidCyclesUsed > 0 ||
      state.activeHobbyIds.length > 0 ||
      state.ownedWardrobeIds.length > 1 ||
      state.activeLaptopId ||
      state.customPcBuild.cpu
  );

  const calc = calculateDiminishingStatGain(currentVal, hasBoost);
  const baseEnergyCost = 10;
  const energyCost = Math.round(baseEnergyCost * calc.energyCostMultiplier);
  const currentEnergy = Math.max(0, 100 - (state.stress || 0));

  if (currentEnergy < energyCost) {
    return {
      nextState: state,
      gained: 0,
      energyCost,
      tierLabel: calc.tierLabel,
      message: `⚡ Недостаточно Бодрости (${currentEnergy}% < ${energyCost}%)! Снизьте стресс или отдохните.`,
    };
  }

  const nextVal = Math.min(100, Number((currentVal + calc.statGain).toFixed(1)));
  const nextSkills = {
    ...state.skills,
    [skillKey]: nextVal,
  };
  if (skillKey === 'strength') {
    nextSkills.muscleMass = Math.min(100, Number((state.skills.muscleMass + calc.statGain * 0.8).toFixed(1)));
  }

  const nextStress = clampStat((state.stress || 0) + energyCost);
  const warnText = calc.requiresGearWarning
    ? ' ⚠️ На уровне 65+ без спортпита/репетитора/оборудования прогресс почти остановился!'
    : '';

  const nextState: PlayerState = {
    ...state,
    skills: nextSkills,
    stress: nextStress,
    chronicle: [
      {
        id: `train_scale_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🏋️ [${actionLabel}] +${calc.statGain} к навыку (текущий ур. ${nextVal}/100 · расход сил -${energyCost}% Бодрости). ${calc.tierLabel}.${warnText}`,
        starred: false,
        category: 'life',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    gained: calc.statGain,
    energyCost,
    tierLabel: calc.tierLabel,
    message: `${actionLabel}: +${calc.statGain} (ур. ${nextVal}) · -${energyCost}% Бодрости.${warnText}`,
  };
}

export function applyPeakStatDecay(
  state: PlayerState,
  maintainedSkills: Array<keyof PlayerState['skills']> = []
): PlayerState {
  const maintainedSet = new Set(maintainedSkills);
  const nextSkills = { ...state.skills };
  const keys = Object.keys(nextSkills) as Array<keyof PlayerState['skills']>;

  for (const k of keys) {
    if (nextSkills[k] >= 85 && !maintainedSet.has(k)) {
      nextSkills[k] = Math.max(84, Number((nextSkills[k] - 1).toFixed(1)));
    }
  }
  return {
    ...state,
    skills: nextSkills,
  };
}

/**
 * ============================================================================
 * 2. GRADE-DEPENDENT PROFESSION MINI-GAMES (IT, BLOGGING, BUSINESS)
 * ============================================================================
 */
export function resolveGradeProfessionMinigame(
  state: PlayerState,
  domain: 'it' | 'blog' | 'business',
  tierTitle: string,
  won: boolean,
  scoreMultiplier = 1.0
): {
  nextState: PlayerState;
  rewardMoney: number;
  message: string;
} {
  if (!won) {
    const nextState: PlayerState = {
      ...state,
      stress: clampStat((state.stress || 0) + 8),
      careerStats: {
        ...state.careerStats,
        currentCombo: 0,
      },
    };
    return {
      nextState,
      rewardMoney: 0,
      message: `✕ Задача «${tierTitle}» провалена (+8% Стресс). Попробуйте снова!`,
    };
  }

  const baseReward =
    domain === 'it'
      ? state.skills.intellect >= 65
        ? 2400
        : state.skills.intellect >= 38
        ? 1350
        : 650
      : domain === 'blog'
      ? state.urbexSubscribers >= 100000
        ? 3200
        : state.urbexSubscribers >= 10000
        ? 1500
        : 550
      : state.ownedBusinesses.length >= 2
      ? 3500
      : 1250;

  const rewardMoney = Math.round(baseReward * state.city.economyMultiplier * scoreMultiplier);
  const primarySkill: keyof PlayerState['skills'] =
    domain === 'it' ? 'intellect' : domain === 'blog' ? 'creativity' : 'finance';

  const scaled = calculateDiminishingStatGain(state.skills[primarySkill], true);
  const nextSkillVal = Math.min(100, Number((state.skills[primarySkill] + scaled.statGain).toFixed(1)));
  const followersDelta =
    domain === 'blog'
      ? state.urbexSubscribers >= 100000
        ? 4500
        : state.urbexSubscribers >= 10000
        ? 1600
        : 650
      : 0;

  const nextState: PlayerState = {
    ...state,
    money: state.money + rewardMoney,
    urbexSubscribers: state.urbexSubscribers + followersDelta,
    happiness: clampStat(state.happiness + 6),
    skills: {
      ...state.skills,
      [primarySkill]: nextSkillVal,
    },
    careerStats: {
      ...state.careerStats,
      kpiScore: clampStat(state.careerStats.kpiScore + 8),
      miniGamesWon: state.careerStats.miniGamesWon + 1,
      currentCombo: state.careerStats.currentCombo + 1,
    },
    chronicle: [
      {
        id: `grade_mg_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🕹️ [Проф-задача · ${tierTitle}] Блестящее решение! Премия: +${formatMoney(rewardMoney, state.currency)}, KPI +8%, навык +${scaled.statGain}${followersDelta > 0 ? `, +${followersDelta} подписчиков` : ''}.`,
        starred: true,
        category: 'career',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    rewardMoney,
    message: `✓ «${tierTitle}» выполнена! +${formatMoney(rewardMoney, state.currency)}, KPI +8%${followersDelta > 0 ? `, +${followersDelta} сабов` : ''}!`,
  };
}

/**
 * ============================================================================
 * 3. PROACTIVE MULTI-STEP INCOMING NPC MESSENGER CHATS (NPCs WRITE FIRST!)
 * ============================================================================
 */
export const PROACTIVE_NPC_CHAT_CATALOG: ProactiveNpcChatThread[] = [
  {
    id: 'npc_chat_mom_food',
    minAge: 0,
    maxAge: 65,
    senderName: 'Мама ❤️',
    senderRole: 'Родные • Голосовое и чат',
    avatar: '👩',
    openingMessage:
      'Сынок, привет! Ты хоть поел нормально сегодня или опять на бутербродах и энергетиках всухомятку? Как там учёба и дела вообще?',
    branches: [
      {
        playerReply: '«Мам, всё супер, только что пообедал горячим! Как вы с папой?»',
        npcFollowUp:
          'Ой, ну слава богу! Мы с отцом нормально, я тут пирожков напекла и скинула тебе немного на карту, купи себе нормальных фруктов ❤️',
        finalChoices: [
          {
            label: 'Поблагодарить маму и пообещать заехать на выходных (+Отношения, +Деньги, -Стресс)',
            outcomeText: 'Мама растрогалась, перевела вам деньги на карту, а на душе стало тепло и спокойно.',
            moneyDelta: 180,
            relationsDelta: 8,
            happinessDelta: 7,
            stressDelta: -8,
          },
          {
            label: 'Быстро ответить «Спасибо, мамуль, бегу по делам!» (+Деньги)',
            outcomeText: 'Вы поблагодарили маму и побежали дальше решать свои задачи.',
            moneyDelta: 180,
            relationsDelta: 4,
          },
        ],
      },
      {
        playerReply: '«Честно говоря, зашиваюсь по полной, вообще не до еды сейчас...»',
        npcFollowUp:
          'Так, ну-ка не вздумай мне там гробить желудок! Никакие дедлайны и экзамены не стоят здоровья. Сейчас же сходи нормально поешь!',
        finalChoices: [
          {
            label: 'Послушаться маму и взять горячий комплексный обед (+Здоровье, -Стресс)',
            outcomeText: 'Вы отложили дела на полчаса и плотно пообедали — силы и настроение сразу вернулись!',
            healthDelta: 7,
            stressDelta: -10,
            relationsDelta: 6,
          },
          {
            label: 'Отмахнуться: «Ладно-ладно, вечером поем» (+Стресс)',
            outcomeText: 'Вы продолжили работать на голодный желудок, чувствуя растущую усталость.',
            stressDelta: 6,
            relationsDelta: -3,
          },
        ],
      },
    ],
  },
  {
    id: 'npc_chat_friend_gym',
    minAge: 13,
    maxAge: 42,
    senderName: 'Димон (Кент) 🤜🤛',
    senderRole: 'Лучший друг • В сети',
    avatar: '🧔',
    openingMessage:
      'Бро, здарова! Чё киснешь дома? Го сегодня вечером в зал железо потягаем или катнем по ночному городу проветрить голову?',
    branches: [
      {
        playerReply: '«Погнали в зал! Сделаем тяжёлую базу и обсудим дела»',
        npcFollowUp:
          'Красава! Я уже предтрен замешал, через полчаса жду у стойки для жима. Сегодня идём на рекордный рабочий вес! 💪',
        finalChoices: [
          {
            label: 'Выложиться на жиме со страховкой кента (+Сила, +Отношения, +Счастье)',
            outcomeText: 'Вы мощно потренировались с Димоном, взяли новый вес и зарядились бодростью!',
            skillKey: 'strength',
            skillDelta: 2,
            relationsDelta: 8,
            happinessDelta: 7,
          },
          {
            label: 'Сделать лёгкий памп и посидеть в сауне (-Стресс, +Здоровье)',
            outcomeText: 'Отличное восстановление после тяжёлой недели — мышцы в тонусе, голова свежая.',
            healthDelta: 6,
            stressDelta: -12,
            relationsDelta: 6,
          },
        ],
      },
      {
        playerReply: '«Го лучше катнем вечером по центру, возьмём кофе на заправке»',
        npcFollowUp:
          'Базару ноль! Заеду через 15 минут, включим музло и обсудим новые темки по бизнесу и крипте.',
        finalChoices: [
          {
            label: 'Обсудить рабочие темки и кайфануть от ночного города (+Финансы, -Стресс)',
            outcomeText: 'Ночная поездка с другом подарила пару дельных финансовых идей и сняла весь стресс.',
            skillKey: 'finance',
            skillDelta: 2,
            happinessDelta: 8,
            stressDelta: -10,
            relationsDelta: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'npc_chat_partner_attention',
    minAge: 16,
    maxAge: 55,
    senderName: 'Любимая 💕',
    senderRole: 'Отношения • Печатает...',
    avatar: '👱‍♀️',
    openingMessage:
      'Слушай, это уже не смешно... Ты опять весь вечер уткнулся в свой монитор и код! Мы вообще проводим время вдвоём или ты женат на ноутбуке?! 😒',
    branches: [
      {
        playerReply: '«Малыш, прости, реально заработался. Закрываю ноут — го в ресторан или закажем роллы!»',
        npcFollowUp:
          'Вот так бы сразу! 🥺 Ладно, только чур телефон на беззвучный, а то опять твой рабочий чат весь вечер пиликать будет.',
        finalChoices: [
          {
            label: 'Устроить романтический ужин без гаджетов (+Отношения, +Счастье, -Стресс)',
            outcomeText: 'Вы провели тёплый вечер вдвоём, полностью перезагрузившись от суеты.',
            moneyDelta: -120,
            relationsDelta: 11,
            happinessDelta: 10,
            stressDelta: -12,
          },
          {
            label: 'Включить любимый сериал дома под пледом (+Отношения, -Стресс)',
            outcomeText: 'Уютный домашний вечер вернул гармонию в ваши отношения.',
            relationsDelta: 8,
            happinessDelta: 7,
            stressDelta: -8,
          },
        ],
      },
      {
        playerReply: '«Блин, я же ради нашего будущего стараюсь, сейчас горящий дедлайн!»',
        npcFollowUp:
          'Я всё понимаю про деньги и амбиции, но мне нужен живой человек рядом, а не тень за клавиатурой...',
        finalChoices: [
          {
            label: 'Пообещать железно освободить все выходные для неё (+Компромисс)',
            outcomeText: 'Вы нашли компромисс, спокойно доделали задачу и сохранили мир в доме.',
            skillKey: 'charisma',
            skillDelta: 2,
            relationsDelta: 4,
            stressDelta: 4,
          },
          {
            label: 'Дожать проект до утра любой ценой (+Деньги, -Отношения)',
            outcomeText: 'Вы закрыли жирный заказ к утру, но между вами остался холодок.',
            moneyDelta: 450,
            relationsDelta: -8,
            stressDelta: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'npc_chat_boss_friday_prod',
    minAge: 18,
    maxAge: 65,
    senderName: 'Тимлид / Босс 💼',
    senderRole: 'Рабочий чат • СРОЧНО',
    avatar: '👔',
    openingMessage:
      'Привет! Сорри что в пятницу вечером, но тут прод упал после вечернего релиза, транзакции висят 🚨 Глянешь сейчас? Оплачу в двойном размере!',
    branches: [
      {
        playerReply: '«Уже открываю логи! Сейчас локализую баг и выкачу хотфикс за 20 минут»',
        npcFollowUp:
          'Вообще выручаешь! Скинул доступы к кластеру, бухгалтерия проведёт двойной бонус первым же платежом.',
        finalChoices: [
          {
            label: 'Поднять прод и забрать двойную премию (+Деньги, +Интеллект)',
            outcomeText: 'Вы за полчаса подняли упавший сервис и получили щедрую премию от руководства!',
            moneyDelta: 850,
            skillKey: 'intellect',
            skillDelta: 2,
            stressDelta: 8,
          },
          {
            label: 'Потребовать кроме премии ещё и оплачиваемый отгул в понедельник (+Деньги, -Стресс)',
            outcomeText: 'Босс с радостью согласился: вы и заработали, и выбили длинные выходные!',
            moneyDelta: 650,
            skillKey: 'charisma',
            skillDelta: 2,
            stressDelta: -4,
          },
        ],
      },
      {
        playerReply: '«Извини, я сейчас не у компа, смогу посмотреть только утром»',
        npcFollowUp:
          'Понял... Придётся будить дежурного девопса. Ладно, в понедельник на созвоне обсудим.',
        finalChoices: [
          {
            label: 'Спокойно отдыхать в свой законный вечер (-Стресс, +Счастье)',
            outcomeText: 'Вы отстояли личные границы и отлично выспались без ночных авралов.',
            stressDelta: -10,
            happinessDelta: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'npc_chat_classmate_exam',
    minAge: 11,
    maxAge: 23,
    senderName: 'Макс (Одногруппник) 🎓',
    senderRole: 'Чат потока • В сети',
    avatar: '🧑‍🎓',
    openingMessage:
      'Йоу! У меня инсайд — слили билеты на завтрашнюю контрольную/зачёт, но там половина задач с подвохом. Залетай в дискорд, прорешаем вместе?',
    branches: [
      {
        playerReply: '«Залетаю в голосовой! Сейчас разберём самые сложные билеты»',
        npcFollowUp:
          'Лучший! Я уже создал комнату и закинул фотки билетов. Если сейчас всё раскидаем — высший балл у нас в кармане!',
        finalChoices: [
          {
            label: 'Разобрать все билеты до идеала (+Интеллект, +Отношения)',
            outcomeText: 'Вы за пару часов разобрали все задачи и блестяще подготовились к сдаче!',
            skillKey: 'intellect',
            skillDelta: 2,
            relationsDelta: 6,
            happinessDelta: 5,
          },
        ],
      },
      {
        playerReply: '«Да ну, я лучше высплюсь и на месте вывезу на импровизации»',
        npcFollowUp:
          'Ну ты рисковый чел конечно 😂 Ладно, ни пуха ни пера нам завтра с утра!',
        finalChoices: [
          {
            label: 'Выспаться и сдать за счёт подвешенного языка (+Харизма, -Стресс)',
            outcomeText: 'Вы отлично выспались и уверенно ответили на дополнительные вопросы преподавателя!',
            skillKey: 'charisma',
            skillDelta: 2,
            stressDelta: -8,
            happinessDelta: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'npc_chat_commissar_summons',
    minAge: 18,
    maxAge: 50,
    senderName: 'Военный комиссариат 🪖',
    senderRole: 'Официальное оповещение • Реестр',
    avatar: '🪖',
    openingMessage:
      'Уведомление: вам необходимо обновить военно-учётные данные и подтвердить актуальный статус (учёба / бронь / служба по контракту) в течение 7 дней.',
    branches: [
      {
        playerReply: '«Отправить электронную выписку об учёбе / работе через кабинет»',
        npcFollowUp:
          'Документы успешно верифицированы в электронном реестре. Ваш учётный статус обновлён без замечаний.',
        finalChoices: [
          {
            label: 'Сохранить выписку со штампом (+Спокойствие, -Стресс)',
            outcomeText: 'Вы вовремя обновили документы в реестре и избавились от лишней бюрократии.',
            stressDelta: -8,
            happinessDelta: 4,
          },
        ],
      },
      {
        playerReply: '«Поинтересоваться условиями контракта в профильном подразделении (связь / БПЛА)»',
        npcFollowUp:
          'Для специалистов с техническими навыками действуют повышенные подъёмные выплаты и приоритетное распределение.',
        finalChoices: [
          {
            label: 'Пройти сборы резервистов с выплатой (+Деньги, +Сила)',
            outcomeText: 'Вы прошли интенсивные тактические сборы, укрепили форму и получили выплату.',
            moneyDelta: 950,
            skillKey: 'strength',
            skillDelta: 2,
            stressDelta: 6,
          },
        ],
      },
    ],
  },
];

export function pickProactiveNpcChat(state: PlayerState): ProactiveNpcChatThread {
  const used = new Set(state.usedEventIds || []);
  const eligible = PROACTIVE_NPC_CHAT_CATALOG.filter(
    (t) => state.age >= t.minAge && state.age <= t.maxAge
  );
  const pool = eligible.length > 0 ? eligible : PROACTIVE_NPC_CHAT_CATALOG;
  const fresh = pool.filter((t) => !used.has(t.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const seed = Math.abs(
    state.age * 19 + state.currentYear * 11 + state.monthOfYear * 7 + state.chronicle.length * 5
  );
  return candidates[seed % candidates.length];
}

export function resolveProactiveNpcChatFinal(
  state: PlayerState,
  threadId: string,
  branchIndex: number,
  finalChoiceIndex: number
): {
  nextState: PlayerState;
  message: string;
} {
  const thread =
    PROACTIVE_NPC_CHAT_CATALOG.find((t) => t.id === threadId) || PROACTIVE_NPC_CHAT_CATALOG[0];
  const branch = thread.branches[branchIndex] || thread.branches[0];
  const choice = branch.finalChoices[finalChoiceIndex] || branch.finalChoices[0];

  const nextSkills = { ...state.skills };
  if (choice.skillKey && choice.skillDelta) {
    const scaled = calculateDiminishingStatGain(nextSkills[choice.skillKey], true);
    nextSkills[choice.skillKey] = Math.min(
      100,
      Number((nextSkills[choice.skillKey] + scaled.statGain).toFixed(1))
    );
  }

  const nextState: PlayerState = {
    ...state,
    money: state.money + Math.round((choice.moneyDelta || 0) * state.city.economyMultiplier),
    health: clampStat(state.health + (choice.healthDelta || 0)),
    happiness: clampStat(state.happiness + (choice.happinessDelta || 0)),
    relations: clampStat(state.relations + (choice.relationsDelta || 0)),
    stress: clampStat((state.stress || 0) + (choice.stressDelta || 0)),
    skills: nextSkills,
    activeIncomingNpcChat: null,
    aiMemory: appendAiMemory(state, `Чат с ${thread.senderName}: ${branch.playerReply}`, choice.outcomeText, 'social'),
    chronicle: [
      {
        id: `npc_proactive_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `📲 [Входящий чат · ${thread.senderName}] ${choice.outcomeText}`,
        starred: false,
        category: 'family',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    message: `📲 ${thread.senderName}: ${choice.outcomeText}`,
  };
}





