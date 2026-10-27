import React, { useState, useMemo } from 'react';
import { PlayerState, FamilyMember, RealArtist } from '../game/types';
import { REAL_ARTISTS_1000 } from '../game/worldData';
import { formatMoney } from '../game/rules';
import { AssetTexturePreview } from './AssetTexturePreview';
import { FullBodyPixelHuman } from './FullBodyPixelHuman';
import {
  Users,
  Heart,
  MessageSquare,
  Sparkles,
  Music,
  Search,
  Send,
  Gift,
  PhoneCall,
  Brain,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface FriendsAiPanelProps {
  player: PlayerState;
  selectedNpcId: string;
  onSelectNpc: (id: string) => void;
  onSendNpcMessage: (npcId: string, message: string) => void;
  onGenerateAiEvent: () => void;
  onToggleOfflineAi: () => void;
  isAiLoading: boolean;
  lastNpcReaction: string | null;
  onInteractFamily: (member: FamilyMember, action: 'visit' | 'gift' | 'ask_support') => void;
  onInteractArtist: (artist: RealArtist, mode: 'concert' | 'collab') => void;
  onAskParentsForPet?: () => void;
}

type SocialSubTab = 'family' | 'friends' | 'artists';

export const FriendsAiPanel: React.FC<FriendsAiPanelProps> = ({
  player,
  selectedNpcId,
  onSelectNpc,
  onSendNpcMessage,
  onGenerateAiEvent,
  onToggleOfflineAi,
  isAiLoading,
  lastNpcReaction,
  onInteractFamily,
  onInteractArtist,
  onAskParentsForPet,
}) => {
  const [subTab, setSubTab] = useState<SocialSubTab>('family');
  const [chatInput, setChatInput] = useState('');
  const [artistRegion, setArtistRegion] = useState<'ALL' | 'СНГ' | 'Европа' | 'Америка'>('ALL');
  const [artistSearch, setArtistSearch] = useState('');

  const selectedNpc =
    player.friends.find((f) => f.id === selectedNpcId) || player.friends[0];

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    return REAL_ARTISTS_1000.filter((a) => {
      const regionOk = artistRegion === 'ALL' || a.region === artistRegion;
      const queryOk =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q);
      return regionOk && queryOk;
    }).slice(0, 60);
  }, [artistRegion, artistSearch]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedNpc) return;
    onSendNpcMessage(selectedNpc.id, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 bg-[#0B0F17] p-1.5 rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setSubTab('family')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'family'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" /> Семья и Родственники ({player.family.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('friends')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'friends'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Друзья и ИИ с Памятью ({player.friends.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('artists')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'artists'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:bg-[#151D2C]'
          }`}
        >
          <Music className="w-3.5 h-3.5" /> {REAL_ARTISTS_1000.length} Артистов с Текстурами
        </button>
      </div>

      {/* 1. DETAILED FAMILY SYSTEM */}
      {subTab === 'family' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400">
                Родословная и семья ({player.city.name}, {player.city.country})
              </div>
              <div className="text-sm text-slate-300 mt-0.5">
                Поддерживайте тёплые отношения с родителями, помогайте им финансово или просите поддержку в юности.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {player.age >= 7 && player.age < 18 && (
                <div className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold">
                  💰 Карманные деньги: +{formatMoney(player.pocketMoneyPerMonth, player.currency)}/мес
                </div>
              )}
              <div className="text-xs font-mono text-slate-400">
                Общий показатель отношений: <span className="text-white font-bold">{player.relations}/100</span>
              </div>
            </div>
          </div>

          {/* Ask Parents For Pet (Ages 4-17 when no active pet) */}
          {player.age >= 4 && player.age <= 17 && !player.activePetId && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#171e2e] via-[#121927] to-[#1a1c29] border border-amber-500/35 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🐾 Домашний питомец (щенок или котёнок)</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Попросите родителей разрешить завести домашнего любимца. Шанс согласия зависит от отношений и семейного дохода.
                  {player.petRequestCooldown > 0 && (
                    <span className="text-amber-400 block mt-0.5 font-mono">
                      Родители просили не поднимать эту тему ещё {player.petRequestCooldown} мес.
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={player.petRequestCooldown > 0 || !onAskParentsForPet}
                onClick={onAskParentsForPet}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-md"
              >
                {player.petRequestCooldown > 0
                  ? `Подождите (${player.petRequestCooldown} мес)`
                  : '«Попросить завести питомца»'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {player.family.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {member.relation}
                    </span>
                    <span className="text-slate-400">{member.age} лет</span>
                  </div>

                  <div className="flex items-start gap-3 mt-2.5">
                    <div className="w-16 h-28 bg-[#070b12] rounded-lg border border-[#1e2938] flex items-center justify-center overflow-hidden shrink-0">
                      <FullBodyPixelHuman
                        appearance={{
                          ...player.appearance,
                          skinColor: player.appearance.skinColor,
                          hairColor: member.relation.includes('Мама')
                            ? '#3f271d'
                            : member.relation.includes('Папа')
                            ? '#271911'
                            : '#1c1917',
                          hairStyle: member.relation.includes('Мама') ? 'long' : 'short',
                          shirtColor: member.relation.includes('Мама')
                            ? '#0ea5e9'
                            : member.relation.includes('Папа')
                            ? '#334155'
                            : '#8b5cf6',
                          pantsColor: '#1e293b',
                          shoeColor: '#0f172a',
                          hasGlasses: false,
                        }}
                        age={member.age}
                        size={100}
                        outfitStyle={
                          member.profession.includes('Директор') ||
                          member.profession.includes('Юрист') ||
                          member.profession.includes('Менеджер')
                            ? 'business'
                            : 'casual'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-white truncate">{member.name}</h4>
                      <div className="text-xs text-emerald-300 mt-0.5 truncate">{member.profession}</div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {member.trait}
                      </div>

                      <div className="mt-2 space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Доход:</span>
                          <span className="text-white text-[11px]">
                            {member.monthlyIncome > 0
                              ? `${formatMoney(member.monthlyIncome, player.currency)}/мес`
                              : 'Учится'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Отношения:</span>
                          <span className="text-pink-400">{member.relationship}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#1E293B] flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onInteractFamily(member, 'visit')}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#161F30] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Навестить / Пообщаться
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={player.money < 200}
                      onClick={() => onInteractFamily(member, 'gift')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition whitespace-nowrap ${
                        player.money >= 200
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 cursor-pointer'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3 h-3" /> Подарок ({formatMoney(200, player.currency)})
                    </button>
                    <button
                      type="button"
                      onClick={() => onInteractFamily(member, 'ask_support')}
                      className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      Попросить совет/помощь
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NPC FRIENDS & ANTI-HALLUCINATION PERSISTENT MEMORY AI (BEFORE & AFTER LEDGER) */}
      {subTab === 'friends' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> Встроенный APK-ИИ без галлюцинаций (Помнит что было ДО и ПОСЛЕ)
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Текущая глава: <span className="text-white font-semibold">{player.storyArc}</span> · Работает 100% автономно без интернета
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleOfflineAi}
                  className="px-3 py-1.5 rounded-lg bg-[#161F30] border border-emerald-500/40 text-xs text-emerald-300 cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {player.offlineAiMode ? 'Встроенный APK-ИИ (Автономный)' : 'Облачный + Локальный ИИ'}
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={onGenerateAiEvent}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiLoading ? 'Генерация...' : 'Сгенерировать ИИ-событие по вашей памяти'}
                </button>
              </div>
            </div>

            {/* Persistent AI Memory Ledger (What happened BEFORE & AFTER) */}
            <div className="p-3 rounded-xl bg-[#111724] border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-300 uppercase">
                  Цепочка памяти ИИ (Факты вашей биографии: ДО → ВЫБОР → ПОСЛЕ):
                </span>
                <span className="text-slate-400">
                  Записей в памяти: {player.aiMemory.entries.length}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B]">
                {player.aiMemory.coreBiographySummary}
                {player.aiMemory.lastChoiceSummary ? ` · Последнее решение: ${player.aiMemory.lastChoiceSummary}` : ''}
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {player.aiMemory.entries.slice(0, 5).map((mem) => (
                  <div
                    key={mem.id}
                    className="p-2 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-300 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>[{mem.age} лет · {mem.year} г.] {mem.actionTaken}</span>
                      <span className="text-amber-300 uppercase">{mem.tag}</span>
                    </div>
                    <div className="text-slate-400">
                      ПОСЛЕ: <span className="text-slate-200">{mem.consequenceSummary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-2">
              {player.friends.map((npc) => {
                const isSelected = npc.id === selectedNpc?.id;
                return (
                  <button
                    key={npc.id}
                    type="button"
                    onClick={() => onSelectNpc(npc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60'
                        : 'bg-[#0B0F17] border-[#1E293B] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{npc.name}</span>
                      <span className="text-xs font-mono text-emerald-400">
                        Дружба {npc.relationship}/100
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {npc.role} • {npc.trait}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between space-y-3">
              {selectedNpc && (
                <>
                  <div>
                    <div className="flex items-center gap-3 border-b border-[#1E293B] pb-2.5">
                      <div className="w-10 h-16 bg-[#070b12] rounded-lg border border-[#1e2938] flex items-center justify-center overflow-hidden shrink-0">
                        <FullBodyPixelHuman
                          appearance={{
                            ...player.appearance,
                            hairStyle: 'short',
                            shirtColor: '#38bdf8',
                            pantsColor: '#1e293b',
                            shoeColor: '#f8fafc',
                          }}
                          age={20}
                          size={64}
                          outfitStyle="street"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          Диалог с {selectedNpc.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{selectedNpc.role}</p>
                      </div>
                      {lastNpcReaction && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          {lastNpcReaction}
                        </span>
                      )}
                    </div>

                    <div className="my-4 p-3.5 rounded-xl bg-[#111724] border border-[#1E293B] text-xs text-slate-200 leading-relaxed">
                      «{selectedNpc.lastMessage}»
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        'Погнали на тренировку в зал!',
                        'Пойдём на ночной уберэкс-рейд!',
                        'Как лучше инвестировать деньги?',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onSendNpcMessage(selectedNpc.id, preset)}
                          className="px-2.5 py-1 rounded-lg bg-[#161F30] hover:bg-[#1E293B] text-[11px] text-slate-300 border border-[#283548] cursor-pointer whitespace-nowrap"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Написать сообщение для ${selectedNpc.name}...`}
                      aria-label="Сообщение для NPC"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#111724] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" /> Отправить
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. 1,060 REAL ARTISTS WITH TEXTURED STAGE PREVIEWS */}
      {subTab === 'artists' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                placeholder="Поиск среди 1 060 реальных артистов (Баста, Кино, Rammstein, Daft Punk, Eminem, The Weeknd)..."
                aria-label="Поиск артиста"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-1">
              {(['ALL', 'СНГ', 'Европа', 'Америка'] as const).map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setArtistRegion(reg)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    artistRegion === reg
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-[#0B0F17] text-slate-300 border border-[#1E293B]'
                  }`}
                >
                  {reg === 'ALL' ? 'Все (1060)' : reg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredArtists.map((artist) => {
              const attended = player.attendedArtistIds.includes(artist.id);
              const collabed = player.collabArtistIds.includes(artist.id);

              return (
                <div
                  key={artist.id}
                  className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <AssetTexturePreview
                      kind="artist"
                      artist={artist}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 truncate">
                          {artist.region} • {artist.genre}
                        </span>
                        <span className="text-slate-400">Популярность +{artist.fameBoost}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{artist.name}</h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={player.money < artist.ticketPrice}
                      onClick={() => onInteractArtist(artist, 'concert')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                        player.money >= artist.ticketPrice
                          ? 'bg-[#161F30] hover:bg-[#1E293B] text-slate-200 border border-[#283548] cursor-pointer'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {attended ? 'Концерт (Повтор)' : `Концерт (${formatMoney(artist.ticketPrice, player.currency)})`}
                    </button>
                    <button
                      type="button"
                      disabled={collabed || player.money < artist.collabPrice}
                      onClick={() => onInteractArtist(artist, 'collab')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                        collabed
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : player.money >= artist.collabPrice
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {collabed
                        ? 'Фит записан'
                        : `Записать фит (${formatMoney(artist.collabPrice, player.currency)})`}
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
