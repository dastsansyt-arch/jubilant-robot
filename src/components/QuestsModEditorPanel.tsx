import React, { useState } from 'react';
import { PlayerState, Season, WeatherType, LifeEventTemplate } from '../game/types';
import { validateAndCreateCustomMod } from '../game/rules';

interface QuestsModEditorPanelProps {
  player: PlayerState;
  onClaimQuest: (questId: string) => void;
  onAddCustomMod: (modEvent: LifeEventTemplate, triggerImmediately: boolean) => void;
  onTriggerExistingMod: (modEvent: LifeEventTemplate) => void;
}

export const QuestsModEditorPanel: React.FC<QuestsModEditorPanelProps> = ({
  player,
  onClaimQuest,
  onAddCustomMod,
  onTriggerExistingMod,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weatherCond, setWeatherCond] = useState<WeatherType | 'any'>('Дождь');
  const [seasonCond, setSeasonCond] = useState<Season | 'any'>('Осень');
  const [choiceALabel, setChoiceALabel] = useState('');
  const [choiceAOutcome, setChoiceAOutcome] = useState('');
  const [choiceBLabel, setChoiceBLabel] = useState('');
  const [choiceBOutcome, setChoiceBOutcome] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleCreateScenario = (triggerNow: boolean) => {
    setFormError(null);
    setFormSuccess(null);

    const validation = validateAndCreateCustomMod({
      title,
      description,
      weatherCondition: weatherCond,
      seasonCondition: seasonCond,
      choiceALabel,
      choiceAOutcome,
      choiceBLabel,
      choiceBOutcome,
    });

    if (!validation.valid || !validation.event) {
      setFormError(validation.error || 'Проверьте правильность заполнения полей.');
      return;
    }

    onAddCustomMod(validation.event, triggerNow);
    setFormSuccess(
      triggerNow
        ? `Сценарий «${validation.event.title}» создан и запущен!`
        : `Мод «${validation.event.title}» добавлен в пул событий жизни!`
    );
    setTitle('');
    setDescription('');
    setChoiceALabel('');
    setChoiceAOutcome('');
    setChoiceBLabel('');
    setChoiceBOutcome('');
  };

  return (
    <div className="space-y-4 text-[#2C2523]">
      {/* Dynamic Quests with Rewards */}
      <section className="bg-[#F4EFE6] border border-[#DCD3C2] rounded-2xl p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#2C2523]">
            Ежедневные и Жизненные Квесты
          </h3>
          <p className="text-xs text-[#6E655F]">
            Задания адаптируются к вашему прогрессу, вылазкам Уберэкса и событиям в мире
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {player.quests.map((q) => {
            const pct = Math.min(100, Math.round((q.currentValue / q.targetValue) * 100));
            return (
              <div
                key={q.id}
                className="bg-[#FFFFFF] border border-[#DCD3C2] rounded-xl p-3 flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2523]">{q.title}</span>
                    <span className="text-xs font-mono font-bold text-[#2E6F5E]">
                      +${q.rewardMoney} · +{q.rewardSkillAmount} {q.rewardSkillKey}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E655F] mt-1">{q.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#6E655F]">
                    <span>
                      Прогресс: {q.currentValue.toLocaleString('ru-RU')} / {q.targetValue.toLocaleString('ru-RU')}
                    </span>
                    <span className="font-bold text-[#2C2523]">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EAE3D5] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#2E6F5E]" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!q.completed || q.claimed}
                  onClick={() => onClaimQuest(q.id)}
                  className={`w-full min-h-[38px] rounded-lg text-xs font-semibold cursor-pointer ${
                    q.claimed
                      ? 'bg-[#EAE3D5] text-[#9C9289]'
                      : q.completed
                      ? 'bg-[#2E6F5E] text-[#FAF7F2] font-bold hover:bg-[#24584A]'
                      : 'bg-[#EAE3D5] text-[#9C9289] cursor-not-allowed'
                  }`}
                >
                  {q.claimed
                    ? 'Награда получена'
                    : q.completed
                    ? 'Забрать награду!'
                    : 'В процессе выполнения'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Built-in Scenario & Mod Editor */}
      <section className="bg-[#F4EFE6] border border-[#DCD3C2] rounded-2xl p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#2C2523]">
            Встроенный редактор событий и Модификаций
          </h3>
          <p className="text-xs text-[#6E655F]">
            Создавайте собственные сюжетные развилки с привязкой к погоде и времени года
          </p>
        </div>

        {formError && (
          <div role="alert" className="p-3 rounded-xl bg-[#B84A39]/12 border border-[#B84A39]/40 text-xs text-[#B84A39] font-medium">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div role="status" className="p-3 rounded-xl bg-[#2E6F5E]/12 border border-[#2E6F5E]/40 text-xs text-[#2E6F5E] font-medium">
            {formSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mod-title" className="block text-xs font-medium text-[#6E655F] mb-1">
              Название события (мода)
            </label>
            <input
              id="mod-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Напр.: Секретная лаборатория под метро"
              className="w-full h-10 px-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="mod-weather" className="block text-xs font-medium text-[#6E655F] mb-1">
                Погода
              </label>
              <select
                id="mod-weather"
                value={weatherCond}
                onChange={(e) => setWeatherCond(e.target.value as WeatherType | 'any')}
                className="w-full h-10 px-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
              >
                <option value="any">Любая</option>
                <option value="Дождь">Дождь</option>
                <option value="Гроза">Гроза</option>
                <option value="Снегопад">Снегопад</option>
                <option value="Туман">Туман</option>
                <option value="Ясно">Ясно</option>
              </select>
            </div>
            <div>
              <label htmlFor="mod-season" className="block text-xs font-medium text-[#6E655F] mb-1">
                Время года
              </label>
              <select
                id="mod-season"
                value={seasonCond}
                onChange={(e) => setSeasonCond(e.target.value as Season | 'any')}
                className="w-full h-10 px-2 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
              >
                <option value="any">Любое</option>
                <option value="Осень">Осень</option>
                <option value="Зима">Зима</option>
                <option value="Весна">Весна</option>
                <option value="Лето">Лето</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="mod-desc" className="block text-xs font-medium text-[#6E655F] mb-1">
            Описание сюжетной ситуации
          </label>
          <textarea
            id="mod-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите, что произошло с героем в городе..."
            className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] text-xs text-[#2C2523]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD3C2]">
            <label htmlFor="mod-choice-a" className="block text-xs font-bold text-[#2E6F5E]">
              Вариант выбора А (Смелый / Urbex)
            </label>
            <input
              id="mod-choice-a"
              type="text"
              value={choiceALabel}
              onChange={(e) => setChoiceALabel(e.target.value)}
              placeholder="Текст кнопки выбора А..."
              className="w-full h-9 px-2.5 rounded-lg bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#2C2523]"
            />
            <input
              type="text"
              aria-label="Результат выбора А"
              value={choiceAOutcome}
              onChange={(e) => setChoiceAOutcome(e.target.value)}
              placeholder="Что произойдёт в летописи..."
              className="w-full h-9 px-2.5 rounded-lg bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#2C2523]"
            />
          </div>

          <div className="space-y-2 bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD3C2]">
            <label htmlFor="mod-choice-b" className="block text-xs font-bold text-[#3B5B76]">
              Вариант выбора Б (Расчётливый / Капитал)
            </label>
            <input
              id="mod-choice-b"
              type="text"
              value={choiceBLabel}
              onChange={(e) => setChoiceBLabel(e.target.value)}
              placeholder="Текст кнопки выбора Б..."
              className="w-full h-9 px-2.5 rounded-lg bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#2C2523]"
            />
            <input
              type="text"
              aria-label="Результат выбора Б"
              value={choiceBOutcome}
              onChange={(e) => setChoiceBOutcome(e.target.value)}
              placeholder="Что произойдёт в летописи..."
              className="w-full h-9 px-2.5 rounded-lg bg-[#FAF7F2] border border-[#DCD3C2] text-xs text-[#2C2523]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleCreateScenario(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2E6F5E] hover:bg-[#24584A] text-[#FAF7F2] font-bold text-xs cursor-pointer"
          >
            Создать и запустить сценарий сейчас
          </button>
          <button
            type="button"
            onClick={() => handleCreateScenario(false)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DC] border border-[#DCD3C2] text-[#2C2523] font-semibold text-xs cursor-pointer"
          >
            Сохранить в список модов ({player.customMods.length})
          </button>
        </div>

        {player.customMods.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-[#DCD3C2]">
            <div className="text-xs font-semibold text-[#6E655F]">
              Установленные пользовательские сценарии:
            </div>
            {player.customMods.map((mod) => (
              <div
                key={mod.id}
                className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#DCD3C2] flex items-center justify-between gap-2"
              >
                <div className="text-xs text-[#2C2523] font-medium truncate">
                  {mod.title} ({mod.weatherCondition} / {mod.seasonCondition})
                </div>
                <button
                  type="button"
                  onClick={() => onTriggerExistingMod(mod)}
                  className="px-3 py-1 rounded-lg bg-[#2E6F5E]/15 text-[#2E6F5E] text-xs font-semibold cursor-pointer shrink-0"
                >
                  Разыграть
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
