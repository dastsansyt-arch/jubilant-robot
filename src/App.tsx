import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  WardrobeItem,
  ProactiveNpcChatFinalChoice,
} from './game/types';
import {
  CITIES_CATALOG,
  CHARACTER_APPEARANCES,
  INITIAL_INVESTMENTS,
  CAREERS_CATALOG,
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
  getAgeGate,
  getLanguageCourseCost,
  appendAiMemory,
  normalizeLoadedPlayerState,
  buyOrEquipWardrobeItem,
  toggleMilitaryService,
  toggleFrontlineDeployment,
  treatIllnessOrInjury,
  resolveCharacterAutoContext,
  resolveCharacterLocationScene,
  calculateDiminishingStatGain,
  executeScaledStatTraining,
  resolveGradeProfessionMinigame,
  pickProactiveNpcChat,
  resolveProactiveNpcChatFinal,
} from './game/rules';
import { motion, AnimatePresence } from 'motion/react';
import { FullBodyPixelHuman, CharacterSceneStage } from './components/FullBodyPixelHuman';
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
          return normalizeLoadedPlayerState(parsed);
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
  const [selectedNpcId, setSelectedNpcId] = useState<string>(
    () => player.friends[0]?.id || 'npc_carlos'
  );
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [lastNpcReaction, setLastNpcReaction] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [showAllChronicle, setShowAllChronicle] = useState<boolean>(false);
  const [npcReplyBranchIdx, setNpcReplyBranchIdx] = useState<number | null>(null);
  const [gradeMinigameModal, setGradeMinigameModal] = useState<{
    category: 'it' | 'blog' | 'business';
    timerLeft: number;
    timingCursor: number;
    selectedTagBonus: number;
    bargainDiscount: number;
    bargainUsedSteps: number[];
    legitChecked: boolean;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastBanner(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
      toastTimerRef.current = null;
    }, 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
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
    setSelectedNpcId(fresh.friends[0]?.id || 'npc_carlos');
    setShowAllChronicle(false);
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
    const isPartTime = career.sector === 'Подработка для подростков';
    const gate = getAgeGate(isPartTime ? 'part_time_job' : 'career', player.age);
    if (!gate.allowed || player.age < career.minAge) {
      showToast(gate.reason || `Доступно с ${career.minAge} лет`);
      return;
    }
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
    const gate = getAgeGate('school', player.age);
    if (!gate.allowed || player.age > 18) {
      showToast('Школьные занятия доступны только в школьном возрасте (6–18 лет)!');
      return;
    }
    const cost = mode === 'homework' ? 0 : mode === 'tutor' ? 180 : 350;
    if (player.money < cost && player.age < 18 && cost > 0) {
      const parentRes = askParentsToPayFor(
        player,
        mode === 'tutor' ? 'Репетитор к экзаменам' : 'Взнос на олимпиаду',
        cost,
        'course',
        (s) => studySchoolExtra({ ...s, money: s.money + cost }, mode)
      );
      setPlayer(parentRes.nextState);
      showToast(parentRes.message);
      return;
    }
    if (player.money < cost) {
      showToast(`Недостаточно средств (${formatMoney(cost, player.currency)})!`);
      return;
    }
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
    const gate = getAgeGate('language_course', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const effectiveCost = getLanguageCourseCost(player, course);
    if (player.money < effectiveCost && player.age < 18) {
      const parentRes = askParentsToPayFor(
        player,
        `Языковой курс «${course.langName}»`,
        effectiveCost,
        'course',
        (s) => takeLanguageCourse({ ...s, money: s.money + effectiveCost }, course)
      );
      setPlayer(parentRes.nextState);
      showToast(parentRes.message);
      return;
    }
    if (player.money < effectiveCost) {
      showToast(`Недостаточно средств (${formatMoney(effectiveCost, player.currency)})!`);
      return;
    }
    setPlayer((prev) => takeLanguageCourse(prev, course));
    showToast(`Пройден языковой курс: ${course.langName} (${course.cefrLabel})!`);
  };

  const handleEnrollUniversity = (uni: UniversityProgram) => {
    const res = enrollInUniversityWithCriteria(player, uni);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleBuyOrEquipTech = (gadget: TechGadgetItem) => {
    const gate = getAgeGate('tech_gadget', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const owned = player.ownedTechGadgetIds.includes(gadget.id);
    if (!owned && player.money < gadget.price) {
      if (player.age < 18) {
        const parentRes = askParentsToPayFor(
          player,
          gadget.name,
          gadget.price,
          'gadget',
          (s) => buyOrEquipTechGadget({ ...s, money: s.money + gadget.price }, gadget)
        );
        setPlayer(parentRes.nextState);
        showToast(parentRes.message);
        return;
      }
      showToast(`Недостаточно средств для покупки «${gadget.name}»!`);
      return;
    }
    setPlayer((prev) => buyOrEquipTechGadget(prev, gadget));
    showToast(`Техника: ${gadget.name}`);
  };

  const handleInstallPcComponent = (component: PcComponentItem) => {
    const gate = getAgeGate('pc_build', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    if (player.money < component.price) {
      showToast(`Недостаточно средств для покупки «${component.name}»!`);
      return;
    }
    setPlayer((prev) => installPcComponent(prev, component));
    showToast(`Установлено в ПК (${component.slotLabel}): ${component.name}`);
  };

  const handleBuyOrUpgradeBusiness = (
    item: BusinessFranchiseItem,
    mode: 'buy' | 'upgrade' | 'branch'
  ) => {
    const gate = getAgeGate('business', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = buyOrUpgradeBusiness(player, item, mode);
    if (next === player) {
      showToast('Недостаточно средств или навыка Финансов для операции с бизнесом!');
      return;
    }
    setPlayer(next);
    showToast(
      mode === 'buy'
        ? `Открыт бизнес: ${item.name}`
        : mode === 'upgrade'
        ? `Бизнес модернизирован: ${item.name}`
        : `Открыт новый филиал: ${item.name}`
    );
  };

  const handleRunPoliticalCampaign = (actionType: 'rally' | 'tv_debate' | 'charity_fund') => {
    const gate = getAgeGate('politics', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = runPoliticalCampaignAction(player, actionType);
    if (next === player) {
      showToast('Недостаточно средств для проведения политической кампании!');
      return;
    }
    setPlayer(next);
    showToast('Политическая кампания проведена! Рейтинг и влияние выросли.');
  };

  const handleElectPoliticalPosition = (pos: PoliticalPosition) => {
    const gate = getAgeGate('politics', player.age);
    if (!gate.allowed || player.age < pos.minAge) {
      showToast(gate.reason || `Доступно с ${pos.minAge} лет`);
      return;
    }
    const next = electPoliticalPosition(player, pos);
    if (next === player) {
      showToast('Не выполнены требования по возрасту, харизме, рейтингу или бюджету!');
      return;
    }
    setPlayer(next);
    showToast(`Поздравляем с избранием на пост: ${pos.title}!`);
  };

  const handleEnactPoliticalReform = (reform: PoliticalReform) => {
    const gate = getAgeGate('politics', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = enactPoliticalReform(player, reform);
    if (next === player) {
      showToast('Недостаточно политического влияния или ранга должности!');
      return;
    }
    setPlayer(next);
    showToast(`Закон принят: ${reform.title}!`);
  };

  const handleToggleHobby = (hobby: HobbyItem) => {
    const isExtreme = hobby.category === 'Экстрим и Уберэкс';
    const gate = getAgeGate(isExtreme ? 'hobby_extreme' : 'hobby_basic', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
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
    if (faction) {
      const gate = getAgeGate('faction', player.age);
      if (!gate.allowed) {
        showToast(gate.reason);
        return;
      }
    }
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
    const gate = getAgeGate('investment', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const asset = INITIAL_INVESTMENTS.find((a) => a.id === assetId);
    if (!asset) return;
    const cost = asset.currentPrice * units;
    if (player.money < cost) {
      showToast(`Недостаточно средств (${formatMoney(cost, player.currency)})!`);
      return;
    }
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
    showToast(`Куплено: ${asset.name} (${units} шт.)`);
  };

  const handleSellInvestment = (assetId: string, units: number) => {
    const gate = getAgeGate('investment', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const asset = INITIAL_INVESTMENTS.find((a) => a.id === assetId);
    if (!asset) return;
    if ((player.investments[assetId] || 0) < units) {
      showToast('У вас нет достаточного количества паёв для продажи!');
      return;
    }
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
    showToast(`Продано: ${asset.name} (${units} шт.)`);
  };

  // Real Estate, Vehicles, Tuning & Relocation handlers
  const handleBuyOrSelectHouse = (house: HouseItem) => {
    if (player.money < 0 && house.id !== 'parents_home') {
      showToast('Долговая яма: при отрицательном балансе аренда и покупка нормального жилья заблокированы!');
      return;
    }
    const owned = player.ownedHouseIds.includes(house.id);
    if (!owned) {
      const gate = getAgeGate('house_buy', player.age);
      if (!gate.allowed) {
        showToast(gate.reason);
        return;
      }
      if (player.money < house.price) {
        showToast('Недостаточно средств для покупки недвижимости!');
        return;
      }
    }
    setPlayer((prev) => {
      const isOwned = prev.ownedHouseIds.includes(house.id);
      if (!isOwned && prev.money < house.price) return prev;
      const nextState: PlayerState = {
        ...prev,
        money: isOwned ? prev.money : prev.money - house.price,
        ownedHouseIds: isOwned ? prev.ownedHouseIds : [...prev.ownedHouseIds, house.id],
        activeHouseId: house.id,
        rentedOutHouseIds: prev.rentedOutHouseIds.filter((id) => id !== house.id),
        chronicle: !isOwned
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
    if (player.age < 18) {
      showToast('Сдача недвижимости в аренду доступна с 18 лет!');
      return;
    }
    setPlayer((prev) => {
      const isRented = prev.rentedOutHouseIds.includes(house.id);
      const nextState: PlayerState = {
        ...prev,
        rentedOutHouseIds: isRented
          ? prev.rentedOutHouseIds.filter((id) => id !== house.id)
          : [...prev.rentedOutHouseIds, house.id],
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      return nextState;
    });
  };

  const handleBuyOrSelectVehicle = (veh: VehicleItem) => {
    const owned = player.ownedVehicleIds.includes(veh.id);
    if (!owned) {
      const gateAction =
        veh.type === 'bicycle'
          ? 'bicycle_buy'
          : veh.type === 'motorcycle'
          ? 'motorcycle_buy'
          : 'vehicle_buy';
      const ageGate = getAgeGate(gateAction, player.age);
      if (!ageGate.allowed) {
        showToast(ageGate.reason || 'Этот транспорт недоступен по возрасту!');
        return;
      }
      if (player.money < veh.price) {
        showToast('Недостаточно средств для покупки транспорта!');
        return;
      }
    }
    setPlayer((prev) => {
      const isOwned = prev.ownedVehicleIds.includes(veh.id);
      if (!isOwned && prev.money < veh.price) return prev;
      const nextState: PlayerState = {
        ...prev,
        money: isOwned ? prev.money : prev.money - veh.price,
        ownedVehicleIds: isOwned ? prev.ownedVehicleIds : [...prev.ownedVehicleIds, veh.id],
        activeVehicleId: veh.id,
        chronicle: !isOwned
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
    const isHouse = tuning.targetType === 'house';
    const minTuneAge = isHouse ? 18 : 16;
    if (player.age < minTuneAge) {
      showToast(`Тюнинг и апгрейд доступны с ${minTuneAge} лет!`);
      return;
    }
    if (player.money < tuning.price) {
      showToast('Недостаточно средств для установки тюнинга!');
      return;
    }
    setPlayer((prev) => {
      if (prev.money < tuning.price) return prev;
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
    const gate = getAgeGate('relocate', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    if (player.money < targetCity.relocationCost) {
      showToast(`Недостаточно средств для переезда (${formatMoney(targetCity.relocationCost, player.currency)})!`);
      return;
    }
    setPlayer((prev) => relocateToCity(prev, targetCity));
    showToast(`Вы переехали в г. ${targetCity.name} (${targetCity.country})!`);
  };

  const handleBuyOrSelectPet = (pet: PetItem | null) => {
    if (!pet) {
      setPlayer((prev) => {
        const nextState: PlayerState = {
          ...prev,
          activePetId: null,
        };
        nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
        return nextState;
      });
      showToast('Вы решили жить без питомца (опционально).');
      return;
    }
    const owned = player.ownedPetIds.includes(pet.id);
    if (!owned && player.age < 18) {
      showToast('До 18 лет попросите родителей завести питомца!');
      return;
    }
    if (!owned && player.money < pet.price) {
      showToast('Недостаточно средств!');
      return;
    }
    setPlayer((prev) => {
      const isOwned = prev.ownedPetIds.includes(pet.id);
      if (!isOwned && prev.money < pet.price) return prev;
      const nextState: PlayerState = {
        ...prev,
        money: isOwned ? prev.money : prev.money - pet.price,
        ownedPetIds: isOwned ? prev.ownedPetIds : [...prev.ownedPetIds, pet.id],
        activePetId: pet.id,
      };
      nextState.monthlyExpenses = calculateMonthlyExpenses(nextState);
      nextState.quests = syncQuestsProgress(nextState);
      return nextState;
    });
    showToast(`Ваш питомец: ${pet.name}`);
  };

  const handleBuyOrToggleBrand = (brand: BrandItem) => {
    if (player.age < 6) {
      showToast('Магазин брендовой одежды доступен с 6 лет!');
      return;
    }
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

  const handleBuyOrEquipWardrobe = (item: WardrobeItem) => {
    const res = buyOrEquipWardrobeItem(player, item);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleToggleMilitaryService = () => {
    const res = toggleMilitaryService(player);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  // Underworld, Steroids, Bad Habits, Crime, Bribes, Casino, Nightlife & Romance handlers
  const handleUseSteroidCycle = (cycle: SteroidCycleItem) => {
    const gate = getAgeGate('steroids', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = useSteroidCycle(player, cycle);
    if (next === player) {
      showToast('Недостаточно средств для покупки курса!');
      return;
    }
    setPlayer(next);
    showToast(`Анаболический курс пройден: ${cycle.name}`);
  };

  const handlePerformHabitAction = (habit: HabitActionItem) => {
    const gate = getAgeGate('habit', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = performHabitAction(player, habit);
    if (next === player) {
      showToast('Недостаточно средств!');
      return;
    }
    setPlayer(next);
    showToast(`${habit.name}: характеристики обновлены`);
  };

  const handleTriggerPeerPressureEvent = () => {
    const gate = getAgeGate('habit', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
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
    const gate = getAgeGate('nightlife', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const next = enjoyNightlifePackage(player, pkg);
    if (next === player) {
      showToast('Недостаточно средств!');
      return;
    }
    setPlayer(next);
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
    if (!member.alive) {
      showToast('Светлая память о родственнике навсегда в вашей летописи.');
      return;
    }
    if (action === 'gift' && player.age < 7) {
      showToast('Дарить подарки за свои деньги можно с 7 лет!');
      return;
    }
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
        moneyDelta = prev.age < 7 ? 0 : supportAmount;
        relDelta = 4;
        text =
          prev.age < 7
            ? `${member.relation} ${member.name} поиграл(а) с вами и окружил(а) заботой.`
            : `${member.relation} ${member.name} поддержал(а) вас советом и перевёл(а) ${formatMoney(supportAmount, prev.currency)} на расходы.`;
      }

      const nextFamily = prev.family.map((f) =>
        f.id === member.id
          ? { ...f, relationship: clampStat(f.relationship + relDelta) }
          : f
      );

      const nextMemory = appendAiMemory(
        prev,
        `Семья (${member.relation} ${member.name})`,
        text,
        'choice'
      );

      return {
        ...prev,
        money: prev.money + moneyDelta,
        relations: clampStat(prev.relations + Math.round(relDelta / 2)),
        happiness: clampStat(prev.happiness + 5),
        family: nextFamily,
        aiMemory: nextMemory,
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
    const gate = getAgeGate(mode === 'collab' ? 'artist_collab' : 'artist_concert', player.age);
    if (!gate.allowed) {
      showToast(gate.reason);
      return;
    }
    const cost = mode === 'concert' ? artist.ticketPrice : artist.collabPrice;
    if (player.money < cost) {
      showToast(`Недостаточно средств (${formatMoney(cost, player.currency)})!`);
      return;
    }
    setPlayer((prev) => {
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
    const targetNpcId = npc.id;

    const applyNpcResult = (
      replyText: string,
      relationDelta: number,
      happinessDelta: number,
      moodReaction: string
    ) => {
      setLastNpcReaction(moodReaction);
      setPlayer((prev) => {
        const nextMem = appendAiMemory(
          prev,
          `Разговор с ${npc.name}: «${userMessage.slice(0, 60)}»`,
          `${npc.name} ответил: «${replyText.slice(0, 80)}» (Отношения +${relationDelta})`,
          'choice'
        );
        return {
          ...prev,
          happiness: clampStat(prev.happiness + happinessDelta),
          relations: clampStat(prev.relations + relationDelta),
          aiMemory: nextMem,
          friends: prev.friends.map((f) => {
            if (f.id !== targetNpcId) return f;
            const prevHistory = f.dialogueHistory || [];
            const nextHistory = [
              ...prevHistory.slice(-14),
              { sender: 'player' as const, text: userMessage, age: prev.age, year: prev.currentYear },
              { sender: 'npc' as const, text: replyText, age: prev.age, year: prev.currentYear },
            ];
            return {
              ...f,
              relationship: clampStat(f.relationship + relationDelta),
              lastMessage: replyText,
              dialogueHistory: nextHistory,
            };
          }),
        };
      });
    };

    const isBrowserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (player.offlineAiMode || isBrowserOffline) {
      const localRes = generateOfflineNpcDialogue(player, targetNpcId, userMessage);
      applyNpcResult(
        localRes.reply,
        localRes.relationDelta,
        localRes.happinessDelta,
        localRes.moodReaction
      );
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
          playerAge: player.age,
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
          playerMessage: userMessage,
          coreBiographySummary: player.aiMemory.coreBiographySummary,
          aiMemoryEntries: player.aiMemory.entries.slice(0, 8),
          dialogueHistory: npc.dialogueHistory || [],
        }),
      });
      const data = await res.json();
      if (data && !data.fallback && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        applyNpcResult(
          data.reply,
          typeof data.relationDelta === 'number' ? data.relationDelta : 5,
          typeof data.happinessDelta === 'number' ? data.happinessDelta : 4,
          data.moodReaction || 'Отвечает с учётом памяти'
        );
      } else {
        const fallback = generateOfflineNpcDialogue(player, targetNpcId, userMessage);
        applyNpcResult(
          fallback.reply,
          fallback.relationDelta,
          fallback.happinessDelta,
          fallback.moodReaction
        );
      }
    } catch {
      const fallback = generateOfflineNpcDialogue(player, targetNpcId, userMessage);
      applyNpcResult(
        fallback.reply,
        fallback.relationDelta,
        fallback.happinessDelta,
        fallback.moodReaction
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateAiEvent = async () => {
    const isBrowserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (player.offlineAiMode || isBrowserOffline) {
      const contextualEvent = generateContextualAiLifeEvent(player);
      setPlayer((prev) => ({
        ...prev,
        activePendingEvent: contextualEvent,
        aiMemory: {
          ...prev.aiMemory,
          lastEventId: contextualEvent.id,
        },
      }));
      showToast('Сгенерировано автономное ИИ-событие на основе памяти ДО и ПОСЛЕ!');
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
          playerAge: player.age,
          city: player.city.name,
          country: player.city.country,
          season: player.season,
          weather: player.weather,
          focus: player.focus,
          careerTitle: player.currentCareerId || 'Свободный исследователь',
          urbexSubscribers: player.urbexSubscribers,
          storyArc: player.storyArc,
          storyHistory: player.storyHistory,
          coreBiographySummary: player.aiMemory.coreBiographySummary,
          aiMemoryEntries: player.aiMemory.entries.slice(0, 8),
          skills: player.skills,
          familySummary: player.family
            .map((m) => `${m.relation} ${m.name} (${m.profession})`)
            .join(', '),
        }),
      });
      const data = await res.json();
      const rawChoices = Array.isArray(data?.choices)
        ? data.choices
        : [data?.choiceA, data?.choiceB, data?.choiceC].filter(Boolean);
      if (data && !data.fallback && data.title && rawChoices && rawChoices.length >= 2) {
        const aiEvent: LifeEventTemplate = {
          id: `ai_ev_${Date.now()}`,
          title: data.title,
          description: data.description,
          minAge: 0,
          maxAge: 99,
          choices: rawChoices,
        };
        setPlayer((prev) => ({
          ...prev,
          activePendingEvent: aiEvent,
          aiMemory: {
            ...prev.aiMemory,
            lastEventId: aiEvent.id,
          },
        }));
      } else {
        const contextualEvent = generateContextualAiLifeEvent(player);
        setPlayer((prev) => ({
          ...prev,
          activePendingEvent: contextualEvent,
          aiMemory: {
            ...prev.aiMemory,
            lastEventId: contextualEvent.id,
          },
        }));
      }
    } catch {
      const contextualEvent = generateContextualAiLifeEvent(player);
      setPlayer((prev) => ({
        ...prev,
        activePendingEvent: contextualEvent,
        aiMemory: {
          ...prev.aiMemory,
          lastEventId: contextualEvent.id,
        },
      }));
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
    const target = player.quests.find((item) => item.id === questId);
    if (!target || !target.completed || target.claimed) return;
    setPlayer((prev) => {
      const q = prev.quests.find((item) => item.id === questId);
      if (!q || !q.completed || q.claimed) return prev;
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
        chronicle: [
          {
            id: `quest_${Date.now()}`,
            age: prev.age,
            year: prev.currentYear,
            season: prev.season,
            weather: prev.weather,
            text: `Выполнена жизненная цель «${q.title}»! Награда: +${formatMoney(q.rewardMoney, prev.currency)}.`,
            starred: true,
            category: 'life',
          },
          ...prev.chronicle,
        ],
      };
    });
    showToast(`Награда получена: «${target.title}» (+${formatMoney(target.rewardMoney, player.currency)})`);
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
  body { background:#F4EFE6; color:#2C2523; font-family:system-ui,-apple-system,sans-serif; padding:24px; max-width:640px; margin:0 auto; }
  .card { background:#FAF7F2; border:1px solid #DCD3C2; border-radius:16px; padding:20px; margin-bottom:16px; }
  .badge { display:inline-block; background:#2E6F5E1F; color:#2E6F5E; border:1px solid #2E6F5E55; padding:4px 10px; border-radius:8px; font-size:12px; font-family:monospace; font-weight:bold; }
  h1 { margin:10px 0 6px; font-size:22px; color:#2C2523; }
  pre { background:#FFFFFF; border:1px solid #DCD3C2; padding:12px; border-radius:10px; overflow:auto; max-height:260px; font-size:11px; color:#6E655F; }
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
          const normalized = normalizeLoadedPlayerState(parsed);
          setPlayer(normalized);
          setSelectedNpcId(normalized.friends[0]?.id || 'npc_carlos');
          setShowAllChronicle(false);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          showToast(`Сохранение «${normalized.name}» (${normalized.age} лет) успешно загружено!`);
          setShowApkModal(false);
        } else {
          showToast('Некорректная структура файла сохранения!');
        }
      } catch {
        showToast('Ошибка при чтении JSON-файла сохранения!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTreatIllness = (mode: 'private_clinic' | 'public_hospital') => {
    const res = treatIllnessOrInjury(player, mode);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleToggleFrontline = () => {
    const res = toggleFrontlineDeployment(player);
    setPlayer(res.nextState);
    showToast(res.summaryText);
  };

  const handleScaledStatTrain = (
    statKey: keyof PlayerState['skills'],
    label: string
  ) => {
    const res = executeScaledStatTraining(player, statKey, label);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleTriggerIncomingNpcChat = () => {
    const thread = pickProactiveNpcChat(player);
    setNpcReplyBranchIdx(null);
    setPlayer((prev) => ({
      ...prev,
      activeIncomingNpcChat: thread,
      usedEventIds: [...(prev.usedEventIds || []).slice(-34), thread.id],
    }));
  };

  const handleFinishIncomingNpcChat = (choiceIdx: number) => {
    if (!player.activeIncomingNpcChat) return;
    const res = resolveProactiveNpcChatFinal(
      player,
      player.activeIncomingNpcChat.id,
      npcReplyBranchIdx ?? 0,
      choiceIdx
    );
    setNpcReplyBranchIdx(null);
    setPlayer(res.nextState);
    showToast(res.message);
  };

  const handleOpenGradeMinigame = (category: 'it' | 'blog' | 'business') => {
    setGradeMinigameModal({
      category,
      timerLeft: 10,
      timingCursor: 52,
      selectedTagBonus: 15,
      bargainDiscount: 0,
      bargainUsedSteps: [],
      legitChecked: false,
    });
  };

  const handleCompleteGradeMinigame = (
    category: 'it' | 'blog' | 'business',
    gradeLevel: 1 | 2 | 3,
    won: boolean,
    customSummary?: string
  ) => {
    const tierTitle =
      customSummary ||
      (category === 'it'
        ? `IT Грейд ${gradeLevel}`
        : category === 'blog'
        ? `Блогинг Грейд ${gradeLevel}`
        : `Бизнес Грейд ${gradeLevel}`);
    const res = resolveGradeProfessionMinigame(player, category, tierTitle, won, 1 + gradeLevel * 0.25);
    setPlayer(res.nextState);
    setGradeMinigameModal(null);
    showToast(res.message);
  };

  // Timer & Timing Bar animation for active Grade Profession Mini-Game Modal
  useEffect(() => {
    if (!gradeMinigameModal) return;
    const interval = window.setInterval(() => {
      setGradeMinigameModal((prev) => {
        if (!prev) return null;
        const nextCursor = (prev.timingCursor + 7) % 100;
        const nextTimer = prev.timerLeft > 0 ? prev.timerLeft - 1 : 0;
        return {
          ...prev,
          timingCursor: nextCursor,
          timerLeft: nextTimer,
        };
      });
    }, 350);
    return () => window.clearInterval(interval);
  }, [gradeMinigameModal !== null]);

  const bonuses = calculateActiveBonuses(player);
  const bizSummary = calculateMonthlyBusinessSummary(player);
  const autoCtx = resolveCharacterAutoContext(player);
  const locationScene = resolveCharacterLocationScene(player);
  const activeCareerObj = player.currentCareerId
    ? CAREERS_CATALOG.find((c) => c.id === player.currentCareerId) || null
    : null;
  const energyStat = clampStat(
    100 - Math.round((player.stress || 0) * 0.75) - ((player.stress || 0) > 80 ? 20 : 0)
  );
  const seasonalHeroGradient =
    player.season === 'Зима'
      ? 'linear-gradient(180deg, #D8E2EB 0%, #FAF7F2 100%)'
      : player.season === 'Весна'
      ? 'linear-gradient(180deg, #E2EFE0 0%, #FAF7F2 100%)'
      : player.season === 'Лето'
      ? 'linear-gradient(180deg, #F9E8C9 0%, #FAF7F2 100%)'
      : 'linear-gradient(180deg, #EBD8C3 0%, #FAF7F2 100%)';
  const currentRoleLabel = player.militaryServiceActive
    ? player.frontlineActive
      ? 'Передовая / Блиндаж'
      : 'Военная база / Казарма'
    : activeCareerObj
    ? `${activeCareerObj.title} (${activeCareerObj.sector})`
    : player.age <= 2
    ? 'Младенец в семье'
    : player.age <= 6
    ? 'Дошкольник'
    : player.age <= 17
    ? `Ученик школы (балл ${player.schoolGradeAvg.toFixed(1)}/12)`
    : player.ownedBusinesses.length > 0
    ? `Владелец бизнеса (${player.ownedBusinesses.length} комп.)`
    : 'Свободный горожанин';

  const availableFocusOptions = ALL_FOCUS_OPTIONS.filter((opt) => {
    if (player.age <= 5) return opt.minAge === 0;
    return opt.minAge >= 6 && opt.minAge <= player.age;
  });
  const currentFocusMeta =
    availableFocusOptions.find((f) => f.value === player.focus) ||
    ALL_FOCUS_OPTIONS.find((f) => f.value === player.focus) ||
    availableFocusOptions[0];

  const MONTH_NAMES = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2C2523] font-sans pb-32 sm:pb-24">
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
        <div className="fixed inset-0 z-50 bg-[#2C2523]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl p-6 space-y-4 shadow-xl text-[#2C2523]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2E6F5E]/12 text-[#2E6F5E] text-xs font-mono font-bold">
                <Smartphone className="w-3.5 h-3.5" /> 100% АВТОНОМНЫЙ APK / ОФФЛАЙН РЕЖИМ
              </div>
              <button
                type="button"
                onClick={() => setShowApkModal(false)}
                className="p-1.5 rounded-lg bg-[#EFE8DC] text-[#2C2523] hover:bg-[#E5DEC9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-display font-bold text-[#2C2523]">
              Установка Life Simulator EX на телефон (Без серверов и интернета)
            </h2>
            <p className="text-xs text-[#6E655F] leading-relaxed">
              Игра полностью автономна: встроенный лёгкий ИИ с памятью ДО/ПОСЛЕ, все 27 стран с Топ-10 ВУЗами, 640 профессий, гардероб и автосохранение работают прямо на вашем телефоне без интернета.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleInstallNativePwa}
                className="w-full py-3 px-4 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Установить приложение на телефон (WebAPK / Нативная иконка)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportSaveJson}
                  className="py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#2E6F5E] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Экспорт сейва (.JSON)
                </button>
                <label className="py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#3B5B76] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" /> Импорт сейва (.JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSaveJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#2C2523] flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-[#2E6F5E]" />
                    <span>Автономный ИИ-движок</span>
                  </div>
                  <div className="text-[11px] text-[#6E655F] mt-0.5">
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
                      ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                      : 'bg-[#EFE8DC] text-[#2C2523]'
                  }`}
                >
                  {player.offlineAiMode ? '✓ ОФФЛАЙН' : 'ОБЛАКО'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadStandaloneLauncher}
                className="w-full py-2 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#2C2523] font-medium text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6F5E]" />
                Скачать автономный HTML-лаунчер
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastBanner && (
        <div className="fixed bottom-28 sm:bottom-20 left-3 right-3 sm:left-auto sm:right-4 z-40 sm:max-w-md px-4 py-3 rounded-xl bg-[#2E6F5E] text-[#FAF7F2] font-semibold text-xs shadow-lg break-words">
          {toastBanner}
        </div>
      )}

      {/* Interactive Story Branching Event Modal */}
      {player.activePendingEvent && (
        <div className="fixed inset-0 z-40 bg-[#2C2523]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl p-6 shadow-xl space-y-4 text-[#2C2523]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2E6F5E]/12 text-[#2E6F5E] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Событие судьбы ({player.age} лет · {player.season}, {player.weather})
            </div>
            <h2 className="text-xl font-display font-bold text-[#2C2523]">
              {player.activePendingEvent.title}
            </h2>
            <p className="text-sm text-[#6E655F] leading-relaxed">
              {player.activePendingEvent.description}
            </p>
            <div className="space-y-2.5 pt-2">
              {player.activePendingEvent.choices.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleResolveEventChoice(ch)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] hover:border-[#2E6F5E] transition cursor-pointer shadow-2xs"
                >
                  <div className="text-sm font-bold text-[#2C2523]">{ch.label}</div>
                  {ch.nextStoryArc && (
                    <div className="text-[11px] font-mono text-[#2E6F5E] mt-1">
                      Запись в память ИИ (ПОСЛЕ): «{ch.nextStoryArc}»
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proactive Incoming NPC Live Messenger Modal (NPCs Write First!) */}
      {player.activeIncomingNpcChat && (
        <div className="fixed inset-0 z-40 bg-[#2C2523]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl p-5 shadow-xl space-y-3.5 text-[#2C2523]">
            <div className="flex items-center justify-between border-b border-[#DCD3C2] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#2E6F5E]/15 border border-[#2E6F5E]/40 flex items-center justify-center text-lg">
                  💬
                </div>
                <div>
                  <div className="text-sm font-display font-extrabold text-[#2C2523]">
                    {player.activeIncomingNpcChat.senderName}
                  </div>
                  <div className="text-[11px] font-mono text-[#2E6F5E]">
                    {player.activeIncomingNpcChat.senderRole} · Входящее сообщение в мессенджер
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNpcReplyBranchIdx(null);
                  setPlayer((prev) => ({ ...prev, activeIncomingNpcChat: null }));
                }}
                className="p-1.5 rounded-lg bg-[#EFE8DC] text-[#2C2523] hover:bg-[#E5DEC9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat History Container */}
            <div className="bg-[#F4EFE6] border border-[#DCD3C2] rounded-xl p-3.5 space-y-2.5 max-h-72 overflow-y-auto">
              {/* Step 1: NPC Opening Message */}
              <div className="max-w-[88%] bg-[#FFFFFF] border border-[#DCD3C2] rounded-2xl rounded-tl-xs p-3 text-xs text-[#2C2523] leading-relaxed shadow-2xs">
                <div className="text-[10px] font-mono font-bold text-[#2E6F5E] mb-1">
                  {player.activeIncomingNpcChat.senderName}
                </div>
                {player.activeIncomingNpcChat.openingMessage}
              </div>

              {/* Step 2: Player Reply + NPC Follow-up */}
              {npcReplyBranchIdx !== null &&
                player.activeIncomingNpcChat.branches[npcReplyBranchIdx] && (
                  <>
                    <div className="ml-auto max-w-[85%] bg-[#2E6F5E] text-[#FAF7F2] rounded-2xl rounded-tr-xs p-3 text-xs leading-relaxed shadow-2xs">
                      <div className="text-[10px] font-mono opacity-80 mb-0.5">Вы</div>
                      {player.activeIncomingNpcChat.branches[npcReplyBranchIdx].playerReply}
                    </div>
                    <div className="max-w-[88%] bg-[#FFFFFF] border border-[#DCD3C2] rounded-2xl rounded-tl-xs p-3 text-xs text-[#2C2523] leading-relaxed shadow-2xs">
                      <div className="text-[10px] font-mono font-bold text-[#2E6F5E] mb-1">
                        {player.activeIncomingNpcChat.senderName}
                      </div>
                      {player.activeIncomingNpcChat.branches[npcReplyBranchIdx].npcFollowUp}
                    </div>
                  </>
                )}
            </div>

            {/* Step Action Buttons */}
            {npcReplyBranchIdx === null ? (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#6E655F]">
                  Шаг 1 из 2 — Выберите ваш ответ в чате:
                </div>
                {player.activeIncomingNpcChat.branches.map((br, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNpcReplyBranchIdx(idx)}
                    className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] hover:border-[#2E6F5E] text-xs font-bold text-[#2C2523] transition cursor-pointer"
                  >
                    💬 {br.playerReply}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#2E6F5E] font-bold">
                  Шаг 2 из 2 — Итоговое решение по диалогу:
                </div>
                {player.activeIncomingNpcChat.branches[npcReplyBranchIdx]?.finalChoices.map(
                  (fc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFinishIncomingNpcChat(idx)}
                      className="w-full text-left p-3 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-xs font-bold transition cursor-pointer"
                    >
                      ✓ {fc.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade-Dependent Profession Mini-Game Modal (IT, Blogging, Business) */}
      {gradeMinigameModal && (
        <div className="fixed inset-0 z-40 bg-[#2C2523]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl p-5 shadow-xl space-y-4 text-[#2C2523]">
            {(() => {
              const cat = gradeMinigameModal.category;
              const itGrade: 1 | 2 | 3 =
                player.skills.intellect >= 75
                  ? 3
                  : player.skills.intellect >= 40
                  ? 2
                  : 1;
              const blogGrade: 1 | 2 | 3 =
                player.urbexSubscribers >= 100000
                  ? 3
                  : player.urbexSubscribers >= 10000
                  ? 2
                  : 1;
              const bizGrade: 1 | 2 = player.ownedBusinesses.length > 0 ? 2 : 1;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#DCD3C2] pb-2.5">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-[#2E6F5E]/15 text-[#2E6F5E] text-[10px] font-mono font-bold">
                        {cat === 'it'
                          ? `💻 IT И ИНЖЕНЕРИЯ · ГРЕЙД ${
                              itGrade === 1
                                ? 'TRAINEE / JUNIOR'
                                : itGrade === 2
                                ? 'MIDDLE / SENIOR'
                                : 'TEAM LEAD / CTO'
                            }`
                          : cat === 'blog'
                          ? `📹 БЛОГИНГ И МЕДИА · ГРЕЙД ${
                              blogGrade === 1
                                ? 'НОВИЧОК (0–10К САБОВ)'
                                : blogGrade === 2
                                ? 'ИНФЛЮЕНСЕР (10К–100К)'
                                : 'МЕДИА-МАГНАТ (100К+)'
                            }`
                          : `🏢 БИЗНЕС И РЕСЕЙЛ · ГРЕЙД ${
                              bizGrade === 1 ? 'ПЕРЕКУП / СТАРТАПЕР' : 'ВЛАДЕЛЕЦ БИЗНЕСА / CEO'
                            }`}
                      </span>
                      <h3 className="text-base font-display font-extrabold text-[#2C2523] mt-1">
                        {cat === 'it'
                          ? itGrade === 1
                            ? 'Мини-игра «Баг-хантинг на время»'
                            : itGrade === 2
                            ? 'Мини-игра «Архитектура и Защита от DDoS»'
                            : 'Мини-игра «Менеджмент Релиза»'
                          : cat === 'blog'
                          ? blogGrade === 1
                            ? 'Мини-игра «Удержание и Монтаж (Timing Bar)»'
                            : blogGrade === 2
                            ? 'Мини-игра «Торг с рекламодателем»'
                            : 'Мини-игра «Управление сеткой каналов»'
                          : bizGrade === 1
                          ? 'Мини-игра «Жесткий торг и Legit Check»'
                          : 'Мини-игра «Антикризисное управление CEO»'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGradeMinigameModal(null)}
                      className="p-1.5 rounded-lg bg-[#EFE8DC] text-[#2C2523] hover:bg-[#E5DEC9] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* IT Grade 1: Bug Hunting */}
                  {cat === 'it' && itGrade === 1 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#6E655F]">Найдите строку с критическим багом:</span>
                        <span className="px-2 py-0.5 rounded bg-[#B84A39]/15 text-[#B84A39] font-bold">
                          ⏱️ Таймер: {gradeMinigameModal.timerLeft} сек
                        </span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteGradeMinigame('it', 1, false, 'Строка 1 корректна — прод упал из-за цикла!')
                          }
                          className="w-full text-left p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                        >
                          1: const calculateTax = (income) =&gt; {'{'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteGradeMinigame(
                              'it',
                              1,
                              gradeMinigameModal.timerLeft > 0,
                              'Баг i <= arr.length (Out-Of-Bounds) устранён до падения прода!'
                            )
                          }
                          className="w-full text-left p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                        >
                          2: for (let i = 0; i &lt;= income.length; i++) {'{'} // BUG?
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteGradeMinigame('it', 1, false, 'Строка 3 корректна — вы пропустили ошибку индексации!')
                          }
                          className="w-full text-left p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                        >
                          3: total += Number(income[i] || 0) * 0.13;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* IT Grade 2: Middle/Senior Architecture */}
                  {cat === 'it' && itGrade === 2 && (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-[#6E655F]">
                        На кластер БД идёт DDoS-атака (180 000 RPS), а запрос аналитики выполняется за O(n²). Выберите архитектурное решение:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'it',
                            2,
                            true,
                            'Включён Redis-кэш + Rate Limiter на балансировщике и индекс в PostgreSQL (аптайм 99.99%)!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-bold cursor-pointer"
                      >
                        🛡️ Поднять Redis-кэш + Rate Limiting и добавить композитный индекс БД
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'it',
                            2,
                            false,
                            'Ручной перезапуск контейнеров под DDoS уронил мастер-базу!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                      >
                        ⚠️ Перезапустить все поды Kubernetes вручную без лимитов трафика
                      </button>
                    </div>
                  )}

                  {/* IT Grade 3: Team Lead / CTO */}
                  {cat === 'it' && itGrade === 3 && (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-[#6E655F]">
                        До релиза 4 часа: Senior-архитектор требует отложить деплой, а QA нашли плавающий баг оплаты. Ваше решение как CTO/Team Lead:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'it',
                            3,
                            true,
                            'Канареечный релиз под Feature Flag на 5% трафика спас дедлайн и нервы команды!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-bold cursor-pointer"
                      >
                        🚀 Выкатить под Feature Flag (Canary 5% трафика) и закрыть хотфиксом утром
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'it',
                            3,
                            false,
                            'Ночной кранч привёл к выгоранию разработчиков и срыву SLA!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                      >
                        🔥 Заставить всю команду пилить код всю ночь без тестов
                      </button>
                    </div>
                  )}

                  {/* Blog Grade 1: Timing Bar + Tag */}
                  {cat === 'blog' && blogGrade === 1 && (
                    <div className="space-y-3 text-xs">
                      <p className="text-[#6E655F]">
                        Поймайте бегунок склейки в зеленой зоне удержания (35%–75%), чтобы ролик залетел в рекомендации:
                      </p>
                      <div className="relative w-full h-6 bg-[#EAE3D5] rounded-full overflow-hidden border border-[#DCD3C2]">
                        <div
                          className="absolute top-0 bottom-0 bg-[#2E6F5E]/35 border-x border-[#2E6F5E]"
                          style={{ left: '35%', width: '40%' }}
                        />
                        <div
                          className="decode-cursor absolute top-0 bottom-0 w-3 bg-[#C87A3E] rounded-full transition-all"
                          style={{ left: `${gradeMinigameModal.timingCursor}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const inZone =
                            gradeMinigameModal.timingCursor >= 35 &&
                            gradeMinigameModal.timingCursor <= 75;
                          handleCompleteGradeMinigame(
                            'blog',
                            1,
                            inZone,
                            inZone
                              ? 'Идеальный тайминг склейки! Удержание аудитории 84%, ролик залетел в реки!'
                              : 'Склейка мимо ритма — зрители пролистнули ролик на 3-й секунде.'
                          );
                        }}
                        className="w-full py-3 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-bold cursor-pointer"
                      >
                        ✂️ Сделать склейку СЕЙЧАС (Курсор: {gradeMinigameModal.timingCursor}%)
                      </button>
                    </div>
                  )}

                  {/* Blog Grade 2: Influencer Sponsor Negotiation */}
                  {cat === 'blog' && blogGrade === 2 && (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-[#6E655F]">
                        Бренд гаджетов предлагает базовый чек за интеграцию. Как проведёте переговоры?
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'blog',
                            2,
                            true,
                            'Вы предоставили медиакит с высоким ER и выбили ставку ×1.8 с нативной подачей!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-bold cursor-pointer"
                      >
                        📈 Показать аналитику удержания и выбить чек ×1.8 за нативный скетч
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'blog',
                            2,
                            false,
                            'Агрессивный ультиматум ×3 сорвал рекламный контракт!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                      >
                        💣 Потребовать ×3 предоплатой без правок или пригрозить антирекламой
                      </button>
                    </div>
                  )}

                  {/* Blog Grade 3: Media Tycoon */}
                  {cat === 'blog' && blogGrade === 3 && (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-[#6E655F]">
                        Ваша сетка из 5 каналов (100к+ сабов) под атакой ботов, а монтажёры просят перераспределить бюджет:
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'blog',
                            3,
                            true,
                            'Авто-фильтрация комментариев + бонусы монтажёрам за KPI удвоили охваты сетки!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-bold cursor-pointer"
                      >
                        🌐 Включить анти-спам шлюз и перевести монтажёров на бонус за удержание
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'blog',
                            3,
                            false,
                            'Урезание ставок монтажёрам привело к утечке команды к конкурентам!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                      >
                        ✂️ Урезать бюджет продакшна на 50% ради быстрой маржи
                      </button>
                    </div>
                  )}

                  {/* Business Grade 1: Reseller / Startup 3-Step Bargaining + Legit Check */}
                  {cat === 'business' && bizGrade === 1 && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span>Текущая скидка поставщика: -{gradeMinigameModal.bargainDiscount}%</span>
                        <span>
                          Legit Check:{' '}
                          {gradeMinigameModal.legitChecked ? '✅ Оригинал подтверждён' : '⚠️ Не проверено'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setGradeMinigameModal((prev) =>
                              prev && !prev.bargainUsedSteps.includes(1)
                                ? {
                                    ...prev,
                                    bargainDiscount: prev.bargainDiscount + 12,
                                    bargainUsedSteps: [...prev.bargainUsedSteps, 1],
                                  }
                                : prev
                            )
                          }
                          className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-semibold cursor-pointer"
                        >
                          🔍 Указать на микро-царапину коробки (-12%)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGradeMinigameModal((prev) =>
                              prev && !prev.bargainUsedSteps.includes(2)
                                ? {
                                    ...prev,
                                    bargainDiscount: prev.bargainDiscount + 15,
                                    bargainUsedSteps: [...prev.bargainUsedSteps, 2],
                                  }
                                : prev
                            )
                          }
                          className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-semibold cursor-pointer"
                        >
                          💵 Предложить нал здесь и сейчас (-15%)
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setGradeMinigameModal((prev) =>
                            prev ? { ...prev, legitChecked: true } : prev
                          )
                        }
                        className="w-full py-2 px-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-mono font-bold text-[#2E6F5E] cursor-pointer"
                      >
                        🔦 Просветить УФ-лампой бирки и серийник (Legit Check)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'business',
                            1,
                            gradeMinigameModal.legitChecked && gradeMinigameModal.bargainDiscount >= 12,
                            gradeMinigameModal.legitChecked
                              ? `Партия проверена УФ-лампой и выкуплена со скидкой -${gradeMinigameModal.bargainDiscount}%!`
                              : 'Вы купили партию без Legit Check — внутри оказалась паль!'
                          )
                        }
                        className="w-full py-2.5 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-bold cursor-pointer"
                      >
                        🤝 Закрыть сделку и зафиксировать маржу
                      </button>
                    </div>
                  )}

                  {/* Business Grade 2: CEO Anti-Crisis */}
                  {cat === 'business' && bizGrade === 2 && (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-[#6E655F]">
                        Кассовый разрыв и внеплановая налоговая проверка сети. Как распределите ресурсы компании?
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'business',
                            2,
                            true,
                            'Факторинг + аудит первички и сохранение ключевого штата вывели сеть в рекордный плюс!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] font-bold cursor-pointer"
                      >
                        📊 Включить факторинг дебиторки, пройти белый аудит и удержать ФОТ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteGradeMinigame(
                            'business',
                            2,
                            false,
                            'Серые схемы при проверке привели к блокировке счетов и штрафу!'
                          )
                        }
                        className="w-full text-left p-3 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] cursor-pointer"
                      >
                        🕶️ Спрятать выручку в серый нал и задержать зарплату сотрудникам
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Hardcore Bankruptcy / Game Over Modal */}
      {!player.isAlive && (
        <div className="fixed inset-0 z-50 bg-[#2C2523]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF7F2] border border-[#B84A39] rounded-2xl p-6 text-center space-y-4 shadow-xl text-[#2C2523]">
            <div className="w-12 h-12 rounded-full bg-[#B84A39]/15 border border-[#B84A39]/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-[#B84A39]" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-[#2C2523]">
              {player.isBankrupt ? 'ФИНАНСОВОЕ БАНКРОТСТВО' : 'ЖИЗНЕННЫЙ ПУТЬ ЗАВЕРШЁН'}
            </h2>
            <p className="text-sm text-[#6E655F]">
              {player.causeOfEnd || 'Ваша история подошла к концу.'}
            </p>
            <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] text-xs font-mono text-[#2C2523] space-y-1">
              <div>Персонаж: {player.name} ({player.age} лет)</div>
              <div>Город: {player.city.name}, {player.city.country}</div>
              <div>Итоговый баланс: {formatMoney(player.money, player.currency)}</div>
              <div>Финальная глава: {player.storyArc}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowTitleModal(true)}
              className="w-full py-3 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-bold text-sm cursor-pointer"
            >
              Начать новую жизнь (с 0 лет)
            </button>
          </div>
        </div>
      )}

      {/* Main Centered Container (Warm Cream Card Dashboard) */}
      <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-3 space-y-3.5">
        {/* Top Bar: App Title, Balance & Quick Actions */}
        <header className="bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E6F5E] flex items-center justify-center font-display font-extrabold text-xs text-[#FAF7F2]">
              EX
            </div>
            <div>
              <div className="text-xs font-display font-extrabold tracking-wider text-[#2C2523] uppercase flex items-center gap-2">
                <span>LIFE SIMULATOR <span className="text-[#2E6F5E]">EX</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2E6F5E]/12 text-[#2E6F5E] border border-[#2E6F5E]/30">
                  WARM PAPER UI
                </span>
              </div>
              <div className="text-[11px] text-[#6E655F] font-medium truncate max-w-xs sm:max-w-md">
                {player.storyArc}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs font-mono">
              Капитал:{' '}
              <span className={player.money < 0 ? 'text-[#B84A39] font-bold' : 'text-[#C87A3E] font-bold'}>
                {formatMoney(player.money, player.currency)}
              </span>
              {bizSummary.netMonthlyProfit > 0 && (
                <span className="text-[#2E6F5E] ml-1.5 hidden sm:inline">
                  (+{formatMoney(bizSummary.netMonthlyProfit, player.currency)}/м)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowApkModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-xs font-semibold text-[#2E6F5E] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5" /> APK / Сейв
            </button>
            <button
              type="button"
              onClick={() => setShowTitleModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-xs font-semibold text-[#2C2523] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#2E6F5E]" /> Новая жизнь (0 лет)
            </button>
          </div>
        </header>

        {/* HERO CARD: 2.5D Blocky-Vector Character Avatar + Contextual Location Scene (Left) + Identity & 2x2 Stat Cards (Right) */}
        <section
          className="border border-[#DCD3C2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors duration-500"
          style={{ background: seasonalHeroGradient }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Left: Contextual Location Scene + 2.5D Character Frame */}
            <div className="md:col-span-4 bg-[#FAF7F2]/90 border border-[#DCD3C2] rounded-2xl p-3 flex flex-col items-center justify-between gap-2">
              <div className="w-full flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-[#6E655F]">
                <span className="font-bold text-[#2C2523]">
                  {locationScene.locationTitle}
                </span>
                <span className="text-[#2E6F5E] font-semibold">
                  {player.season === 'Зима'
                    ? '❄️ Зима'
                    : player.season === 'Весна'
                    ? '🌱 Весна'
                    : player.season === 'Лето'
                    ? '☀️ Лето'
                    : '🍂 Осень'}{' '}
                  · {player.weather}
                </span>
              </div>

              <div className="w-full">
                <CharacterSceneStage
                  locationId={locationScene.locationId}
                  season={player.season}
                  weather={player.weather}
                  appearance={player.appearance}
                  age={player.age}
                  strength={player.skills.strength}
                  muscleMass={player.skills.muscleMass}
                  facialHairId={player.facialHairId}
                  hasInjury={player.hasInjury}
                  contextMode={autoCtx.contextMode}
                  outfitCategory={autoCtx.outfitCategory}
                  suitColorOverride={autoCtx.suitColor}
                  tieColorOverride={autoCtx.tieColor}
                  handItem={autoCtx.handItem}
                  hasWatch={autoCtx.hasWatch}
                  hasGlassesOverride={autoCtx.hasGlasses}
                />
              </div>

              <div className="w-full space-y-1.5">
                <div className="px-2.5 py-1 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] text-[10px] font-mono text-[#6E655F] text-center leading-snug">
                  {locationScene.locationSubtitle}
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] text-[10px] font-mono text-[#2C2523] text-center leading-snug">
                  {autoCtx.contextLabel}
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchBottomNav('assets')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[11px] font-bold text-[#2E6F5E] transition cursor-pointer whitespace-nowrap"
                >
                  👔 Гардероб и Магазин одежды
                </button>
              </div>
            </div>

            {/* Right: Character Identity, Role Badge & 2x2 Grid of 4 Stat Cards */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-3">
              {/* Top Identity Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#2C2523] tracking-tight">
                      {player.name}
                    </h1>
                    <div className="text-xs text-[#6E655F] font-medium flex flex-wrap items-center gap-2 mt-0.5">
                      <span>📍 {player.city.name}, {player.city.country}</span>
                      <span>•</span>
                      <span>
                        📅 {MONTH_NAMES[(player.monthOfYear - 1) % 12]} {player.currentYear} г. ({player.dayOfMonth}-е число)
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[#2E6F5E] font-semibold">Поколение I</span>
                    </div>
                  </div>

                  {/* Turn Step Selector */}
                  <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#DCD3C2]">
                    <span className="text-[11px] font-mono text-[#6E655F] px-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#2E6F5E]" /> Шаг:
                    </span>
                    {TURN_STEPS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setPlayer((prev) => ({ ...prev, turnStep: st.id }))}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                          player.turnStep === st.id
                            ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold'
                            : 'text-[#6E655F] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role / Status Badge: [Возраст • Статус • Текущая роль/профессия] */}
                <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE8DC] border border-[#DCD3C2] text-xs font-semibold text-[#2C2523]">
                  <span className="font-mono font-bold text-[#2E6F5E]">Возраст {player.age} лет</span>
                  <span className="text-[#6E655F]">•</span>
                  <span className="text-[#C87A3E]">
                    {player.isMarried ? 'В браке' : player.activePartnerId ? 'В отношениях' : player.age < 18 ? 'Под опекой семьи' : 'Свободен'}
                  </span>
                  <span className="text-[#6E655F]">•</span>
                  <span className="text-[#3B5B76]">{currentRoleLabel}</span>
                </div>
              </div>

              {/* 2x2 Grid of 4 Core Progress Bar Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Health (Terracotta #B84A39) */}
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6E655F]">❤️ Здоровье</span>
                    <span className="font-mono font-bold text-[#B84A39]">{player.health}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B84A39] rounded-full transition-all"
                      style={{ width: `${player.health}%` }}
                    />
                  </div>
                </div>

                {/* 2. Energy / Vitality (Sage #2E6F5E) */}
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6E655F]">⚡ Бодрость (Анти-стресс)</span>
                    <span className="font-mono font-bold text-[#2E6F5E]">{energyStat}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E6F5E] rounded-full transition-all"
                      style={{ width: `${energyStat}%` }}
                    />
                  </div>
                </div>

                {/* 3. Happiness (Amber-Ochre #C87A3E) */}
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6E655F]">☀️ Счастье</span>
                    <span className="font-mono font-bold text-[#C87A3E]">{player.happiness}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C87A3E] rounded-full transition-all"
                      style={{ width: `${player.happiness}%` }}
                    />
                  </div>
                </div>

                {/* 4. Intellect & Knowledge (Steel Blue #3B5B76) */}
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6E655F]">📘 Знания и Интеллект</span>
                    <span className="font-mono font-bold text-[#3B5B76]">{player.knowledge}/100</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3B5B76] rounded-full transition-all"
                      style={{ width: `${player.knowledge}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Athletic, Social & Assets Summary Strip */}
              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#6E655F]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[#2E6F5E] font-bold inline-flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" /> Сила {player.skills.strength} · Мышцы {player.skills.muscleMass}
                  </span>
                  <span>Рост {player.heightCm} см · Вес {player.weightKg} кг</span>
                  <span>Харизма {player.skills.charisma}</span>
                  <span>Отношения {player.relations}/100</span>
                  {bonuses.wardrobeStatusBonus > 0 && (
                    <span className="text-[#C87A3E] font-bold">
                      Статус гардероба +{bonuses.wardrobeStatusBonus}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {player.shadowIncome > 0 && (
                    <button
                      type="button"
                      onClick={handleLaunderMoney}
                      className="px-2 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527] border border-[#C87A3E]/40 text-[11px] font-bold cursor-pointer"
                    >
                      Отмыть {formatMoney(player.shadowIncome, player.currency)}
                    </button>
                  )}
                  {player.stress >= 25 && player.money >= 1200 && (
                    <button
                      type="button"
                      onClick={handleTakeVacation}
                      className="px-2 py-0.5 rounded bg-[#3B5B76]/15 text-[#3B5B76] border border-[#3B5B76]/40 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Palmtree className="w-3 h-3" /> Отпуск
                    </button>
                  )}
                  {player.age >= 12 && (
                    <button
                      type="button"
                      onClick={handlePublishBlogPost}
                      className="px-2 py-0.5 rounded bg-[#2E6F5E]/15 text-[#2E6F5E] border border-[#2E6F5E]/40 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Smartphone className="w-3 h-3" /> Пост в блог ({player.blogPostsCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Hardcore Survival Bar: Stress, Chronic Illnesses, Clinic Treatment & Debt Spiral */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      (player.stress || 0) > 80
                        ? 'bg-[#B84A39]/15 text-[#B84A39] border border-[#B84A39]/40'
                        : 'bg-[#EFE8DC] text-[#2C2523]'
                    }`}
                  >
                    🧠 Стресс: {player.stress || 0}%
                    {(player.stress || 0) > 80 ? ' (Паника: -50% доход, -20 Энергии)' : ''}
                  </span>

                  {player.money < 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#B84A39]/15 text-[#B84A39] border border-[#B84A39]/40 font-mono font-bold">
                      ⚠️ Долговая яма ({player.debtDelinquencyTurns || 0} х. просрочки · коллекторы +15 стресса)
                    </span>
                  )}

                  {player.spendingMode === 'Экономный' && player.age >= 18 && (
                    <span className="px-2 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527] font-mono text-[11px]">
                      🍞 Голод/Экономия (-3 кг, -5 Здоровья/м)
                    </span>
                  )}

                  {(player.activeIllnesses?.length > 0 || player.hasInjury) ? (
                    <span className="px-2 py-0.5 rounded bg-[#B84A39]/15 text-[#B84A39] font-mono font-semibold">
                      🩺 Диагнозы:{' '}
                      {player.activeIllnesses?.length > 0
                        ? player.activeIllnesses.join(', ')
                        : 'Травма связок'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#6E655F]">
                      🩺 Хронических болезней нет (здоровье без лечения само не растёт)
                    </span>
                  )}
                </div>

                {(player.activeIllnesses?.length > 0 || player.hasInjury || player.health < 95) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTreatIllness('private_clinic')}
                      className="px-2.5 py-1 rounded-lg bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                    >
                      🏥 Частная клиника (+28❤️, без осложнений)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreatIllness('public_hospital')}
                      className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#2C2523] text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                    >
                      🚑 Госбольница ($0, риск осложнений)
                    </button>
                  </div>
                )}
              </div>

              {/* Diminishing Returns Stat Progression, Grade Mini-Games & Live Incoming NPC Messenger Bar */}
              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono font-bold text-[#2C2523] text-[11px]">
                    📈 Прокачка (Скейлинг):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleScaledStatTrain('strength', 'Силовая тренировка')}
                    className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[11px] font-semibold text-[#2C2523] cursor-pointer"
                  >
                    💪 Сила ({player.skills.strength} · +{calculateDiminishingStatGain(player.skills.strength, player.ownedWardrobeIds.length > 1).statGain})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScaledStatTrain('intellect', 'Интенсивная учёба')}
                    className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[11px] font-semibold text-[#2C2523] cursor-pointer"
                  >
                    📘 Интеллект ({player.skills.intellect} · +{calculateDiminishingStatGain(player.skills.intellect, Boolean(player.activeLaptopId)).statGain})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScaledStatTrain('charisma', 'Практика риторики')}
                    className="px-2 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[11px] font-semibold text-[#2C2523] cursor-pointer"
                  >
                    🗣️ Харизма ({player.skills.charisma} · +{calculateDiminishingStatGain(player.skills.charisma, true).statGain})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {player.age >= 12 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenGradeMinigame('it')}
                        className="px-2 py-1 rounded-lg bg-[#3B5B76] hover:bg-[#2F4960] text-[#FAF7F2] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        💻 IT-Задача (Грейд)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGradeMinigame('blog')}
                        className="px-2 py-1 rounded-lg bg-[#C87A3E] hover:bg-[#B56527] text-[#FAF7F2] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        📹 Медиа-Тайминг
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGradeMinigame('business')}
                        className="px-2 py-1 rounded-lg bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        🏢 Торг / CEO
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleTriggerIncomingNpcChat}
                    className="px-2.5 py-1 rounded-lg bg-[#2C2523] hover:bg-[#3E3532] text-[#FAF7F2] text-[11px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    📲 Входящий чат NPC
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Focus Selector, Spending Mode & Next Turn Action Row */}
          <div className="pt-3 border-t border-[#DCD3C2] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              <label
                title={currentFocusMeta.shortHint}
                className="flex-1 min-w-[230px] flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs"
              >
                <span className="text-[#6E655F] font-mono shrink-0">Фокус:</span>
                <select
                  aria-label="Жизненный фокус"
                  value={player.focus}
                  onChange={(e) =>
                    setPlayer((prev) => ({ ...prev, focus: e.target.value as LifeFocus }))
                  }
                  className="flex-1 min-w-0 bg-transparent font-bold text-[#2E6F5E] outline-none cursor-pointer"
                >
                  {availableFocusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs shrink-0">
                <span className="text-[#6E655F] font-mono">Траты:</span>
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
                  className="bg-transparent font-bold text-[#2C2523] outline-none cursor-pointer"
                >
                  <option value="Экономный">Эконом (×0.65)</option>
                  <option value="Баланс">Баланс (×1.0)</option>
                  <option value="Роскошный">Роскошь (×1.75)</option>
                </select>
              </label>
            </div>

            {/* Speed & Next Turn CTA */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Пауза"
                onClick={() => setIsPaused((p) => !p)}
                className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center cursor-pointer ${
                  isPaused
                    ? 'bg-[#C87A3E]/15 border-[#C87A3E]/50 text-[#B56527]'
                    : 'bg-[#FFFFFF] border-[#DCD3C2] text-[#6E655F]'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
              </button>

              {SPEED_MULTIPLIERS.slice(0, 4).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setSpeedMultiplier(spd);
                    setIsPaused(false);
                  }}
                  className={`px-2 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    !isPaused && speedMultiplier === spd
                      ? 'bg-[#2C2523] text-[#FAF7F2] border-[#2C2523]'
                      : 'bg-[#FFFFFF] border-[#DCD3C2] text-[#6E655F] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {spd}×
                </button>
              ))}

              <button
                type="button"
                onClick={handleNextStep}
                data-testid="next-year-btn"
                className="ml-auto px-4 py-2 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-display font-bold text-xs tracking-wide transition cursor-pointer whitespace-nowrap shadow-sm"
              >
                Далее (+1 {TURN_STEPS.find((t) => t.id === player.turnStep)?.label}) »
              </button>
            </div>
          </div>
        </section>

        {/* Active Section Content */}
        <main className="bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
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
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD3C2] pb-3">
                    <div>
                      <h2 className="text-lg font-display font-bold text-[#2C2523]">Летопись вашей жизни (с 0 лет)</h2>
                      <p className="text-xs text-[#2E6F5E] mt-0.5">
                        Локация: {player.city.name} ({player.city.country}) · Встроенный ИИ помнит {player.aiMemory.entries.length} ключевых событий ДО и ПОСЛЕ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAiEvent}
                      className="px-3 py-1.5 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Сгенерировать ИИ-событие сейчас
                    </button>
                  </div>

                  {/* Military Conscription / Frontline Contract Situation Card (18+ years) */}
                  {player.age >= 18 && (
                    <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-display font-bold text-[#2C2523] flex items-center gap-1.5">
                          <span>🪖 Военный комиссариат / Срочная служба и Передовая</span>
                          {player.militaryServiceActive && (
                            <span className="px-2 py-0.5 rounded bg-[#B84A39]/15 text-[#B84A39] text-[10px] font-mono font-bold">
                              {player.frontlineActive ? 'НА ПЕРЕДОВОЙ (БЛИНДАЖ)' : 'ВОЕННАЯ БАЗА / КАЗАРМА'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6E655F] mt-0.5">
                          {player.militaryServiceActive
                            ? player.frontlineActive
                              ? 'Вы в блиндаже на передовой: повышенное боевое довольствие (+$2 400/мес), военные спец-события, риск контузии и обстрелов.'
                              : 'Вы на военной базе: плац, казарма и полигон. Можно отправиться на передовую в блиндаж или демобилизоваться.'
                            : 'Поступление на службу автоматически переводит внешний вид и фон персонажа в военную базу (+5 Сила и Выносливость).'}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {player.militaryServiceActive && (
                          <button
                            type="button"
                            onClick={handleToggleFrontline}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                              player.frontlineActive
                                ? 'bg-[#C87A3E] hover:bg-[#B56527] text-[#FAF7F2]'
                                : 'bg-[#2C2523] hover:bg-[#3E3532] text-[#FAF7F2]'
                            }`}
                          >
                            {player.frontlineActive ? '⛺ Ротация на военную базу' : '💥 Отправиться на передовую (Блиндаж)'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleToggleMilitaryService}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            player.militaryServiceActive
                              ? 'bg-[#B84A39] hover:bg-[#9E3D2E] text-[#FAF7F2]'
                              : 'bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#2C2523]'
                          }`}
                        >
                          {player.militaryServiceActive ? '🎖️ Демобилизоваться в запас' : '🪖 Поступить на военную службу'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-[#DCD3C2]">
                    {(showAllChronicle ? player.chronicle : player.chronicle.slice(0, 35)).map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleToggleStarEntry(entry.id)}
                        className="py-3.5 flex items-start gap-3 sm:gap-3.5 hover:bg-[#EFE8DC]/70 px-2.5 rounded-xl transition cursor-pointer"
                      >
                        <div className="w-16 shrink-0 font-mono text-xs text-[#6E655F] pt-0.5">
                          <div className="font-bold text-[#2C2523]">{entry.age} лет</div>
                          {entry.dateLabel && (
                            <div className="text-[10px] text-[#6E655F] truncate">{entry.dateLabel}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 break-words text-sm text-[#2C2523] leading-relaxed">
                          {entry.text}
                        </div>
                        <Star
                          className={`w-4 h-4 shrink-0 mt-1 ${
                            entry.starred ? 'text-[#C87A3E] fill-[#C87A3E]' : 'text-[#DCD3C2]'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  {player.chronicle.length > 35 && (
                    <button
                      type="button"
                      onClick={() => setShowAllChronicle((prev) => !prev)}
                      className="w-full py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-xs font-mono text-[#2C2523] cursor-pointer"
                    >
                      {showAllChronicle
                        ? 'Свернуть старые записи летописи'
                        : `Показать всю летопись (${player.chronicle.length} записей)`}
                    </button>
                  )}
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
                  onBuyOrEquipWardrobe={handleBuyOrEquipWardrobe}
                  onToggleMilitaryService={handleToggleMilitaryService}
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

      {/* Mobile-First Fixed Bottom Navigation Bar (Warm Cream Paper UI) */}
      <nav
        aria-label="Нижнее меню разделов"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#DCD3C2] px-2 py-1.5 shadow-sm"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-4 sm:grid-cols-8 gap-1">
          <button
            type="button"
            onClick={() => handleSwitchBottomNav('chronicle')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'chronicle'
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
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
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
            }`}
          >
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {player.age < 6 && <Lock className="w-2.5 h-2.5 text-[#C87A3E]" />}
            </div>
            <span>Учёба</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('hobbies')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'hobbies'
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
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
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {player.age < 14 && <Lock className="w-2.5 h-2.5 text-[#C87A3E]" />}
            </div>
            <span>Работа</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('family')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'family'
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
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
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
            }`}
          >
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              {player.age < 6 && <Lock className="w-2.5 h-2.5 text-[#C87A3E]" />}
            </div>
            <span>Покупки</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('underworld')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'underworld'
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {player.age < 12 && <Lock className="w-2.5 h-2.5 text-[#C87A3E]" />}
            </div>
            <span>Криминал/18+</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchBottomNav('quests')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-[#2E6F5E] text-[#FAF7F2]'
                : 'text-[#6E655F] hover:bg-[#EFE8DC]'
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
