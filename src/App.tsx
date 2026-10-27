import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayerState,
  LifeFocus,
  SpendingMode,
  TurnStepMode,
  CareerTrack,
  UrbexSpot,
  PetItem,
  HouseItem,
  BrandItem,
  LifeEventTemplate,
  EventChoice,
  UniversityProgram,
  HobbyItem,
  SocialFaction,
  VehicleItem,
  TuningUpgrade,
  CityOption,
  FamilyMember,
  RealArtist,
  BusinessFranchiseItem,
  PoliticalPosition,
  PoliticalReform,
  TechGadgetItem,
  PcComponentItem,
  LanguageCourseItem,
  SteroidCycleItem,
  HabitActionItem,
  CrimeActionItem,
  BribeActionItem,
  CasinoGameType,
  NightlifePackageItem,
  RomancePartner,
} from './game/types';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  INITIAL_INVESTMENTS,
} from './game/catalogs';
import { PEER_PRESSURE_EVENTS_CATALOG } from './game/worldData';
import {
  createInitialPlayerState,
  advanceTurnByStep,
  applyEventChoice,
  executeUrbexExpedition,
  calculateActiveBonuses,
  calculateMonthlyExpenses,
  calculateMonthlyBusinessSummary,
  generateOfflineNpcDialogue,
  generateContextualAiLifeEvent,
  syncQuestsProgress,
  clampStat,
  relocateToCity,
  formatMoney,
  executeProfessionSpecialAction,
  resolveProfessionDilemmaChoice,
  resolveProfessionMiniGameResult,
  regenerateLocalColleges,
  buyOrEquipTechGadget,
  installPcComponent,
  buyOrUpgradeBusiness,
  runPoliticalCampaignAction,
  electPoliticalPosition,
  enactPoliticalReform,
  studySchoolExtra,
  takeLanguageCourse,
  enrollInUniversityWithCriteria,
  useSteroidCycle,
  performHabitAction,
  executeCrimeAction,
  executeBribeAction,
  playCasinoGame,
  enjoyNightlifePackage,
  interactRomancePartner,
  askParentsForPet,
  askParentsToPayFor,
  takeVacation,
  launderMoney,
  publishBlogPost,
} from './game/rules';
import { motion, AnimatePresence } from 'motion/react';
import { PixelDioramaCanvas } from './components/PixelDioramaCanvas';
import { TitleScreenModal } from './components/TitleScreenModal';
import { CareerUrbexPanel, CareerPanelSubTab } from './components/CareerUrbexPanel';
import { AssetsBrandStorePanel } from './components/AssetsBrandStorePanel';
import { FriendsAiPanel } from './components/FriendsAiPanel';
import { UnderworldNightlifePanel } from './components/UnderworldNightlifePanel';
import { QuestsModEditorPanel } from './components/QuestsModEditorPanel';
import {
  Pause,
  Star,
  BookOpen,
  Briefcase,
  ShoppingBag,
  Users,
  Sparkles,
  RotateCcw,
  Calendar,
  Dumbbell,
  AlertTriangle,
  GraduationCap,
  Flame,
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Brain,
  Upload,
  Palmtree,
  Lock,
} from 'lucide-react';

declare global {
  interface Window {
    __LIFE_SIM_DEBUG__?: {
      getState: () => PlayerState;
      advanceYear: () => void;
    };
  }
}

type MainTab =
  | 'chronicle'
  | 'education'
  | 'hobbies'
  | 'career'
  | 'family'
  | 'assets'
  | 'underworld'
  | 'quests';

const STORAGE_KEY = 'LIFE_SIM_EX_SAVE_V3';

const SPEED_MULTIPLIERS = [1, 2, 4, 8, 12, 16] as const;

const TURN_STEPS: { id: TurnStepMode; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
];

const ALL_FOCUS_OPTIONS: { value: LifeFocus; label: string; shortHint: string; minAge: number }[] = [
  {
    value: 'Раннее развитие',
    label: 'Раннее развитие (+Интеллект, +Речь)',
    shortHint: '+Интеллект, +Речь',
    minAge: 0,
  },
  {
    value: 'Активный малыш',
    label: 'Активный малыш (+Здоровье, +Сила)',
    shortHint: '+Здоровье, +Сила',
    minAge: 0,
  },
  {
    value: 'Любимчик семьи',
    label: 'Любимчик семьи (+Счастье, +Отношения)',
    shortHint: '+Счастье, +Отношения',
    minAge: 0,
  },
  {
    value: 'Учёба',
    label: 'Учёба (+Знания, +Школьный балл и Интеллект)',
    shortHint: '+Знания, +Аттестат, +Интеллект',
    minAge: 6,
  },
  {
    value: 'Спорт и Сила',
    label: 'Спорт и Сила (+Мышцы, +Сила и Атлетизм)',
    shortHint: '+Мышцы, +Сила, +Выносливость',
    minAge: 6,
  },
  {
    value: 'Медиа и Музыка',
    label: 'Медиа и Музыка (+Харизма, +Фанаты и Креатив)',
    shortHint: '+Харизма, +Креатив',
    minAge: 10,
  },
  {
    value: 'Карьера',
    label: 'Карьера (+Зарплата, +KPI и Профессия)',
    shortHint: '+KPI, +Карьерный рост',
    minAge: 14,
  },
  {
    value: 'Уберэкс',
    label: 'Уберэкс (+Экстрим, +Подписчики и Выносливость)',
    shortHint: '+Уберэкс, +Подписчики',
    minAge: 16,
  },
  {
    value: 'Бизнес и Политика',
    label: 'Бизнес и Политика (+Прибыль сети, +Рейтинг и Финансы)',
    shortHint: '+Финансы, +Влияние',
    minAge: 18,
  },
  {
    value: 'Инвестиции',
    label: 'Инвестиции (+Дивиденды и Капитал)',
    shortHint: '+Финансы, +Портфель',
    minAge: 18,
  },
];

