import React, { useState, useMemo } from 'react';
import {
  PlayerState,
  PetItem,
  HouseItem,
  BrandItem,
  VehicleItem,
  TuningUpgrade,
  CityOption,
  TechGadgetItem,
  PcComponentItem,
  PcSlotType,
} from '../game/types';
import {
  PETS_CATALOG,
  HOUSES_CATALOG,
  BRANDS_CATALOG,
  CITIES_CATALOG,
} from '../game/catalogs';
import {
  VEHICLES_CATALOG,
  TUNING_CATALOG,
  TECH_GADGETS_CATALOG,
  PC_COMPONENTS_CATALOG,
  getItemReleaseYear,
} from '../game/worldData';
import { calculateCustomPcStats, formatMoney } from '../game/rules';
import { AssetTexturePreview } from './AssetTexturePreview';
import { FullBodyPixelHuman } from './FullBodyPixelHuman';
import { CharacterAppearance } from '../game/types';
import {
  Home,
  Car,
  Wrench,
  Plane,
  Dog,
  ShoppingBag,
  Receipt,
  Check,
  Sparkles,
  Search,
  Smartphone,
  Cpu,
  Monitor,
  Zap,
  Calendar,
  Lock,
  Scissors,
} from 'lucide-react';

interface AssetsBrandStorePanelProps {
  player: PlayerState;
  onBuyOrSelectHouse: (house: HouseItem) => void;
  onToggleRentHouse: (house: HouseItem) => void;
  onBuyOrSelectVehicle: (vehicle: VehicleItem) => void;
  onInstallTuning: (tuning: TuningUpgrade) => void;
  onBuyOrEquipTech: (gadget: TechGadgetItem) => void;
  onInstallPcComponent: (component: PcComponentItem) => void;
  onRelocateCity: (city: CityOption) => void;
  onBuyOrSelectPet: (pet: PetItem | null) => void;
  onBuyOrToggleBrand: (brand: BrandItem) => void;
  onUpdateAppearance?: (app: Partial<CharacterAppearance>) => void;
  onUpdatePlayerState?: (patch: Partial<PlayerState>) => void;
  onAskParentsForPet?: () => void;
}

type AssetTab =
  | 'houses'
  | 'vehicles'
  | 'tech'
  | 'pc_builder'
  | 'tuning'
  | 'relocate'
  | 'pets'
  | 'brands'
  | 'barbershop';

const PC_SLOT_ORDER: { slot: PcSlotType; label: string }[] = [
  { slot: 'cpu', label: '1. Процессор (CPU)' },
  { slot: 'gpu', label: '2. Видеокарта (GPU)' },
  { slot: 'ram', label: '3. Оперативная память (RAM)' },
  { slot: 'ssd', label: '4. SSD Накопитель (NVMe)' },
  { slot: 'cooling_case', label: '5. Корпус, БП и Охлаждение' },
  { slot: 'monitor', label: '6. Монитор и Периферия' },
];

