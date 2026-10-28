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
  WardrobeItem,
  CharacterAppearance,
} from '../game/types';
import {
  PETS_CATALOG,
  HOUSES_CATALOG,
  BRANDS_CATALOG,
  CITIES_CATALOG,
  WARDROBE_CATALOG,
  HAIR_STYLES,
  SKIN_TONES,
  HAIR_COLORS,
} from '../game/catalogs';
import {
  VEHICLES_CATALOG,
  TUNING_CATALOG,
  TECH_GADGETS_CATALOG,
  PC_COMPONENTS_CATALOG,
  getItemReleaseYear,
} from '../game/worldData';
import {
  calculateCustomPcStats,
  formatMoney,
  resolveCharacterAutoContext,
} from '../game/rules';
import { AssetTexturePreview } from './AssetTexturePreview';
import { FullBodyPixelHuman } from './FullBodyPixelHuman';
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
  onBuyOrEquipWardrobe?: (item: WardrobeItem) => void;
  onToggleMilitaryService?: () => void;
  onUpdateAppearance?: (app: Partial<CharacterAppearance>) => void;
  onUpdatePlayerState?: (patch: Partial<PlayerState>) => void;
  onAskParentsForPet?: () => void;
}

type AssetTab =
  | 'barbershop'
  | 'houses'
  | 'vehicles'
  | 'tech'
  | 'pc_builder'
  | 'tuning'
  | 'relocate'
  | 'pets'
  | 'brands';

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
  onBuyOrEquipWardrobe,
  onToggleMilitaryService,
  onUpdateAppearance,
  onUpdatePlayerState,
}) => {
  const [subTab, setSubTab] = useState<AssetTab>('barbershop');
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
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#2E6F5E]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E655F]">
              Ежемесячные расходы ({player.city.name}) · Эпоха на дворе:{' '}
              <strong className="text-[#2E6F5E]">{player.currentYear} г.</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyAvailableByEra((p) => !p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 cursor-pointer border ${
                onlyAvailableByEra
                  ? 'bg-[#2E6F5E]/15 border-[#2E6F5E] text-[#2E6F5E] font-bold'
                  : 'bg-[#FFFFFF] border-[#DCD3C2] text-[#2C2523] hover:bg-[#EFE8DC]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {onlyAvailableByEra
                ? `Только техника до ${player.currentYear} г.`
                : 'Показать все годы выпуска'}
            </button>
            <span className="text-sm font-mono font-bold text-[#B84A39]">
              -{formatMoney(exp.total, player.currency)} / мес
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
            <div className="text-[10px] text-[#6E655F]">Еда и продукты</div>
            <div className="text-[#2C2523] font-semibold mt-0.5">
              {formatMoney(exp.food, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
            <div className="text-[10px] text-[#6E655F]">ЖКХ и коммуналка</div>
            <div className="text-[#2C2523] font-semibold mt-0.5">
              {formatMoney(exp.utilities, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
            <div className="text-[10px] text-[#6E655F]">Аренда / Налог дома</div>
            <div className="text-[#2C2523] font-semibold mt-0.5">
              {formatMoney(exp.rentOrUpkeep, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
            <div className="text-[10px] text-[#6E655F]">Транспорт / Топливо</div>
            <div className="text-[#2C2523] font-semibold mt-0.5">
              {formatMoney(exp.transport, player.currency)}/м
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
            <div className="text-[10px] text-[#6E655F]">Хобби и Клубы</div>
            <div className="text-[#2C2523] font-semibold mt-0.5">
              {formatMoney(exp.hobbiesAndFaction, player.currency)}/м
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#DCD3C2]">
        <button
          type="button"
          onClick={() => setSubTab('barbershop')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'barbershop'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Гардероб и Аксессуары</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('houses')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'houses'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Дома и Виллы</span>
          {player.age < 18 && (
            <span className="flex items-center gap-0.5 text-[10px] text-[#C87A3E] bg-[#C87A3E]/15 px-1.5 py-0.5 rounded border border-[#C87A3E]/40">
              <Lock className="w-2.5 h-2.5" /> с 18 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('vehicles')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'vehicles'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Автопарк</span>
          {player.age < 6 ? (
            <span className="flex items-center gap-0.5 text-[10px] text-[#C87A3E] bg-[#C87A3E]/15 px-1.5 py-0.5 rounded border border-[#C87A3E]/40">
              <Lock className="w-2.5 h-2.5" /> с 6 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[10px] text-[#3B5B76] bg-[#3B5B76]/15 px-1.5 py-0.5 rounded border border-[#3B5B76]/40">
              {player.age < 16 ? 'Велосипеды' : 'Мото 16+'}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tech')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'tech'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Телефоны и Техника
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pc_builder')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'pc_builder'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Сборка ПК</span>
          {player.age < 12 && (
            <span className="flex items-center gap-0.5 text-[10px] text-[#C87A3E] bg-[#C87A3E]/15 px-1.5 py-0.5 rounded border border-[#C87A3E]/40">
              <Lock className="w-2.5 h-2.5" /> с 12 лет
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tuning')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'tuning'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Тюнинг Домов и Авто
        </button>
        <button
          type="button"
          onClick={() => setSubTab('relocate')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'relocate'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Plane className="w-3.5 h-3.5" /> Переезд ({CITIES_CATALOG.length} городов)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'pets'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Dog className="w-3.5 h-3.5" />
          <span>Питомцы</span>
          {player.activePetId === null && <span className="text-[10px] opacity-80">(нет)</span>}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('brands')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'brands'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Бренды
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
                    ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                    : 'bg-[#FAF7F2] border-[#DCD3C2]'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="w-full h-24 rounded-lg bg-[#EFE8DC] border border-[#DCD3C2] flex items-center justify-center overflow-hidden">
                    <AssetTexturePreview kind="house" house={house} />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#6E655F] font-semibold">
                        {house.propertyType} • {house.floors} эт.
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C87A3E]">
                        {house.price === 0 ? 'Бесплатно' : formatMoney(house.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C2523] mt-1.5">{house.name}</h4>
                    <p className="text-xs text-[#2E6F5E] font-medium mt-0.5">{house.skillBonusLabel}</p>
                    {house.monthlyRentIncome > 0 && (
                      <div className="text-[11px] font-mono text-[#6E655F] mt-1">
                        Аренда: +{formatMoney(house.monthlyRentIncome, player.currency)}/мес
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex flex-wrap items-center justify-end gap-2">
                  {owned && house.id !== 'parents_home' && !active && (
                    <button
                      type="button"
                      onClick={() => onToggleRentHouse(house)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                        rentedOut
                          ? 'bg-[#C87A3E] text-[#FAF7F2] font-bold'
                          : 'bg-[#FFFFFF] hover:bg-[#EFE8DC] text-[#2C2523] border border-[#DCD3C2]'
                      }`}
                    >
                      {rentedOut ? 'Сдаётся в аренду' : 'Сдать в аренду'}
                    </button>
                  )}

                  {player.age < 18 && !owned ? (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE8DC] text-[#C87A3E] border border-[#C87A3E]/40 cursor-not-allowed whitespace-nowrap flex items-center gap-1"
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
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : owned
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : canBuy
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
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
              <Search className="w-4 h-4 text-[#6E655F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Поиск среди 55+ авто (ВАЗ 2107, Lanos, Skyline R34, Supra, M5 CS, Гелендваген, Urus, 911 GT3 RS, Jesko)..."
                aria-label="Поиск транспорта"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none focus:border-[#2E6F5E]"
              />
            </div>
            <select
              aria-label="Категория транспорта"
              value={vehicleCategory}
              onChange={(e) => setVehicleCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
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
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="w-full h-20 rounded-lg bg-[#EFE8DC] border border-[#DCD3C2] flex items-center justify-center overflow-hidden">
                      <AssetTexturePreview
                        kind="vehicle"
                        vehicle={veh}
                        releaseYear={releaseYear}
                      />
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#6E655F] font-semibold truncate">
                          {veh.categoryLabel} • {veh.baseHorsepower} л.с.
                        </span>
                        <span className="text-xs font-mono font-bold text-[#C87A3E]">
                          {formatMoney(veh.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C2523] mt-1.5">{veh.name}</h4>
                      <div className="text-xs text-[#6E655F] mt-1">
                        Престиж: <span className="text-[#2E6F5E] font-semibold">+{veh.prestigeBonus}</span> • Выпуск:{' '}
                        <span
                          className={
                            eraUnlocked
                              ? 'text-[#3B5B76] font-mono font-semibold'
                              : 'text-[#B84A39] font-mono font-semibold'
                          }
                        >
                          {releaseYear} г.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: veh.bodyColor }}
                      />
                      <span className="text-[11px] text-[#6E655F]">{veh.brand}</span>
                    </div>
                    {!ageOk && !owned ? (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE8DC] text-[#C87A3E] border border-[#C87A3E]/40 cursor-not-allowed whitespace-nowrap flex items-center gap-1"
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
                            ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                            : owned
                            ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                            : canBuy
                            ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                            : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
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
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <div className="text-[10px] uppercase text-[#6E655F]">Активный Смартфон</div>
              <div className="text-xs font-bold text-[#2E6F5E] mt-0.5">
                {activePhone ? activePhone.name : 'Не выбран (купите смартфон)'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#6E655F]">Активный Ноутбук</div>
              <div className="text-xs font-bold text-[#3B5B76] mt-0.5">
                {activeLaptop ? activeLaptop.name : 'Не выбран (купите ноутбук)'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#6E655F]">Всего гаджетов в коллекции</div>
              <div className="text-xs font-bold text-[#2C2523] mt-0.5">
                {player.ownedTechGadgetIds.length} / {TECH_GADGETS_CATALOG.length} шт.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[#6E655F]">
              Смартфоны, ноутбуки, консоли и камеры (появляются в продаже согласно году выпуска — сейчас {player.currentYear} г.):
            </span>
            <select
              aria-label="Категория техники"
              value={techCategory}
              onChange={(e) => setTechCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
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
              const ageOk = player.age >= 12;
              const canBuy = ageOk && (player.money >= gadget.price || player.age < 18) && eraUnlocked;

              return (
                <div
                  key={gadget.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isEquipped || owned
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
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
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#2E6F5E] font-semibold truncate">
                          {gadget.category} • {gadget.brand}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#C87A3E]">
                          {formatMoney(gadget.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C2523] mt-1.5">{gadget.name}</h4>
                      <div className="text-[11px] font-mono text-[#6E655F] mt-0.5">{gadget.description}</div>
                      <div className="text-xs text-[#2E6F5E] font-medium mt-1">
                        KPI +{gadget.kpiBoost} • Ум +{gadget.intellectBonus} • Выпуск: {releaseYear} г.
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#6E655F]">
                      {isEquipped ? 'Активное устройство' : owned ? 'В коллекции' : `Релиз: ${releaseYear} г.`}
                    </span>
                    <button
                      type="button"
                      disabled={!owned && !canBuy}
                      onClick={() => onBuyOrEquipTech(gadget)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isEquipped
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : owned
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : canBuy
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                      }`}
                    >
                      {isEquipped
                        ? 'Используется'
                        : owned
                        ? 'Сделать основным'
                        : !ageOk
                        ? '🔒 с 12 лет'
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
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#2E6F5E]" />
                <span className="text-xs font-mono uppercase text-[#2E6F5E] font-bold">
                  Кастомный Конструктор ПК (Собрано слотов: {pcStats.completedSlotsCount}/6)
                </span>
              </div>
              <span className="text-xs font-mono text-[#C87A3E] font-semibold">
                Статус сборки: {pcStats.isFullRig ? 'Полный Кастом (Бонус ×1.25)' : 'В процессе апгрейда'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Рейтинг 3DMark / Benchmark</div>
                <div className="text-[#2E6F5E] font-bold text-sm mt-0.5">
                  {pcStats.totalPerfScore} pts
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Частота кадров (4K Ultra)</div>
                <div className="text-[#3B5B76] font-bold text-sm mt-0.5">
                  {pcStats.estimatedFps4k} FPS
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Множитель зарплаты и KPI</div>
                <div className="text-[#C87A3E] font-bold text-sm mt-0.5">
                  ×{pcStats.totalCareerTechMultiplier} к доходу
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Энергопотребление ПК</div>
                <div className="text-[#2C2523] font-bold text-sm mt-0.5">{pcStats.totalPowerWatts} Вт</div>
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
                        ? 'bg-[#2E6F5E]/15 border-[#2E6F5E]'
                        : 'bg-[#FFFFFF] hover:bg-[#EFE8DC] border-[#DCD3C2]'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase text-[#6E655F]">{item.label}</div>
                    <div className="text-xs font-bold text-[#2C2523] truncate mt-0.5">
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
              const ageOk = player.age >= 12;
              const canAfford = ageOk && player.money >= comp.price;

              return (
                <div
                  key={comp.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isInstalled
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
                  }`}
                >
                  <div className="flex gap-3">
                    <AssetTexturePreview kind="pc" pc={comp} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#3B5B76] font-semibold">
                          {comp.slotLabel} • Tier {comp.tier}/5
                        </span>
                        <span className="text-xs font-mono font-bold text-[#C87A3E]">
                          {formatMoney(comp.price, player.currency)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C2523] mt-1.5">{comp.name}</h4>
                      <div className="text-xs text-[#6E655F] mt-0.5 font-mono">{comp.bonusLabel}</div>
                      <div className="text-xs text-[#2E6F5E] font-semibold mt-1">
                        Производительность +{comp.perfScore} pts • +{comp.tier * 2} Интеллект
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#6E655F] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#C87A3E]" /> {comp.powerWatts} Вт
                    </span>
                    <button
                      type="button"
                      disabled={isInstalled || !canAfford}
                      onClick={() => onInstallPcComponent(comp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isInstalled
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : canAfford
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                      }`}
                    >
                      {isInstalled
                        ? 'Установлено в ПК'
                        : !ageOk
                        ? '🔒 с 12 лет'
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
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#6E655F] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2E6F5E] shrink-0" />
            Тюнинг домов (спортзал, студия, солнечные панели) и транспорта (Stage 2/3, карбоновый обвес, неоновая подсветка, бронирование VIP) визуально меняет вашу сцену и даёт постоянные бонусы!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TUNING_CATALOG.map((tune) => {
              const isInstalled =
                tune.targetType === 'house'
                  ? player.installedHouseTuningIds.includes(tune.id)
                  : player.installedVehicleTuningIds.includes(tune.id);
              const minTuneAge = tune.targetType === 'house' ? 18 : 16;
              const ageOk = player.age >= minTuneAge;
              const hasVehicle = tune.targetType === 'house' || Boolean(player.activeVehicleId);
              const canBuy = !isInstalled && ageOk && hasVehicle && player.money >= tune.price;

              return (
                <div
                  key={tune.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isInstalled
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#6E655F] font-semibold">
                        {tune.targetType === 'house' ? 'Тюнинг Дома' : 'Тюнинг Транспорта'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C87A3E]">
                        {formatMoney(tune.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C2523] mt-2">{tune.name}</h4>
                    <p className="text-xs text-[#2E6F5E] font-medium mt-1">{tune.bonusLabel}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#6E655F]">
                      Престиж +{tune.prestigeBonus}
                      {tune.horsepowerBonus > 0 ? ` • +${tune.horsepowerBonus} л.с.` : ''}
                    </span>
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onInstallTuning(tune)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isInstalled
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : !ageOk || !hasVehicle
                          ? 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                          : canBuy
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                      }`}
                    >
                      {isInstalled
                        ? 'Установлено'
                        : !ageOk
                        ? `🔒 с ${minTuneAge} лет`
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
              <Search className="w-4 h-4 text-[#6E655F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={relocateSearch}
                onChange={(e) => setRelocateSearch(e.target.value)}
                placeholder="Поиск города или курорта (Киев, Львов, Одесса, Лондон, Монако, Бали, Майами)..."
                aria-label="Поиск города для переезда"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none focus:border-[#2E6F5E]"
              />
            </div>
            <select
              aria-label="Регион переезда"
              value={relocateRegion}
              onChange={(e) => setRelocateRegion(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none"
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
              const ageOk = player.age >= 18;
              const canAfford = ageOk && player.money >= city.relocationCost;

              return (
                <div
                  key={city.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#6E655F]">{city.regionGroup}</span>
                      <span className="text-xs font-mono font-bold text-[#2E6F5E]">
                        Валюта: {city.currency}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C2523] mt-1">
                      {city.name}, {city.country}
                    </h4>
                    <div className="text-xs text-[#6E655F] mt-1 font-mono">
                      Коэф. зарплат: ×{city.economyMultiplier.toFixed(2)} • Аренда ~{formatMoney(city.monthlyRentBase, city.currency)}/мес
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#C87A3E] font-semibold">
                      Перелёт и виза: {formatMoney(city.relocationCost, player.currency)}
                    </span>
                    <button
                      type="button"
                      disabled={isCurrent || !canAfford}
                      onClick={() => onRelocateCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : canAfford
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Ваш город' : !ageOk ? '🔒 с 18 лет' : 'Переехать'}
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
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-[#6E655F]">
              Питомец — полностью <strong className="text-[#2E6F5E]">опционален</strong>. Вы можете жить без питомца или взять верного спутника.
            </div>
            <button
              type="button"
              onClick={() => onBuyOrSelectPet(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                player.activePetId === null
                  ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold'
                  : 'bg-[#FFFFFF] hover:bg-[#EFE8DC] text-[#2C2523] border border-[#DCD3C2]'
              }`}
            >
              {player.activePetId === null ? '✓ Сейчас: Без питомца' : 'Оставить дома / Жить без питомца'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PETS_CATALOG.map((pet) => {
              const owned = player.ownedPetIds.includes(pet.id);
              const active = player.activePetId === pet.id;
              const ageOk = player.age >= 18;
              const canBuy = ageOk && player.money >= pet.price;

              return (
                <div
                  key={pet.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    active
                      ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                      : 'bg-[#FAF7F2] border-[#DCD3C2]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#6E655F]">{pet.breedLabel}</span>
                      <span className="text-xs font-mono font-bold text-[#C87A3E]">
                        {pet.price === 0 ? 'Семья' : formatMoney(pet.price, player.currency)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C2523] mt-1">{pet.name}</h4>
                    <p className="text-xs text-[#2E6F5E] font-medium mt-1">{pet.skillBonusLabel}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex justify-end">
                    <button
                      type="button"
                      disabled={!owned && !canBuy}
                      onClick={() => onBuyOrSelectPet(pet)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                        active
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] font-bold cursor-default'
                          : owned || canBuy
                          ? 'bg-[#2E6F5E] hover:bg-[#255A4C] text-[#FAF7F2] font-bold cursor-pointer'
                          : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                      }`}
                    >
                      {active
                        ? 'Рядом с вами'
                        : owned
                        ? 'Позвать с собой'
                        : !ageOk
                        ? '🔒 До 18 лет — через родителей'
                        : 'Приютить'}
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
            const ageOk = player.age >= 6;
            const canBuy = ageOk && player.money >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  equipped
                    ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                    : 'bg-[#FAF7F2] border-[#DCD3C2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#2E6F5E]">{item.brand}</span>
                    <span className="text-xs font-mono font-bold text-[#C87A3E]">
                      {formatMoney(item.price, player.currency)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2C2523] mt-1">{item.name}</h4>
                  <div className="text-xs text-[#6E655F] mt-1">
                    Стиль +{item.stylePoints} • Харизма +{item.charismaBonus} • Уберэкс +{item.urbexBonus}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#6E655F]">{item.badgeText}</span>
                  <button
                    type="button"
                    disabled={!owned && !canBuy}
                    onClick={() => onBuyOrToggleBrand(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                      equipped
                        ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold cursor-pointer'
                        : owned || canBuy
                        ? 'bg-[#FFFFFF] hover:bg-[#EFE8DC] text-[#2C2523] border border-[#DCD3C2] cursor-pointer'
                        : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                    }`}
                  >
                    {equipped && <Check className="w-3.5 h-3.5" />}
                    {equipped ? 'Надето' : owned ? 'Надеть' : !ageOk ? '🔒 с 6 лет' : 'Купить'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 9. WARDROBE & ACCESSORIES STORE + BARBERSHOP (STRICT AUTO-CONTEXT + STORE PURCHASES) */}
      {subTab === 'barbershop' && (() => {
        const autoCtx = resolveCharacterAutoContext(player);
        const ownedWardrobeIds = player.ownedWardrobeIds || [];

        const HAIRSTYLE_LABELS: Record<string, string> = {
          short: 'Короткий кроп',
          side_part: 'Пробор набок',
          slick_back: 'Зачёс назад',
          long: 'Длинные волосы',
          ponytail: 'Хвост / пучок сзади',
          curly: 'Объёмные кудри',
          fade: 'Высокий фейд',
          spiky: 'Колючий ёжик',
          bun: 'Топ-кнот (пучок)',
          balding: 'Залысины (зрелый)',
        };

        return (
          <div className="space-y-5">
            {/* Context Rules Explanation Banner */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-[#2E6F5E] font-bold flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" /> Гардероб, Аксессуары и Барбершоп (Авто-Контекст + Покупка в Магазине)
                </div>
                <div className="text-xs text-[#6E655F]">
                  Внешний вид и предметы в руках меняются строго по возрасту/ситуации (0–2 младенец, 3–6 игрушка, 7–17 школьный рюкзак, на службе — бронежилет и автомат) либо надеваются из <strong className="text-[#2C2523]">купленных в магазине</strong> костюмов и аксессуаров!
                </div>
              </div>
              {player.age >= 18 && onToggleMilitaryService && (
                <button
                  type="button"
                  onClick={onToggleMilitaryService}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap ${
                    player.militaryServiceActive
                      ? 'bg-[#B84A39] text-[#FAF7F2] border-[#B84A39]'
                      : 'bg-[#EFE8DC] hover:bg-[#E5DEC9] text-[#2C2523] border-[#DCD3C2]'
                  }`}
                >
                  {player.militaryServiceActive
                    ? '🎖️ Демобилизоваться (Вернуться к гражданскому гардеробу)'
                    : '🪖 Поступить на военную службу (Форма + Автомат)'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Live 2.5D Character Preview with Auto-Context Badge */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] flex flex-col items-center justify-between space-y-3">
                <div className="text-xs font-mono text-[#6E655F] uppercase tracking-wider font-bold text-center">
                  2.5D Персонаж • Авто-Контекст
                </div>
                <div className="w-48 h-68 bg-[#F4EFE6] rounded-2xl border border-[#DCD3C2] flex items-center justify-center shadow-inner overflow-hidden">
                  <FullBodyPixelHuman
                    appearance={player.appearance}
                    age={player.age}
                    strength={player.skills.strength}
                    muscleMass={player.skills.muscleMass}
                    size={220}
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
                <div className="w-full p-2.5 rounded-xl bg-[#EFE8DC] border border-[#DCD3C2] text-center space-y-1">
                  <div className="text-xs font-bold text-[#2C2523]">
                    {player.name} · {player.age} лет
                  </div>
                  <div className="text-[11px] font-mono text-[#2E6F5E] font-semibold">
                    {autoCtx.contextLabel}
                  </div>
                  <div className="text-[10px] font-mono text-[#6E655F]">
                    Куплено вещей в гардеробе: {ownedWardrobeIds.length} / {WARDROBE_CATALOG.length}
                  </div>
                </div>
              </div>

              {/* Right: Barbershop (Hairstyle, Beard 18+, Hair/Skin Tone) */}
              <div className="lg:col-span-8 space-y-3.5">
                {/* 10 Hairstyles */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] space-y-2">
                  <div className="text-xs font-bold text-[#2C2523] flex items-center justify-between">
                    <span>1. Причёска и Стрижка (10 вариантов)</span>
                    <span className="text-xs font-mono text-[#2E6F5E]">
                      {HAIRSTYLE_LABELS[player.appearance.hairStyle] || player.appearance.hairStyle}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          onUpdateAppearance?.({ hairStyle: style });
                          onUpdatePlayerState?.({ hairstyleId: style });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                          player.appearance.hairStyle === style
                            ? 'bg-[#2E6F5E] text-[#FAF7F2] border-[#2E6F5E] font-bold'
                            : 'bg-[#FFFFFF] text-[#2C2523] border-[#DCD3C2] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {HAIRSTYLE_LABELS[style] || style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7 Facial Hair Styles (Strictly 18+) */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] space-y-2">
                  <div className="text-xs font-bold text-[#2C2523] flex items-center justify-between">
                    <span>2. Борода, Усы и Бакенбарды (только с 18 лет)</span>
                    {player.age < 18 && (
                      <span className="text-[10px] text-[#C87A3E] font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Доступно с 18 лет
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'none', label: 'Гладко выбрит' },
                        { id: 'stubble', label: 'Лёгкая щетина' },
                        { id: 'mustache', label: 'Усы' },
                        { id: 'goatee', label: 'Эспаньолка' },
                        { id: 'beard', label: 'Классическая борода' },
                        { id: 'full_beard', label: 'Густая борода' },
                        { id: 'mutton_chops', label: 'Бакенбарды с усами' },
                      ] as const
                    ).map((fh) => {
                      const isLocked = player.age < 18 && fh.id !== 'none';
                      return (
                        <button
                          key={fh.id}
                          type="button"
                          disabled={isLocked}
                          onClick={() => onUpdatePlayerState?.({ facialHairId: fh.id })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                            isLocked
                              ? 'bg-[#EFE8DC] text-[#6E655F]/50 border-[#DCD3C2] cursor-not-allowed'
                              : player.facialHairId === fh.id
                              ? 'bg-[#2E6F5E] text-[#FAF7F2] border-[#2E6F5E] font-bold cursor-pointer'
                              : 'bg-[#FFFFFF] text-[#2C2523] border-[#DCD3C2] hover:bg-[#EFE8DC] cursor-pointer'
                          }`}
                        >
                          {fh.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hair Color & Skin Tone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] space-y-2">
                    <div className="text-xs font-bold text-[#2C2523]">3. Цвет волос</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { hex: HAIR_COLORS[0], label: 'Брюнет' },
                        { hex: HAIR_COLORS[1], label: 'Тёмный шатен' },
                        { hex: HAIR_COLORS[2], label: 'Шатен' },
                        { hex: HAIR_COLORS[3], label: 'Русый' },
                        { hex: HAIR_COLORS[4], label: 'Рыжий' },
                        { hex: HAIR_COLORS[5], label: 'Седой' },
                      ].map((hc) => (
                        <button
                          key={hc.hex}
                          type="button"
                          onClick={() => onUpdateAppearance?.({ hairColor: hc.hex })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                            player.appearance.hairColor === hc.hex
                              ? 'bg-[#2E6F5E] text-[#FAF7F2] border-[#2E6F5E]'
                              : 'bg-[#FFFFFF] text-[#2C2523] border-[#DCD3C2]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: hc.hex }}
                          />
                          <span>{hc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] space-y-2">
                    <div className="text-xs font-bold text-[#2C2523]">4. Тон кожи</div>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_TONES.map((tone, idx) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => onUpdateAppearance?.({ skinColor: tone })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                            player.appearance.skinColor === tone
                              ? 'bg-[#2E6F5E] text-[#FAF7F2] border-[#2E6F5E]'
                              : 'bg-[#FFFFFF] text-[#2C2523] border-[#DCD3C2]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: tone }}
                          />
                          <span>Тон #{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WARDROBE & ACCESSORIES STORE CATALOG */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-display font-bold text-[#2C2523]">
                  Магазин одежды и аксессуаров (Покупка и Экипировка в Гардеробе)
                </h3>
                <span className="text-xs font-mono text-[#6E655F]">
                  Правило реализма: надеть костюм или взять портфель в руку можно ТОЛЬКО после покупки!
                </span>
              </div>

              {player.age < 18 && (
                <div className="p-3 rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/35 text-xs text-[#2C2523]">
                  <strong>Автоматический возрастной контекст ({player.age} лет):</strong> Сейчас ваш персонаж носит одежду по возрасту ({autoCtx.contextLabel}). Взрослые деловые костюмы и портфели откроются с 18 лет!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WARDROBE_CATALOG.map((item) => {
                  const isOwned = ownedWardrobeIds.includes(item.id);
                  const isEquipped =
                    player.equippedSuitId === item.id ||
                    player.equippedAccessoryId === item.id ||
                    player.equippedWatchId === item.id ||
                    player.equippedGlassesId === item.id;
                  const ageOk = player.age >= item.minAge;
                  const canAfford = player.money >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                        isEquipped
                          ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]'
                          : 'bg-[#FAF7F2] border-[#DCD3C2]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Mini 2.5D Preview of the Suit / Hand Item */}
                        <div className="w-16 h-24 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex items-center justify-center shrink-0 overflow-hidden">
                          <FullBodyPixelHuman
                            appearance={player.appearance}
                            age={Math.max(22, player.age)}
                            size={82}
                            facialHairId={player.facialHairId}
                            contextMode="adult"
                            outfitCategory={item.slot === 'suit' ? item.category : 'business'}
                            suitColorOverride={item.suitColor || '#2B3A4A'}
                            tieColorOverride={item.tieColor || '#B84A39'}
                            handItem={item.handItemType || 'none'}
                            hasWatch={item.slot === 'watch'}
                            hasGlassesOverride={item.slot === 'glasses'}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFE8DC] text-[#6E655F] font-semibold">
                              {item.categoryLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#C87A3E]">
                              {isOwned ? 'В гардеробе' : formatMoney(item.price, player.currency)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#2C2523] mt-1">{item.name}</h4>
                          <p className="text-xs text-[#6E655F] mt-0.5 leading-snug">
                            {item.description}
                          </p>
                          <div className="text-[11px] font-mono text-[#2E6F5E] font-semibold mt-1.5">
                            {item.bonusLabel}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#DCD3C2] flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-[#6E655F]">
                          {item.slot === 'suit'
                            ? 'Слот: Одежда / Костюм'
                            : item.slot === 'hand_accessory'
                            ? 'Слот: Предмет в руках'
                            : item.slot === 'watch'
                            ? 'Слот: Часы на запястье'
                            : 'Слот: Очки'}
                        </span>

                        <button
                          type="button"
                          disabled={!ageOk || (!isOwned && !canAfford)}
                          onClick={() => onBuyOrEquipWardrobe?.(item)}
                          data-testid={`wardrobe-btn-${item.id}`}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                            !ageOk
                              ? 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                              : isEquipped
                              ? 'bg-[#2E6F5E] text-[#FAF7F2] cursor-pointer'
                              : isOwned
                              ? 'bg-[#FFFFFF] hover:bg-[#EFE8DC] text-[#2E6F5E] border border-[#2E6F5E] cursor-pointer'
                              : canAfford
                              ? 'bg-[#C87A3E] hover:bg-[#B56527] text-[#FAF7F2] cursor-pointer shadow-xs'
                              : 'bg-[#EFE8DC] text-[#6E655F] cursor-not-allowed'
                          }`}
                        >
                          {!ageOk ? (
                            <>
                              <Lock className="w-3 h-3" /> с {item.minAge} лет
                            </>
                          ) : isEquipped ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Надето (Снять)
                            </>
                          ) : isOwned ? (
                            'Надеть из гардероба'
                          ) : (
                            `Купить за ${formatMoney(item.price, player.currency)}`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