export function App() {
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState(CITIES_CATALOG[0]);
  const [selectedAppearance, setSelectedAppearance] = useState(CHARACTER_APPEARANCES[0]);
  const [customName, setCustomName] = useState(CITIES_CATALOG[0].defaultNames[0]);
  const [birthYear, setBirthYear] = useState<number>(2008);
  const [birthMonth, setBirthMonth] = useState<number>(5);
  const [birthDay, setBirthDay] = useState<number>(15);

  const [player, setPlayer] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlayerState;
        if (parsed && parsed.name && parsed.city && parsed.aiMemory && parsed.languages) {
          return parsed;
        }
      }
    } catch {
      // ignore corrupted save
    }
    return createInitialPlayerState(
      CITIES_CATALOG[0],
      CHARACTER_APPEARANCES[0],
      CITIES_CATALOG[0].defaultNames[0],
      2008,
      5,
      15
    );
  });

  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<MainTab>('chronicle');
  const [careerForcedSubTab, setCareerForcedSubTab] = useState<CareerPanelSubTab>('careers');
  const [selectedNpcId, setSelectedNpcId] = useState<string>('npc_carlos');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [lastNpcReaction, setLastNpcReaction] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 4200);
  }, []);

  // Autosave to localStorage for 100% offline persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {
      // ignore quota errors
    }
  }, [player]);

  // Capture Android/Chrome native WebAPK install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleNextStep = useCallback(() => {
    setPlayer((prev) => advanceTurnByStep(prev, prev.turnStep));
  }, []);

  // Expose debug helper
  useEffect(() => {
    window.__LIFE_SIM_DEBUG__ = {
      getState: () => player,
      advanceYear: () => setPlayer((prev) => advanceTurnByStep(prev, 'year')),
    };
  }, [player]);

  // Auto-progression timer when unpaused
  useEffect(() => {
    if (isPaused || showTitleModal || !player.isAlive || player.activePendingEvent) {
      return;
    }
    const tickMs = Math.max(120, Math.round(900 / speedMultiplier));
    const timer = setInterval(() => {
      setPlayer((prev) => {
        if (!prev.isAlive || prev.activePendingEvent) return prev;
        const nextProgress = prev.yearProgress + 10;
        if (nextProgress >= 100) {
          return advanceTurnByStep(prev, prev.turnStep);
        }
        return { ...prev, yearProgress: nextProgress };
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPaused, speedMultiplier, showTitleModal, player.isAlive, player.activePendingEvent]);

  const handleStartNewLife = () => {
    const fresh = createInitialPlayerState(
      selectedCity,
      selectedAppearance,
      customName,
      birthYear,
      birthMonth,
      birthDay
    );
    setPlayer(fresh);
    setShowTitleModal(false);
    setIsPaused(true);
    setActiveTab('chronicle');
    showToast(
      `Вы родились (0 лет) ${birthDay < 10 ? `0${birthDay}` : birthDay}.${birthMonth < 10 ? `0${birthMonth}` : birthMonth}.${birthYear} в г. ${fresh.city.name} (${fresh.city.country})!`
    );
  };

  const handleSwitchBottomNav = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === 'education') {
      setCareerForcedSubTab('education');
    } else if (tab === 'hobbies') {
      setCareerForcedSubTab('hobbies');
    } else if (tab === 'career') {
      setCareerForcedSubTab('careers');
    }
  };

  const handleToggleStarEntry = (entryId: string) => {
    setPlayer((prev) => ({
      ...prev,
      chronicle: prev.chronicle.map((item) =>
        item.id === entryId ? { ...item, starred: !item.starred } : item
      ),
    }));
  };

  // Career, Per-Profession Mechanics, Business & Politics handlers
  const handleSelectCareer = (career: CareerTrack) => {
    setPlayer((prev) => {
      const localSalary = Math.round(career.annualSalary * prev.city.economyMultiplier);
      return {
        ...prev,
        currentCareerId: career.id,
        careerStats: {
          ...prev.careerStats,
          promotionsCount: prev.careerStats.promotionsCount + 1,
        },
        chronicle: [
          {
            id: `job_${Date.now()}`,
            age: prev.age,
            year: prev.currentYear,
            season: prev.season,
            weather: prev.weather,
            text: `Вы устроились на должность «${career.title}» (${career.sector}) с окладом ${formatMoney(localSalary, prev.currency)}/год.`,
            starred: true,
            category: 'career',
          },
          ...prev.chronicle,
        ],
      };
    });
    showToast(`Новая должность: ${career.title}`);
  };

  const handleExecuteProfessionAction = () => {
    const res = executeProfessionSpecialAction(player);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleResolveProfessionDilemma = (optionIndex: number) => {
    const res = resolveProfessionDilemmaChoice(player, optionIndex);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleResolveProfessionMiniGame = (accuracyPercent: number) => {
    const res = resolveProfessionMiniGameResult(player, accuracyPercent);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleRegenerateColleges = () => {
    setPlayer((prev) => regenerateLocalColleges(prev, Math.floor(Math.random() * 100) + 1));
    showToast('Сгенерированы новые номерные колледжи и техникумы города!');
  };

  const handleStudySchoolExtra = (mode: 'homework' | 'tutor' | 'olympiad') => {
    setPlayer((prev) => studySchoolExtra(prev, mode));
    showToast(
      mode === 'homework'
        ? 'Домашние задания выполнены (+Школьный балл и Знания)!'
        : mode === 'tutor'
        ? 'Занятие с репетитором повысило ваш средний балл!'
        : 'Вы выступили на предметной олимпиаде (+Школьный балл)!'
    );
  };

  const handleTakeLanguageCourse = (course: LanguageCourseItem) => {
    setPlayer((prev) => takeLanguageCourse(prev, course));
    showToast(`Пройден языковой курс: ${course.langName} (${course.cefrLabel})!`);
  };

  const handleEnrollUniversity = (uni: UniversityProgram) => {
    const res = enrollInUniversityWithCriteria(player, uni);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleBuyOrEquipTech = (gadget: TechGadgetItem) => {
    setPlayer((prev) => buyOrEquipTechGadget(prev, gadget));
    showToast(`Техника: ${gadget.name}`);
  };

  const handleInstallPcComponent = (component: PcComponentItem) => {
    setPlayer((prev) => installPcComponent(prev, component));
    showToast(`Установлено в ПК (${component.slotLabel}): ${component.name}`);
  };

  const handleBuyOrUpgradeBusiness = (
    item: BusinessFranchiseItem,
    mode: 'buy' | 'upgrade' | 'branch'
  ) => {
    setPlayer((prev) => buyOrUpgradeBusiness(prev, item, mode));
    showToast(
      mode === 'buy'
        ? `Открыт бизнес: ${item.name}`
        : mode === 'upgrade'
        ? `Бизнес модернизирован: ${item.name}`
        : `Открыт новый филиал: ${item.name}`
    );
  };

  const handleRunPoliticalCampaign = (actionType: 'rally' | 'tv_debate' | 'charity_fund') => {
    setPlayer((prev) => runPoliticalCampaignAction(prev, actionType));
    showToast('Политическая кампания проведена! Рейтинг и влияние выросли.');
  };

  const handleElectPoliticalPosition = (pos: PoliticalPosition) => {
    setPlayer((prev) => electPoliticalPosition(prev, pos));
    showToast(`Поздравляем с избранием на пост: ${pos.title}!`);
  };

  const handleEnactPoliticalReform = (reform: PoliticalReform) => {
    setPlayer((prev) => enactPoliticalReform(prev, reform));
    showToast(`Закон принят: ${reform.title}!`);
  };

  const handleToggleHobby = (hobby: HobbyItem) => {
    setPlayer((prev) => {
      const exists = prev.activeHobbyIds.includes(hobby.id);
      const nextHobbies = exists
        ? prev.activeHobbyIds.filter((id) => id !== hobby.id)
        : [...prev.activeHobbyIds, hobby.id];
      const nextSkills = exists
        ? prev.skills
        : {
            ...prev.skills,
            [hobby.skillKey]: clampStat(prev.skills[hobby.skillKey] + 2),
            strength: clampStat(prev.skills.strength + (hobby.strengthGain > 0 ? 2 : 0)),
            muscleMass: clampStat(prev.skills.muscleMass + (hobby.muscleGain > 0 ? 2 : 0)),
          };
      const nextState: PlayerState = {
        ...prev,
        activeHobbyIds: nextHobbies,
        skills: nextSkills,
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      nextState.quests = syncQuestsProgress(nextState);
      return nextState;
    });
  };

  const handleJoinFaction = (faction: SocialFaction | null) => {
    setPlayer((prev) => {
      const nextState: PlayerState = {
        ...prev,
        activeFactionId: faction ? faction.id : null,
        storyArc: faction ? `Глава: Участник круга «${faction.name}»` : prev.storyArc,
        chronicle: faction
          ? [
              {
                id: `fac_${Date.now()}`,
                age: prev.age,
                year: prev.currentYear,
                season: prev.season,
                weather: prev.weather,
                text: `Вы вступили в социальный круг «${faction.name}» (${faction.category}). ${faction.perkLabel}.`,
                starred: true,
                category: 'life',
              },
              ...prev.chronicle,
            ]
          : prev.chronicle,
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      return nextState;
    });
    if (faction) {
      showToast(`Вы вступили в «${faction.name}»`);
    }
  };

  const handleRunUrbexRaid = (spot: UrbexSpot) => {
    const result = executeUrbexExpedition(player, spot);
    setPlayer(result.nextState);
    showToast(result.summaryText);
  };

  const handleBuyInvestment = (assetId: string, units: number) => {
    const asset = INITIAL_INVESTMENTS.find((a) => a.id === assetId);
    if (!asset) return;
    const cost = asset.currentPrice * units;
    setPlayer((prev) => {
      if (prev.money < cost) return prev;
      const nextInv = {
        ...prev.investments,
        [assetId]: (prev.investments[assetId] || 0) + units,
      };
      const nextState: PlayerState = {
        ...prev,
        money: prev.money - cost,
        investments: nextInv,
      };
      nextState.quests = syncQuestsProgress(nextState);
      return nextState;
    });
  };

  const handleSellInvestment = (assetId: string, units: number) => {
    const asset = INITIAL_INVESTMENTS.find((a) => a.id === assetId);
    if (!asset) return;
    setPlayer((prev) => {
      const current = prev.investments[assetId] || 0;
      if (current < units) return prev;
      const nextInv = {
        ...prev.investments,
        [assetId]: current - units,
      };
      const nextState: PlayerState = {
        ...prev,
        money: prev.money + asset.currentPrice * units,
        investments: nextInv,
      };
      nextState.quests = syncQuestsProgress(nextState);
      return nextState;
    });
  };

  // Real Estate, Vehicles, Tuning & Relocation handlers
  const handleBuyOrSelectHouse = (house: HouseItem) => {
    setPlayer((prev) => {
      const owned = prev.ownedHouseIds.includes(house.id);
      if (!owned && prev.money < house.price) return prev;
      const nextState: PlayerState = {
        ...prev,
        money: owned ? prev.money : prev.money - house.price,
        ownedHouseIds: owned ? prev.ownedHouseIds : [...prev.ownedHouseIds, house.id],
        activeHouseId: house.id,
        rentedOutHouseIds: prev.rentedOutHouseIds.filter((id) => id !== house.id),
        chronicle: !owned
          ? [
              {
                id: `house_${Date.now()}`,
                age: prev.age,
                year: prev.currentYear,
                season: prev.season,
                weather: prev.weather,
                text: `Покупка недвижимости: «${house.name}» (${house.propertyType}) за ${formatMoney(house.price, prev.currency)}.`,
                starred: true,
                category: 'finance',
              },
              ...prev.chronicle,
            ]
          : prev.chronicle,
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      return nextState;
    });
    showToast(`Недвижимость: ${house.name}`);
  };

  const handleToggleRentHouse = (house: HouseItem) => {
    setPlayer((prev) => {
      const isRented = prev.rentedOutHouseIds.includes(house.id);
      return {
        ...prev,
        rentedOutHouseIds: isRented
          ? prev.rentedOutHouseIds.filter((id) => id !== house.id)
          : [...prev.rentedOutHouseIds, house.id],
      };
    });
  };

  const handleBuyOrSelectVehicle = (veh: VehicleItem) => {
    setPlayer((prev) => {
      const owned = prev.ownedVehicleIds.includes(veh.id);
      if (!owned && prev.money < veh.price) return prev;
      const nextState: PlayerState = {
        ...prev,
        money: owned ? prev.money : prev.money - veh.price,
        ownedVehicleIds: owned ? prev.ownedVehicleIds : [...prev.ownedVehicleIds, veh.id],
        activeVehicleId: veh.id,
        chronicle: !owned
          ? [
              {
                id: `veh_${Date.now()}`,
                age: prev.age,
                year: prev.currentYear,
                season: prev.season,
                weather: prev.weather,
                text: `Приобретён транспорт (${veh.categoryLabel}): «${veh.name}» (${veh.baseHorsepower} л.с.) за ${formatMoney(veh.price, prev.currency)}!`,
                starred: true,
                category: 'finance',
              },
              ...prev.chronicle,
            ]
          : prev.chronicle,
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      return nextState;
    });
    showToast(`Активный транспорт: ${veh.name}`);
  };

  const handleInstallTuning = (tuning: TuningUpgrade) => {
    setPlayer((prev) => {
      if (prev.money < tuning.price) return prev;
      const isHouse = tuning.targetType === 'house';
      const list = isHouse ? prev.installedHouseTuningIds : prev.installedVehicleTuningIds;
      if (list.includes(tuning.id)) return prev;

      const nextSkills = {
        ...prev.skills,
        strength: clampStat(prev.skills.strength + tuning.muscleBonus),
        muscleMass: clampStat(prev.skills.muscleMass + tuning.muscleBonus),
      };

      const nextState: PlayerState = {
        ...prev,
        money: prev.money - tuning.price,
        happiness: clampStat(prev.happiness + tuning.happinessBonus),
        skills: nextSkills,
        installedHouseTuningIds: isHouse ? [...prev.installedHouseTuningIds, tuning.id] : prev.installedHouseTuningIds,
        installedVehicleTuningIds: !isHouse ? [...prev.installedVehicleTuningIds, tuning.id] : prev.installedVehicleTuningIds,
        chronicle: [
          {
            id: `tune_${Date.now()}`,
            age: prev.age,
            year: prev.currentYear,
            season: prev.season,
            weather: prev.weather,
            text: `Установлен тюнинг «${tuning.name}»: ${tuning.bonusLabel}.`,
            starred: true,
            category: 'finance',
          },
          ...prev.chronicle,
        ],
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      return nextState;
    });
    showToast(`Установлен тюнинг: ${tuning.name}`);
  };

  const handleRelocateCity = (targetCity: CityOption) => {
    setPlayer((prev) => relocateToCity(prev, targetCity));
    showToast(`Вы переехали в г. ${targetCity.name} (${targetCity.country})!`);
  };

  const handleBuyOrSelectPet = (pet: PetItem | null) => {
    if (!pet) {
      setPlayer((prev) => ({
        ...prev,
        activePetId: null,
      }));
      showToast('Вы решили жить без питомца (опционально).');
      return;
    }
    setPlayer((prev) => {
      const owned = prev.ownedPetIds.includes(pet.id);
      if (!owned && prev.money < pet.price) return prev;
      return {
        ...prev,
        money: owned ? prev.money : prev.money - pet.price,
        ownedPetIds: owned ? prev.ownedPetIds : [...prev.ownedPetIds, pet.id],
        activePetId: pet.id,
      };
    });
    showToast(`Ваш питомец: ${pet.name}`);
  };

  const handleBuyOrToggleBrand = (brand: BrandItem) => {
    setPlayer((prev) => {
      const owned = prev.ownedBrandIds.includes(brand.id);
      const equipped = prev.equippedBrandIds.includes(brand.id);
      if (!owned && prev.money < brand.price) return prev;

      const nextEquipped = equipped
        ? prev.equippedBrandIds.filter((id) => id !== brand.id)
        : [...prev.equippedBrandIds, brand.id];

      return {
        ...prev,
        money: owned ? prev.money : prev.money - brand.price,
        ownedBrandIds: owned ? prev.ownedBrandIds : [...prev.ownedBrandIds, brand.id],
        equippedBrandIds: nextEquipped,
      };
    });
  };

  // Underworld, Steroids, Bad Habits, Crime, Bribes, Casino, Nightlife & Romance handlers
  const handleUseSteroidCycle = (cycle: SteroidCycleItem) => {
    setPlayer((prev) => useSteroidCycle(prev, cycle));
    showToast(`Анаболический курс пройден: ${cycle.name}`);
  };

  const handlePerformHabitAction = (habit: HabitActionItem) => {
    setPlayer((prev) => performHabitAction(prev, habit));
    showToast(`${habit.name}: характеристики обновлены`);
  };

  const handleTriggerPeerPressureEvent = () => {
    const ev =
      PEER_PRESSURE_EVENTS_CATALOG[
        (player.age + player.dayOfMonth) % PEER_PRESSURE_EVENTS_CATALOG.length
      ];
    setPlayer((prev) => ({ ...prev, activePendingEvent: ev }));
  };

  const handleExecuteCrimeAction = (crime: CrimeActionItem) => {
    const res = executeCrimeAction(player, crime);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleExecuteBribeAction = (bribe: BribeActionItem) => {
    const res = executeBribeAction(player, bribe);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handlePlayCasinoGame = (
    gameType: CasinoGameType,
    betAmount: number
  ) => {
    const res = playCasinoGame(player, gameType, betAmount);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleEnjoyNightlifePackage = (pkg: NightlifePackageItem) => {
    setPlayer((prev) => enjoyNightlifePackage(prev, pkg));
    showToast(`Ночной отдых: ${pkg.name}`);
  };

  const handleInteractRomancePartner = (
    partner: RomancePartner,
    action: 'start_dating' | 'romantic_date' | 'luxury_gift' | 'marry' | 'breakup'
  ) => {
    const res = interactRomancePartner(player, partner, action);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  // Family & Real Artists handlers
  const handleInteractFamily = (
    member: FamilyMember,
    action: 'visit' | 'gift' | 'ask_support'
  ) => {
    setPlayer((prev) => {
      let moneyDelta = 0;
      let relDelta = 6;
      let text = '';

      if (action === 'visit') {
        relDelta = 8;
        text = `Вы тепло пообщались с родственником: ${member.relation} ${member.name} (${member.profession}).`;
      } else if (action === 'gift') {
        if (prev.money < 200) return prev;
        moneyDelta = -200;
        relDelta = 14;
        text = `Вы подарили подарок (${formatMoney(200, prev.currency)}) для ${member.relation}: ${member.name}. Отношения укрепились!`;
      } else {
        const supportAmount =
          member.monthlyIncome > 0 ? Math.min(450, Math.round(member.monthlyIncome * 0.15)) : 100;
        moneyDelta = supportAmount;
        relDelta = 4;
        text = `${member.relation} ${member.name} поддержал(а) вас советом и перевёл(а) ${formatMoney(supportAmount, prev.currency)} на расходы.`;
      }

      const nextFamily = prev.family.map((f) =>
        f.id === member.id
          ? { ...f, relationship: clampStat(f.relationship + relDelta) }
          : f
      );

      return {
        ...prev,
        money: prev.money + moneyDelta,
        relations: clampStat(prev.relations + Math.round(relDelta / 2)),
        happiness: clampStat(prev.happiness + 5),
        family: nextFamily,
        chronicle: [
          {
            id: `fam_${Date.now()}`,
            age: prev.age,
            year: prev.currentYear,
            season: prev.season,
            weather: prev.weather,
            text,
            starred: false,
            category: 'family',
          },
          ...prev.chronicle,
        ],
      };
    });
  };

  const handleInteractArtist = (artist: RealArtist, mode: 'concert' | 'collab') => {
    setPlayer((prev) => {
      const cost = mode === 'concert' ? artist.ticketPrice : artist.collabPrice;
      if (prev.money < cost) return prev;
      const subscribersBoost = mode === 'collab' ? artist.fameBoost * 65 : artist.fameBoost * 8;

      return {
        ...prev,
        money: prev.money - cost,
        happiness: clampStat(prev.happiness + (mode === 'concert' ? 12 : 18)),
        urbexSubscribers: prev.urbexSubscribers + subscribersBoost,
        skills: {
          ...prev.skills,
          creativity: clampStat(prev.skills.creativity + (mode === 'collab' ? 8 : 3)),
          charisma: clampStat(prev.skills.charisma + (mode === 'collab' ? 6 : 2)),
        },
        attendedArtistIds:
          mode === 'concert' && !prev.attendedArtistIds.includes(artist.id)
            ? [...prev.attendedArtistIds, artist.id]
            : prev.attendedArtistIds,
        collabArtistIds:
          mode === 'collab' && !prev.collabArtistIds.includes(artist.id)
            ? [...prev.collabArtistIds, artist.id]
            : prev.collabArtistIds,
        storyArc:
          mode === 'collab'
            ? `Глава: Совместный хит с ${artist.name}`
            : prev.storyArc,
        chronicle: [
          {
            id: `art_${Date.now()}`,
            age: prev.age,
            year: prev.currentYear,
            season: prev.season,
            weather: prev.weather,
            text:
              mode === 'collab'
                ? `Вы записали совместный фит с артистом ${artist.name} (${artist.region}, ${artist.genre})! +${subscribersBoost.toLocaleString('ru-RU')} подписчиков.`
                : `Вы посетили живой концерт ${artist.name} (${artist.genre}) и зарядились вдохновением!`,
            starred: mode === 'collab',
            category: 'music',
          },
          ...prev.chronicle,
        ],
      };
    });
    showToast(
      mode === 'collab'
        ? `Записан фит с ${artist.name}!`
        : `Вы побывали на концерте ${artist.name}!`
    );
  };

  // NPC Live AI Chat & Anti-Hallucination Persistent-Memory AI Event Generator
  const handleSendNpcMessage = async (npcId: string, userMessage: string) => {
    const npc = player.friends.find((f) => f.id === npcId) || player.friends[0];
    if (!npc) return;

    if (player.offlineAiMode) {
      const localRes = generateOfflineNpcDialogue(player, npcId, userMessage);
      setLastNpcReaction(localRes.moodReaction);
      setPlayer((prev) => ({
        ...prev,
        happiness: clampStat(prev.happiness + localRes.happinessDelta),
        relations: clampStat(prev.relations + localRes.relationDelta),
        friends: prev.friends.map((f) =>
          f.id === npcId
            ? {
                ...f,
                relationship: clampStat(f.relationship + localRes.relationDelta),
                lastMessage: localRes.reply,
              }
            : f
        ),
      }));
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/npc-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: player.name,
          age: player.age,
          city: player.city.name,
          country: player.city.country,
          season: player.season,
          weather: player.weather,
          careerTitle: player.currentCareerId || 'Свободный путь',
          urbexSubscribers: player.urbexSubscribers,
          storyArc: player.storyArc,
          strength: player.skills.strength,
          muscleMass: player.skills.muscleMass,
          npcName: npc.name,
          npcRole: npc.role,
          npcTrait: npc.trait,
          relationship: npc.relationship,
          userActionOrMessage: userMessage,
        }),
      });
      const data = await res.json();
      setLastNpcReaction(data.moodReaction || 'Отвечает');
      setPlayer((prev) => ({
        ...prev,
        happiness: clampStat(prev.happiness + (data.happinessDelta || 4)),
        relations: clampStat(prev.relations + (data.relationDelta || 5)),
        friends: prev.friends.map((f) =>
          f.id === npcId
            ? {
                ...f,
                relationship: clampStat(f.relationship + (data.relationDelta || 5)),
                lastMessage: data.reply || 'Давай встретимся и обсудим план!',
              }
            : f
        ),
      }));
    } catch {
      const fallback = generateOfflineNpcDialogue(player, npcId, userMessage);
      setLastNpcReaction(fallback.moodReaction);
      setPlayer((prev) => ({
        ...prev,
        friends: prev.friends.map((f) =>
          f.id === npcId ? { ...f, lastMessage: fallback.reply } : f
        ),
      }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateAiEvent = async () => {
    // Always use embedded Anti-Hallucination Persistent-Memory AI first in APK mode
    if (player.offlineAiMode) {
      const contextualEvent = generateContextualAiLifeEvent(player);
      setPlayer((prev) => ({ ...prev, activePendingEvent: contextualEvent }));
      showToast('Сгенерировано ИИ-событие на основе вашей памяти ДО и ПОСЛЕ!');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: player.name,
          age: player.age,
          city: player.city.name,
          country: player.city.country,
          season: player.season,
          weather: player.weather,
          focus: player.focus,
          careerTitle: player.currentCareerId || 'Свободный исследователь',
          urbexSubscribers: player.urbexSubscribers,
          storyArc: player.storyArc,
          familySummary: player.family
            .map((m) => `${m.relation} ${m.name} (${m.profession})`)
            .join(', '),
        }),
      });
      const data = await res.json();
      if (data && data.title && Array.isArray(data.choices)) {
        const aiEvent: LifeEventTemplate = {
          id: `ai_ev_${Date.now()}`,
          title: data.title,
          description: data.description,
          minAge: 0,
          maxAge: 99,
          choices: data.choices,
        };
        setPlayer((prev) => ({ ...prev, activePendingEvent: aiEvent }));
      } else {
        const contextualEvent = generateContextualAiLifeEvent(player);
        setPlayer((prev) => ({ ...prev, activePendingEvent: contextualEvent }));
      }
    } catch {
      const contextualEvent = generateContextualAiLifeEvent(player);
      setPlayer((prev) => ({ ...prev, activePendingEvent: contextualEvent }));
      showToast('Сгенерировано автономное ИИ-событие с памятью ДО и ПОСЛЕ');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleResolveEventChoice = (choice: EventChoice) => {
    if (!player.activePendingEvent) return;
    setPlayer((prev) =>
      prev.activePendingEvent ? applyEventChoice(prev, prev.activePendingEvent, choice) : prev
    );
  };

  const handleClaimQuest = (questId: string) => {
    setPlayer((prev) => {
      const q = prev.quests.find((item) => item.id === questId);
      if (!q || !q.completed || !q.claimed === false) return prev;
      return {
        ...prev,
        money: prev.money + q.rewardMoney,
        skills: {
          ...prev.skills,
          [q.rewardSkillKey]: clampStat(prev.skills[q.rewardSkillKey] + q.rewardSkillAmount),
        },
        quests: prev.quests.map((item) =>
          item.id === questId ? { ...item, claimed: true } : item
        ),
      };
    });
  };

  // Download standalone offline launcher HTML / JSON backup
  const handleDownloadStandaloneLauncher = () => {
    const saveJson = JSON.stringify(player, null, 2);
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Life Simulator EX — Автономный Профиль (${player.name})</title>
<style>
  body { background:#070A0F; color:#E6EDF5; font-family:system-ui,-apple-system,sans-serif; padding:24px; max-width:640px; margin:0 auto; }
  .card { background:#0E131D; border:1px solid #1E293B; border-radius:16px; padding:20px; margin-bottom:16px; }
  .badge { display:inline-block; background:#10B98125; color:#34D399; border:1px solid #10B98155; padding:4px 10px; border-radius:8px; font-size:12px; font-family:monospace; }
  h1 { margin:10px 0 6px; font-size:22px; }
  pre { background:#070A0F; padding:12px; border-radius:10px; overflow:auto; max-height:260px; font-size:11px; color:#94A3B8; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">LIFE SIMULATOR EX · OFFLINE SAVE CAPSULE</span>
    <h1>${player.name} (${player.age} лет · ${player.city.name}, ${player.city.country})</h1>
    <p>Дата в игре: ${player.dayOfMonth}.${player.monthOfYear}.${player.currentYear} · Баланс: ${formatMoney(player.money, player.currency)}</p>
    <p>Текущая глава: <strong>${player.storyArc}</strong></p>
    <p>Этот файл содержит вашу полную автономную сохранённую биографию и цепочку памяти ИИ (${player.aiMemory.entries.length} записей).</p>
  </div>
  <div class="card">
    <h3>Память ИИ (ДО и ПОСЛЕ):</h3>
    <pre>${player.aiMemory.coreBiographySummary}</pre>
    <h3>Резервная копия сохранения JSON:</h3>
    <pre id="save-data">${saveJson.replace(/</g, '&lt;')}</pre>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeSimulatorEX_${player.name.replace(/\s+/g, '_')}_Offline.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Автономный файл игры скачан на устройство!');
  };

  const handleInstallNativePwa = async () => {
    const promptEvent = deferredInstallPrompt as { prompt?: () => Promise<void> } | null;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      await promptEvent.prompt();
      setDeferredInstallPrompt(null);
      showToast('Запущена установка приложения на телефон!');
    } else {
      handleDownloadStandaloneLauncher();
    }
  };

  const handleAskParentsForPet = () => {
    const res = askParentsForPet(player);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleTakeVacation = () => {
    const resortCity =
      CITIES_CATALOG.find((c) => c.regionGroup.includes('Курорты')) || CITIES_CATALOG[0];
    const res = takeVacation(player, resortCity);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleLaunderMoney = () => {
    const res = launderMoney(player, Math.min(player.shadowIncome, 50000));
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handlePublishBlogPost = () => {
    const res = publishBlogPost(player, 'lifestyle');
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleExportSaveJson = () => {
    const jsonStr = JSON.stringify(player, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesimulator_save_${player.name.replace(/\s+/g, '_')}_${player.age}y.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Файл сохранения экспортирован в JSON!');
  };

  const handleImportSaveJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as PlayerState;
        if (parsed && parsed.name && parsed.city && parsed.skills) {
          setPlayer(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          showToast(`Сохранение «${parsed.name}» (${parsed.age} лет) успешно загружено!`);
          setShowApkModal(false);
        } else {
          alert('Некорректная структура файла сохранения!');
        }
      } catch {
        alert('Ошибка при чтении JSON-файла сохранения!');
      }
    };
    reader.readAsText(file);
  };

  const bonuses = calculateActiveBonuses(player);
  const bizSummary = calculateMonthlyBusinessSummary(player);
  const availableFocusOptions = ALL_FOCUS_OPTIONS.filter((opt) => {
    if (player.age <= 5) return opt.minAge === 0;
    return opt.minAge >= 6 && opt.minAge <= player.age;
  });
  const currentFocusMeta =
    availableFocusOptions.find((f) => f.value === player.focus) ||
    ALL_FOCUS_OPTIONS.find((f) => f.value === player.focus) ||
    availableFocusOptions[0];

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E6EDF5] font-sans pb-24">
      {/* Title Screen Modal with Custom Birth Date & Start at Age 0 */}
      {showTitleModal && (
        <TitleScreenModal
          selectedCity={selectedCity}
          selectedAppearance={selectedAppearance}
          playerName={customName}
          birthYear={birthYear}
          birthMonth={birthMonth}
          birthDay={birthDay}
          onSelectCity={setSelectedCity}
          onSelectAppearance={setSelectedAppearance}
          onChangeName={setCustomName}
          onChangeBirthDate={(y, m, d) => {
            setBirthYear(y);
            setBirthMonth(m);
            setBirthDay(d);
          }}
          onStartLife={handleStartNewLife}
        />
      )}

      {/* Standalone Offline APK / Phone Installer Modal */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F1520] border border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-mono">
                <Smartphone className="w-3.5 h-3.5" /> 100% АВТОНОМНЫЙ APK / ОФФЛАЙН РЕЖИМ
              </div>
              <button
                type="button"
                onClick={() => setShowApkModal(false)}
                className="p-1.5 rounded-lg bg-[#161F30] text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-display font-bold text-white">
              Установка Life Simulator EX на телефон (Без серверов и интернета)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Игра полностью автономна: встроенный лёгкий ИИ с памятью ДО/ПОСЛЕ, все 27 стран с Топ-10 ВУЗами, 640 профессий, текстуры авто/домов/техники и автосохранение работают прямо на вашем телефоне без интернета.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleInstallNativePwa}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                Установить приложение на телефон (WebAPK / Нативная иконка)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportSaveJson}
                  className="py-2.5 px-3 rounded-xl bg-[#161F30] hover:bg-[#1E293B] border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Экспорт сейва (.JSON)
                </button>
                <label className="py-2.5 px-3 rounded-xl bg-[#161F30] hover:bg-[#1E293B] border border-sky-500/40 text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" /> Импорт сейва (.JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSaveJson}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Hybrid Offline/Cloud AI Toggle */}
              <div className="p-3 rounded-xl bg-[#141C2B] border border-[#243247] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Автономный ИИ-движок</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {player.offlineAiMode
                      ? 'Встроенный APK-ИИ (100% офлайн без интернета)'
                      : 'Гибридный режим (Облако + Встроенный ИИ)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPlayer((prev) => ({ ...prev, offlineAiMode: !prev.offlineAiMode }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    player.offlineAiMode
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#1b263b] text-slate-300'
                  }`}
                >
                  {player.offlineAiMode ? '✓ ОФФЛАЙН' : 'ОБЛАКО'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadStandaloneLauncher}
                className="w-full py-2 px-3 rounded-xl bg-[#111724] hover:bg-[#172033] border border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Скачать автономный HTML-лаунчер
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-[11px] text-slate-300 space-y-1.5">
              <div className="font-bold text-emerald-400 uppercase font-mono">
                Как установить как APK на Android за 5 секунд:
              </div>
              <div>1. В мобильном браузере Chrome нажмите меню «⋮» → <strong>«Установить приложение»</strong> (Android автоматически собирает системный WebAPK без Play Market).</div>
              <div>2. Либо откройте адрес игры в бесплатном сервисе <strong>PWABuilder.com</strong> → нажмите <strong>Package for Stores → Android APK</strong> и скачайте готовый `.apk` файл (манифест и Service Worker уже встроены в игру!).</div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastBanner && (
        <div className="fixed bottom-20 right-4 z-40 max-w-md px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-xl">
          {toastBanner}
        </div>
      )}

      {/* Interactive Story Branching Event Modal */}
      {player.activePendingEvent && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F1520] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Событие судьбы ({player.age} лет · {player.season}, {player.weather})
            </div>
            <h2 className="text-xl font-display font-bold text-white">
              {player.activePendingEvent.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {player.activePendingEvent.description}
            </p>
            <div className="space-y-2.5 pt-2">
              {player.activePendingEvent.choices.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleResolveEventChoice(ch)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#161F30] hover:bg-emerald-500/20 border border-[#283548] hover:border-emerald-400 transition cursor-pointer"
                >
                  <div className="text-sm font-bold text-white">{ch.label}</div>
                  {ch.nextStoryArc && (
                    <div className="text-[11px] font-mono text-emerald-400 mt-1">
                      Запись в память ИИ (ПОСЛЕ): «{ch.nextStoryArc}»
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hardcore Bankruptcy / Game Over Modal */}
      {!player.isAlive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111622] border border-rose-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              {player.isBankrupt ? 'ФИНАНСОВОЕ БАНКРОТСТВО' : 'ЖИЗНЕННЫЙ ПУТЬ ЗАВЕРШЁН'}
            </h2>
            <p className="text-sm text-slate-300">
              {player.causeOfEnd || 'Ваша история подошла к концу.'}
            </p>
            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-slate-300 space-y-1">
              <div>Персонаж: {player.name} ({player.age} лет)</div>
              <div>Город: {player.city.name}, {player.city.country}</div>
              <div>Итоговый баланс: {formatMoney(player.money, player.currency)}</div>
              <div>Финальная глава: {player.storyArc}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowTitleModal(true)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
            >
              Начать новую жизнь (с 0 лет)
            </button>
          </div>
        </div>
      )}

      {/* Main Centered Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-3 space-y-3.5">
        {/* Top Brand & Chronometer Header */}
        <header className="bg-[#0E131D] border border-[#1E293B] rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center font-display font-extrabold text-xs text-emerald-300">
                EX
              </div>
              <div>
                <div className="text-xs font-display font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
                  <span>LIFE SIMULATOR <span className="text-emerald-400">EX</span></span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    APK OFFLINE AI
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium truncate max-w-xs sm:max-w-md">
                  {player.storyArc}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="px-2.5 py-1.5 rounded-xl bg-[#141C2B] border border-[#243247] text-xs font-mono">
                Баланс:{' '}
                <span className={player.money < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {formatMoney(player.money, player.currency)}
                </span>
                {bizSummary.netMonthlyProfit > 0 && (
                  <span className="text-emerald-300 ml-1.5 hidden sm:inline">
                    (+{formatMoney(bizSummary.netMonthlyProfit, player.currency)}/м)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowApkModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Smartphone className="w-3.5 h-3.5" /> APK / Оффлайн
              </button>
              <button
                type="button"
                onClick={() => setShowTitleModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[#141C2B] hover:bg-[#1B263B] border border-[#243247] text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Новая судьба (0 лет)
              </button>
            </div>
          </div>

          {/* Age (Starting from 0), Date, Morphology & Turn Step Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-lg sm:text-xl font-display text-slate-200">
                  Возраст <strong className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{player.age}</strong>{' '}
                  <span className="text-xs font-mono text-emerald-400">
                    {player.age === 0
                      ? '(Новорождённый)'
                      : player.age < 6
                      ? '(Раннее детство)'
                      : player.age < 18
                      ? `(Школа · балл ${player.schoolGradeAvg.toFixed(1)})`
                      : ''}
                  </span>
                </span>
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  Дата: {player.dayOfMonth < 10 ? `0${player.dayOfMonth}` : player.dayOfMonth}.
                  {player.monthOfYear < 10 ? `0${player.monthOfYear}` : player.monthOfYear}.{player.currentYear} · {player.name}
                </span>
              </div>
              {/* Physical Morphology & Endgame Indicators Row */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono">
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <Dumbbell className="w-3.5 h-3.5" /> Сила: {player.skills.strength} · Мышцы: {player.skills.muscleMass}
                </span>
                <span className="text-slate-400">Рост: {player.heightCm} см</span>
                <span className="text-slate-400">Вес: {player.weightKg} кг</span>
                {player.age >= 6 && player.age <= 18 && (
                  <span className="text-slate-300">Аттестат: {player.schoolGradeAvg.toFixed(1)}/12</span>
                )}
                {player.stress > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      player.stress >= 70
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Стресс: {player.stress}%
                  </span>
                )}
                {player.taxScrutiny > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      player.taxScrutiny >= 40
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Налоговая: {player.taxScrutiny}%
                  </span>
                )}
                {player.shadowIncome > 0 && (
                  <button
                    type="button"
                    onClick={handleLaunderMoney}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                  >
                    Отмыть теневые {formatMoney(player.shadowIncome, player.currency)}
                  </button>
                )}
                {player.stress >= 25 && player.money >= 1500 && (
                  <button
                    type="button"
                    onClick={handleTakeVacation}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition cursor-pointer flex items-center gap-1"
                  >
                    <Palmtree className="w-3 h-3" /> Отпуск (-$1.5k, -45% стресса)
                  </button>
                )}
                {player.age >= 13 && (
                  <button
                    type="button"
                    onClick={handlePublishBlogPost}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition cursor-pointer flex items-center gap-1"
                  >
                    <Smartphone className="w-3 h-3" /> Блог ({player.blogPostsCount} постов · +{formatMoney(player.blogAdRevenue, player.currency)}/ход)
                  </button>
                )}
              </div>
            </div>

            {/* Turn Step Selector (Day / Week / Month / Year) */}
            <div className="flex items-center gap-1 bg-[#090D14] p-1 rounded-xl border border-[#1E293B] self-start md:self-auto">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Ход:
              </span>
              {TURN_STEPS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setPlayer((prev) => ({ ...prev, turnStep: st.id }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    player.turnStep === st.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-[#151D2C]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#1A2333] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-emerald-400 to-cyan-400 transition-all duration-200"
              style={{ width: `${Math.max(12, player.yearProgress)}%` }}
            />
          </div>

          {/* Speed Controls & Next Turn Button */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-label="Пауза"
              onClick={() => setIsPaused((p) => !p)}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center cursor-pointer ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#141C2B] border-[#243247] text-slate-300'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>

            {SPEED_MULTIPLIERS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  setSpeedMultiplier(spd);
                  setIsPaused(false);
                }}
                className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                  !isPaused && speedMultiplier === spd
                    ? 'bg-white text-slate-950 border-white'
                    : 'bg-[#141C2B] border-[#243247] text-slate-300 hover:border-slate-500'
                }`}
              >
                {spd}×
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextStep}
              data-testid="next-year-btn"
              className="ml-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs tracking-wide transition cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/10"
            >
              Далее (+1 {TURN_STEPS.find((t) => t.id === player.turnStep)?.label}) »
            </button>
          </div>
        </header>

        {/* Hi-Bit Pixel Diorama Viewport (Dynamic Location & Season Background + Optional Pet) */}
        <section className="bg-[#0E131D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
          <PixelDioramaCanvas
            age={player.age}
            season={player.season}
            weather={player.weather}
            cityName={player.city.name}
            countryName={player.city.country}
            appearance={player.appearance}
            pet={bonuses.pet}
            house={bonuses.house}
            vehicle={bonuses.vehicle}
            equippedBrands={bonuses.equippedBrands}
            strength={player.skills.strength}
            muscleMass={player.skills.muscleMass}
            hasNeonTuning={player.installedVehicleTuningIds.includes('tune_car_neon')}
            hasSpoilerTuning={player.installedVehicleTuningIds.includes('tune_car_widebody')}
            hasSmartHomeTuning={player.installedHouseTuningIds.includes('tune_home_smart')}
            hasInjury={player.hasInjury}
            outfitStyle={player.outfitStyle}
            hairstyleId={player.hairstyleId}
            facialHairId={player.facialHairId}
            hasMask={player.hasMask}
            hasCareer={player.currentCareerId !== null}
          />

          <div className="p-3 bg-[#111722] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
            <div>
              <strong className="text-white">
                {player.city.name}, {player.city.country}
              </strong>{' '}
              · {bonuses.house.name} ·{' '}
              {bonuses.pet ? `питомец ${bonuses.pet.name}` : 'без питомца'}
              {bonuses.vehicle ? ` · ${bonuses.vehicle.name} (${bonuses.vehicleTotalHp} л.с.)` : ''}
            </div>
            <div className="font-mono text-[11px] text-emerald-400">
              Мама: {player.family[0]?.name} · Папа: {player.family[1]?.name}
            </div>
          </div>
        </section>

        {/* Core 4 Stats + Explicit Stat-Bonus Focus Selector & Spending Mode Bar */}
        <section className="bg-[#0E131D] border border-[#1E293B] rounded-2xl p-3.5 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <div className="text-[11px] text-slate-400">Здоровье</div>
              <div className="text-base font-bold font-mono text-white">{player.health}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${player.health}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Счастье</div>
              <div className="text-base font-bold font-mono text-white">{player.happiness}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${player.happiness}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Знания</div>
              <div className="text-base font-bold font-mono text-white">{player.knowledge}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${player.knowledge}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Отношения</div>
              <div className="text-base font-bold font-mono text-white">{player.relations}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
                <div className="h-full bg-pink-400 rounded-full" style={{ width: `${player.relations}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1E293B]">
            <label className="flex-1 flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-[#141C2B] border border-[#243247] text-xs">
              <span className="text-slate-400 font-mono">Фокус развития:</span>
              <select
                aria-label="Жизненный фокус"
                value={player.focus}
                onChange={(e) =>
                  setPlayer((prev) => ({ ...prev, focus: e.target.value as LifeFocus }))
                }
                className="flex-1 bg-transparent font-bold text-emerald-300 outline-none cursor-pointer min-w-[200px]"
              >
                {availableFocusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                {currentFocusMeta.shortHint}
              </span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141C2B] border border-[#243247] text-xs shrink-0">
              <span className="text-slate-400 font-mono">Режим трат:</span>
              <select
                aria-label="Режим трат"
                value={player.spendingMode}
                onChange={(e) =>
                  setPlayer((prev) => {
                    const next = { ...prev, spendingMode: e.target.value as SpendingMode };
                    next.monthlyExpenses = calculateMonthlyExpenses(next);
                    return next;
                  })
                }
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
              >
                <option value="Экономный" className="bg-slate-900">Эконом (×0.75)</option>
                <option value="Баланс" className="bg-slate-900">Баланс (×1.0)</option>
                <option value="Роскошный" className="bg-slate-900">Роскошь (×1.65)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Active Section Content */}
        <main className="bg-[#0E131D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {activeTab === 'chronicle' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                    <div>
                      <h2 className="text-lg font-display font-bold text-white">Летопись вашей жизни (с 0 лет)</h2>
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Локация: {player.city.name} ({player.city.country}) · Встроенный ИИ помнит {player.aiMemory.entries.length} ключевых событий ДО и ПОСЛЕ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAiEvent}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Сгенерировать ИИ-событие сейчас
                    </button>
                  </div>

                  <div className="divide-y divide-[#1E293B]">
                    {player.chronicle.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleToggleStarEntry(entry.id)}
                        className="py-3.5 flex items-start gap-3.5 hover:bg-[#131B29] px-2.5 rounded-xl transition cursor-pointer"
                      >
                        <div className="w-16 shrink-0 font-mono text-xs text-slate-400 pt-0.5">
                          <div>{entry.age} лет</div>
                          {entry.dateLabel && (
                            <div className="text-[10px] text-slate-500 truncate">{entry.dateLabel}</div>
                          )}
                        </div>
                        <div className="flex-1 text-sm text-slate-100 leading-relaxed">
                          {entry.text}
                        </div>
                        <Star
                          className={`w-4 h-4 shrink-0 mt-1 ${
                            entry.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'education' || activeTab === 'hobbies' || activeTab === 'career') && (
                <CareerUrbexPanel
                  player={player}
                  forcedSubTab={careerForcedSubTab}
                  onSelectCareer={handleSelectCareer}
                  onExecuteProfessionAction={handleExecuteProfessionAction}
                  onResolveProfessionDilemma={handleResolveProfessionDilemma}
                  onResolveProfessionMiniGame={handleResolveProfessionMiniGame}
                  onGenerateAiEvent={handleGenerateAiEvent}
                  onBuyOrUpgradeBusiness={handleBuyOrUpgradeBusiness}
                  onRunPoliticalCampaign={handleRunPoliticalCampaign}
                  onElectPoliticalPosition={handleElectPoliticalPosition}
                  onEnactPoliticalReform={handleEnactPoliticalReform}
                  onEnrollUniversity={handleEnrollUniversity}
                  onStudySchoolExtra={handleStudySchoolExtra}
                  onTakeLanguageCourse={handleTakeLanguageCourse}
                  onRegenerateColleges={handleRegenerateColleges}
                  onToggleHobby={handleToggleHobby}
                  onJoinFaction={handleJoinFaction}
                  onRunUrbexRaid={handleRunUrbexRaid}
                  onBuyInvestment={handleBuyInvestment}
                  onSellInvestment={handleSellInvestment}
                />
              )}

              {activeTab === 'assets' && (
                <AssetsBrandStorePanel
                  player={player}
                  onBuyOrSelectHouse={handleBuyOrSelectHouse}
                  onToggleRentHouse={handleToggleRentHouse}
                  onBuyOrSelectVehicle={handleBuyOrSelectVehicle}
                  onInstallTuning={handleInstallTuning}
                  onBuyOrEquipTech={handleBuyOrEquipTech}
                  onInstallPcComponent={handleInstallPcComponent}
                  onRelocateCity={handleRelocateCity}
                  onBuyOrSelectPet={handleBuyOrSelectPet}
                  onBuyOrToggleBrand={handleBuyOrToggleBrand}
                  onUpdateAppearance={(app) =>
                    setPlayer((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, ...app },
                    }))
                  }
                  onUpdatePlayerState={(patch) =>
                    setPlayer((prev) => ({ ...prev, ...patch }))
                  }
                  onAskParentsForPet={handleAskParentsForPet}
                />
              )}

              {activeTab === 'family' && (
                <FriendsAiPanel
                  player={player}
                  selectedNpcId={selectedNpcId}
                  onSelectNpc={setSelectedNpcId}
                  onSendNpcMessage={handleSendNpcMessage}
                  onGenerateAiEvent={handleGenerateAiEvent}
                  onToggleOfflineAi={() =>
                    setPlayer((prev) => ({ ...prev, offlineAiMode: !prev.offlineAiMode }))
                  }
                  isAiLoading={isAiLoading}
                  lastNpcReaction={lastNpcReaction}
                  onInteractFamily={handleInteractFamily}
                  onInteractArtist={handleInteractArtist}
                  onAskParentsForPet={handleAskParentsForPet}
                />
              )}

              {activeTab === 'underworld' && (
                <UnderworldNightlifePanel
                  player={player}
                  onUseSteroid={handleUseSteroidCycle}
                  onPerformHabit={handlePerformHabitAction}
                  onTriggerPeerEvent={handleTriggerPeerPressureEvent}
                  onExecuteCrime={handleExecuteCrimeAction}
                  onExecuteBribe={handleExecuteBribeAction}
                  onPlayCasino={handlePlayCasinoGame}
                  onEnjoyNightlife={handleEnjoyNightlifePackage}
                  onInteractRomance={handleInteractRomancePartner}
                />
              )}

              {activeTab === 'quests' && (
                <QuestsModEditorPanel
                  player={player}
                  onClaimQuest={handleClaimQuest}
                  onAddCustomMod={(mod, triggerNow) =>
                    setPlayer((prev) => ({
                      ...prev,
                      customMods: [mod, ...prev.customMods],
                      activePendingEvent: triggerNow ? mod : prev.activePendingEvent,
                    }))
                  }
                  onTriggerExistingMod={(mod) =>
                    setPlayer((prev) => ({ ...prev, activePendingEvent: mod }))
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile-First Fixed Bottom Navigation Bar (Учёба, Хобби, Работа, Семья, Имущество, Криминал/Казино, Квесты) */}
      <nav
        aria-label="Нижнее меню разделов"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0E17]/95 backdrop-blur-md border-t border-[#1E293B] px-2 py-1.5"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-4 sm:grid-cols-8 gap-1">
          <button
            type="button"
            onClick={() => handleSwitchBottomNav('chronicle')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'chronicle'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Жизнь</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('education')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'education'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {player.age < 6 && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </div>
            <span>Учёба</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('hobbies')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'hobbies'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Хобби</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('career')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'career'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {player.age < 14 && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </div>
            <span>Работа</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('family')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'family'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Семья/ИИ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('assets')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              {player.age < 6 && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </div>
            <span>Покупки</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('underworld')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'underworld'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {player.age < 12 && <Lock className="w-2.5 h-2.5 text-amber-400" />}
            </div>
            <span>Криминал/18+</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('quests')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-[#161F30]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Квесты</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
export default App;
