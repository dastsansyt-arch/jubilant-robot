import React from 'react';
import { CharacterAppearance, FacialHairId, OutfitStyle } from '../game/types';

export interface FullBodyPixelHumanProps {
  appearance?: CharacterAppearance;
  age?: number;
  gender?: 'male' | 'female';
  skinColor?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  outfitStyle?: OutfitStyle;
  suitColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  tieColor?: string;
  facialHairId?: FacialHairId;
  hasGlasses?: boolean;
  hasMask?: boolean;
  hasInjury?: boolean;
  hasBriefcase?: boolean;
  briefcaseColor?: string;
  strength?: number;
  muscleMass?: number;
  size?: number; // Target height in px, e.g. 120, 160, 200
  className?: string;
  previewAsAdult?: boolean;
}

// Color shade helper
function adjustColor(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const FullBodyPixelHuman: React.FC<FullBodyPixelHumanProps> = ({
  appearance,
  age = 25,
  gender,
  skinColor: customSkin,
  hairColor: customHair,
  hairStyle: customHairStyle,
  eyeColor: customEye,
  outfitStyle = 'business',
  suitColor: customSuit,
  shirtColor: customShirt,
  pantsColor: customPants,
  tieColor: customTie,
  facialHairId = 'none',
  hasGlasses: customGlasses,
  hasMask = false,
  hasInjury = false,
  hasBriefcase,
  briefcaseColor = '#8D5B36',
  strength = 30,
  muscleMass = 25,
  size = 140,
  className = '',
  previewAsAdult = false,
}) => {
  const effectiveAge = previewAsAdult ? 25 : age;

  // Resolve base colors
  const skin = customSkin || appearance?.skinColor || '#f2c9a1';
  const skinLight = adjustColor(skin, 15);
  const skinDark = adjustColor(skin, -20);
  const skinShadow = adjustColor(skin, -35);

  const hair = customHair || appearance?.hairColor || '#2c1e14';
  const hairLight = adjustColor(hair, 20);
  const hairDark = adjustColor(hair, -25);

  const hairStyle = customHairStyle || appearance?.hairStyle || 'short';
  const eyes = customEye || appearance?.eyeColor || '#1f2937';
  const glasses = customGlasses !== undefined ? customGlasses : Boolean(appearance?.hasGlasses);

  // Suit / Clothing presets matching the reference image
  // Ref: tan/camel, dark navy, slate blue, red/crimson, yellow/gold, emerald teal, charcoal
  const SUIT_PALETTES: Record<string, { jacket: string; pants: string; tie: string }> = {
    business: { jacket: '#2b3a4a', pants: '#1e2834', tie: '#c53030' },
    luxury:   { jacket: '#8c3a3a', pants: '#5a2222', tie: '#1a202c' },
    sport:    { jacket: '#22543d', pants: '#1c4532', tie: '#ffffff' },
    street:   { jacket: '#b7791f', pants: '#744210', tie: '#e2e8f0' },
    casual:   { jacket: '#4a5568', pants: '#2d3748', tie: '#9b2c2c' },
  };

  const palette = SUIT_PALETTES[outfitStyle] || SUIT_PALETTES.business;
  const jacketBase = customSuit || appearance?.shirtColor || palette.jacket;
  const jacketLight = adjustColor(jacketBase, 18);
  const jacketDark = adjustColor(jacketBase, -20);

  const pantsBase = customPants || appearance?.pantsColor || palette.pants;
  const pantsLight = adjustColor(pantsBase, 18);
  const pantsDark = adjustColor(pantsBase, -22);

  const tieBase = customTie || palette.tie;
  const tieLight = adjustColor(tieBase, 20);
  const tieDark = adjustColor(tieBase, -20);

  const shoes = appearance?.shoeColor || '#171923';
  const shoesLight = adjustColor(shoes, 25);
  const shoesDark = adjustColor(shoes, -20);

  // Growth & Proportion scaling by age
  // 0-3: baby (short, chubby head), 4-10: child, 11-16: teen, 18+: adult full body
  const isBaby = effectiveAge <= 3;
  const isChild = effectiveAge > 3 && effectiveAge <= 10;
  const isTeen = effectiveAge > 10 && effectiveAge <= 16;
  const isAdult = effectiveAge >= 17;

  // Muscle / Athletic width modifier (adults only)
  const muscleBonus = isAdult ? Math.min(4, Math.round((strength + muscleMass) / 45)) : 0;

  // Briefcase logic: business/luxury adult characters hold briefcase like in reference
  const showBriefcase = hasBriefcase !== undefined
    ? hasBriefcase
    : isAdult && (outfitStyle === 'business' || outfitStyle === 'luxury');

  const briefcaseLight = adjustColor(briefcaseColor, 25);
  const briefcaseDark = adjustColor(briefcaseColor, -25);

  return (
    <svg
      viewBox="0 0 64 96"
      width={Math.round(size * (64 / 96))}
      height={size}
      className={`select-none ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dropShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Soft Oval Drop Shadow ── */}
      <ellipse cx="32" cy="91" rx={isBaby ? "12" : "18"} ry="3.5" fill="url(#dropShadow)" />

      {isBaby ? (
        // ── BABY / TODDLER FORM (0-3 yrs) ──
        <g id="baby-layer">
          {/* Baby Head */}
          <rect x="22" y="44" width="20" height="18" fill={skinLight} />
          <rect x="32" y="44" width="10" height="18" fill={skinDark} />
          {/* Eyes */}
          <rect x="26" y="52" width="3" height="3" fill={eyes} />
          <rect x="35" y="52" width="3" height="3" fill={eyes} />
          {/* Baby Romper / Clothes */}
          <rect x="24" y="62" width="16" height="16" fill={jacketLight} />
          <rect x="32" y="62" width="8" height="16" fill={jacketDark} />
          {/* Baby Cap / Hair tuft */}
          <rect x="24" y="41" width="16" height="5" fill={hairLight} />
          <rect x="32" y="41" width="8" height="5" fill={hairDark} />
          {/* Tiny feet */}
          <rect x="25" y="78" width="5" height="4" fill={shoesLight} />
          <rect x="34" y="78" width="5" height="4" fill={shoesDark} />
        </g>
      ) : (
        // ── FULL BODY STYLIZED VOXEL HUMAN (Child / Teen / Adult) ──
        <g id="fullbody-human">
          {/* ════════════ 1. LEGS & PANTS (Separate legs with gap) ════════════ */}
          {/* Left Leg (Light side) */}
          <rect
            x={isChild ? "26" : "25"}
            y={isChild ? "58" : isTeen ? "52" : "48"}
            width={isChild ? "5" : "6"}
            height={isChild ? "26" : isTeen ? "32" : "36"}
            fill={pantsLight}
          />
          {/* Left Leg Inner Crease */}
          <rect
            x={isChild ? "30" : "29"}
            y={isChild ? "58" : isTeen ? "52" : "48"}
            width="2"
            height={isChild ? "26" : isTeen ? "32" : "36"}
            fill={pantsBase}
          />

          {/* Right Leg (Shadow side) */}
          <rect
            x={isChild ? "33" : "33"}
            y={isChild ? "58" : isTeen ? "52" : "48"}
            width={isChild ? "5" : "6"}
            height={isChild ? "26" : isTeen ? "32" : "36"}
            fill={pantsDark}
          />
          {/* Right Leg Outer edge */}
          <rect
            x={isChild ? "37" : "37"}
            y={isChild ? "58" : isTeen ? "52" : "48"}
            width="2"
            height={isChild ? "26" : isTeen ? "32" : "36"}
            fill={adjustColor(pantsDark, -15)}
          />

          {/* ════════════ 2. SHOES ════════════ */}
          {/* Left Shoe */}
          <rect x={isChild ? "25" : "24"} y={isChild ? "84" : "84"} width="7" height="6" fill={shoesLight} />
          <rect x={isChild ? "25" : "24"} y={isChild ? "88" : "88"} width="7" height="2" fill={adjustColor(shoesLight, -20)} />

          {/* Right Shoe */}
          <rect x={isChild ? "33" : "33"} y={isChild ? "84" : "84"} width="7" height="6" fill={shoesDark} />
          <rect x={isChild ? "33" : "33"} y={isChild ? "88" : "88"} width="7" height="2" fill={adjustColor(shoesDark, -20)} />

          {/* ════════════ 3. TORSO / JACKET / SHIRT ════════════ */}
          {/* Left Torso (Light side) */}
          <rect
            x={23 - muscleBonus}
            y={isChild ? "36" : "24"}
            width={9 + muscleBonus}
            height={isChild ? "22" : "24"}
            fill={jacketLight}
          />
          {/* Right Torso (Shadow side) */}
          <rect
            x="32"
            y={isChild ? "36" : "24"}
            width={9 + muscleBonus}
            height={isChild ? "22" : "24"}
            fill={jacketDark}
          />

          {/* White Dress Shirt V-Neck strip */}
          <rect x="30" y={isChild ? "36" : "24"} width="4" height={isChild ? "14" : "18"} fill="#ffffff" />
          <rect x="32" y={isChild ? "36" : "24"} width="2" height={isChild ? "14" : "18"} fill="#e2e8f0" />

          {/* Tie (matching reference image style) */}
          <rect x="31" y={isChild ? "38" : "26"} width="2" height={isChild ? "10" : "14"} fill={tieLight} />
          <rect x="32" y={isChild ? "38" : "26"} width="1" height={isChild ? "10" : "14"} fill={tieDark} />
          {/* Tie Knot */}
          <rect x="30.5" y={isChild ? "36" : "24"} width="3" height="3" fill={tieLight} />

          {/* Suit Lapels (Light on left, dark on right) */}
          <polygon points={`30,${isChild ? 36 : 24} ${27 - muscleBonus},${isChild ? 43 : 32} 30,${isChild ? 47 : 36}`} fill={jacketLight} />
          <polygon points={`34,${isChild ? 36 : 24} ${37 + muscleBonus},${isChild ? 43 : 32} 34,${isChild ? 47 : 36}`} fill={jacketDark} />

          {/* ════════════ 4. ARMS & HANDS ════════════ */}
          {/* Left Arm (Light side) */}
          <rect
            x={18 - muscleBonus}
            y={isChild ? "37" : "25"}
            width="5"
            height={isChild ? "20" : "22"}
            fill={jacketLight}
          />
          {/* Left Hand / Cuff */}
          <rect x={18 - muscleBonus} y={isChild ? "57" : "47"} width="5" height="4" fill={skinLight} />

          {/* Right Arm (Shadow side) */}
          <rect
            x={41 + muscleBonus}
            y={isChild ? "37" : "25"}
            width="5"
            height={isChild ? "20" : "22"}
            fill={jacketDark}
          />
          {/* Right Hand / Cuff */}
          <rect x={41 + muscleBonus} y={isChild ? "57" : "47"} width="5" height="4" fill={skinDark} />

          {/* Injury bandage on right arm if injured */}
          {hasInjury && (
            <g id="injury-bandage">
              <rect x={40 + muscleBonus} y={isChild ? "47" : "35"} width="7" height="6" fill="#f7fafc" stroke="#e2e8f0" strokeWidth="0.5" />
              <rect x={42 + muscleBonus} y={isChild ? "49" : "37"} width="3" height="2" fill="#e53e3e" />
            </g>
          )}

          {/* ════════════ 5. BRIEFCASE / ACCESSORY (Reference Style) ════════════ */}
          {showBriefcase && (
            <g id="leather-briefcase">
              {/* Briefcase Body */}
              <rect x="11 - muscleBonus" y="44" width="13" height="15" rx="1" fill={briefcaseLight} />
              <rect x="17 - muscleBonus" y="44" width="7" height="15" rx="1" fill={briefcaseDark} />
              {/* Golden Handle */}
              <path
                d={`M ${15 - muscleBonus} 44 L ${15 - muscleBonus} 41 L ${20 - muscleBonus} 41 L ${20 - muscleBonus} 44`}
                stroke="#d69e2e"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Golden Locks */}
              <rect x="13 - muscleBonus" y="49" width="2" height="2" fill="#ecc94b" />
              <rect x="19 - muscleBonus" y="49" width="2" height="2" fill="#d69e2e" />
            </g>
          )}

          {/* ════════════ 6. NECK ════════════ */}
          <rect x="29" y={isChild ? "32" : "20"} width="3" height="4" fill={skinLight} />
          <rect x="32" y={isChild ? "32" : "20"} width="3" height="4" fill={skinDark} />

          {/* ════════════ 7. HEAD & FACE (Blocky Stylized) ════════════ */}
          {/* Head Base: Left light, Right dark split */}
          <rect x="23" y={isChild ? "16" : "6"} width="9" height={isChild ? "16" : "14"} fill={skinLight} />
          <rect x="32" y={isChild ? "16" : "6"} width="9" height={isChild ? "16" : "14"} fill={skinDark} />

          {/* Eyebrows */}
          <rect x="25" y={isChild ? "21" : "10"} width="4" height="1.5" fill={hairLight} />
          <rect x="35" y={isChild ? "21" : "10"} width="4" height="1.5" fill={hairDark} />

          {/* Eyes (Square pixel eyes with white shine like reference) */}
          {/* Left Eye */}
          <rect x="26" y={isChild ? "23" : "12"} width="3" height="3" fill={eyes} />
          <rect x="26" y={isChild ? "23" : "12"} width="1.5" height="1.5" fill="#ffffff" />

          {/* Right Eye */}
          <rect x="35" y={isChild ? "23" : "12"} width="3" height="3" fill={eyes} />
          <rect x="35" y={isChild ? "23" : "12"} width="1.5" height="1.5" fill="#ffffff" />

          {/* Glasses Frame */}
          {glasses && (
            <g id="glasses-layer">
              <rect x="24" y={isChild ? "22" : "11"} width="6" height="5" fill="none" stroke="#1a202c" strokeWidth="1" />
              <rect x="34" y={isChild ? "22" : "11"} width="6" height="5" fill="none" stroke="#1a202c" strokeWidth="1" />
              <line x1="30" y1={isChild ? "24" : "13"} x2="34" y2={isChild ? "24" : "13"} stroke="#1a202c" strokeWidth="1" />
            </g>
          )}

          {/* Mouth / Smile */}
          <rect x="29" y={isChild ? "28" : "17"} width="6" height="1.5" fill={skinShadow} />

          {/* Facial Hair (Reference: thick full beard, stubble, mustache, goatee) */}
          {facialHairId !== 'none' && !hasMask && isAdult && (
            <g id="facial-hair">
              {facialHairId === 'stubble' && (
                <rect x="24" y="16" width="16" height="4" fill={hairDark} opacity="0.35" />
              )}
              {facialHairId === 'mustache' && (
                <rect x="27" y="15.5" width="10" height="2" fill={hairDark} />
              )}
              {facialHairId === 'goatee' && (
                <>
                  <rect x="28" y="15.5" width="8" height="2" fill={hairDark} />
                  <rect x="29" y="17.5" width="6" height="2.5" fill={hairDark} />
                </>
              )}
              {(facialHairId === 'beard' || facialHairId === 'full_beard') && (
                <>
                  {/* Thick beard wrapped around chin & cheeks like reference row 1 & 2 */}
                  <rect x="23" y="14" width="3" height="6" fill={hairLight} />
                  <rect x="38" y="14" width="3" height="6" fill={hairDark} />
                  <rect x="24" y="16" width="16" height="4" fill={hairDark} />
                  <rect x="25" y="18" width="14" height="2.5" fill={adjustColor(hairDark, -15)} />
                </>
              )}
            </g>
          )}

          {/* Face Mask (like reference bottom-right character) */}
          {hasMask && (
            <g id="face-mask">
              <rect x="24" y="14" width="16" height="6" fill="#2d3748" rx="1" />
              <line x1="23" y1="15" x2="25" y2="15" stroke="#718096" strokeWidth="1" />
              <line x1="39" y1="15" x2="41" y2="15" stroke="#718096" strokeWidth="1" />
            </g>
          )}

          {/* ════════════ 8. HAIR STYLES (Modular Layer) ════════════ */}
          <g id="hair-layer">
            {hairStyle === 'short' && (
              <>
                <rect x="22" y={isChild ? "13" : "3"} width="10" height="5" fill={hairLight} />
                <rect x="32" y={isChild ? "13" : "3"} width="10" height="5" fill={hairDark} />
                <rect x="22" y={isChild ? "15" : "5"} width="2" height="6" fill={hairLight} />
                <rect x="40" y={isChild ? "15" : "5"} width="2" height="6" fill={hairDark} />
              </>
            )}

            {hairStyle === 'spiky' && (
              <>
                <polygon points={`22,${isChild ? 16 : 6} 25,${isChild ? 11 : 1} 28,${isChild ? 16 : 6}`} fill={hairLight} />
                <polygon points={`27,${isChild ? 16 : 6} 31,${isChild ? 10 : 0} 34,${isChild ? 16 : 6}`} fill={hairLight} />
                <polygon points={`33,${isChild ? 16 : 6} 37,${isChild ? 10 : 0} 40,${isChild ? 16 : 6}`} fill={hairDark} />
                <polygon points={`38,${isChild ? 16 : 6} 41,${isChild ? 11 : 1} 42,${isChild ? 16 : 6}`} fill={hairDark} />
                <rect x="22" y={isChild ? "14" : "4"} width="20" height="3" fill={hairLight} />
              </>
            )}

            {hairStyle === 'fade' && (
              <>
                <rect x="23" y={isChild ? "13" : "3"} width="9" height="4" fill={hairLight} />
                <rect x="32" y={isChild ? "13" : "3"} width="9" height="4" fill={hairDark} />
                <rect x="22" y={isChild ? "17" : "7"} width="1.5" height="4" fill={hairLight} opacity="0.5" />
                <rect x="40.5" y={isChild ? "17" : "7"} width="1.5" height="4" fill={hairDark} opacity="0.5" />
              </>
            )}

            {hairStyle === 'long' && (
              <>
                <rect x="21" y={isChild ? "13" : "3"} width="11" height="5" fill={hairLight} />
                <rect x="32" y={isChild ? "13" : "3"} width="11" height="5" fill={hairDark} />
                {/* Long hair flowing down sides */}
                <rect x="20" y={isChild ? "15" : "5"} width="3.5" height="15" fill={hairLight} />
                <rect x="40.5" y={isChild ? "15" : "5"} width="3.5" height="15" fill={hairDark} />
              </>
            )}

            {hairStyle === 'curly' && (
              <>
                <circle cx="24" cy={isChild ? "14" : "4"} r="3" fill={hairLight} />
                <circle cx="29" cy={isChild ? "13" : "3"} r="3.5" fill={hairLight} />
                <circle cx="34" cy={isChild ? "13" : "3"} r="3.5" fill={hairDark} />
                <circle cx="39" cy={isChild ? "14" : "4"} r="3" fill={hairDark} />
                <rect x="22" y={isChild ? "14" : "4"} width="20" height="4" fill={hairLight} />
              </>
            )}

            {hairStyle === 'bob' && (
              <>
                <rect x="21" y={isChild ? "13" : "3"} width="11" height="6" fill={hairLight} />
                <rect x="32" y={isChild ? "13" : "3"} width="11" height="6" fill={hairDark} />
                <rect x="20" y={isChild ? "16" : "6"} width="3" height="9" fill={hairLight} />
                <rect x="41" y={isChild ? "16" : "6"} width="3" height="9" fill={hairDark} />
              </>
            )}

            {hairStyle === 'bun' && (
              <>
                <rect x="22" y={isChild ? "13" : "3"} width="10" height="5" fill={hairLight} />
                <rect x="32" y={isChild ? "13" : "3"} width="10" height="5" fill={hairDark} />
                {/* Top Bun */}
                <circle cx="32" cy={isChild ? "10" : "1"} r="3.5" fill={hairDark} />
              </>
            )}

            {hairStyle === 'hood' && (
              <path
                d={`M 20 ${isChild ? 16 : 6} Q 32 ${isChild ? 8 : -2} 44 ${isChild ? 16 : 6} L 44 ${isChild ? 36 : 26} L 20 ${isChild ? 36 : 26} Z`}
                fill={adjustColor(jacketBase, -10)}
              />
            )}
          </g>
        </g>
      )}
    </svg>
  );
};
