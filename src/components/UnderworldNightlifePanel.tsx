import React, { useState } from 'react';
import {
  PlayerState,
  SteroidCycleItem,
  HabitActionItem,
  CrimeActionItem,
  BribeActionItem,
  CasinoGameType,
  NightlifePackageItem,
  RomancePartner,
} from '../game/types';
import {
  STEROID_CYCLES_CATALOG,
  HABIT_ACTIONS_CATALOG,
  CRIME_ACTIONS_CATALOG,
  BRIBE_ACTIONS_CATALOG,
  NIGHTLIFE_SERVICES_CATALOG,
  ROMANCE_PARTNERS_CATALOG,
} from '../game/worldData';
import { formatMoney } from '../game/rules';
import {
  Dumbbell,
  Flame,
  ShieldAlert,
  Coins,
  Heart,
  Sparkles,
  Lock,
} from 'lucide-react';

interface UnderworldNightlifePanelProps {
  player: PlayerState;
  initialSubTab?: 'steroids' | 'habits' | 'crime' | 'casino' | 'romance' | 'nightlife';
  onUseSteroid: (cycle: SteroidCycleItem) => void;
  onPerformHabit: (item: HabitActionItem) => void;
  onTriggerPeerEvent: () => void;
  onExecuteCrime: (crime: CrimeActionItem) => void;
  onExecuteBribe: (bribe: BribeActionItem) => void;
  onPlayCasino: (gameType: CasinoGameType, betAmount: number) => void;
  onEnjoyNightlife: (pkg: NightlifePackageItem) => void;
  onInteractRomance: (
    partner: RomancePartner,
    action: 'start_dating' | 'romantic_date' | 'luxury_gift' | 'marry' | 'breakup'
  ) => void;
}

