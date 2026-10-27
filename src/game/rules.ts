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
} from './types';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  PETS_CATALOG,
  HOUSES_CATALOG,
  BRANDS_CATALOG,
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
}) {
  const house = HOUSES_CATALOG.find((h) => h.id === state.activeHouseId) || HOUSES_CATALOG[0];
  const vehicle = VEHICLES_CATALOG.find((v) => v.id === state.activeVehicleId) || null;
  const spendMult =
    state.spendingMode === 'Экономный' ? 0.65 : state.spendingMode === 'Баланс' ? 1.0 : 1.75;

  const isAdult = state.age >= 18;
  const food = isAdult
    ? Math.round(state.city.monthlyFoodBase * spendMult)
    : Math.round(state.city.monthlyFoodBase * 0.25 * spendMult);

  const hasSmartHome = state.installedHouseTuningIds.includes('tune_home_smart');
  const rawUtilities =
    isAdult || house.id !== 'parents_home'
      ? Math.round(state.city.monthlyUtilitiesBase * house.floors * (hasSmartHome ? 0.6 : 1.0))
      : 0;

  const rentOrUpkeep =
    house.id === 'parents_home'
      ? isAdult
        ? Math.round(state.city.monthlyRentBase * 0.6)
        : 0
      : Math.round(house.upkeepAnnual / 12);

  const transport = vehicle ? vehicle.monthlyUpkeep : isAdult ? 45 : 15;

  const hobbiesCost = state.activeHobbyIds.reduce((sum, id) => {
    const h = HOBBIES_80.find((item) => item.id === id);
    return sum + (h ? h.monthlyCost : 0);
  }, 0);

  const faction = FACTIONS_26.find((f) => f.id === state.activeFactionId);
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

    focus: startingAge === 0 ? 'Раннее развитие' : 'Учёба',
    spendingMode: 'Баланс',
    money: 1500,
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
    activeHobbyIds: ['hobby_1'],
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
    urbexSubscribers: 140,
    urbexVideosCount: 2,
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

    activeSmartphoneId: 'phone_redmi_note13',
    activeLaptopId: null,
    ownedTechGadgetIds: ['phone_redmi_note13'],
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
    brandCharismaBonus,
    brandStylePoints,
    tuningPrestige,
    vehicleTotalHp,
    homeMuscleBonus,
    rentalAnnualIncome,
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

// Universal turn advancement supporting Day, Week, Month, or Year!
export function advanceTurnByStep(state: PlayerState, stepOverride?: TurnStepMode): PlayerState {
  if (!state.isAlive) return state;

  const step = stepOverride || state.turnStep;
  const yearFraction =
    step === 'day' ? 1 / 30 / 12 : step === 'week' ? 7 / 30 / 12 : step === 'month' ? 1 / 12 : 1;
  const monthsPassed = step === 'year' ? 12 : step === 'month' ? 1 : step === 'week' ? 0.25 : 1 / 30;

  let nextDay = state.dayOfMonth;
  let nextMonth = state.monthOfYear;
  let yearsIncrement = 0;

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
  } else {
    yearsIncrement = 1;
  }

  if (nextMonth > 12) {
    nextMonth -= 12;
    yearsIncrement += 1;
  }

  const newAge = state.age + yearsIncrement;
  const newYear = state.currentYear + yearsIncrement;

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

  const bonuses = calculateActiveBonuses(state);
  const expenses = calculateMonthlyExpenses(state);
  const bizSummary = calculateMonthlyBusinessSummary(state);

  const scale = Math.max(0.15, yearFraction);
  let healthDelta = Math.round(
    (bonuses.petHealthBonus + (bonuses.house.energyRecoveryBonus > 5 ? 3 : 0) - 1) * scale
  );
  let happinessDelta = Math.round(bonuses.petHappinessBonus * scale);
  let knowledgeDelta = 0;
  let relationsDelta = 0;
  const newSkills = { ...state.skills };
  let followersGain = 0;
  let nextSchoolGrade = state.schoolGradeAvg;
  const nextLanguages = { ...state.languages };

  // Native language natural acquisition during childhood
  const nativeLang = getNativeLanguageForCountry(state.city.countryCode);
  if (yearsIncrement > 0 && newAge >= 3 && (nextLanguages[nativeLang] || 0) < 5) {
    nextLanguages[nativeLang] = Math.min(6, (nextLanguages[nativeLang] || 3) + 1);
  }

  // Bad habits chronic drain
  const totalAddiction = state.habits.smoking + state.habits.alcohol + state.habits.drugs;
  if (totalAddiction > 40) {
    healthDelta -= Math.max(1, Math.round((totalAddiction / 35) * scale));
  }

  // Romance partner bonus
  const activePartner = ROMANCE_PARTNERS_CATALOG.find((p) => p.id === state.activePartnerId);
  let partnerIncome = 0;
  if (activePartner) {
    happinessDelta += Math.max(1, Math.round(activePartner.happinessBonus * 0.4 * scale));
    if (state.isMarried || state.partnerRelationship >= 70) {
      partnerIncome = Math.round(activePartner.wealthBonusPerMonth * monthsPassed);
    }
  }

  if (state.focus === 'Учёба') {
    knowledgeDelta += Math.max(1, Math.round(5 * scale));
    newSkills.intellect = clampStat(newSkills.intellect + Math.max(1, Math.round(4 * scale)));
    if (newAge >= 6 && newAge <= 18) {
      nextSchoolGrade = Number(Math.min(12.0, nextSchoolGrade + 0.25 * scale).toFixed(1));
    }
  } else if (state.focus === 'Спорт и Сила') {
    const gymBoost = state.activeFactionId === 'fac_5' ? 2 : 1;
    newSkills.strength = clampStat(newSkills.strength + Math.max(1, Math.round(6 * scale * gymBoost)));
    newSkills.muscleMass = clampStat(newSkills.muscleMass + Math.max(1, Math.round(6 * scale * gymBoost)));
    newSkills.fitness = clampStat(newSkills.fitness + Math.max(1, Math.round(5 * scale)));
    healthDelta += Math.max(1, Math.round(5 * scale));
  } else if (state.focus === 'Бизнес и Политика') {
    newSkills.finance = clampStat(newSkills.finance + Math.max(1, Math.round(5 * scale)));
    newSkills.charisma = clampStat(newSkills.charisma + Math.max(1, Math.round(5 * scale)));
    relationsDelta += Math.max(1, Math.round(3 * scale));
  } else if (state.focus === 'Медиа и Музыка') {
    newSkills.creativity = clampStat(newSkills.creativity + Math.max(1, Math.round(5 * scale)));
    newSkills.charisma = clampStat(newSkills.charisma + Math.max(1, Math.round(4 * scale)));
    followersGain += Math.round((220 + newSkills.creativity * 14) * bonuses.house.blogGrowthBonus * scale);
  } else if (state.focus === 'Уберэкс') {
    newSkills.urbex = clampStat(newSkills.urbex + Math.max(1, Math.round(5 * scale)));
    newSkills.creativity = clampStat(newSkills.creativity + Math.max(1, Math.round(3 * scale)));
    followersGain += Math.round(
      (180 + newSkills.urbex * 12) * bonuses.petFollowerMultiplier * bonuses.house.blogGrowthBonus * scale
    );
  } else if (state.focus === 'Карьера') {
    newSkills.intellect = clampStat(newSkills.intellect + Math.max(1, Math.round(3 * scale)));
    newSkills.charisma = clampStat(newSkills.charisma + Math.max(1, Math.round(3 * scale)));
    knowledgeDelta += Math.max(1, Math.round(2 * scale));
  } else if (state.focus === 'Инвестиции') {
    newSkills.finance = clampStat(newSkills.finance + Math.max(1, Math.round(5 * scale)));
    knowledgeDelta += Math.max(1, Math.round(3 * scale));
  } else if (state.focus === 'Раннее развитие') {
    knowledgeDelta += Math.max(1, Math.round(4 * scale));
    newSkills.intellect = clampStat(newSkills.intellect + Math.max(1, Math.round(5 * scale)));
    newSkills.charisma = clampStat(newSkills.charisma + Math.max(1, Math.round(3 * scale)));
  } else if (state.focus === 'Активный малыш') {
    healthDelta += Math.max(1, Math.round(6 * scale));
    newSkills.strength = clampStat(newSkills.strength + Math.max(1, Math.round(4 * scale)));
    newSkills.fitness = clampStat(newSkills.fitness + Math.max(1, Math.round(5 * scale)));
  } else if (state.focus === 'Любимчик семьи') {
    happinessDelta += Math.max(1, Math.round(6 * scale));
    relationsDelta += Math.max(1, Math.round(6 * scale));
    newSkills.charisma = clampStat(newSkills.charisma + Math.max(1, Math.round(3 * scale)));
  }

  for (const hId of state.activeHobbyIds) {
    const h = HOBBIES_80.find((item) => item.id === hId);
    if (h) {
      newSkills[h.skillKey] = clampStat(newSkills[h.skillKey] + Math.max(1, Math.round(h.skillGain * scale)));
      if (h.strengthGain > 0) {
        newSkills.strength = clampStat(newSkills.strength + Math.max(1, Math.round(h.strengthGain * scale)));
      }
      if (h.muscleGain > 0) {
        newSkills.muscleMass = clampStat(newSkills.muscleMass + Math.max(1, Math.round(h.muscleGain * scale)));
      }
      happinessDelta += Math.max(1, Math.round(h.happinessGain * scale));
      healthDelta += Math.round(h.healthDelta * scale);
    }
  }

  if (bonuses.homeMuscleBonus > 0) {
    newSkills.muscleMass = clampStat(
      newSkills.muscleMass + Math.max(1, Math.round(bonuses.homeMuscleBonus * scale))
    );
    newSkills.strength = clampStat(
      newSkills.strength + Math.max(1, Math.round(bonuses.homeMuscleBonus * scale))
    );
  }

  const activeFaction = FACTIONS_26.find((f) => f.id === state.activeFactionId);
  let factionIncome = 0;
  let factionNote = '';
  if (activeFaction) {
    if (activeFaction.monthlyBonusOrFee > 0) {
      factionIncome = Math.round(activeFaction.monthlyBonusOrFee * monthsPassed);
    }
    if (activeFaction.riskPercent >= 25 && (newAge + nextMonth) % 3 === 0) {
      healthDelta -= 6;
      factionNote = ` Опасная потасовка в круге «${activeFaction.name}» стоила здоровья (-6).`;
    }
  }

  const activeCareer = CAREERS_CATALOG.find((c) => c.id === state.currentCareerId);
  const kpiBonusMult = 1 + (state.careerStats.kpiScore - 50) / 250;
  const annualCareerSalary = activeCareer
    ? Math.round(activeCareer.annualSalary * state.city.economyMultiplier * kpiBonusMult)
    : newAge < 7
    ? 250
    : newAge < 18
    ? 600
    : 1800;

  const activePolPos = POLITICAL_POSITIONS.find((p) => p.id === state.politicalPositionId);
  const annualPolSalary = activePolPos ? Math.round(activePolPos.annualSalary * state.city.economyMultiplier) : 0;
  const gainedInfluence = activePolPos ? Math.max(1, Math.round(activePolPos.influencePerMonth * monthsPassed)) : 0;

  const periodCareerIncome = Math.round(((annualCareerSalary + annualPolSalary) / 12) * monthsPassed);
  const periodBusinessProfit = Math.round(bizSummary.netMonthlyProfit * monthsPassed);
  const newSubscribers = state.urbexSubscribers + followersGain;
  const periodMediaIncome =
    newAge >= 10
      ? Math.round(((newSubscribers * 0.35 * bonuses.house.blogGrowthBonus) / 12) * monthsPassed)
      : 0;
  const periodDividends = Math.round(
    (calculateAnnualInvestmentYield(state.investments, newSkills.finance) / 12) * monthsPassed
  );
  const periodRental = Math.round((bonuses.rentalAnnualIncome / 12) * monthsPassed);
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
  const periodBlogIncome = Math.round((state.blogAdRevenue || 0) * monthsPassed);

  const netCashflow =
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

  const nextMoney = Math.round(state.money + netCashflow);

  // Stress dynamics
  let stressDelta = 0;
  if (activeCareer) stressDelta += Math.round(3 * scale);
  if (state.focus === 'Учёба' && newAge >= 14) stressDelta += Math.round(2 * scale);
  if (bonuses.house.energyRecoveryBonus > 0) stressDelta -= Math.round(bonuses.house.energyRecoveryBonus * 0.5 * scale);
  if (!activeCareer && newAge >= 18) stressDelta -= Math.round(3 * scale);
  const nextStress = clampStat((state.stress || 0) + stressDelta);

  // Injury recovery
  let nextInjury = state.hasInjury || false;
  let nextInjuryTurns = state.injuryTurnsLeft || 0;
  if (nextInjury && nextInjuryTurns > 0) {
    nextInjuryTurns -= 1;
    if (nextInjuryTurns <= 0) {
      nextInjury = false;
      nextInjuryTurns = 0;
    }
  }

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
  const nextWeightKg = Math.round(
    baseWeight + (newAge >= 12 ? newSkills.muscleMass * 0.38 : newSkills.muscleMass * 0.08)
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

  if (nextMoney < 0) {
    happinessDelta -= 6;
    healthDelta -= 4;
  }

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
    if (newAge === 6) milestoneNote = ` Вы пошли в 1-й класс («${state.secondarySchoolName}»)!`;
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
    text: `[${stepLabel}] Погода: ${weather} (${seasonByMonth}). Итог за ход: ${cashStr} (счета: -${expStr}${bizStr}).${milestoneNote}${factionNote}`,
    starred: Boolean(milestoneNote),
    category: 'life' as const,
  };

  const isBankrupt = nextMoney <= -12000;
  const isAlive = nextHealth > 0 && newAge < 100 && !isBankrupt;
  const causeOfEnd = !isAlive
    ? isBankrupt
      ? 'Полное финансовое банкротство: долги по счетам превысили критический порог (-12 000).'
      : nextHealth <= 0
      ? 'Критический упадок здоровья и перегрузка организма.'
      : 'Долгая и насыщенная жизнь подошла к столетнему рубежу.'
    : undefined;

  const updatedState: PlayerState = {
    ...state,
    age: newAge,
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
    hasInjury: nextInjury,
    injuryTurnsLeft: nextInjuryTurns,
    petRequestCooldown: nextPetCooldown,
    pocketMoneyPerMonth: pocketMoneyMonthly,
  };

  // Check seasonal & holiday events
  let stateWithSeasonal = checkAndGenerateSeasonalEvent(updatedState);

  if (!stateWithSeasonal.activePendingEvent && yearsIncrement > 0 && (newAge % 2 === 0 || newAge === 1 || newAge === 6 || newAge === 15)) {
    stateWithSeasonal.activePendingEvent = generateContextualAiLifeEvent(stateWithSeasonal);
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

// Embedded Anti-Hallucination Persistent AI Event Generator (Remembers Before & After, Age & Era Grounded)
export function generateContextualAiLifeEvent(state: PlayerState): LifeEventTemplate {
  const prevMemory =
    state.aiMemory.entries[0]?.consequenceSummary ||
    `Вы живёте в г. ${state.city.name} (${state.city.country}).`;
  const motherName = state.family[0]?.name || 'Мама';
  const fatherName = state.family[1]?.name || 'Папа';

  // Stage 1: Infancy & Early Childhood (Age 0 - 5)
  if (state.age <= 5) {
    return {
      id: `ai_child_${state.age}_${state.currentYear}`,
      title: `Раннее детство (${state.age} лет · ${state.currentYear} г.): Развитие с родителями`,
      description: `[Память ИИ: ${prevMemory}] В г. ${state.city.name} ваши родители (${motherName} и ${fatherName}) замечают ваш интерес к окружающему миру. Какую игрушку или занятие вы выбираете?`,
      minAge: 0,
      maxAge: 5,
      weatherCondition: 'any',
      seasonCondition: 'any',
      careerCondition: 'any',
      choices: [
        {
          label: 'Собирать конструктор и листать детские книжки (+Знания, +Интеллект)',
          outcomeText: `Вы часами собирали сложные фигуры. Родители в восторге от вашей смышлёности!`,
          nextStoryArc: 'Глава: Любознательный ребёнок',
          knowledgeDelta: 8,
          happinessDelta: 6,
          skillKey: 'intellect',
          skillDelta: 6,
        },
        {
          label: 'Активно бегать во дворе и лазать по детской площадке (+Здоровье, +Атлетизм)',
          outcomeText: `Вы росли невероятно подвижным и крепким ребёнком в г. ${state.city.name}!`,
          nextStoryArc: 'Глава: Неутомимая энергия детства',
          healthDelta: 6,
          happinessDelta: 7,
          skillKey: 'fitness',
          skillDelta: 6,
        },
      ],
    };
  }

  // Stage 2: School Years (Age 6 - 17)
  if (state.age <= 17) {
    if (state.age >= 13 && state.age % 3 === 0) {
      const peerEv =
        PEER_PRESSURE_EVENTS_CATALOG[state.age % PEER_PRESSURE_EVENTS_CATALOG.length];
      if (peerEv) return peerEv;
    }

    return {
      id: `ai_school_${state.age}_${state.currentYear}`,
      title: `Школьная развилка (${state.age} лет · Ср. балл ${state.schoolGradeAvg.toFixed(1)}/12)`,
      description: `[Память ИИ: ${prevMemory}] В школе «${state.secondarySchoolName}» (г. ${state.city.name}, ${state.currentYear} г.) объявлена профильная олимпиада и набор в спортивную сборную.`,
      minAge: 6,
      maxAge: 17,
      weatherCondition: 'any',
      seasonCondition: 'any',
      careerCondition: 'any',
      choices: [
        {
          label: 'Блестяще выступить на олимпиаде (+Школьный балл, +Интеллект, +Грант)',
          outcomeText: `Вы заняли призовое место в г. ${state.city.name}! Учителя повысили ваш годовой балл аттестата.`,
          nextStoryArc: 'Глава: Гордость школы и будущий абитуриент Топ-ВУЗа',
          knowledgeDelta: 10,
          happinessDelta: 6,
          moneyDelta: 250,
          skillKey: 'intellect',
          skillDelta: 8,
        },
        {
          label: 'Выиграть турнир школьной сборной и стать душой компании (+Сила, +Харизма)',
          outcomeText: `Весь класс болел за вас на трибунах! Ваша популярность и физическая форма выросли.`,
          nextStoryArc: 'Глава: Лидер школы и спортплощадки',
          healthDelta: 6,
          happinessDelta: 10,
          relationsDelta: 10,
          skillKey: 'strength',
          skillDelta: 8,
        },
      ],
    };
  }

  // Stage 3: Adult Life (18+) — Grounded in Career, Business, Romance, and Previous Memory
  const allEvents = [...state.customMods, ...PEER_PRESSURE_EVENTS_CATALOG, ...CORE_EVENTS_CATALOG];
  const matchingEvents = allEvents.filter((ev) => {
    const ageOk = state.age >= ev.minAge && state.age <= ev.maxAge;
    const notRepeated = ev.id !== state.aiMemory.lastEventId;
    return ageOk && notRepeated;
  });

  if (matchingEvents.length > 0 && state.age % 4 === 0) {
    return matchingEvents[(state.age + state.currentYear) % matchingEvents.length];
  }

  const careerTitle =
    CAREERS_CATALOG.find((c) => c.id === state.currentCareerId)?.title || 'Свободный специалист';

  return {
    id: `ai_adult_${state.age}_${state.currentYear}`,
    title: `Вызов судьбы в г. ${state.city.name} (${state.currentYear} г. · ${careerTitle})`,
    description: `[Память ИИ до этого: ${prevMemory}] С учётом вашего прошлого выбора и опыта (${careerTitle}) вам поступает закрытое предложение от влиятельных людей г. ${state.city.name}.`,
    minAge: 18,
    maxAge: 100,
    weatherCondition: 'any',
    seasonCondition: 'any',
    careerCondition: 'any',
    choices: [
      {
        label: 'Возглавить легальный инновационный проект (+Доход, +Интеллект, +Репутация)',
        outcomeText: `Вы блестяще применили свои знания в г. ${state.city.name} и заработали солидный гонорар!`,
        nextStoryArc: `Глава: Триумф профессионала в г. ${state.city.name}`,
        happinessDelta: 8,
        knowledgeDelta: 6,
        moneyDelta: Math.round(1800 * state.city.economyMultiplier),
        skillKey: 'finance',
        skillDelta: 8,
      },
      {
        label: 'Рискнуть в жёсткой силовой и медийной игре (+Крупный куш, +Харизма, +Подписчики)',
        outcomeText: `Ваша решительность ошеломила конкурентов! О вас заговорил весь ${state.city.name}.`,
        nextStoryArc: `Глава: Дерзкий игрок г. ${state.city.name}`,
        happinessDelta: 10,
        relationsDelta: 8,
        moneyDelta: Math.round(2400 * state.city.economyMultiplier),
        followersDelta: 850,
        skillKey: 'charisma',
        skillDelta: 8,
      },
    ],
  };
}

export function relocateToCity(state: PlayerState, targetCity: CityOption): PlayerState {
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
    activeHouseId: state.activeHouseId === 'parents_home' ? 'suburb_studio' : state.activeHouseId,
    ownedHouseIds: state.ownedHouseIds.includes('suburb_studio')
      ? state.ownedHouseIds
      : [...state.ownedHouseIds, 'suburb_studio'],
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

  const nextState: PlayerState = {
    ...state,
    health: clampStat(state.health + (choice.healthDelta || 0)),
    happiness: clampStat(state.happiness + (choice.happinessDelta || 0)),
    knowledge: clampStat(state.knowledge + (choice.knowledgeDelta || 0)),
    relations: clampStat(state.relations + (choice.relationsDelta || 0)),
    money: state.money + (choice.moneyDelta || 0),
    urbexSubscribers: Math.max(0, state.urbexSubscribers + (choice.followersDelta || 0)),
    skills: newSkills,
    habits: nextHabits,
    schoolGradeAvg: nextSchoolGrade,
    storyArc: nextStoryArc,
    storyHistory: nextHistory,
    aiMemory: updatedMemory,
    activePendingEvent: null,
    chronicle: [
      {
        id: `ev_${state.age}_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `[Сюжет: ${event.title}] ${choice.outcomeText}${
          choice.nextStoryArc ? ` -> Новая глава: «${choice.nextStoryArc}»` : ''
        }`,
        starred: true,
        category: event.isCustomMod ? 'mod' : 'life',
      },
      ...state.chronicle,
    ],
  };

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

// Language Course Action (Advances CEFR level A1 -> A2 -> B1 -> B2 -> C1 -> C2)
export function takeLanguageCourse(state: PlayerState, course: LanguageCourseItem): PlayerState {
  const currentLvl = state.languages[course.langCode] || 0;
  if (currentLvl >= 6 || state.money < course.price) {
    return state;
  }

  const nextLvl = Math.min(6, Math.max(course.targetLevel, currentLvl + 1));
  const cefr = CEFR_LEVEL_LABELS[nextLvl] || 'B2';

  return {
    ...state,
    money: state.money - course.price,
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
        text: `[Языковые курсы] Вы прошли ступень курса «${course.langName}»! Ваш уровень: ${cefr} (-${formatMoney(course.price, state.currency)}).`,
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
    shadowIncome: won ? (state.shadowIncome || 0) + netDelta : state.shadowIncome,
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

  const cost =
    action === 'start_dating'
      ? 100
      : action === 'romantic_date'
      ? 240
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
      ? `Романтический ужин при свечах с ${partner.name}: любовь и доверие укрепились (${nextRel}/100)!`
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
  const bonuses = calculateActiveBonuses(state);
  const lastMem = state.aiMemory.entries[0]?.actionTaken || state.storyArc;
  const brandMention =
    bonuses.equippedBrands.length > 0
      ? ` Кстати, твой образ (${bonuses.equippedBrands[0].brand}) отлично смотрится!`
      : '';

  const lower = userMessageOrAction.toLowerCase();
  if (lower.includes('уберэкс') || lower.includes('заброш') || lower.includes('рейд') || lower.includes('спорт')) {
    return {
      reply: `Помню твоё недавнее дело («${lastMem}»)! Твоя физическая форма (Сила: ${state.skills.strength}) в ${state.currentYear} году позволяет нам брать любые высоты в г. ${state.city.name}.${brandMention}`,
      moodReaction: 'С уважением жмёт руку',
      relationDelta: 8,
      happinessDelta: 6,
    };
  }
  if (lower.includes('инвест') || lower.includes('деньг') || lower.includes('бизнес') || lower.includes('вуз') || lower.includes('учеб')) {
    return {
      reply: `С твоим школьным баллом (${state.schoolGradeAvg.toFixed(1)}/12) и опытом («${lastMem}») в г. ${state.city.name} открыты лучшие дороги! Следи за ежемесячными счетами (${formatMoney(state.monthlyExpenses.total, state.currency)}/мес).`,
      moodReaction: 'Деловито кивает',
      relationDelta: 6,
      happinessDelta: 4,
    };
  }

  return {
    reply: `Рад тебя слышать, ${state.name}! Я помню всё, через что мы прошли («${lastMem}»). В ${state.currentYear} году в г. ${state.city.name} у нас впереди ещё больше побед!${brandMention}`,
    moodReaction: `Помнит вашу историю (${npc?.name || 'Друг'})`,
    relationDelta: 6,
    happinessDelta: 5,
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
    'casino':           { minAge: 18, reason: 'Казино 777 — строго с 18 лет!' },
    'steroids':         { minAge: 18, reason: 'Стероиды — только с 18 лет!' },
    'nightlife':        { minAge: 18, reason: 'Клуб 18+ — только совершеннолетним' },
    'romance':          { minAge: 12, reason: 'Первая симпатия открывается с 12 лет' },
    'romance_adult':    { minAge: 18, reason: 'Взрослые свидания и брак — с 18 лет' },
    'urbex':            { minAge: 16, reason: 'Экстрим и Уберэкс доступны с 16 лет' },
    'hobby_basic':      { minAge: 6,  reason: 'Хобби и секции доступны с 6 лет' },
    'hobby_extreme':    { minAge: 16, reason: 'Экстремальные хобби доступны с 16 лет' },
    'language_course':  { minAge: 6,  reason: 'Языковые курсы доступны с 6 лет' },
    'tech_gadget':      { minAge: 12, reason: 'Гаджеты и смартфоны с 12 лет' },
    'pc_build':         { minAge: 12, reason: 'Сборка ПК доступна с 12 лет' },
    'pet_request':      { minAge: 4,  reason: 'Попросить питомца можно с 4 до 17 лет' },
    'blog_post':        { minAge: 12, reason: 'Блог и соцсети с 12 лет' },
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
  const taxCommission = Math.round(toLaunder * 0.18); // 18% fee
  const cleanProfit = toLaunder - taxCommission;

  const nextState: PlayerState = {
    ...state,
    shadowIncome: availableShadow - toLaunder,
    taxScrutiny: Math.max(0, (state.taxScrutiny || 0) - 25),
    money: state.money + cleanProfit,
    chronicle: [
      {
        id: `launder_${Date.now()}`,
        age: state.age,
        year: state.currentYear,
        season: state.season,
        weather: state.weather,
        text: `🏦 [Легализация капитала] Через бизнес-счета отмыто $${cleanProfit.toLocaleString('ru-RU')} теневых средств (комиссия $${taxCommission.toLocaleString('ru-RU')}). Внимание налоговой службы спало!`,
        starred: true,
        category: 'business',
      },
      ...state.chronicle,
    ],
  };

  return {
    nextState,
    summaryText: `Легализовано $${cleanProfit.toLocaleString('ru-RU')}. Внимание налоговой инспекции снизилось на 25%.`,
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


