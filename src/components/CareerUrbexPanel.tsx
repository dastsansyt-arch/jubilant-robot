import React, { useState, useMemo, useEffect } from 'react';
import {
  PlayerState,
  CareerTrack,
  UrbexSpot,
  UniversityProgram,
  HobbyItem,
  SocialFaction,
  BusinessFranchiseItem,
  PoliticalPosition,
  PoliticalReform,
  LanguageCourseItem,
} from '../game/types';
import {
  CAREERS_CATALOG,
  URBEX_SPOTS,
  INITIAL_INVESTMENTS,
} from '../game/catalogs';
import {
  HOBBIES_80,
  FACTIONS_26,
  BUSINESS_CATALOG,
  POLITICAL_POSITIONS,
  POLITICAL_REFORMS,
  PROFESSION_SHIFT_CASES,
  ALL_EDUCATION_COUNTRIES,
  getCountryUniversityPack,
  LANGUAGE_COURSES_CATALOG,
  CEFR_LEVEL_LABELS,
  LANGUAGE_NAMES,
} from '../game/worldData';
import {
  calculatePortfolioValue,
  calculateAnnualInvestmentYield,
  calculateMonthlyBusinessSummary,
  calculateCustomPcStats,
  checkUniversityAdmission,
  formatMoney,
} from '../game/rules';
import {
  Briefcase,
  Building2,
  Landmark,
  GraduationCap,
  Dumbbell,
  ShieldAlert,
  Camera,
  TrendingUp,
  Search,
  Flame,
  Zap,
  Award,
  BarChart3,
  Gamepad2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Target,
  Languages,
  BookOpen,
  Globe2,
  Lock,
} from 'lucide-react';

const SKILL_NAMES_RU: Record<string, string> = {
  intellect: 'к Интеллекту',
  strength: 'к Силе',
  muscleMass: 'к Мышцам',
  charisma: 'к Харизме',
  finance: 'к Финансам',
  creativity: 'к Творчеству',
  urbex: 'к Уберэксу',
  fitness: 'к Выносливости',
};

export type CareerPanelSubTab =
  | 'careers'
  | 'business'
  | 'politics'
  | 'education'
  | 'languages'
  | 'hobbies'
  | 'factions'
  | 'urbex'
  | 'investments';

interface CareerUrbexPanelProps {
  player: PlayerState;
  forcedSubTab?: CareerPanelSubTab;
  onSelectCareer: (career: CareerTrack) => void;
  onExecuteProfessionAction: () => void;
  onResolveProfessionDilemma: (optionIndex: number) => void;
  onResolveProfessionMiniGame: (accuracyPercent: number) => void;
  onGenerateAiEvent: () => void;
  onBuyOrUpgradeBusiness: (item: BusinessFranchiseItem, mode: 'buy' | 'upgrade' | 'branch') => void;
  onRunPoliticalCampaign: (actionType: 'rally' | 'tv_debate' | 'charity_fund') => void;
  onElectPoliticalPosition: (pos: PoliticalPosition) => void;
  onEnactPoliticalReform: (reform: PoliticalReform) => void;
  onEnrollUniversity: (uni: UniversityProgram) => void;
  onStudySchoolExtra: (mode: 'homework' | 'tutor' | 'olympiad') => void;
  onTakeLanguageCourse: (course: LanguageCourseItem) => void;
  onRegenerateColleges: () => void;
  onToggleHobby: (hobby: HobbyItem) => void;
  onJoinFaction: (faction: SocialFaction | null) => void;
  onRunUrbexRaid: (spot: UrbexSpot) => void;
  onBuyInvestment: (assetId: string, units: number) => void;
  onSellInvestment: (assetId: string, units: number) => void;
}

