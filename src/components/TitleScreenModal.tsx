import React, { useState, useMemo } from 'react';
import { CityOption, CharacterAppearance, RegionGroup } from '../game/types';
import { CITIES_CATALOG, CHARACTER_APPEARANCES } from '../game/catalogs';
import { generateFamilyForCity, generateRandomPersonName } from '../game/worldData';
import { formatMoney } from '../game/rules';
import { FullBodyPixelHuman } from './FullBodyPixelHuman';
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
    <div className="fixed inset-0 z-50 bg-[#EAE3D5]/95 backdrop-blur-md overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-[#FAF7F2] border border-[#DCD3C2] rounded-2xl shadow-xl overflow-hidden my-auto text-[#2C2523]">
        {/* Top Banner with Life Simulator EX Emblem in Warm Cream UI */}
        <div className="relative px-6 py-5 bg-[#F4EFE6] border-b border-[#DCD3C2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#2E6F5E] flex items-center justify-center shadow-sm">
              <span className="font-display font-extrabold text-lg tracking-tighter text-[#FAF7F2]">
                EX
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#2E6F5E]/12 border border-[#2E6F5E]/30 text-[#2E6F5E] text-[11px] font-mono uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Реалистичный Симулятор Жизни • {CITIES_CATALOG.length} Городов и Курортов
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#2C2523] tracking-tight">
                LIFE SIMULATOR <span className="text-[#2E6F5E]">EX</span>
              </h1>
              <p className="text-xs text-[#6E655F] mt-0.5">
                Старт с 0 лет • ВУЗы мира • 640 профессий • Бизнес-империя • 2.5D Гардероб и Персонажи
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] text-[#2C2523] border border-[#DCD3C2] text-xs font-semibold transition cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#2E6F5E]" />
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
                  className="block text-xs font-mono uppercase tracking-wider text-[#6E655F]"
                >
                  Имя и фамилия персонажа ({selectedCity.country})
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCountryName}
                  className="text-xs text-[#2E6F5E] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Shuffle className="w-3 h-3" /> Сгенерировать по стране
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-[#6E655F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="character-name-input"
                  type="text"
                  value={playerName}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="Введите имя и фамилию..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#DCD3C2] focus:border-[#2E6F5E] rounded-xl text-[#2C2523] text-sm outline-none transition"
                />
              </div>

              {/* Birth Date Selector (Starts at Age 0 on chosen date) */}
              <div className="mt-3 p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2E6F5E] font-bold">
                    Дата рождения (Старт с 0 лет · Эпоха по году)
                  </span>
                  <span className="text-[11px] font-mono text-[#C87A3E] font-bold">
                    {birthDay}.{birthMonth}.{birthYear} г. (0 лет)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#6E655F] mb-0.5">День (1–30)</label>
                    <select
                      value={birthDay}
                      onChange={(e) =>
                        onChangeBirthDate(birthYear, birthMonth, Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d} число
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#6E655F] mb-0.5">Месяц</label>
                    <select
                      value={birthMonth}
                      onChange={(e) =>
                        onChangeBirthDate(birthYear, Number(e.target.value), birthDay)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
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
                    <label className="block text-[10px] text-[#6E655F] mb-0.5">Год рождения</label>
                    <select
                      value={birthYear}
                      onChange={(e) =>
                        onChangeBirthDate(Number(e.target.value), birthMonth, birthDay)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] font-mono"
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
                <span className="text-xs font-mono uppercase tracking-wider text-[#6E655F] flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-[#2E6F5E]" /> Город рождения ({filteredCities.length})
                </span>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#6E655F] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Поиск города..."
                    aria-label="Поиск города рождения"
                    className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none focus:border-[#2E6F5E]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setRegionFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                    regionFilter === 'ALL'
                      ? 'bg-[#2E6F5E] text-[#FAF7F2] font-semibold'
                      : 'bg-[#FFFFFF] text-[#6E655F] hover:text-[#2C2523] border border-[#DCD3C2]'
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
                        ? 'bg-[#2E6F5E] text-[#FAF7F2] font-semibold'
                        : 'bg-[#FFFFFF] text-[#6E655F] hover:text-[#2C2523] border border-[#DCD3C2]'
                    }`}
                  >
                    {reg.shortLabel}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
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
                          ? 'bg-[#2E6F5E]/12 border-[#2E6F5E] text-[#2C2523] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#DCD3C2] text-[#2C2523] hover:bg-[#F4EFE6]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#2C2523] truncate">
                          {city.name}, {city.country}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFE8DC] text-[#2E6F5E] font-semibold whitespace-nowrap">
                          {city.currency === 'EUR' ? 'EUR €' : 'USD $'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6E655F] font-mono">
                        <span>ЗП ×{city.economyMultiplier.toFixed(2)}</span>
                        <span>
                          ЖКХ/Еда ~{formatMoney(city.monthlyFoodBase + city.monthlyUtilitiesBase, city.currency)}/м
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Family Preview Card */}
            <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#2E6F5E] font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Ваша семья при рождении ({selectedCity.name})
                </span>
                <span className="text-[11px] font-mono text-[#6E655F] flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-[#C87A3E]" /> Валюта: {selectedCity.localCurrencyLabel}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {previewFamily.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#6E655F]">
                        <span>{member.relation}</span>
                        <span>{member.age} лет</span>
                      </div>
                      <div className="text-xs font-bold text-[#2C2523] mt-0.5 truncate">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-[#2E6F5E] font-medium truncate mt-0.5">
                        {member.profession}
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-[#DCD3C2] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#6E655F]">
                      <span className="truncate max-w-[120px]">{member.trait.split(',')[0]}</span>
                      {member.monthlyIncome > 0 && (
                        <span className="text-[#C87A3E] font-bold shrink-0">
                          +{formatMoney(member.monthlyIncome, selectedCity.currency)}/м
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 2.5D Blocky Character Generator & Start CTA (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6E655F] font-bold">
                  Генератор 2.5D образов (60 вариантов)
                </span>
                <span className="text-xs font-mono text-[#2E6F5E] font-bold">
                  #{selectedAppearance.id} • {selectedAppearance.archetypeTag}
                </span>
              </div>

              {/* Selected Character Preview Card (2.5D Blocky Vector) */}
              <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex items-center gap-4 mb-3">
                <div className="w-24 h-36 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  <FullBodyPixelHuman
                    appearance={selectedAppearance}
                    age={22}
                    size={125}
                    contextMode="adult"
                    outfitCategory="business"
                    suitColorOverride={selectedAppearance.shirtColor}
                    handItem="briefcase"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-bold text-[#2C2523] truncate">{selectedAppearance.label}</div>
                  <div className="text-xs text-[#6E655F]">
                    Причёска: <span className="text-[#2E6F5E] font-semibold">{selectedAppearance.hairStyle}</span>
                  </div>
                  <div className="text-[11px] text-[#6E655F] leading-relaxed">
                    В 0–2 года вы начнёте младенцем, в 3–6 — с игрушкой, в 7–17 — со школьным рюкзаком, а с 18 лет сможете покупать деловые костюмы и портфели в магазине!
                  </div>
                </div>
              </div>

              {/* 60 Skins Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-6 gap-1.5 max-h-52 overflow-y-auto p-2 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2]">
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
                          ? 'bg-[#2E6F5E]/15 border-[#2E6F5E] scale-105 shadow-xs'
                          : 'bg-[#FFFFFF] border-[#DCD3C2] hover:bg-[#EFE8DC]'
                      }`}
                    >
                      <div className="w-8 h-10 flex items-center justify-center overflow-hidden">
                        <FullBodyPixelHuman
                          appearance={app}
                          age={24}
                          size={38}
                          contextMode="adult"
                          outfitCategory="business"
                          suitColorOverride={app.shirtColor}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-[#6E655F] mt-0.5">#{app.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hardcore Rules Info + Start CTA */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/35 text-xs text-[#2C2523] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C87A3E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#B56527]">Глубокий реализм:</span> реальные счета за еду и жильё, ВУЗы мира, бизнес-империя, гардероб с бонусами и ИИ-память.
                </div>
              </div>

              <button
                type="button"
                onClick={onStartLife}
                data-testid="start-life-btn"
                className="w-full py-3.5 px-6 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-display font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                Начать жизнь с 0 лет в г. {selectedCity.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
