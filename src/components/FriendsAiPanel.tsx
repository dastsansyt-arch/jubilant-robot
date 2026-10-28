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
    <div className="space-y-5 text-[#2C2523]">
      {/* Sub-navigation (Warm Cream Paper UI) */}
      <div className="flex flex-wrap gap-1.5 bg-[#F4EFE6] p-1.5 rounded-xl border border-[#DCD3C2]">
        <button
          type="button"
          onClick={() => setSubTab('family')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'family'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" /> Семья и Родственники ({player.family.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('friends')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'friends'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Друзья и ИИ с Памятью ({player.friends.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('artists')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            subTab === 'artists'
              ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold shadow-2xs'
              : 'text-[#6E655F] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
          }`}
        >
          <Music className="w-3.5 h-3.5" /> {REAL_ARTISTS_1000.length} Артистов с Текстурами
        </button>
      </div>

      {/* 1. DETAILED FAMILY SYSTEM */}
      {subTab === 'family' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase font-bold text-[#2E6F5E]">
                Родословная и семья ({player.city.name}, {player.city.country})
              </div>
              <div className="text-sm text-[#6E655F] mt-0.5">
                Поддерживайте тёплые отношения с родителями, помогайте им финансово или просите поддержку в юности.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {player.age >= 7 && player.age < 18 && (
                <div className="px-3 py-1 rounded-lg bg-[#2E6F5E]/12 border border-[#2E6F5E]/30 text-xs font-mono text-[#2E6F5E] font-bold">
                  💰 Карманные деньги: +{formatMoney(player.pocketMoneyPerMonth, player.currency)}/мес
                </div>
              )}
              <div className="text-xs font-mono text-[#6E655F]">
                Общий показатель отношений: <span className="text-[#2C2523] font-bold">{player.relations}/100</span>
              </div>
            </div>
          </div>

          {/* Ask Parents For Pet (Ages 4-17 when no active pet) */}
          {player.age >= 4 && player.age <= 17 && !player.activePetId && (
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#C87A3E]/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#C87A3E] flex items-center gap-1.5">
                  <span>🐾 Домашний питомец (щенок или котёнок)</span>
                </div>
                <div className="text-[11px] text-[#6E655F] mt-0.5">
                  Попросите родителей разрешить завести домашнего любимца. Шанс согласия зависит от отношений и семейного дохода.
                  {player.petRequestCooldown > 0 && (
                    <span className="text-[#B84A39] block mt-0.5 font-mono">
                      Родители просили не поднимать эту тему ещё {player.petRequestCooldown} мес.
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={player.petRequestCooldown > 0 || !onAskParentsForPet}
                onClick={onAskParentsForPet}
                className="px-4 py-2 rounded-xl bg-[#C87A3E] hover:bg-[#B56527] disabled:bg-[#EAE3D5] disabled:text-[#9C9289] text-[#FAF7F2] text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-xs"
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
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#2E6F5E]/12 text-[#2E6F5E] border border-[#2E6F5E]/30 font-bold">
                      {member.relation}
                    </span>
                    <span className="text-[#6E655F]">
                      {member.alive ? `${member.age} лет` : `Светлая память (${member.age} лет)`}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mt-2.5">
                    <div className="w-16 h-28 bg-[#F4EFE6] rounded-lg border border-[#DCD3C2] flex items-center justify-center overflow-hidden shrink-0">
                      <FullBodyPixelHuman
                        appearance={{
                          ...player.appearance,
                          skinColor: player.appearance.skinColor,
                          hairColor: member.relation.includes('Мать') || member.relation.includes('Мама')
                            ? '#3f271d'
                            : member.relation.includes('Отец') || member.relation.includes('Папа')
                            ? '#271911'
                            : '#1c1917',
                          hairStyle: member.relation.includes('Мать') || member.relation.includes('Мама') ? 'long' : 'short',
                          shirtColor: member.relation.includes('Мать') || member.relation.includes('Мама')
                            ? '#3B5B76'
                            : member.relation.includes('Отец') || member.relation.includes('Папа')
                            ? '#4A5568'
                            : '#C87A3E',
                          pantsColor: '#2C2523',
                          shoeColor: '#1E1A18',
                          hasGlasses: false,
                        }}
                        age={member.age}
                        size={100}
                        outfitCategory={
                          member.profession.includes('Директор') ||
                          member.profession.includes('Юрист') ||
                          member.profession.includes('Менеджер')
                            ? 'business'
                            : 'casual'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-[#2C2523] truncate">{member.name}</h4>
                      <div className="text-xs text-[#2E6F5E] font-semibold mt-0.5 truncate">{member.profession}</div>
                      <div className="text-[11px] text-[#6E655F] mt-1 line-clamp-2">
                        {member.trait}
                      </div>

                      <div className="mt-2 space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6E655F]">Доход:</span>
                          <span className="text-[#2C2523] font-semibold text-[11px]">
                            {member.monthlyIncome > 0
                              ? `${formatMoney(member.monthlyIncome, player.currency)}/мес`
                              : 'Учится'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6E655F]">Отношения:</span>
                          <span className="text-[#B84A39] font-bold">{member.relationship}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#DCD3C2] flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled={!member.alive}
                    onClick={() => onInteractFamily(member, 'visit')}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#F4EFE6] hover:bg-[#EFE8DC] disabled:opacity-50 text-[#2C2523] border border-[#DCD3C2] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#2E6F5E]" /> Навестить / Пообщаться
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={!member.alive || player.age < 7 || player.money < 200}
                      onClick={() => onInteractFamily(member, 'gift')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition whitespace-nowrap ${
                        member.alive && player.age >= 7 && player.money >= 200
                          ? 'bg-[#2E6F5E]/15 hover:bg-[#2E6F5E]/25 text-[#2E6F5E] border border-[#2E6F5E]/30 cursor-pointer'
                          : 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3 h-3" />{' '}
                      {player.age < 7 ? '🔒 с 7 лет' : `Подарок (${formatMoney(200, player.currency)})`}
                    </button>
                    <button
                      type="button"
                      disabled={!member.alive}
                      onClick={() => onInteractFamily(member, 'ask_support')}
                      className="py-1.5 px-2 rounded-lg bg-[#C87A3E]/15 hover:bg-[#C87A3E]/25 disabled:opacity-50 text-[#B56527] border border-[#C87A3E]/30 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      {player.age < 7 ? 'Поиграть вместе' : 'Попросить совет/помощь'}
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
          <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono uppercase font-bold text-[#2E6F5E] flex items-center gap-1.5">
                  <Brain className="w-4 h-4 shrink-0" /> ИИ-Движок с Долгосрочной Памятью (Помнит что было ДО и ПОСЛЕ)
                </div>
                <div className="text-xs text-[#6E655F] mt-0.5 break-words">
                  Текущая глава: <span className="text-[#2C2523] font-semibold">{player.storyArc}</span> · Поддерживает облачный Gemini 3.8 Flash и 100% автономный APK-движок
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleOfflineAi}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-xs font-semibold text-[#2E6F5E] cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{player.offlineAiMode ? 'Режим: Автономный APK-ИИ' : 'Режим: Облачный Gemini + APK-ИИ'}</span>
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={onGenerateAiEvent}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAiLoading ? 'Генерация...' : 'Сгенерировать ИИ-событие по вашей памяти'}</span>
                </button>
              </div>
            </div>

            {/* Persistent AI Memory Ledger (What happened BEFORE & AFTER) */}
            <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                <span className="text-[#3B5B76] font-bold uppercase">
                  Цепочка памяти ИИ (Факты вашей биографии: ДО → ВЫБОР → ПОСЛЕ):
                </span>
                <span className="text-[#6E655F]">
                  Записей в памяти: {player.aiMemory.entries.length}
                </span>
              </div>
              <div className="text-xs text-[#2C2523] font-mono bg-[#F4EFE6] p-2.5 rounded-lg border border-[#DCD3C2] break-words">
                {player.aiMemory.coreBiographySummary}
                {player.aiMemory.lastChoiceSummary ? ` · Последнее решение: ${player.aiMemory.lastChoiceSummary}` : ''}
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {player.aiMemory.entries.slice(0, 6).map((mem) => (
                  <div
                    key={mem.id}
                    className="p-2 rounded-lg bg-[#FAF7F2] border border-[#DCD3C2] text-[11px] font-mono text-[#2C2523] flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[#2E6F5E] font-semibold">
                      <span className="truncate">[{mem.age} лет · {mem.year} г.] ДО: {mem.actionTaken}</span>
                      <span className="text-[#C87A3E] uppercase shrink-0">{mem.tag}</span>
                    </div>
                    <div className="text-[#6E655F] break-words">
                      ПОСЛЕ: <span className="text-[#2C2523] font-medium">{mem.consequenceSummary}</span>
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
                        ? 'bg-[#2E6F5E]/12 border-[#2E6F5E]'
                        : 'bg-[#FFFFFF] border-[#DCD3C2] hover:bg-[#EFE8DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2C2523]">{npc.name}</span>
                      <span className="text-xs font-mono font-bold text-[#2E6F5E]">
                        Дружба {npc.relationship}/100
                      </span>
                    </div>
                    <div className="text-xs text-[#6E655F] mt-0.5">
                      {npc.role} • {npc.trait}
                    </div>
                    {npc.dialogueHistory && npc.dialogueHistory.length > 0 && (
                      <div className="text-[10px] font-mono text-[#3B5B76] mt-1">
                        Реплик в памяти диалога: {npc.dialogueHistory.length}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 p-4 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] flex flex-col justify-between space-y-3 shadow-2xs">
              {selectedNpc && (
                <>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 border-b border-[#DCD3C2] pb-2.5">
                      <div className="w-10 h-16 bg-[#F4EFE6] rounded-lg border border-[#DCD3C2] flex items-center justify-center overflow-hidden shrink-0">
                        <FullBodyPixelHuman
                          appearance={{
                            ...player.appearance,
                            hairStyle: 'short',
                            shirtColor: '#3B5B76',
                            pantsColor: '#2C2523',
                            shoeColor: '#1E1A18',
                          }}
                          age={Math.max(6, player.age)}
                          size={64}
                          outfitCategory="street"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#2C2523] flex items-center gap-1.5 truncate">
                          <MessageSquare className="w-4 h-4 text-[#2E6F5E] shrink-0" />
                          Диалог с {selectedNpc.name} (Помнит контекст ДО)
                        </h4>
                        <p className="text-[11px] text-[#6E655F] truncate">{selectedNpc.role}</p>
                      </div>
                      {lastNpcReaction && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2E6F5E]/15 text-[#2E6F5E] font-semibold">
                          {lastNpcReaction}
                        </span>
                      )}
                    </div>

                    {/* Multi-Turn Dialogue History with Memory */}
                    <div className="my-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedNpc.dialogueHistory && selectedNpc.dialogueHistory.length > 0 ? (
                        selectedNpc.dialogueHistory.map((turn, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs leading-relaxed break-words border ${
                              turn.sender === 'player'
                                ? 'bg-[#2E6F5E]/10 border-[#2E6F5E]/30 text-[#2C2523] ml-6'
                                : 'bg-[#F4EFE6] border-[#DCD3C2] text-[#2C2523] mr-6'
                            }`}
                          >
                            <div className="text-[10px] font-mono text-[#6E655F] mb-0.5">
                              {turn.sender === 'player' ? `${player.name}` : selectedNpc.name} ({turn.age} лет, {turn.year} г.)
                            </div>
                            <div>«{turn.text}»</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#DCD3C2] text-xs text-[#2C2523] leading-relaxed break-words">
                          «{selectedNpc.lastMessage}»
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(player.age <= 5
                        ? [
                            'Давай играть в кубики и конструктор!',
                            'Пойдём гулять в парк с родителями!',
                          ]
                        : player.age < 16
                        ? [
                            'Погнали на тренировку после уроков!',
                            'Как лучше подготовиться к олимпиаде и ВУЗу?',
                            'Что нового в школе и в городе?',
                          ]
                        : [
                            'Погнали на тренировку в зал!',
                            'Пойдём на ночной уберэкс-рейд!',
                            'Как лучше инвестировать деньги?',
                          ]
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onSendNpcMessage(selectedNpc.id, preset)}
                          className="px-2.5 py-1 rounded-lg bg-[#F4EFE6] hover:bg-[#EFE8DC] text-[11px] text-[#2C2523] border border-[#DCD3C2] cursor-pointer text-left font-medium"
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none focus:border-[#2E6F5E]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
              <Search className="w-4 h-4 text-[#6E655F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                placeholder="Поиск среди 1 060 реальных артистов (Баста, Кино, Rammstein, Daft Punk, Eminem, The Weeknd)..."
                aria-label="Поиск артиста"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523] outline-none focus:border-[#2E6F5E]"
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
                      ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold'
                      : 'bg-[#FFFFFF] text-[#6E655F] border border-[#DCD3C2] hover:bg-[#EFE8DC]'
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
                  className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex gap-3">
                    <AssetTexturePreview
                      kind="artist"
                      artist={artist}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#F4EFE6] text-[#2E6F5E] border border-[#DCD3C2] font-semibold truncate">
                          {artist.region} • {artist.genre}
                        </span>
                        <span className="text-[#6E655F]">Популярность +{artist.fameBoost}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2C2523] mt-1.5">{artist.name}</h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#DCD3C2] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={player.age < 10 || player.money < artist.ticketPrice}
                      onClick={() => onInteractArtist(artist, 'concert')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                        player.age >= 10 && player.money >= artist.ticketPrice
                          ? 'bg-[#F4EFE6] hover:bg-[#EFE8DC] text-[#2C2523] border border-[#DCD3C2] cursor-pointer'
                          : 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                      }`}
                    >
                      {player.age < 10
                        ? '🔒 с 10 лет'
                        : attended
                        ? 'Концерт (Повтор)'
                        : `Концерт (${formatMoney(artist.ticketPrice, player.currency)})`}
                    </button>
                    <button
                      type="button"
                      disabled={collabed || player.age < 14 || player.money < artist.collabPrice}
                      onClick={() => onInteractArtist(artist, 'collab')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                        collabed
                          ? 'bg-[#2E6F5E]/15 text-[#2E6F5E] cursor-default'
                          : player.age >= 14 && player.money >= artist.collabPrice
                          ? 'bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] cursor-pointer'
                          : 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                      }`}
                    >
                      {collabed
                        ? 'Фит записан'
                        : player.age < 14
                        ? '🔒 Фит с 14 лет'
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
