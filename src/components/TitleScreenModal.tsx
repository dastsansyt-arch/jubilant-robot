import React, { useState, useMemo } from 'react';
import { CityOption, CharacterAppearance, RegionGroup } from '../game/types';
import { CITIES_CATALOG, CHARACTER_APPEARANCES } from '../game/catalogs';
import { generateFamilyForCity, generateRandomPersonName } from '../game/worldData';
import { formatMoney } from '../game/rules';
import { Globe, Sparkles, User, Play, Shuffle, Users, Wallet, ShieldCheck, Search } from 'lucide-react';

interface TitleScreenModalProps {
  selectedCity: CityOption;
  selectedAppearance: CharacterAppearance;
  playerName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  onSelectCity: (city: CityOption) => void;
  onSelectAppearance: (app: CharacterAppearance) => void;
  onChangeName: (name: string) => void;
  onChangeBirthDate: (year: number, month: number, day: number) => void;
  onStartLife: () => void;
}

const REGION_GROUPS: { id: RegionGroup; shortLabel: string }[] = [
  { id: 'Украина (Областные центры)', shortLabel: 'Украина (25)' },
  { id: 'Евросоюз и Европа', shortLabel: 'Европа (26)' },
  { id: 'Курорты мира и Европы', shortLabel: 'Курорты (13)' },
  { id: 'СНГ и Восточная Европа', shortLabel: 'СНГ' },
  { id: 'Северная и Южная Америка', shortLabel: 'Америка' },
  { id: 'Азия и Ближний Восток', shortLabel: 'Азия' },
];

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  selectedCity,
  selectedAppearance,
  playerName,
  birthYear,
  birthMonth,
  birthDay,
  onSelectCity,
  onSelectAppearance,
  onChangeName,
  onChangeBirthDate,
  onStartLife,
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [citySearch, setCitySearch] = useState<string>('');

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    return CITIES_CATALOG.filter((c) => {
      const regionOk = regionFilter === 'ALL' || c.regionGroup === regionFilter;
      const queryOk =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);
      return regionOk && queryOk;
    });
  }, [regionFilter, citySearch]);

  const previewFamily = useMemo(
    () => generateFamilyForCity(selectedCity, playerName || selectedCity.defaultNames[0]),
    [selectedCity, playerName]
  );

  const handleRandomize = () => {
    const randomCity = CITIES_CATALOG[Math.floor(Math.random() * CITIES_CATALOG.length)];
    const randomApp = CHARACTER_APPEARANCES[Math.floor(Math.random() * CHARACTER_APPEARANCES.length)];
    const randomName = generateRandomPersonName(randomCity.countryCode);
    onSelectCity(randomCity);
    onSelectAppearance(randomApp);
    onChangeName(randomName);
  };

  const handleGenerateCountryName = () => {
    onChangeName(generateRandomPersonName(selectedCity.countryCode));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A0F]/95 backdrop-blur-xl overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-[#0F141E] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Banner with Life Simulator EX Emblem */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0F172A] via-[#131C31] to-[#0F172A] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <span className="font-display font-extrabold text-lg tracking-tighter text-emerald-300">
                EX
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Hi-Bit Global Life Simulation • {CITIES_CATALOG.length} Городов и Курортов
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                LIFE SIMULATOR <span className="text-emerald-400">EX</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Все областные центры Украины, столицы Европы и курорты мира • 640 профессий • Бизнес и Франшизы • Политика
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#182234] hover:bg-[#1E2B42] text-slate-200 border border-[#283548] text-xs font-medium transition cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
              Случайная судьба
            </button>
          </div>
        </div>

        {/* Main Configuration Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: World Atlas & Family Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Name & Country-Aware Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="character-name-input"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-400"
                >
                  Имя и фамилия персонажа ({selectedCity.country})
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCountryName}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3 h-3" /> Сгенерировать по стране
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="character-name-input"
                  type="text"
                  value={playerName}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="Введите имя и фамилию..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090D14] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white text-sm outline-none transition"
                />
              </div>

              {/* Birth Date Selector (Starts at Age 0 on chosen date, unlocks era tech!) */}
              <div className="mt-3 p-3 rounded-xl bg-[#090D14] border border-[#1E293B]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    Дата рождения (Старт с 0 лет · Эпоха технологий по году)
                  </span>
                  <span className="text-[11px] font-mono text-amber-300">
                    {birthDay}.{birthMonth}.{birthYear} г. (0 лет)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">День (1–30)</label>
                    <select
                      value={birthDay}
                      onChange={(e) =>
                        onChangeBirthDate(birthYear, birthMonth, Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-white"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d} число
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Месяц</label>
                    <select
                      value={birthMonth}
                      onChange={(e) =>
                        onChangeBirthDate(birthYear, Number(e.target.value), birthDay)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-white"
                    >
                      {[
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
                      ].map((mName, idx) => (
                        <option key={mName} value={idx + 1}>
                          {mName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Год рождения</label>
                    <select
                      value={birthYear}
                      onChange={(e) =>
                        onChangeBirthDate(Number(e.target.value), birthMonth, birthDay)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-white font-mono"
                    >
                      {[1985, 1990, 1995, 2000, 2005, 2008, 2010, 2015, 2020, 2024, 2026].map(
                        (yr) => (
                          <option key={yr} value={yr}>
                            {yr} г.
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Region Filter & City Selector */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Город рождения ({filteredCities.length})
                </span>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Поиск города..."
                    aria-label="Поиск города рождения"
                    className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-[#090D14] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setRegionFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                    regionFilter === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-[#131B2B] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
                  }`}
                >
                  Все ({CITIES_CATALOG.length})
                </button>
                {REGION_GROUPS.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setRegionFilter(reg.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                      regionFilter === reg.id
                        ? 'bg-emerald-500 text-slate-950 font-semibold'
                        : 'bg-[#131B2B] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
                    }`}
                  >
                    {reg.shortLabel}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const active = city.id === selectedCity.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onSelectCity(city);
                        onChangeName(city.defaultNames[0]);
                      }}
                      className={`text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm'
                          : 'bg-[#090D14]/90 border-[#1E293B] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-white truncate">
                          {city.name}, {city.country}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 whitespace-nowrap">
                          {city.currency === 'EUR' ? 'EUR €' : 'USD $'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>ЗП ×{city.economyMultiplier.toFixed(2)}</span>
                        <span>
                          Еда/ЖКХ ~{formatMoney(city.monthlyFoodBase + city.monthlyUtilitiesBase, city.currency)}/мес
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Family Preview Card */}
            <div className="p-3.5 rounded-xl bg-[#090D14] border border-[#1E293B] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Ваша семья при рождении ({selectedCity.name})
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-amber-400" /> Валюта: {selectedCity.localCurrencyLabel}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {previewFamily.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{member.relation}</span>
                        <span>{member.age} лет</span>
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5 truncate">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-emerald-300/90 truncate mt-0.5">
                        {member.profession}
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[120px]">{member.trait.split(',')[0]}</span>
                      {member.monthlyIncome > 0 && (
                        <span className="text-emerald-400 font-semibold shrink-0">
                          +{formatMoney(member.monthlyIncome, selectedCity.currency)}/м
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 60 Hi-Bit Character Skins & Hardcore Summary (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Коллекция из 60 Hi-Bit образов
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  #{selectedAppearance.id} • {selectedAppearance.archetypeTag}
                </span>
              </div>

              {/* Selected Character Preview Card */}
              <div className="p-3 rounded-xl bg-[#090D14] border border-[#1E293B] flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-[#131B2B] border border-[#26334D] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" className="w-11 h-11" style={{ imageRendering: 'pixelated' }}>
                    <rect x="4" y="1" width="8" height="3" fill={selectedAppearance.hairColor} />
                    <rect x="4" y="4" width="8" height="4" fill={selectedAppearance.skinColor} />
                    <rect x="5" y="5" width="2" height="1" fill={selectedAppearance.eyeColor} />
                    <rect x="9" y="5" width="2" height="1" fill={selectedAppearance.eyeColor} />
                    <rect x="3" y="8" width="10" height="4" fill={selectedAppearance.shirtColor} />
                    <rect x="4" y="12" width="3" height="3" fill={selectedAppearance.pantsColor} />
                    <rect x="9" y="12" width="3" height="3" fill={selectedAppearance.pantsColor} />
                    <rect x="4" y="15" width="3" height="1" fill={selectedAppearance.shoeColor} />
                    <rect x="9" y="15" width="3" height="1" fill={selectedAppearance.shoeColor} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{selectedAppearance.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Архетип: <span className="text-emerald-300">{selectedAppearance.archetypeTag}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Телосложение и бицепсы персонажа растут на экране по мере прокачки Силы и Мышечной массы.
                  </div>
                </div>
              </div>

              {/* 60 Skins Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto p-2 rounded-xl bg-[#090D14] border border-[#1E293B]">
                {CHARACTER_APPEARANCES.map((app) => {
                  const isSelected = app.id === selectedAppearance.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => onSelectAppearance(app)}
                      title={`${app.label} (${app.archetypeTag})`}
                      className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 scale-105'
                          : 'bg-[#121824] border-[#1E293B] hover:border-slate-600'
                      }`}
                    >
                      <svg viewBox="0 0 12 12" className="w-6 h-6" style={{ imageRendering: 'pixelated' }}>
                        <rect x="3" y="1" width="6" height="2" fill={app.hairColor} />
                        <rect x="3" y="3" width="6" height="3" fill={app.skinColor} />
                        <rect x="4" y="4" width="1" height="1" fill={app.eyeColor} />
                        <rect x="7" y="4" width="1" height="1" fill={app.eyeColor} />
                        <rect x="2" y="6" width="8" height="3" fill={app.shirtColor} />
                        <rect x="3" y="9" width="2" height="3" fill={app.pantsColor} />
                        <rect x="7" y="9" width="2" height="3" fill={app.pantsColor} />
                      </svg>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">#{app.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hardcore Rules Info + Start CTA */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Хардкор-режим:</span> реальные счета за еду, ЖКХ, жильё и транспорт. Открывайте франшизы, стройте карьеру или идите в политику!
                </div>
              </div>

              <button
                type="button"
                onClick={onStartLife}
                data-testid="start-life-btn"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                Начать жизнь в г. {selectedCity.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
