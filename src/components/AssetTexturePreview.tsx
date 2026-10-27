import React from 'react';
import {
  HouseItem,
  VehicleItem,
  TechGadgetItem,
  PcComponentItem,
  RealArtist,
} from '../game/types';

interface AssetTexturePreviewProps {
  kind: 'house' | 'vehicle' | 'tech' | 'pc' | 'artist';
  house?: HouseItem;
  vehicle?: VehicleItem;
  tech?: TechGadgetItem;
  pc?: PcComponentItem;
  artist?: RealArtist;
  releaseYear?: number;
}

export const AssetTexturePreview: React.FC<AssetTexturePreviewProps> = ({
  kind,
  house,
  vehicle,
  tech,
  pc,
  artist,
  releaseYear,
}) => {
  if (kind === 'vehicle' && vehicle) {
    const isBike = vehicle.type === 'bicycle' || vehicle.type === 'motorcycle';
    const isAirOrSea =
      vehicle.type === 'yacht' || vehicle.type === 'helicopter' || vehicle.type === 'jet';
    const isSuv = vehicle.type === 'suv';
    const isHyper = vehicle.type === 'hypercar';

    return (
      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-[#1e2d42] bg-gradient-to-b from-[#0b1320] via-[#111c2d] to-[#16202a] mb-2.5 select-none">
        {/* Subtle grid texture */}
        <svg viewBox="0 0 240 88" className="w-full h-full block">
          <defs>
            <pattern id={`grid_${vehicle.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <path
                d="M 12 0 L 0 0 0 12"
                fill="none"
                stroke="rgba(148,163,184,0.07)"
                strokeWidth="0.7"
              />
            </pattern>
            <linearGradient id={`paint_${vehicle.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={vehicle.bodyColor} />
              <stop offset="60%" stopColor={vehicle.bodyColor} />
              <stop offset="100%" stopColor="#090d14" />
            </linearGradient>
          </defs>
          <rect width="240" height="88" fill={`url(#grid_${vehicle.id})`} />
          {/* Road or Sea floor */}
          <rect
            x="0"
            y="66"
            width="240"
            height="22"
            fill={vehicle.type === 'yacht' ? '#0c4a6e' : '#0f172a'}
          />
          <line
            x1="0"
            y1="76"
            x2="240"
            y2="76"
            stroke={vehicle.type === 'yacht' ? '#38bdf8' : '#f59e0b'}
            strokeWidth="1.5"
            strokeDasharray="10 8"
            opacity="0.55"
          />

          {isBike ? (
            <g>
              <circle cx="82" cy="58" r="13" fill="#090d12" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="156" cy="58" r="13" fill="#090d12" stroke="#94a3b8" strokeWidth="3" />
              <path
                d="M82 58 L112 36 L146 38 L156 58 L115 56 Z"
                fill={`url(#paint_${vehicle.id})`}
                stroke={vehicle.accentColor}
                strokeWidth="2"
              />
              <rect x="102" y="30" width="24" height="6" rx="3" fill="#1e293b" />
              <circle cx="152" cy="36" r="4" fill="#fef08a" />
            </g>
          ) : isAirOrSea ? (
            <g>
              <polygon
                points="46,56 196,56 176,70 62,70"
                fill={`url(#paint_${vehicle.id})`}
                stroke={vehicle.accentColor}
                strokeWidth="2"
              />
              <polygon points="84,36 154,36 168,56 72,56" fill="#38bdf8" opacity="0.65" />
              {vehicle.type === 'helicopter' && (
                <rect x="44" y="24" width="152" height="3" fill="#e2e8f0" />
              )}
              {vehicle.type === 'jet' && (
                <polygon points="108,36 138,18 148,36" fill={vehicle.accentColor} />
              )}
            </g>
          ) : (
            <g>
              {/* Neon underglow for hypercars and sports cars */}
              {(isHyper || vehicle.prestigeBonus >= 55) && (
                <ellipse
                  cx="120"
                  cy="68"
                  rx="68"
                  ry="4"
                  fill={vehicle.accentColor}
                  opacity="0.45"
                />
              )}
              {/* Spoiler */}
              {isHyper && (
                <polygon
                  points="46,40 58,40 62,48 48,48"
                  fill={vehicle.accentColor}
                />
              )}
              {/* Car / SUV Body */}
              <path
                d={
                  isSuv
                    ? 'M48 60 L48 40 L74 26 L158 26 L178 40 L194 44 L194 60 Z'
                    : isHyper
                    ? 'M42 60 L54 44 L92 32 L152 32 L198 46 L198 60 Z'
                    : 'M46 60 L52 42 L84 28 L148 28 L174 42 L194 46 L194 60 Z'
                }
                fill={`url(#paint_${vehicle.id})`}
                stroke={vehicle.accentColor}
                strokeWidth="1.5"
              />
              {/* Windows */}
              <polygon
                points="86,32 144,32 164,43 72,43"
                fill="#38bdf8"
                opacity="0.55"
              />
              {/* Racing stripe */}
              <rect x="52" y="49" width="138" height="3" fill={vehicle.accentColor} opacity="0.8" />
              {/* Headlight & Taillight */}
              <rect x="188" y="47" width="6" height="5" rx="1" fill="#fef08a" />
              <rect x="46" y="46" width="5" height="5" rx="1" fill="#ef4444" />
              {/* Wheels with alloy rims */}
              <circle cx="80" cy="60" r="12" fill="#090d12" stroke="#475569" strokeWidth="2.5" />
              <circle cx="80" cy="60" r="6" fill={vehicle.accentColor} />
              <circle cx="164" cy="60" r="12" fill="#090d12" stroke="#475569" strokeWidth="2.5" />
              <circle cx="164" cy="60" r="6" fill={vehicle.accentColor} />
            </g>
          )}
        </svg>

        <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-slate-300 border border-white/10">
            {vehicle.brand}
          </span>
          {releaseYear && (
            <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-[9px] font-mono text-sky-300 border border-sky-500/30">
              {releaseYear} г.
            </span>
          )}
        </div>
        <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-amber-300 border border-amber-500/30">
          {vehicle.baseHorsepower} л.с.
        </div>
      </div>
    );
  }

  if (kind === 'house' && house) {
    const floors = Math.min(4, Math.max(1, house.floors));
    return (
      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-[#1e2d42] bg-gradient-to-b from-[#0c1626] via-[#132238] to-[#11241d] mb-2.5 select-none">
        <svg viewBox="0 0 240 88" className="w-full h-full block">
          {/* Stars & Moon/Sun */}
          <circle cx="206" cy="18" r="8" fill="#fde047" opacity="0.8" />
          <rect x="0" y="70" width="240" height="18" fill="#064e3b" />
          {/* Pool for luxury tiers */}
          {house.tier >= 4 && (
            <rect x="166" y="72" width="56" height="10" rx="3" fill="#0284c7" stroke="#bae6fd" strokeWidth="1" />
          )}
          {/* Building Facade with Brick/Marble Lines */}
          <rect
            x="64"
            y={70 - floors * 13}
            width="104"
            height={floors * 13}
            fill={house.wallColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          {/* Roof */}
          <polygon
            points={`56,${70 - floors * 13} 116,${54 - floors * 13} 176,${70 - floors * 13}`}
            fill={house.roofColor}
          />
          {/* Lit Windows Grid */}
          {Array.from({ length: floors }).map((_, fIdx) =>
            [0, 1, 2, 3].map((wIdx) => (
              <rect
                key={`${fIdx}_${wIdx}`}
                x={74 + wIdx * 22}
                y={73 - (fIdx + 1) * 12}
                width="12"
                height="7"
                rx="1"
                fill={(fIdx + wIdx) % 2 === 0 ? '#fde047' : '#38bdf8'}
                opacity="0.85"
              />
            ))
          )}
          {/* Door */}
          <rect x="110" y="59" width="12" height="11" fill="#78350f" />
        </svg>
        <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-emerald-300 border border-emerald-500/30">
          {house.propertyType} · {house.floors} эт.
        </div>
        <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-amber-300 border border-amber-500/30">
          Престиж +{house.prestigeBonus}
        </div>
      </div>
    );
  }

  if (kind === 'tech' && tech) {
    const isPhone = tech.category === 'Смартфоны и Флагманы';
    const isLaptop = tech.category === 'Ноутбуки и Ультрабуки';
    return (
      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-[#1e2d42] bg-gradient-to-br from-[#0b1322] via-[#131c31] to-[#1e1b4b] mb-2 select-none">
        <svg viewBox="0 0 240 72" className="w-full h-full block">
          {isPhone ? (
            <g>
              <rect
                x="98"
                y="8"
                width="44"
                height="56"
                rx="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <rect x="102" y="13" width="36" height="46" rx="3" fill="#1d4ed8" opacity="0.7" />
              <circle cx="120" cy="16" r="2" fill="#090d12" />
              <circle cx="110" cy="24" r="3" fill="#38bdf8" opacity="0.8" />
            </g>
          ) : isLaptop ? (
            <g>
              <rect
                x="78"
                y="12"
                width="84"
                height="42"
                rx="3"
                fill="#0f172a"
                stroke="#a855f7"
                strokeWidth="2"
              />
              <rect x="83" y="16" width="74" height="34" fill="#1e1b4b" />
              <line x1="90" y1="26" x2="136" y2="26" stroke="#34d399" strokeWidth="2" />
              <line x1="90" y1="33" x2="148" y2="33" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="66,54 174,54 182,61 58,61" fill="#64748b" />
            </g>
          ) : (
            <g>
              <rect
                x="76"
                y="16"
                width="88"
                height="40"
                rx="8"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="2"
              />
              <circle cx="102" cy="36" r="10" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
              <circle cx="138" cy="36" r="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            </g>
          )}
        </svg>
        <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-sky-300">
          {tech.brand}
        </div>
        {releaseYear && (
          <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/65 text-[9px] font-mono text-emerald-300">
            {releaseYear} г.
          </div>
        )}
      </div>
    );
  }

  if (kind === 'pc' && pc) {
    return (
      <div className="relative w-full h-18 rounded-lg overflow-hidden border border-[#1e2d42] bg-gradient-to-r from-[#09111e] via-[#131d31] to-[#1e1533] mb-2 select-none">
        <svg viewBox="0 0 240 64" className="w-full h-full block">
          {/* Circuit traces */}
          <line x1="10" y1="32" x2="230" y2="32" stroke="#10b981" strokeWidth="1" opacity="0.25" />
          <rect
            x="72"
            y="12"
            width="96"
            height="40"
            rx="4"
            fill="#0f172a"
            stroke={pc.tier >= 4 ? '#f43f5e' : '#38bdf8'}
            strokeWidth="2"
          />
          <circle cx="96" cy="32" r="11" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
          <circle cx="120" cy="32" r="11" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="144" cy="32" r="11" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
        </svg>
        <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-purple-300">
          Tier {pc.tier}/5
        </div>
        {releaseYear && (
          <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-sky-300">
            {releaseYear} г.
          </div>
        )}
      </div>
    );
  }

  if (kind === 'artist' && artist) {
    return (
      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-purple-500/30 bg-gradient-to-br from-[#1a1033] via-[#0f172a] to-[#31102f] mb-2 select-none">
        <svg viewBox="0 0 240 72" className="w-full h-full block">
          {/* Stage Spotlights */}
          <polygon points="30,0 85,72 50,72" fill="#a855f7" opacity="0.22" />
          <polygon points="210,0 155,72 190,72" fill="#ec4899" opacity="0.22" />
          {/* Equalizer Bars */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <rect
              key={i}
              x={36 + i * 14}
              y={52 - ((i * 7) % 24)}
              width="8"
              height={20 + ((i * 7) % 24)}
              rx="1"
              fill={i % 2 === 0 ? '#a855f7' : '#38bdf8'}
              opacity="0.55"
            />
          ))}
          {/* Artist Silhouette & Mic */}
          <circle cx="120" cy="24" r="10" fill="#fde047" />
          <rect x="108" y="35" width="24" height="28" rx="5" fill="#e2e8f0" />
        </svg>
        <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-purple-300">
          {artist.region} · {artist.genre}
        </div>
        <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300">
          +{artist.fameBoost.toLocaleString('ru-RU')} хайп
        </div>
      </div>
    );
  }

  return null;
};