export const UnderworldNightlifePanel: React.FC<UnderworldNightlifePanelProps> = ({
  player,
  initialSubTab = 'crime',
  onUseSteroid,
  onPerformHabit,
  onTriggerPeerEvent,
  onExecuteCrime,
  onExecuteBribe,
  onPlayCasino,
  onEnjoyNightlife,
  onInteractRomance,
}) => {
  const [subTab, setSubTab] = useState<
    'steroids' | 'habits' | 'crime' | 'casino' | 'romance' | 'nightlife'
  >(initialSubTab);
  const [betAmount, setBetAmount] = useState<number>(500);

  const activePartner = ROMANCE_PARTNERS_CATALOG.find((p) => p.id === player.activePartnerId);

  return (
    <div className="space-y-3.5 text-[#2C2523]">
      {/* Sub-navigation bar in Warm Cream UI */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-[#F4EFE6] p-1.5 rounded-xl border border-[#DCD3C2]">
        <button
          type="button"
          onClick={() => setSubTab('crime')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'crime'
              ? 'bg-[#B84A39] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Криминал</span>
          </div>
          {player.age < 16 ? (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 16 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[9px] text-[#3B5B76]">16+ уличное</span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('casino')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'casino'
              ? 'bg-[#C87A3E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Казино 777</span>
          </div>
          {player.age < 18 && (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 18 лет
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('steroids')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'steroids'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Стероиды</span>
          </div>
          {player.age < 18 && (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 18 лет
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('habits')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'habits'
              ? 'bg-[#C87A3E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Привычки</span>
          </div>
          {player.age < 14 && (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 14 лет
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('romance')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'romance'
              ? 'bg-[#B84A39] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>Любовь</span>
          </div>
          {player.age < 12 ? (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 12 лет
            </span>
          ) : player.age < 18 ? (
            <span className="text-[9px] text-[#B84A39]">12+ подростк.</span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('nightlife')}
          className={`py-2 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            subTab === 'nightlife'
              ? 'bg-[#3B5B76] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2]'
          }`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Эскорт / Клуб</span>
          </div>
          {player.age < 18 && (
            <span className="text-[9px] text-[#C87A3E] flex items-center gap-0.5">
              <Lock className="w-2 h-2" /> с 18 лет
            </span>
          )}
        </button>
      </div>

      {/* 1. CRIME, GANG SHOOTOUTS, HEISTS & BRIBES */}
      {subTab === 'crime' && (
        <div className="space-y-3">
          {player.age < 16 ? (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#2C2523]">Криминальный мир заблокирован до 16 лет</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  Уголовные преступления и нелегальные операции доступны только с 16 лет. До этого возраста ведите законопослушную жизнь.
                </div>
              </div>
            </div>
          ) : player.age < 18 ? (
            <div className="rounded-xl bg-[#3B5B76]/12 border border-[#3B5B76]/40 p-3 text-[#2C2523] flex items-center gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-[#3B5B76] shrink-0" />
              <div>
                <strong>Подростковый возраст (16–17 лет):</strong> Доступны мелкие уличные дела. Тяжёлые ограбления и разборки доступны с 18 лет!
              </div>
            </div>
          ) : null}

          <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#B84A39] uppercase tracking-wider">
                Криминальный синдикат, Разборки и Коррупция
              </div>
              <div className="text-[11px] text-[#6E655F]">
                Розыск полиции:{' '}
                <span className="text-[#C87A3E] font-mono font-bold">
                  {player.wantedLevel > 0 ? '★'.repeat(player.wantedLevel) : '0 ★ (Чист)'}
                </span>{' '}
                · Ограблений: <span className="text-[#2E6F5E] font-mono font-bold">{player.heistsCompleted}</span> ·
                Взяток взято: <span className="text-[#C87A3E] font-mono font-bold">{player.bribesTakenCount}</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-[#2C2523] bg-[#FFFFFF] border border-[#DCD3C2] px-2.5 py-1 rounded-lg">
              Сила: {player.skills.strength} · Интеллект: {player.skills.intellect}
            </div>
          </div>

          <div className="text-xs font-bold text-[#2C2523] uppercase tracking-wider px-1">
            Бандитские разборки, Угоны и Ограбления
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CRIME_ACTIONS_CATALOG.map((crime) => {
              const isLocked =
                player.age < 16 ||
                (player.age < 18 && (crime.wantedGain > 1 || crime.minPayout > 1000));
              return (
                <div
                  key={crime.id}
                  className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2C2523]">{crime.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#B84A39]/12 text-[#B84A39]">
                        Шанс ~{crime.baseSuccessChance}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E655F] mt-1">{crime.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-[#2E6F5E]/12 text-[#2E6F5E] font-semibold">
                        Куш: {formatMoney(crime.minPayout, player.currency)} –{' '}
                        {formatMoney(crime.maxPayout, player.currency)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527] font-semibold">
                        +{crime.wantedGain}★ розыск
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F4EFE6] text-[#6E655F] border border-[#DCD3C2]">
                        Нужна Сила {crime.requiredStrength} / Инт {crime.requiredIntellect}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => onExecuteCrime(crime)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                      isLocked
                        ? 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                        : 'bg-[#B84A39] hover:bg-[#9E3D2E] text-[#FAF7F2] cursor-pointer'
                    }`}
                  >
                    {isLocked
                      ? player.age < 16
                        ? '🔒 с 16 лет'
                        : '🔒 с 18 лет'
                      : 'Пойти на дело'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-xs font-bold text-[#C87A3E] uppercase tracking-wider px-1 pt-2">
            Взятки и Откаты (Дать взятку полиции/судье или Взять откат на работе)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BRIBE_ACTIONS_CATALOG.map((bribe) => {
              const isGive = bribe.direction === 'give';
              const isLocked = player.age < 18;
              return (
                <div
                  key={bribe.id}
                  className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2C2523]">{bribe.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isGive
                            ? 'bg-[#3B5B76]/15 text-[#3B5B76]'
                            : 'bg-[#2E6F5E]/15 text-[#2E6F5E]'
                        }`}
                      >
                        {isGive
                          ? `-${formatMoney(bribe.costOrReward, player.currency)}`
                          : `+${formatMoney(bribe.costOrReward, player.currency)}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E655F] mt-1">{bribe.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => onExecuteBribe(bribe)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                      isLocked
                        ? 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                        : isGive
                        ? 'bg-[#3B5B76] hover:bg-[#2F495E] text-[#FAF7F2] cursor-pointer'
                        : 'bg-[#C87A3E] hover:bg-[#B56527] text-[#FAF7F2] cursor-pointer'
                    }`}
                  >
                    {isLocked
                      ? '🔒 с 18 лет'
                      : isGive
                      ? `Дать взятку (${bribe.wantedDelta}★)`
                      : `Взять взятку в конверте (+${formatMoney(bribe.costOrReward, player.currency)})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VIP CASINO 777 */}
      {subTab === 'casino' && (
        <div className="space-y-3">
          {player.age < 18 && (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold">Казино 777 строго с 18 лет</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  Азартные игры на деньги лицам до 18 лет запрещены законом. Доступ откроется при наступлении совершеннолетия.
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#C87A3E]">
                  Гранд-Казино «Royal 777» (г. {player.city.name})
                </h3>
                <p className="text-[11px] text-[#6E655F]">
                  Чистый баланс в казино за жизнь:{' '}
                  <span
                    className={`font-mono font-bold ${
                      player.casinoNetProfit >= 0 ? 'text-[#2E6F5E]' : 'text-[#B84A39]'
                    }`}
                  >
                    {formatMoney(player.casinoNetProfit, player.currency)}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[100, 500, 2000, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      betAmount === amt
                        ? 'bg-[#C87A3E] text-[#FAF7F2]'
                        : 'bg-[#FFFFFF] text-[#2C2523] border border-[#DCD3C2] hover:bg-[#EFE8DC]'
                    }`}
                  >
                    {formatMoney(amt, player.currency)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'roulette_red' as CasinoGameType,
                title: 'Европейская Рулетка (Красное / Чёрное)',
                desc: 'Классическая ставка с выплатой x2.0 и честным шансом 48%.',
                badge: 'Выплата x2.0',
              },
              {
                id: 'blackjack' as CasinoGameType,
                title: 'Блэкджек 21 за VIP-столом',
                desc: 'Ваш Интеллект повышает вероятность обыграть дилера!',
                badge: 'Выплата x2.2',
              },
              {
                id: 'slots_777' as CasinoGameType,
                title: 'Слот-машина «Три Семёрки 777 Jackpot»',
                desc: 'Высокая волатильность и солидный множитель при совпадении линии.',
                badge: 'Выплата x4.5',
              },
              {
                id: 'high_poker' as CasinoGameType,
                title: 'Закрытый Техасский Холдем Покер',
                desc: 'Ваша Харизма помогает блефовать против миллионеров.',
                badge: 'Выплата x2.8',
              },
              {
                id: 'roulette_zero' as CasinoGameType,
                title: 'Рулетка: Прямая ставка на ЗЕРО (0)',
                desc: 'Максимальный адреналин: редкое попадание умножает ставку в 18 раз!',
                badge: 'Супер-куш x18',
              },
            ].map((g) => (
              <div
                key={g.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2523]">{g.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527]">
                      {g.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E655F] mt-1">{g.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={player.age < 18 || player.money < betAmount}
                  onClick={() => onPlayCasino(g.id, betAmount)}
                  className="w-full py-2 rounded-lg bg-[#C87A3E] hover:bg-[#B56527] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {player.age < 18
                    ? '🔒 с 18 лет'
                    : `Сделать ставку ${formatMoney(betAmount, player.currency)}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STEROIDS & SPORTS PHARMACOLOGY */}
      {subTab === 'steroids' && (
        <div className="space-y-3">
          {player.age < 18 && (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold">Фармакология заблокирована до 18 лет</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  Тяжёлые анаболические препараты разрушают подростковую гормональную систему. Доступны только совершеннолетним.
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#2E6F5E] uppercase">
                Спортивная фармакология, Стероиды и ПКТ
              </div>
              <div className="text-[11px] text-[#6E655F]">
                Пройдено курсов: <span className="text-[#2E6F5E] font-mono font-bold">{player.steroidCyclesUsed}</span> ·
                Сила: <span className="text-[#C87A3E] font-mono font-bold">{player.skills.strength}/100</span> ·
                Мышечная масса: <span className="text-[#C87A3E] font-mono font-bold">{player.skills.muscleMass}/100</span> ·
                Вес: <span className="text-[#3B5B76] font-mono font-bold">{player.weightKg} кг</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STEROID_CYCLES_CATALOG.map((cycle) => (
              <div
                key={cycle.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2523]">{cycle.name}</span>
                    <span className="text-xs font-mono font-bold text-[#2E6F5E]">
                      {formatMoney(cycle.price, player.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E655F] mt-1">{cycle.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {cycle.strengthGain > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#2E6F5E]/12 text-[#2E6F5E] font-semibold">
                        +{cycle.strengthGain} Сила
                      </span>
                    )}
                    {cycle.muscleGain !== 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527] font-semibold">
                        {cycle.muscleGain > 0 ? `+${cycle.muscleGain}` : cycle.muscleGain} Мышцы
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        cycle.healthDelta >= 0
                          ? 'bg-[#3B5B76]/15 text-[#3B5B76]'
                          : 'bg-[#B84A39]/15 text-[#B84A39]'
                      }`}
                    >
                      Здоровье {cycle.healthDelta >= 0 ? `+${cycle.healthDelta}` : cycle.healthDelta}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={player.age < 18 || player.money < cycle.price}
                  onClick={() => onUseSteroid(cycle)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    player.age < 18 || player.money < cycle.price
                      ? 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                      : cycle.category === 'pct'
                      ? 'bg-[#3B5B76] hover:bg-[#2F495E] text-[#FAF7F2] cursor-pointer'
                      : 'bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] cursor-pointer'
                  }`}
                >
                  {player.age < 18
                    ? '🔒 с 18 лет'
                    : cycle.category === 'pct'
                    ? 'Пройти ПКТ и восстановить здоровье'
                    : 'Использовать курс'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BAD HABITS & PEER PRESSURE */}
      {subTab === 'habits' && (
        <div className="space-y-3">
          {player.age < 14 && (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold">Вредные привычки и тусовки — с 14 лет</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  Подростковые компании и вызовы со сверстниками открываются с 14 лет.
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#C87A3E] uppercase">
                  Вредные привычки, Вписки с друзьями и Реабилитация
                </div>
                <div className="text-[11px] text-[#6E655F]">
                  Высокая зависимость постепенно отнимает здоровье каждый ход.
                </div>
              </div>
              <button
                type="button"
                disabled={player.age < 14}
                onClick={onTriggerPeerEvent}
                className="px-3 py-1.5 rounded-lg bg-[#C87A3E] hover:bg-[#B56527] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] disabled:cursor-not-allowed text-[#FAF7F2] text-xs font-bold transition cursor-pointer"
              >
                {player.age < 14 ? '🔒 с 14 лет' : 'Событие с компанией друзей'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Курение / Никотин</div>
                <div className="text-sm font-mono font-bold text-[#C87A3E]">
                  {player.habits.smoking}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Алкоголь</div>
                <div className="text-sm font-mono font-bold text-[#B56527]">
                  {player.habits.alcohol}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#DCD3C2]">
                <div className="text-[10px] text-[#6E655F]">Запрещённые вещества</div>
                <div className="text-sm font-mono font-bold text-[#B84A39]">
                  {player.habits.drugs}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HABIT_ACTIONS_CATALOG.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2523]">{item.name}</span>
                    <span className="text-xs font-mono font-bold text-[#C87A3E]">
                      {formatMoney(item.price, player.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E655F] mt-1">{item.description}</p>
                </div>
                <button
                  type="button"
                  disabled={player.age < 14 || player.money < item.price}
                  onClick={() => onPerformHabit(item)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                    player.age < 14 || player.money < item.price
                      ? 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                      : item.habitType === 'rehab'
                      ? 'bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] cursor-pointer'
                      : 'bg-[#C87A3E] hover:bg-[#B56527] text-[#FAF7F2] cursor-pointer'
                  }`}
                >
                  {player.age < 14
                    ? '🔒 с 14 лет'
                    : item.habitType === 'rehab'
                    ? 'Лечь в клинику детокса (-45% зависимостей)'
                    : 'Выполнить'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LOVE, ROMANCE & MARRIAGE */}
      {subTab === 'romance' && (
        <div className="space-y-3">
          {player.age < 12 ? (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold">Романтические отношения заблокированы до 12 лет</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  В детском возрасте развивайте дружбу и играйте с ровесниками. Романтика открывается в подростковом возрасте (с 12 лет).
                </div>
              </div>
            </div>
          ) : player.age < 18 ? (
            <div className="rounded-xl bg-[#B84A39]/12 border border-[#B84A39]/40 p-3 text-[#2C2523] flex items-center gap-2.5 text-xs">
              <Heart className="w-4 h-4 text-[#B84A39] shrink-0" />
              <div>
                <strong>Подростковая романтика (12–17 лет):</strong> Школьная симпатия, прогулки в парке и свидания в кино. Брак и элитные украшения откроются в 18 лет!
              </div>
            </div>
          ) : null}

          {activePartner ? (
            <div className="rounded-xl bg-[#F4EFE6] border border-[#B84A39]/50 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#B84A39]/15 text-[#B84A39] text-[10px] font-bold uppercase">
                    {player.isMarried ? 'Официальный брак 💍' : 'Ваша вторая половинка ❤️'}
                  </span>
                  <h3 className="text-sm font-bold text-[#2C2523] mt-1">
                    {activePartner.name} ({activePartner.age} лет · {activePartner.profession})
                  </h3>
                  <p className="text-[11px] text-[#6E655F]">{activePartner.personality}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[#B84A39] font-bold">
                    Любовь: {player.partnerRelationship}/100
                  </div>
                  <div className="text-[11px] font-mono text-[#2E6F5E] font-semibold">
                    Вклад в бюджет: +{formatMoney(activePartner.wealthBonusPerMonth, player.currency)}/мес
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={player.age < 12}
                  onClick={() => onInteractRomance(activePartner, 'romantic_date')}
                  className="px-3 py-1.5 rounded-lg bg-[#B84A39] hover:bg-[#9E3D2E] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                >
                  {player.age < 18 ? 'Свидание в кино / кафе' : 'Свидание в ресторане'} (-{formatMoney(player.age < 18 ? 40 : 240, player.currency)})
                </button>
                <button
                  type="button"
                  disabled={player.age < 18}
                  onClick={() => onInteractRomance(activePartner, 'luxury_gift')}
                  className="px-3 py-1.5 rounded-lg bg-[#3B5B76] hover:bg-[#2F495E] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                >
                  {player.age < 18
                    ? '🔒 Украшения (с 18 лет)'
                    : `Подарить украшения Cartier (-${formatMoney(1200, player.currency)})`}
                </button>
                {!player.isMarried && (
                  <button
                    type="button"
                    disabled={player.age < 18}
                    onClick={() => onInteractRomance(activePartner, 'marry')}
                    className="px-3 py-1.5 rounded-lg bg-[#C87A3E] hover:bg-[#B56527] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    {player.age < 18
                      ? '🔒 Брак (с 18 лет)'
                      : `Сыграть свадьбу 💍 (-${formatMoney(4500, player.currency)})`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onInteractRomance(activePartner, 'breakup')}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#6E655F] text-xs font-semibold cursor-pointer"
                >
                  Расстаться
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3 text-xs text-[#6E655F]">
              У вас пока нет постоянной девушки/партнёра. Выберите симпатию ниже, чтобы пригласить на первое свидание!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROMANCE_PARTNERS_CATALOG.map((p) => {
              const isCurrent = player.activePartnerId === p.id;
              const isLocked = player.age < 12;
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between gap-2 shadow-2xs ${
                    isCurrent
                      ? 'bg-[#B84A39]/10 border-[#B84A39]'
                      : 'bg-[#FFFFFF] border-[#DCD3C2]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-[#DCD3C2]"
                      style={{ background: p.outfitColor }}
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2C2523]">
                        {p.name}, {p.age} лет
                      </div>
                      <div className="text-[11px] font-semibold text-[#B84A39]">{p.profession}</div>
                      <p className="text-[10px] text-[#6E655F] mt-0.5">{p.personality}</p>
                      <div className="text-[10px] font-mono text-[#2E6F5E] font-semibold mt-1">
                        Семейный бонус: +{formatMoney(p.wealthBonusPerMonth, player.currency)}/мес ·
                        Счастье +{p.happinessBonus}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() =>
                      onInteractRomance(p, isCurrent ? 'romantic_date' : 'start_dating')
                    }
                    className="w-full py-2 rounded-lg bg-[#B84A39] hover:bg-[#9E3D2E] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isLocked
                      ? '🔒 с 12 лет'
                      : isCurrent
                      ? `Пойти на свидание (${formatMoney(player.age < 18 ? 40 : 240, player.currency)})`
                      : `Познакомиться и пригласить (${formatMoney(player.age < 18 ? 20 : 100, player.currency)})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. NIGHTLIFE & ESCORTS */}
      {subTab === 'nightlife' && (
        <div className="space-y-3">
          {player.age < 18 && (
            <div className="rounded-xl bg-[#C87A3E]/12 border border-[#C87A3E]/40 p-4 text-[#2C2523] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C87A3E] shrink-0" />
              <div>
                <div className="text-sm font-bold">Эскорт и Ночные клубы строго 18+</div>
                <div className="text-xs text-[#6E655F] mt-0.5">
                  Вход в клубы и заведения 18+ строго по паспорту с 18 лет. Несовершеннолетним вход воспрещён.
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] p-3">
            <div className="text-xs font-bold text-[#3B5B76] uppercase">
              Ночные клубы, Приват-лаунжи и Эскорт-сервис
            </div>
            <div className="text-[11px] text-[#6E655F]">
              Мгновенно поднимает настроение и харизму без обязательств.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NIGHTLIFE_SERVICES_CATALOG.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] p-3 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2523]">{pkg.name}</span>
                    <span className="text-xs font-mono text-[#3B5B76] font-bold">
                      {formatMoney(pkg.price, player.currency)}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-[#C87A3E] mt-0.5">{pkg.tierLabel}</div>
                  <p className="text-[11px] text-[#6E655F] mt-1">{pkg.description}</p>
                  <div className="mt-2 flex gap-1.5 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#C87A3E]/15 text-[#B56527] font-semibold">
                      +{pkg.happinessGain} Счастье
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#3B5B76]/15 text-[#3B5B76] font-semibold">
                      +{pkg.charismaGain} Харизма
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={player.age < 18 || player.money < pkg.price}
                  onClick={() => onEnjoyNightlife(pkg)}
                  className="w-full py-2 rounded-lg bg-[#3B5B76] hover:bg-[#2F495E] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {player.age < 18
                    ? '🔒 с 18 лет'
                    : `Заказать (${formatMoney(pkg.price, player.currency)})`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