export const CareerUrbexPanel: React.FC<CareerUrbexPanelProps> = ({
  player,
  forcedSubTab,
  onSelectCareer,
  onExecuteProfessionAction,
  onResolveProfessionDilemma,
  onResolveProfessionMiniGame,
  onGenerateAiEvent,
  onBuyOrUpgradeBusiness,
  onRunPoliticalCampaign,
  onElectPoliticalPosition,
  onEnactPoliticalReform,
  onEnrollUniversity,
  onStudySchoolExtra,
  onTakeLanguageCourse,
  onRegenerateColleges,
  onToggleHobby,
  onJoinFaction,
  onRunUrbexRaid,
  onBuyInvestment,
  onSellInvestment,
}) => {
  const [subTab, setSubTab] = useState<CareerPanelSubTab>(forcedSubTab || 'careers');
  const [careerSector, setCareerSector] = useState<string>('ALL');
  const [careerSearch, setCareerSearch] = useState<string>('');
  const [hobbyCategory, setHobbyCategory] = useState<string>('ALL');
  const [businessFilter, setBusinessFilter] = useState<'ALL' | 'FRANCHISE' | 'CORP'>('ALL');
  const [eduCountryCode, setEduCountryCode] = useState<string>('UA');
  const [showLocalColleges, setShowLocalColleges] = useState<boolean>(false);
  const [langFilter, setLangFilter] = useState<string>('ALL');

  useEffect(() => {
    if (forcedSubTab) {
      setSubTab(forcedSubTab);
    }
  }, [forcedSubTab]);

  // Interactive Profession Mini-Game local state
  const [miniGameNodes, setMiniGameNodes] = useState<boolean[]>([false, false, false, false]);
  const [reflexZoneIdx, setReflexZoneIdx] = useState<number>(2);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    CAREERS_CATALOG.forEach((c) => set.add(c.sector));
    return Array.from(set);
  }, []);

  const filteredCareers = useMemo(() => {
    const q = careerSearch.trim().toLowerCase();
    return CAREERS_CATALOG.filter((c) => {
      const matchSector = careerSector === 'ALL' || c.sector === careerSector;
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q);
      return matchSector && matchQuery;
    }).slice(0, 60);
  }, [careerSector, careerSearch]);

  const hobbyCategories = useMemo(() => {
    const set = new Set<string>();
    HOBBIES_80.forEach((h) => set.add(h.category));
    return Array.from(set);
  }, []);

  const filteredHobbies = useMemo(() => {
    if (hobbyCategory === 'ALL') return HOBBIES_80;
    return HOBBIES_80.filter((h) => h.category === hobbyCategory);
  }, [hobbyCategory]);

  const filteredBusinesses = useMemo(() => {
    if (businessFilter === 'FRANCHISE') return BUSINESS_CATALOG.filter((b) => b.isFranchise);
    if (businessFilter === 'CORP') return BUSINESS_CATALOG.filter((b) => !b.isFranchise);
    return BUSINESS_CATALOG;
  }, [businessFilter]);

  const selectedCountryPack = useMemo(
    () => getCountryUniversityPack(eduCountryCode),
    [eduCountryCode]
  );

  const displayedEducation = useMemo(() => {
    if (showLocalColleges) {
      return player.localColleges;
    }
    return selectedCountryPack.universities;
  }, [showLocalColleges, player.localColleges, selectedCountryPack]);

  const filteredLanguageCourses = useMemo(() => {
    if (langFilter === 'ALL') return LANGUAGE_COURSES_CATALOG;
    return LANGUAGE_COURSES_CATALOG.filter((c) => c.langCode === langFilter);
  }, [langFilter]);

  const currentCareer = CAREERS_CATALOG.find((c) => c.id === player.currentCareerId);
  const activeShiftCase = useMemo(() => {
    const cat = currentCareer ? currentCareer.category : 'tech';
    return (
      PROFESSION_SHIFT_CASES.find((sc) => sc.category === cat) ||
      PROFESSION_SHIFT_CASES[0]
    );
  }, [currentCareer]);

  const currentPolPos = POLITICAL_POSITIONS.find((p) => p.id === player.politicalPositionId);
  const bizSummary = calculateMonthlyBusinessSummary(player);
  const portfolioValue = calculatePortfolioValue(player.investments);
  const annualDividends = calculateAnnualInvestmentYield(
    player.investments,
    player.skills.finance
  );
  const pcStats = calculateCustomPcStats(player);

  const handleToggleMiniNode = (idx: number) => {
    const next = miniGameNodes.map((v, i) => (i === idx ? !v : v));
    setMiniGameNodes(next);
    if (next.every(Boolean)) {
      const score = reflexZoneIdx === 2 ? 98 : reflexZoneIdx === 1 || reflexZoneIdx === 3 ? 86 : 72;
      onResolveProfessionMiniGame(score);
      setMiniGameNodes([false, false, false, false]);
      setReflexZoneIdx((prev) => (prev + 1) % 5);
    }
  };

  return (
    <div className="space-y-5">
      {/* Categorized Sub-navigation bar */}
      <div className="flex flex-wrap gap-1.5 bg-[#0B0F17] p-1.5 rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setSubTab('education')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'education'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Школа, Колледжи и ВУЗы</span>
          {player.age < 6 ? (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 6 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[10px] text-slate-400 font-mono">
              (Школа/Колледжи)
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('languages')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'languages'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Языковые Курсы</span>
          {player.age < 6 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 6 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('hobbies')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'hobbies'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>80 Хобби и Секций</span>
          {player.age < 6 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 6 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('careers')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'careers'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>640 Профессий</span>
          {player.age < 14 ? (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 14 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-600/40">
              14+ подработки
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('business')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'business'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Бизнес и Франшизы</span>
          {player.age < 18 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 18 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('politics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'politics'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Политика и Законы</span>
          {player.age < 21 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 21 года
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('factions')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'factions'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>26 Группировок</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('urbex')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'urbex'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Экстрим / Уберэкс</span>
          {player.age < 16 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 16 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('investments')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'investments'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Биржа</span>
          {player.age < 18 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 18 лет
            </span>
          )}
        </button>
      </div>

      {/* 1. 640 PROFESSIONS, INTERACTIVE MINI-GAMES & TACTICAL SHIFT DILEMMAS */}
      {subTab === 'careers' && (
        <div className="space-y-4">
          {/* Active Career & Sector Mechanic Dashboard */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Профессиональная статистика, Техника и KPI
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {currentCareer
                    ? `${currentCareer.title} (${currentCareer.sector})`
                    : 'Стажёр / Свободный специалист (Выберите любую из 640 профессий ниже)'}
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">
                  Годовой оклад (KPI {player.careerStats.kpiScore}% • Множитель ПК ×{pcStats.totalCareerTechMultiplier})
                </div>
                <div className="text-base font-bold text-emerald-400">
                  {currentCareer
                    ? `${formatMoney(
                        Math.round(
                          currentCareer.annualSalary *
                            player.city.economyMultiplier *
                            (1 + (player.careerStats.kpiScore - 50) / 250) *
                            pcStats.totalCareerTechMultiplier
                        ),
                        player.currency
                      )}/год`
                    : `${formatMoney(player.age < 18 ? 600 : 1800, player.currency)}/год`}
                </div>
              </div>
            </div>

            {/* KPI & Sector Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Эффективность KPI</div>
                <div className="text-emerald-400 font-bold mt-0.5">{player.careerStats.kpiScore} / 100</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Комбо и Побед в Мини-Играх</div>
                <div className="text-amber-300 font-bold mt-0.5">
                  x{player.careerStats.currentCombo} ({player.careerStats.miniGamesWon} побед)
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Идеальных смен</div>
                <div className="text-white font-bold mt-0.5">{player.careerStats.perfectShifts}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Спецпроектов</div>
                <div className="text-emerald-300 font-bold mt-0.5">{player.careerStats.specialActionsDone}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">
                  {currentCareer ? currentCareer.mechanicStatLabel : 'Отраслевой рекорд'}
                </div>
                <div className="text-cyan-300 font-bold mt-0.5">
                  {currentCareer
                    ? player.careerStats.sectorMetrics[currentCareer.mechanicStatLabel] || 0
                    : 0}
                </div>
              </div>
            </div>

            {/* Interactive Per-Profession Mechanic Action Button + Live AI Career Situation */}
            <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-300">
                Спец-действие:{' '}
                <span className="text-white font-semibold">
                  «{currentCareer ? currentCareer.mechanicActionLabel : 'Практический фриланс-заказ'}»
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onGenerateAiEvent}
                  className="px-3 py-2 rounded-xl bg-[#161F30] hover:bg-[#1E293B] border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" /> ИИ-Событие с памятью ДО/ПОСЛЕ
                </button>
                {currentCareer && (
                  <button
                    type="button"
                    onClick={onExecuteProfessionAction}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/10"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {currentCareer.mechanicActionLabel} (+
                    {formatMoney(
                      Math.round(currentCareer.mechanicBonusMoney * player.city.economyMultiplier),
                      player.currency
                    )}
                    )
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Work Shift Tactical Dilemma (3 Choices) + Interactive Profession Mini-Game */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Left Card: 3-Choice Tactical Shift Case */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Тактический выбор на смене • {currentCareer ? currentCareer.sector : 'Отраслевой кейс'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">3 пути решения</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{activeShiftCase.scenarioTitle}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeShiftCase.scenarioPrompt}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {activeShiftCase.options.map((opt, idx) => {
                  const baseBonus = currentCareer ? currentCareer.mechanicBonusMoney : 1400;
                  const estMoney = Math.round(
                    baseBonus * opt.bonusMultiplier * player.city.economyMultiplier * pcStats.totalCareerTechMultiplier
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onResolveProfessionDilemma(idx)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#121926] hover:bg-emerald-500/15 border border-[#1E293B] hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              opt.approach === 'safe'
                                ? 'bg-blue-500/20 text-blue-300'
                                : opt.approach === 'creative'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {opt.approach === 'safe'
                              ? 'Стандарт'
                              : opt.approach === 'creative'
                              ? 'Креатив'
                              : 'Риск-Прорыв'}
                          </span>
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {opt.outcomeHint}
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="text-xs font-bold text-emerald-400">
                          +{formatMoney(estMoney, player.currency)}
                        </div>
                        <div className="text-[10px] text-cyan-300">KPI +{opt.kpiDelta}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Interactive Profession Mini-Game */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> Мини-Игра Профессии
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    Комбо-множитель: ×{(1 + Math.min(player.careerStats.currentCombo, 10) * 0.12).toFixed(2)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{activeShiftCase.miniGameTitle}</h4>
                <p className="text-xs text-slate-300 mt-1">
                  {activeShiftCase.miniGameTargetHint}
                </p>
              </div>

              {/* Precision Reflex Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Калибровка точности смены:</span>
                  <span className="text-emerald-400">
                    {reflexZoneIdx === 2 ? '100% ИДЕАЛ (Зелёная зона)' : '85% Высокая точность'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { idx: 0, label: '70%', cls: 'border-slate-700 text-slate-400' },
                    { idx: 1, label: '85%', cls: 'border-cyan-500/50 text-cyan-300' },
                    { idx: 2, label: '100% КРИТ', cls: 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold' },
                    { idx: 3, label: '85%', cls: 'border-cyan-500/50 text-cyan-300' },
                    { idx: 4, label: '70%', cls: 'border-slate-700 text-slate-400' },
                  ].map((z) => (
                    <button
                      key={z.idx}
                      type="button"
                      onClick={() => setReflexZoneIdx(z.idx)}
                      className={`py-1.5 rounded-lg border text-[11px] font-mono transition cursor-pointer ${
                        reflexZoneIdx === z.idx
                          ? 'ring-2 ring-emerald-400 bg-emerald-500/25 text-white'
                          : z.cls
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Interactive Task Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Узел #1: Анализ', 'Узел #2: Сборка', 'Узел #3: Контроль', 'Узел #4: Релиз'].map(
                  (nodeLabel, idx) => {
                    const done = miniGameNodes[idx];
                    return (
                      <button
                        key={nodeLabel}
                        type="button"
                        onClick={() => handleToggleMiniNode(idx)}
                        className={`p-2.5 rounded-xl border text-xs font-mono font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          done
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-[#121926] hover:bg-[#192336] text-slate-200 border-[#263449]'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Target className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-[11px]">{nodeLabel}</span>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() => onResolveProfessionMiniGame(reflexZoneIdx === 2 ? 96 : 84)}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Завершить блиц-смену сейчас (Бонус за точность {reflexZoneIdx === 2 ? '96%' : '84%'})
              </button>
            </div>
          </div>

          {/* Search & Sector Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={careerSearch}
                onChange={(e) => setCareerSearch(e.target.value)}
                placeholder="Поиск среди 640 профессий (Хирург, Архитектор ИИ, Пилот, Дипломат, Шеф-повар, Девелопер)..."
                aria-label="Поиск профессии"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <select
              aria-label="Фильтр отрасли"
              value={careerSector}
              onChange={(e) => setCareerSector(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-200 outline-none"
            >
              <option value="ALL">Все 16 отраслей (640 профессий)</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredCareers.map((career) => {
              const isCurrent = player.currentCareerId === career.id;
              const ageOk = player.age >= career.minAge;
              const skillVal = player.skills[career.requiredSkill];
              const skillOk = skillVal >= career.requiredSkillValue;
              const canApply = ageOk && skillOk && !isCurrent;
              const localSalary = Math.round(career.annualSalary * player.city.economyMultiplier);

              return (
                <div
                  key={career.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 truncate">
                        {career.sector} • Ур. {career.level}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {formatMoney(localSalary, player.currency)}/год
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{career.title}</h4>
                    <p className="text-[11px] text-emerald-300/90 mt-0.5">
                      Механика: {career.mechanicActionLabel}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-slate-400">
                      Возраст: <span className={ageOk ? 'text-emerald-400' : 'text-amber-400'}>{career.minAge}+</span> • Навык ({career.requiredSkill}):{' '}
                      <span className={skillOk ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillVal}/{career.requiredSkillValue}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!canApply}
                      onClick={() => onSelectCareer(career)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : canApply
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Ваша работа' : canApply ? 'Устроиться' : 'Требования'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. BUSINESS & FRANCHISES SYSTEM */}
      {subTab === 'business' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Предприятий и Франшиз</div>
              <div className="text-base font-bold text-white mt-0.5">
                {player.ownedBusinesses.length} ед. ({bizSummary.totalEmployees} сотр.)
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Оборот в месяц</div>
              <div className="text-base font-bold text-emerald-300 mt-0.5">
                +{formatMoney(bizSummary.totalRevenue, player.currency)}/м
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Зарплаты и Налоги</div>
              <div className="text-base font-bold text-rose-400 mt-0.5">
                -{formatMoney(bizSummary.totalPayrollAndTax, player.currency)}/м
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Чистая прибыль/мес</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                +{formatMoney(bizSummary.netMonthlyProfit, player.currency)}/м
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-400">
              Покупайте готовые франшизы (кофейни, пекарни, фастфуд, курьерские службы) или создавайте собственные корпорации в 12 отраслях.
            </div>
            <div className="flex gap-1">
              {(['ALL', 'FRANCHISE', 'CORP'] as const).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setBusinessFilter(flt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    businessFilter === flt
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#0B0F17] text-slate-300 border border-[#1E293B]'
                  }`}
                >
                  {flt === 'ALL' ? 'Все (16)' : flt === 'FRANCHISE' ? 'Франшизы' : 'Корпорации'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredBusinesses.map((biz) => {
              const owned = player.ownedBusinesses.find((b) => b.businessId === biz.id);
              const skillOk = player.skills.finance >= biz.requiredFinanceSkill;
              const canBuy = !owned && skillOk && player.money >= biz.buyCost;
              const netBase = Math.round(
                (biz.monthlyRevenueBase - biz.monthlyExpensesBase) * player.city.economyMultiplier
              );
              const upgCost = owned ? Math.round(biz.upgradeCostBase * owned.level) : biz.upgradeCostBase;
              const branchCost = Math.round(biz.buyCost * 0.75);

              return (
                <div
                  key={biz.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    owned
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                        {biz.isFranchise ? 'ФРАНШИЗА' : 'КОРПОРАЦИЯ'} • {biz.industry}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        +{formatMoney(netBase, player.currency)}/мес
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{biz.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{biz.description}</p>
                    {owned && (
                      <div className="mt-2 text-xs font-mono text-emerald-300">
                        Уровень модернизации: {owned.level}/5 • Филиалов в сети: {owned.customBranches} шт.
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Финансы: <span className={skillOk ? 'text-emerald-400' : 'text-amber-400'}>{player.skills.finance}/{biz.requiredFinanceSkill}</span>
                    </span>

                    {!owned ? (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onBuyOrUpgradeBusiness(biz, 'buy')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                          canBuy
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Открыть ({formatMoney(biz.buyCost, player.currency)})
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={owned.level >= 5 || player.money < upgCost}
                          onClick={() => onBuyOrUpgradeBusiness(biz, 'upgrade')}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                            owned.level < 5 && player.money >= upgCost
                              ? 'bg-[#161F30] hover:bg-[#1E293B] text-emerald-300 border border-emerald-500/40 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {owned.level >= 5 ? 'Макс. Ур.' : `Улучшить (${formatMoney(upgCost, player.currency)})`}
                        </button>
                        <button
                          type="button"
                          disabled={player.money < branchCost}
                          onClick={() => onBuyOrUpgradeBusiness(biz, 'branch')}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                            player.money >= branchCost
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          +Филиал ({formatMoney(branchCost, player.currency)})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. POLITICS & STATE GOVERNANCE */}
      {subTab === 'politics' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Политическая карьера и Государственная власть ({player.city.country})
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {currentPolPos
                    ? `${currentPolPos.title} (Ранг ${currentPolPos.tier}/8)`
                    : 'Гражданин (Не состоит на государственной должности)'}
                </div>
              </div>
              <div className="flex gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block">Рейтинг доверия</span>
                  <span className="text-emerald-400 font-bold text-sm">{player.approvalRating}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Полит. капитал</span>
                  <span className="text-amber-300 font-bold text-sm">{player.politicalInfluence} ед.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-auto">Агитация и рост рейтинга:</span>
              <button
                type="button"
                disabled={player.money < 800}
                onClick={() => onRunPoliticalCampaign('rally')}
                className="px-3 py-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] text-xs font-semibold text-slate-200 border border-[#283548] cursor-pointer whitespace-nowrap"
              >
                Встреча с избирателями ({formatMoney(800, player.currency)} • +5% рейт.)
              </button>
              <button
                type="button"
                disabled={player.money < 2200}
                onClick={() => onRunPoliticalCampaign('tv_debate')}
                className="px-3 py-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] text-xs font-semibold text-emerald-300 border border-emerald-500/30 cursor-pointer whitespace-nowrap"
              >
                Прайм-тайм Теледебаты ({formatMoney(2200, player.currency)} • +10% рейт.)
              </button>
              <button
                type="button"
                disabled={player.money < 4500}
                onClick={() => onRunPoliticalCampaign('charity_fund')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Благотворительный фонд ({formatMoney(4500, player.currency)} • +15% рейт.)
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
              Выборные должности и Посты (от Районного лидера и Мэра до Президента страны)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {POLITICAL_POSITIONS.map((pos) => {
                const isCurrent = player.politicalPositionId === pos.id;
                const canRun =
                  !isCurrent &&
                  player.age >= pos.minAge &&
                  player.skills.charisma >= pos.requiredCharisma &&
                  player.approvalRating >= pos.requiredApproval &&
                  player.money >= pos.campaignCost;

                return (
                  <div
                    key={pos.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500/60'
                        : 'bg-[#0B0F17] border-[#1E293B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          Гос. ранг {pos.tier}/8 • +{pos.influencePerMonth} полит. кап/мес
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {formatMoney(pos.annualSalary, player.currency)}/год
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white mt-1.5">{pos.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{pos.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Рейтинг: {player.approvalRating}/{pos.requiredApproval}% • Харизма: {player.skills.charisma}/{pos.requiredCharisma}
                      </span>
                      <button
                        type="button"
                        disabled={!canRun}
                        onClick={() => onElectPoliticalPosition(pos)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                            : canRun
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isCurrent
                          ? 'Ваш пост'
                          : `Избраться (${formatMoney(pos.campaignCost, player.currency)})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
              Государственные реформы и Законопроекты (Увеличивают доходность бизнеса и экономику)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {POLITICAL_REFORMS.map((ref) => {
                const enacted = player.enactedReformIds.includes(ref.id);
                const currentTier = currentPolPos ? currentPolPos.tier : 0;
                const canEnact =
                  !enacted &&
                  currentTier >= ref.minTier &&
                  player.politicalInfluence >= ref.influenceCost;

                return (
                  <div
                    key={ref.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                      enacted
                        ? 'bg-emerald-500/15 border-emerald-500/60'
                        : 'bg-[#0B0F17] border-[#1E293B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Требуется ранг поста: {ref.minTier}+</span>
                        <span className="text-emerald-400">
                          Прибыль бизнеса +{ref.businessYieldBonusPercent}%
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-1">{ref.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ref.description}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-300">
                        Цена: {ref.influenceCost} полит. капитала
                      </span>
                      <button
                        type="button"
                        disabled={!canEnact}
                        onClick={() => onEnactPoliticalReform(ref)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                          enacted
                            ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                            : canEnact
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {enacted ? 'Закон принят' : 'Принять закон'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. SCHOOL GRADES, COUNTRY TOP-10 UNIVERSITIES (ALL EU + UK + UA) & ADMISSION CRITERIA */}
      {subTab === 'education' && (
        <div className="space-y-4">
          {/* School GPA, Extra Study & Languages Status Card */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Школьный аттестат, Оценки и Критерии Поступления в ВУЗы
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {player.secondarySchoolName} · Средний балл школы:{' '}
                  <span className="text-emerald-400 font-mono text-base">{player.schoolGradeAvg.toFixed(1)} / 12.0</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Высокий школьный балл (+0.9 выше порога ВУЗа) открывает <strong className="text-amber-300">100% Бюджет / Грант (0$)</strong> в любой стране!
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onStudySchoolExtra('homework')}
                  className="px-3 py-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-xs font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  Учить уроки (Бесплатно · +0.25 балла)
                </button>
                <button
                  type="button"
                  onClick={() => onStudySchoolExtra('tutor')}
                  className="px-3 py-1.5 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-emerald-500/40 text-xs font-semibold text-emerald-300 cursor-pointer whitespace-nowrap"
                >
                  Репетитор (+0.55 балла)
                </button>
                <button
                  type="button"
                  onClick={() => onStudySchoolExtra('olympiad')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Олимпиада (+0.85 балла)
                </button>
              </div>
            </div>

            {/* Active Languages Strip */}
            <div className="pt-2.5 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-mono">Ваши языки:</span>
                {Object.entries(player.languages)
                  .filter(([, lvl]) => lvl > 0)
                  .map(([code, lvl]) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]"
                    >
                      {LANGUAGE_NAMES[code as keyof typeof LANGUAGE_NAMES]?.name || code}: {CEFR_LEVEL_LABELS[lvl] || 'A1'}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubTab('languages')}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Languages className="w-3.5 h-3.5" /> Открыть Языковые курсы
                </button>
                <button
                  type="button"
                  onClick={onRegenerateColleges}
                  className="px-3 py-1 rounded-lg bg-[#161F30] hover:bg-[#1E293B] border border-[#283548] text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="w-3 h-3" /> Обновить Колледжи №
                </button>
              </div>
            </div>
          </div>

          {/* Country Selector (27 Countries: Ukraine, Poland, Germany, UK, Spain, France, Italy & ALL EU Countries) */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono uppercase text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Выберите страну для поступления (Топ-10 Университетов в каждой стране ЕС, Украине и Британии):
              </div>
              <button
                type="button"
                onClick={() => setShowLocalColleges((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  showLocalColleges
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#161F30] text-amber-300 border border-amber-500/40'
                }`}
              >
                {showLocalColleges
                  ? 'Показать Топ-10 ВУЗов выбранной страны'
                  : `Колледжи № вашего города (${player.localColleges.length})`}
              </button>
            </div>

            {!showLocalColleges && (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {ALL_EDUCATION_COUNTRIES.map((c) => {
                  const active = eduCountryCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setEduCountryCode(c.code)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'bg-[#121926] hover:bg-[#192336] text-slate-300 border border-[#243247]'
                      }`}
                    >
                      [{c.code}] {c.name.replace(/\s*\(.*\)/, '')} (Топ-10)
                    </button>
                  );
                })}
              </div>
            )}

            {!showLocalColleges && (
              <div className="text-xs font-mono text-emerald-300 bg-[#111724] px-3 py-2 rounded-lg border border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                <span>
                  Страна: <strong>[{selectedCountryPack.flagCode}] {selectedCountryPack.countryName}</strong> · Экзамен: {selectedCountryPack.examName} · Язык обучения:{' '}
                  <strong>{LANGUAGE_NAMES[selectedCountryPack.languageCode]?.name || selectedCountryPack.languageCode}</strong>
                </span>
                <span className="text-amber-300">
                  Критерии страны: аттестат от {selectedCountryPack.universities[9]?.minSchoolGrade?.toFixed(1) || '7.5'} до{' '}
                  {selectedCountryPack.universities[0]?.minSchoolGrade?.toFixed(1) || '10.6'} баллов
                </span>
              </div>
            )}
          </div>

          {/* Universities / Colleges List with Country Admission Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {displayedEducation.map((uni) => {
              const completed = player.completedEducationIds.includes(uni.id);
              const admission = checkUniversityAdmission(player, uni);
              const reqLangName = LANGUAGE_NAMES[admission.reqLang]?.name || 'Язык';
              const reqLangCefr = CEFR_LEVEL_LABELS[admission.reqLangLvl] || 'B1';
              const playerLangCefr = CEFR_LEVEL_LABELS[admission.playerLangLvl] || 'Нет';

              return (
                <div
                  key={uni.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    completed
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {uni.institutionType} • {uni.cityOrCountry} {uni.worldRankLabel ? `• ${uni.worldRankLabel}` : ''}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          admission.hasScholarship ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {admission.hasScholarship
                          ? 'БЮДЖЕТ / ГРАНТ (0$)'
                          : formatMoney(admission.effectiveTuition, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{uni.name}</h4>
                    <div className="text-xs text-emerald-300 mt-1">
                      Диплом: {uni.diplomaLabel} (+{uni.skillBonus} к навыку «{uni.primarySkill}»)
                    </div>

                    {/* Admission Criteria Badges */}
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                      <div
                        className={`p-1.5 rounded border ${
                          admission.gradeOk
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        Аттестат: {player.schoolGradeAvg.toFixed(1)}/{admission.minGrade.toFixed(1)}
                      </div>
                      <div
                        className={`p-1.5 rounded border ${
                          admission.langOk
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {reqLangName}: {playerLangCefr}/{reqLangCefr}
                      </div>
                      <div
                        className={`p-1.5 rounded border ${
                          admission.intellectOk
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        Ум: {player.skills.intellect}/{uni.requiredIntellect}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      {!admission.ageOk
                        ? (uni.institutionType === 'Колледж' || uni.institutionType === 'Техникум / Лицей' ? '🔒 Колледж с 14 лет' : '🔒 ВУЗ доступен с 18 лет')
                        : !admission.gradeOk
                        ? `Нужен балл ${admission.minGrade.toFixed(1)}`
                        : !admission.langOk
                        ? `Нужен язык ${reqLangCefr}`
                        : 'Все критерии выполнены'}
                    </span>
                    <button
                      type="button"
                      disabled={!admission.canEnroll}
                      onClick={() => onEnrollUniversity(uni)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        completed
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : admission.canEnroll
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {completed
                        ? 'Диплом получен'
                        : admission.hasScholarship
                        ? 'Поступить (Бюджет)'
                        : 'Поступить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4B. LANGUAGE COURSES & CERTIFICATES (CEFR A1-C1) */}
      {subTab === 'languages' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Международные языковые курсы и экзамены (IELTS, Goethe, Państwowy, DELE, DELF)
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Изучайте иностранные языки от A2 до C1, чтобы поступать в Топ-10 ВУЗов Польши, Германии, Великобритании, Испании, Франции, Чехии и всех стран ЕС.
              </div>
            </div>
            <select
              aria-label="Фильтр языка"
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#121926] border border-[#243247] text-xs text-white"
            >
              <option value="ALL">Все языки мира ({LANGUAGE_COURSES_CATALOG.length} курсов)</option>
              {Object.entries(LANGUAGE_NAMES).map(([code, meta]) => (
                <option key={code} value={code}>
                  [{meta.badge}] {meta.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredLanguageCourses.map((course) => {
              const currentLvl = player.languages[course.langCode] || 0;
              const alreadyMastered = currentLvl >= course.targetLevel;
              const localCost = Math.round(course.price * Math.max(0.7, player.city.economyMultiplier * 0.85));
              const canTake = !alreadyMastered && player.money >= localCost;

              return (
                <div
                  key={course.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    alreadyMastered
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        [{course.flagLabel}] {course.langName} • {course.cefrLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {formatMoney(localCost, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">
                      Курс «{course.langName}» ({course.cefrLabel})
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{course.description}</p>
                    <div className="text-xs text-emerald-300 mt-1.5 font-mono">
                      Ваш текущий уровень: {CEFR_LEVEL_LABELS[currentLvl]} → Повышение (+{course.intellectGain} Ум, +{course.charismaGain} Харизма)
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Сертификат: {course.cefrLabel}
                    </span>
                    <button
                      type="button"
                      disabled={!canTake}
                      onClick={() => onTakeLanguageCourse(course)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        alreadyMastered
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : canTake
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {alreadyMastered ? 'Сертификат получен' : 'Пройти курс'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. 80 HOBBIES & SPORTS */}
      {subTab === 'hobbies' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-400">
              Активные хобби ({player.activeHobbyIds.length}) тренируют навыки,{' '}
              <span className="text-emerald-300">Силу ({player.skills.strength})</span> и{' '}
              <span className="text-emerald-300">Мышечную массу ({player.skills.muscleMass})</span> каждый ход.
            </div>
            <select
              aria-label="Категория хобби"
              value={hobbyCategory}
              onChange={(e) => setHobbyCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-200"
            >
              <option value="ALL">Все категории (80 хобби)</option>
              {hobbyCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredHobbies.map((hobby) => {
              const active = player.activeHobbyIds.includes(hobby.id);
              return (
                <div
                  key={hobby.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-slate-400">
                      {hobby.category} • {formatMoney(hobby.monthlyCost, player.currency)}/мес
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">{hobby.name}</div>
                    <div className="text-[11px] text-emerald-300/90 mt-0.5">
                      +{hobby.skillGain} {SKILL_NAMES_RU[hobby.skillKey] || hobby.skillKey}
                      {hobby.strengthGain > 0 ? ` • +${hobby.strengthGain} к Силе` : ''}
                      {hobby.muscleGain > 0 ? ` • +${hobby.muscleGain} к Мышцам` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleHobby(hobby)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#161F30] hover:bg-[#1E293B] text-slate-200 border border-[#283548]'
                    }`}
                  >
                    {active ? 'Активно' : 'Записаться'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. 26 SOCIAL FACTIONS & CIRCLES */}
      {subTab === 'factions' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Социальные круги, уличные группировки, автоклубы и лейблы дают ежемесячный доход или особые привилегии.
            </div>
            {player.activeFactionId && (
              <button
                type="button"
                onClick={() => onJoinFaction(null)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer whitespace-nowrap ml-3"
              >
                Покинуть круг
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {FACTIONS_26.map((fac) => {
              const isMember = player.activeFactionId === fac.id;
              return (
                <div
                  key={fac.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isMember
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {fac.category}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          fac.monthlyBonusOrFee >= 0 ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {fac.monthlyBonusOrFee >= 0
                          ? `+${formatMoney(fac.monthlyBonusOrFee, player.currency)}/мес`
                          : `Взнос ${formatMoney(Math.abs(fac.monthlyBonusOrFee), player.currency)}/мес`}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{fac.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{fac.perkLabel}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Риск: {fac.riskPercent}% • Авторитет: {fac.respectScore}
                    </span>
                    <button
                      type="button"
                      disabled={isMember}
                      onClick={() => onJoinFaction(fac)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isMember
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                      }`}
                    >
                      {isMember ? 'Вы состоите' : 'Вступить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. URBEX EXPEDITIONS */}
      {subTab === 'urbex' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Канал экстрима и Уберэкс-исследований</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {player.urbexSubscribers.toLocaleString('ru-RU')} подписчиков • Навык Уберэкса: {player.skills.urbex}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {URBEX_SPOTS.map((spot) => {
              const weatherBonusActive = player.weather === spot.weatherBonus;
              return (
                <div
                  key={spot.id}
                  className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                        Сложность {spot.difficulty}/5
                      </span>
                      {weatherBonusActive ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Погодный бонус ×1.35
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400">
                          +{spot.baseSubscribersGain.toLocaleString('ru-RU')} подп.
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{spot.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{spot.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-300">
                      Доход ~{formatMoney(spot.baseAdRevenue, player.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRunUrbexRaid(spot)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      Снять рейд
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. STOCKS & INVESTMENTS */}
      {subTab === 'investments' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Стоимость инвестиционного портфеля</div>
              <div className="text-lg font-bold font-mono text-white">
                {formatMoney(portfolioValue, player.currency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Ожидаемые дивиденды в год</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                +{formatMoney(annualDividends, player.currency)} / год
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INITIAL_INVESTMENTS.map((asset) => {
              const ownedUnits = player.investments[asset.id] || 0;
              return (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{asset.ticker}</span>
                      <span className="text-xs font-mono text-slate-300">
                        Доходность ~{asset.annualYieldPercent}%/год
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{asset.name}</h4>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Цена лота: {formatMoney(asset.currentPrice, player.currency)} • В портфеле: {ownedUnits} шт.
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center gap-2">
                    <button
                      type="button"
                      disabled={player.money < asset.currentPrice}
                      onClick={() => onBuyInvestment(asset.id, 1)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Купить 1 лот
                    </button>
                    <button
                      type="button"
                      disabled={ownedUnits <= 0}
                      onClick={() => onSellInvestment(asset.id, 1)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Продать 1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