export const AssetsBrandStorePanel: React.FC<AssetsBrandStorePanelProps> = ({
  player,
  onBuyOrSelectHouse,
  onToggleRentHouse,
  onBuyOrSelectVehicle,
  onInstallTuning,
  onBuyOrEquipTech,
  onInstallPcComponent,
  onRelocateCity,
  onBuyOrSelectPet,
  onBuyOrToggleBrand,
  onUpdateAppearance,
  onUpdatePlayerState,
  onAskParentsForPet,
}) => {
  const [subTab, setSubTab] = useState<AssetTab>('houses');
  const [vehicleCategory, setVehicleCategory] = useState<string>('ALL');
  const [vehicleSearch, setVehicleSearch] = useState<string>('');
  const [techCategory, setTechCategory] = useState<string>('ALL');
  const [selectedPcSlot, setSelectedPcSlot] = useState<PcSlotType>('gpu');
  const [relocateRegion, setRelocateRegion] = useState<string>('ALL');
  const [relocateSearch, setRelocateSearch] = useState<string>('');
  const [onlyAvailableByEra, setOnlyAvailableByEra] = useState<boolean>(false);

  const vehicleCategories = useMemo(() => {
    const set = new Set<string>();
    VEHICLES_CATALOG.forEach((v) => set.add(v.categoryLabel));
    return Array.from(set);
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    return VEHICLES_CATALOG.filter((v) => {
      const catOk = vehicleCategory === 'ALL' || v.categoryLabel === vehicleCategory;
      const queryOk =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.categoryLabel.toLowerCase().includes(q);
      const relYear = getItemReleaseYear(v.id, v.price);
      const eraOk = !onlyAvailableByEra || relYear <= player.currentYear;
      return catOk && queryOk && eraOk;
    });
  }, [vehicleCategory, vehicleSearch, onlyAvailableByEra, player.currentYear]);

  const techCategories = useMemo(() => {
    const set = new Set<string>();
    TECH_GADGETS_CATALOG.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, []);

  const filteredTech = useMemo(() => {
    return TECH_GADGETS_CATALOG.filter((t) => {
      const catOk = techCategory === 'ALL' || t.category === techCategory;
      const relYear = getItemReleaseYear(t.id, t.price);
      const eraOk = !onlyAvailableByEra || relYear <= player.currentYear;
      return catOk && eraOk;
    });
  }, [techCategory, onlyAvailableByEra, player.currentYear]);

  const slotComponents = useMemo(() => {
    return PC_COMPONENTS_CATALOG.filter((c) => c.slot === selectedPcSlot);
  }, [selectedPcSlot]);

  const filteredCities = useMemo(() => {
    const q = relocateSearch.trim().toLowerCase();
    return CITIES_CATALOG.filter((c) => {
      const regOk = relocateRegion === 'ALL' || c.regionGroup === relocateRegion;
      const queryOk =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);
      return regOk && queryOk;
    });
  }, [relocateRegion, relocateSearch]);

  const exp = player.monthlyExpenses;
  const pcStats = calculateCustomPcStats(player);
  const activePhone = TECH_GADGETS_CATALOG.find((g) => g.id === player.activeSmartphoneId);
  const activeLaptop = TECH_GADGETS_CATALOG.find((g) => g.id === player.activeLaptopId);

  return (
    <div className="space-y-5">
      {/* Realistic Monthly Bills & Era Technology Banner */}
      <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Ежемесячные расходы ({player.city.name}) · Эпоха на дворе: <strong className="text-emerald-400">{player.currentYear} г.</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyAvailableByEra((p) => !p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 cursor-pointer border ${
                onlyAvailableByEra
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-[#121926] border-[#243247] text-slate-300'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {onlyAvailableByEra ? `Только техника до ${player.currentYear} г.` : 'Показать все годы выпуска'}
            </button>
            <span className="text-sm font-mono font-bold text-rose-400">
              -{formatMoney(exp.total, player.currency)} / мес
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
            <div className="text-[10px] text-slate-400">Еда и продукты</div>
            <div className="text-white font-semibold mt-0.5">
              {formatMoney(exp.food, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
            <div className="text-[10px] text-slate-400">ЖКХ и коммуналка</div>
            <div className="text-white font-semibold mt-0.5">
              {formatMoney(exp.utilities, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
            <div className="text-[10px] text-slate-400">Аренда / Налог дома</div>
            <div className="text-white font-semibold mt-0.5">
              {formatMoney(exp.rentOrUpkeep, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
            <div className="text-[10px] text-slate-400">Транспорт / Топливо</div>
            <div className="text-white font-semibold mt-0.5">
              {formatMoney(exp.transport, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
            <div className="text-[10px] text-slate-400">Хобби и Клубы</div>
            <div className="text-white font-semibold mt-0.5">
              {formatMoney(exp.hobbiesAndFaction, player.currency)}/м
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 bg-[#0B0F17] p-1.5 rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setSubTab('houses')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'houses'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Дома и Виллы</span>
          {player.age < 18 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 18 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('vehicles')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'vehicles'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Автопарк</span>
          {player.age < 6 ? (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 6 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-600/40">
              {player.age < 16 ? 'Велосипеды' : 'Мото 16+'}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tech')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'tech'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Телефоны и Техника
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pc_builder')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'pc_builder'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Сборка ПК</span>
          {player.age < 12 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/40">
              <Lock className="w-2.5 h-2.5" /> с 12 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tuning')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'tuning'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Тюнинг Домов и Авто
        </button>
        <button
          type="button"
          onClick={() => setSubTab('relocate')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'relocate'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Plane className="w-3.5 h-3.5" /> Переезд ({CITIES_CATALOG.length} городов)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'pets'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Dog className="w-3.5 h-3.5" />
          <span>Питомцы</span>
          {player.activePetId === null && <span className="text-[10px] text-slate-400">(нет)</span>}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('brands')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'brands'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Бренды
        </button>
        <button
          type="button"
          onClick={() => setSubTab('barbershop')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'barbershop'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" /> Барбершоп & Стиль
        </button>
      </div>

      {/* 1. REAL ESTATE (HOUSES & APARTMENTS) WITH TEXTURED PREVIEW */}
      {subTab === 'houses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HOUSES_CATALOG.map((house) => {
            const owned = player.ownedHouseIds.includes(house.id);
            const active = player.activeHouseId === house.id;
            const rentedOut = player.rentedOutHouseIds.includes(house.id);
            const canBuy = player.money >= house.price;

            return (
              <div
                key={house.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/60'
                    : 'bg-[#0B0F17] border-[#1E293B]'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="w-full h-24 rounded-lg bg-[#070A0F] border border-[#1E293B] flex items-center justify-center overflow-hidden">
                    <AssetTexturePreview
                      kind="house"
                      house={house}
                    />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {house.propertyType} • {house.floors} эт.
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {house.price === 0 ? 'Бесплатно' : formatMoney(house.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{house.name}</h4>
                    <p className="text-xs text-emerald-300 mt-0.5">{house.skillBonusLabel}</p>
                    {house.monthlyRentIncome > 0 && (
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Аренда: +{formatMoney(house.monthlyRentIncome, player.currency)}/мес
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex flex-wrap items-center justify-end gap-2">
                  {owned && house.id !== 'parents_home' && !active && (
                    <button
                      type="button"
                      onClick={() => onToggleRentHouse(house)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                        rentedOut
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {rentedOut ? 'Сдаётся в аренду' : 'Сдать в аренду'}
                    </button>
                  )}

                  {player.age < 18 && !owned ? (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400 border border-amber-500/30 cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                    >
                      🔒 Покупка с 18 лет
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!owned && !canBuy}
                      onClick={() => onBuyOrSelectHouse(house)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : owned
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : canBuy
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {active
                        ? 'Вы живёте здесь'
                        : owned
                        ? 'Переехать сюда'
                        : `Купить (${formatMoney(house.price, player.currency)})`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. EXPANDED VEHICLES & TRANSPORT WITH TEXTURES & ERA RELEASE YEAR */}
      {subTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Поиск среди 55+ авто (ВАЗ 2107, Lanos, Skyline R34, Supra, M5 CS, Гелендваген, Urus, 911 GT3 RS, Jesko)..."
                aria-label="Поиск транспорта"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <select
              aria-label="Категория транспорта"
              value={vehicleCategory}
              onChange={(e) => setVehicleCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-200"
            >
              <option value="ALL">Все виды транспорта ({VEHICLES_CATALOG.length})</option>
              {vehicleCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredVehicles.map((veh) => {
              const owned = player.ownedVehicleIds.includes(veh.id);
              const active = player.activeVehicleId === veh.id;
              const releaseYear = getItemReleaseYear(veh.id, veh.price);
              const eraUnlocked = player.currentYear >= releaseYear;
              const vehMinAge = veh.type === 'bicycle' ? 6 : veh.type === 'motorcycle' ? 16 : 18;
              const ageOk = player.age >= vehMinAge;
              const canBuy = player.money >= veh.price && eraUnlocked && ageOk;

              return (
                <div
                  key={veh.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="w-full h-20 rounded-lg bg-[#070A0F] border border-[#1E293B] flex items-center justify-center overflow-hidden">
                      <AssetTexturePreview
                        kind="vehicle"
                        vehicle={veh}
                        releaseYear={releaseYear}
                      />
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 truncate">
                          {veh.categoryLabel} • {veh.baseHorsepower} л.с.
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {formatMoney(veh.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{veh.name}</h4>
                      <div className="text-xs text-slate-400 mt-1">
                        Престиж: <span className="text-emerald-300">+{veh.prestigeBonus}</span> • Выпуск:{' '}
                        <span className={eraUnlocked ? 'text-cyan-300 font-mono' : 'text-rose-400 font-mono'}>
                          {releaseYear} г.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: veh.bodyColor }}
                      />
                      <span className="text-[11px] text-slate-400">{veh.brand}</span>
                    </div>
                    {!ageOk && !owned ? (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400 border border-amber-500/30 cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                      >
                        🔒 с {vehMinAge} лет
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!owned && !canBuy}
                        onClick={() => onBuyOrSelectVehicle(veh)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                            : owned
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : canBuy
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {active
                          ? 'Активен'
                          : owned
                          ? 'Выбрать'
                          : !eraUnlocked
                          ? `Выйдет в ${releaseYear} г.`
                          : `Купить (${formatMoney(veh.price, player.currency)})`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SMARTPHONES, LAPTOPS, CONSOLES, CAMERAS & TECH GADGETS WITH TEXTURES & ERA RELEASE YEAR */}
      {subTab === 'tech' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Активный Смартфон</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {activePhone ? activePhone.name : 'Не выбран (купите смартфон)'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Активный Ноутбук</div>
              <div className="text-xs font-bold text-cyan-300 mt-0.5">
                {activeLaptop ? activeLaptop.name : 'Не выбран (купите ноутбук)'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Всего гаджетов в коллекции</div>
              <div className="text-xs font-bold text-white mt-0.5">
                {player.ownedTechGadgetIds.length} / {TECH_GADGETS_CATALOG.length} шт.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              Смартфоны, ноутбуки, консоли и камеры (появляются в продаже согласно году выпуска — сейчас {player.currentYear} г.):
            </span>
            <select
              aria-label="Категория техники"
              value={techCategory}
              onChange={(e) => setTechCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-200"
            >
              <option value="ALL">Вся техника ({TECH_GADGETS_CATALOG.length})</option>
              {techCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredTech.map((gadget) => {
              const owned = player.ownedTechGadgetIds.includes(gadget.id);
              const isEquipped =
                player.activeSmartphoneId === gadget.id || player.activeLaptopId === gadget.id;
              const releaseYear = getItemReleaseYear(gadget.id, gadget.price);
              const eraUnlocked = player.currentYear >= releaseYear;
              const canBuy = player.money >= gadget.price && eraUnlocked;

              return (
                <div
                  key={gadget.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isEquipped || owned
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div className="flex gap-3">
                    <AssetTexturePreview
                      kind="tech"
                      tech={gadget}
                      releaseYear={releaseYear}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-300 truncate">
                          {gadget.category} • {gadget.brand}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {formatMoney(gadget.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{gadget.name}</h4>
                      <div className="text-[11px] font-mono text-slate-300 mt-0.5">{gadget.description}</div>
                      <div className="text-xs text-emerald-300 mt-1">
                        KPI +{gadget.kpiBoost} • Ум +{gadget.intellectBonus} • Выпуск: {releaseYear} г.
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {isEquipped ? 'Активное устройство' : owned ? 'В коллекции' : `Релиз: ${releaseYear} г.`}
                    </span>
                    <button
                      type="button"
                      disabled={!owned && !canBuy}
                      onClick={() => onBuyOrEquipTech(gadget)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isEquipped
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : owned
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : canBuy
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped
                        ? 'Используется'
                        : owned
                        ? 'Сделать основным'
                        : !eraUnlocked
                        ? `Релиз в ${releaseYear} г.`
                        : `Купить (${formatMoney(gadget.price, player.currency)})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CUSTOM PC BUILDER WITH TEXTURED HARDWARE PREVIEWS */}
      {subTab === 'pc_builder' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase text-emerald-400">
                  Кастомный Конструктор ПК (Собрано слотов: {pcStats.completedSlotsCount}/6)
                </span>
              </div>
              <span className="text-xs font-mono text-amber-300">
                Статус сборки: {pcStats.isFullRig ? 'Полный Кастом (Бонус ×1.25)' : 'В процессе апгрейда'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Рейтинг 3DMark / Benchmark</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">
                  {pcStats.totalPerfScore} pts
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Частота кадров (4K Ultra)</div>
                <div className="text-cyan-300 font-bold text-sm mt-0.5">
                  {pcStats.estimatedFps4k} FPS
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Множитель зарплаты и KPI</div>
                <div className="text-amber-300 font-bold text-sm mt-0.5">
                  ×{pcStats.totalCareerTechMultiplier} к доходу
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111724] border border-[#1E293B]">
                <div className="text-[10px] text-slate-400">Энергопотребление ПК</div>
                <div className="text-white font-bold text-sm mt-0.5">{pcStats.totalPowerWatts} Вт</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {PC_SLOT_ORDER.map((item) => {
                const installedId = player.customPcBuild[item.slot];
                const installedPart = PC_COMPONENTS_CATALOG.find((c) => c.id === installedId);
                const isSelected = selectedPcSlot === item.slot;
                return (
                  <button
                    key={item.slot}
                    type="button"
                    onClick={() => setSelectedPcSlot(item.slot)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400'
                        : 'bg-[#111724] hover:bg-[#161F30] border-[#1E293B]'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase text-slate-400">{item.label}</div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">
                      {installedPart ? installedPart.name : 'Не установлено (Выбрать)'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {slotComponents.map((comp) => {
              const isInstalled = player.customPcBuild[comp.slot] === comp.id;
              const canAfford = player.money >= comp.price;

              return (
                <div
                  key={comp.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isInstalled
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div className="flex gap-3">
                    <AssetTexturePreview
                      kind="pc"
                      pc={comp}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {comp.slotLabel} • Tier {comp.tier}/5
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {formatMoney(comp.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{comp.name}</h4>
                      <div className="text-xs text-slate-300 mt-0.5 font-mono">{comp.bonusLabel}</div>
                      <div className="text-xs text-emerald-300 mt-1">
                        Производительность +{comp.perfScore} pts • +{comp.tier * 2} Интеллект
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> {comp.powerWatts} Вт
                    </span>
                    <button
                      type="button"
                      disabled={isInstalled || !canAfford}
                      onClick={() => onInstallPcComponent(comp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isInstalled
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isInstalled
                        ? 'Установлено в ПК'
                        : `Установить (${formatMoney(comp.price, player.currency)})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. HOME & VEHICLE TUNING */}
      {subTab === 'tuning' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            Тюнинг домов (спортзал, студия, солнечные панели) и транспорта (Stage 2/3, карбоновый обвес, неоновая подсветка, бронирование VIP) визуально меняет вашу сцену и даёт постоянные бонусы!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TUNING_CATALOG.map((tune) => {
              const isInstalled =
                tune.targetType === 'house'
                  ? player.installedHouseTuningIds.includes(tune.id)
                  : player.installedVehicleTuningIds.includes(tune.id);
              const hasVehicle = tune.targetType === 'house' || Boolean(player.activeVehicleId);
              const canBuy = !isInstalled && hasVehicle && player.money >= tune.price;

              return (
                <div
                  key={tune.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isInstalled
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {tune.targetType === 'house' ? 'Тюнинг Дома' : 'Тюнинг Транспорта'}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {formatMoney(tune.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{tune.name}</h4>
                    <p className="text-xs text-emerald-300 mt-1">{tune.bonusLabel}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Престиж +{tune.prestigeBonus}
                      {tune.horsepowerBonus > 0 ? ` • +${tune.horsepowerBonus} л.с.` : ''}
                    </span>
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onInstallTuning(tune)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isInstalled
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : !hasVehicle
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canBuy
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isInstalled
                        ? 'Установлено'
                        : !hasVehicle
                        ? 'Сначала купите транспорт'
                        : 'Установить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. WORLD RELOCATION (74+ CITIES, UKRAINE, EUROPE & RESORTS) */}
      {subTab === 'relocate' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={relocateSearch}
                onChange={(e) => setRelocateSearch(e.target.value)}
                placeholder="Поиск города или курорта (Киев, Львов, Одесса, Лондон, Монако, Бали, Майами)..."
                aria-label="Поиск города для переезда"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <select
              aria-label="Регион переезда"
              value={relocateRegion}
              onChange={(e) => setRelocateRegion(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-slate-200 outline-none"
            >
              <option value="ALL">Все регионы ({CITIES_CATALOG.length} городов)</option>
              <option value="Украина (Областные центры)">Украина (25 областных центров)</option>
              <option value="Евросоюз и Европа">Евросоюз и Европа (26)</option>
              <option value="Курорты мира и Европы">Курорты мира и Европы (13)</option>
              <option value="СНГ и Восточная Европа">СНГ и Восточная Европа</option>
              <option value="Северная и Южная Америка">Северная и Южная Америка</option>
              <option value="Азия и Ближний Восток">Азия и Ближний Восток</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isCurrent = city.id === player.city.id;
              const canAfford = player.money >= city.relocationCost;

              return (
                <div
                  key={city.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{city.regionGroup}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Валюта: {city.currency}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {city.name}, {city.country}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Коэф. зарплат: ×{city.economyMultiplier.toFixed(2)} • Аренда ~{formatMoney(city.monthlyRentBase, city.currency)}/мес
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-300">
                      Перелёт и виза: {formatMoney(city.relocationCost, player.currency)}
                    </span>
                    <button
                      type="button"
                      disabled={isCurrent || !canAfford}
                      onClick={() => onRelocateCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Ваш город' : 'Переехать'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. OPTIONAL PETS (CAN HAVE OR NOT HAVE A PET) */}
      {subTab === 'pets' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-300">
              Питомец — полностью <strong className="text-emerald-400">опционален</strong>. Вы можете жить без питомца или взять верного спутника.
            </div>
            <button
              type="button"
              onClick={() => onBuyOrSelectPet(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                player.activePetId === null
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              {player.activePetId === null ? '✓ Сейчас: Без питомца' : 'Оставить дома / Жить без питомца'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PETS_CATALOG.map((pet) => {
              const owned = player.ownedPetIds.includes(pet.id);
              const active = player.activePetId === pet.id;
              const canBuy = player.money >= pet.price;

              return (
                <div
                  key={pet.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/60'
                      : 'bg-[#0B0F17] border-[#1E293B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{pet.breedLabel}</span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {pet.price === 0 ? 'Семья' : formatMoney(pet.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{pet.name}</h4>
                    <p className="text-xs text-emerald-300 mt-1">{pet.skillBonusLabel}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex justify-end">
                    <button
                      type="button"
                      disabled={!owned && !canBuy}
                      onClick={() => onBuyOrSelectPet(pet)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : owned || canBuy
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {active ? 'Рядом с вами' : owned ? 'Позвать с собой' : 'Приютить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. CLOTHING BRANDS */}
      {subTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BRANDS_CATALOG.map((item) => {
            const owned = player.ownedBrandIds.includes(item.id);
            const equipped = player.equippedBrandIds.includes(item.id);
            const canBuy = player.money >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  equipped
                    ? 'bg-emerald-500/15 border-emerald-500/60'
                    : 'bg-[#0B0F17] border-[#1E293B]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">{item.brand}</span>
                    <span className="text-xs font-mono text-amber-300">
                      {formatMoney(item.price, player.currency)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{item.name}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    Стиль +{item.stylePoints} • Харизма +{item.charismaBonus} • Уберэкс +{item.urbexBonus}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{item.badgeText}</span>
                  <button
                    type="button"
                    disabled={!owned && !canBuy}
                    onClick={() => onBuyOrToggleBrand(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                      equipped
                        ? 'bg-emerald-500 text-slate-950 cursor-pointer'
                        : owned || canBuy
                        ? 'bg-[#161F30] hover:bg-[#1E293B] text-white border border-[#283548] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {equipped && <Check className="w-3.5 h-3.5" />}
                    {equipped ? 'Надето' : owned ? 'Надеть' : 'Купить'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 9. BARBERSHOP & WARDROBE STYLING */}
      {subTab === 'barbershop' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4" /> Барбершоп, Гардероб и Стилистика
              </div>
              <div className="text-sm text-slate-300 mt-0.5">
                Настройте уникальный стиль персонажа: причёску, бороду, усы, татуировки и стиль одежды.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Live Character Preview */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#070b12] border border-[#1E293B] flex flex-col items-center justify-center space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Живой предпросмотр (Hi-Bit 1:4)
              </div>
              <div className="w-48 h-72 bg-[#0d131f] rounded-2xl border border-[#1e2938] flex items-center justify-center shadow-inner overflow-hidden">
                <FullBodyPixelHuman
                  appearance={player.appearance}
                  age={player.age}
                  size={240}
                  outfitStyle={player.outfitStyle}
                  facialHairId={player.facialHairId}
                  hasMask={player.hasMask}
                  hasInjury={player.hasInjury}
                />
              </div>
              <div className="text-xs font-mono text-emerald-300 text-center">
                {player.name} · {player.age} лет · {player.outfitStyle.toUpperCase()}
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:col-span-7 space-y-4">
              {/* Hairstyle */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Причёска и Стрижка</span>
                  <span className="text-xs font-mono text-emerald-400">{player.appearance.hairStyle}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {(['short', 'fade', 'long', 'curly', 'spiky', 'bun', 'bob', 'hood'] as const).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => onUpdateAppearance?.({ hairStyle: style })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          player.appearance.hairStyle === style
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[#151d2a] text-slate-300 hover:bg-[#1e293b]'
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Facial Hair (14+) */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Борода и Усы</span>
                  {player.age < 14 && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> с 14 лет
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'none', label: 'Гладко выбрит' },
                      { id: 'stubble', label: 'Щетина' },
                      { id: 'mustache', label: 'Усы' },
                      { id: 'goatee', label: 'Эспаньолка' },
                      { id: 'beard', label: 'Борода' },
                      { id: 'full_beard', label: 'Густая борода' },
                    ] as const
                  ).map((fh) => {
                    const isLocked = player.age < 14 && fh.id !== 'none';
                    return (
                      <button
                        key={fh.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => onUpdatePlayerState?.({ facialHairId: fh.id })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isLocked
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                            : player.facialHairId === fh.id
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[#151d2a] text-slate-300 hover:bg-[#1e293b] cursor-pointer'
                        }`}
                      >
                        {fh.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outfit Style */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Стиль гардероба</span>
                  <span className="text-xs font-mono text-emerald-400">{player.outfitStyle}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: 'casual', label: 'Casual' },
                      { id: 'business', label: 'Business' },
                      { id: 'sport', label: 'Sport' },
                      { id: 'street', label: 'Street' },
                      { id: 'luxury', label: 'Luxury' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onUpdatePlayerState?.({ outfitStyle: st.id })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        player.outfitStyle === st.id
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-[#151d2a] text-slate-300 hover:bg-[#1e293b]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tattoos & Tactical Mask */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Татуировки и Аксессуары</span>
                  {player.age < 18 && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Тату с 18 лет
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((lvl) => {
                    const isLocked = player.age < 18 && lvl > 0;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isLocked}
                        onClick={() => onUpdatePlayerState?.({ tattooLevel: lvl })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isLocked
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                            : player.tattooLevel === lvl
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[#151d2a] text-slate-300 hover:bg-[#1e293b] cursor-pointer'
                        }`}
                      >
                        {lvl === 0 ? 'Без тату' : `Тату Ур. ${lvl}`}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onUpdatePlayerState?.({ hasMask: !player.hasMask })}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      player.hasMask
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-[#151d2a] text-slate-300 hover:bg-[#1e293b]'
                    }`}
                  >
                    {player.hasMask ? '✓ Маска надета (Тактическая балаклава)' : 'Надеть маску'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
