import React from 'react';
import {
  BackgroundLocationId,
  CharacterAppearance,
  FacialHairId,
  OutfitStyle,
  Season,
  WeatherType,
} from '../game/types';

export interface FullBodyPixelHumanProps {
  appearance: CharacterAppearance;
  age?: number;
  strength?: number;
  muscleMass?: number;
  outfitStyle?: OutfitStyle;
  facialHairId?: FacialHairId;
  hasMask?: boolean;
  hasInjury?: boolean;
  hasBriefcase?: boolean;
  size?: number;
  className?: string;
  // Extended Auto-Context & Wardrobe Props
  contextMode?: 'infant' | 'toddler' | 'school' | 'military' | 'adult';
  outfitCategory?: 'infant' | 'toddler' | 'school' | 'military' | 'casual' | 'street' | 'sport' | 'business' | 'luxury';
  suitColorOverride?: string;
  tieColorOverride?: string;
  handItem?: 'none' | 'toy' | 'backpack' | 'rifle' | 'sport_bag' | 'briefcase' | 'dual_cases';
  hasWatch?: boolean;
  hasGlassesOverride?: boolean;
}

function shadeColor(hex: string, percent: number): string {
  const cleaned = (hex || '#4A5568').replace('#', '');
  const fullHex =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned.padEnd(6, '0').slice(0, 6);
  const num = parseInt(fullHex, 16);
  if (Number.isNaN(num)) return '#3A4250';
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round((255 * percent) / 100)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round((255 * percent) / 100)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round((255 * percent) / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 2.5D Blocky-Vector Character Generator (Hi-Bit Warm Editorial Style)
 * Matches the 12-character reference sheet: blocky 2.5D head/hair/beard,
 * tailored suits with lapels & ties, shaded right side for volume,
 * oval floor shadow, and strict age/military/wardrobe hand items.
 */
export const FullBodyPixelHuman: React.FC<FullBodyPixelHumanProps> = ({
  appearance,
  age = 20,
  strength = 25,
  muscleMass = 25,
  outfitStyle = 'casual',
  facialHairId = 'none',
  hasInjury = false,
  hasBriefcase = false,
  size = 160,
  className = '',
  contextMode,
  outfitCategory,
  suitColorOverride,
  tieColorOverride,
  handItem,
  hasWatch = false,
  hasGlassesOverride,
}) => {
  const effectiveAge = Math.max(0, age);

  // Determine automatic age & military context if not explicitly passed
  const resolvedMode: 'infant' | 'toddler' | 'school' | 'military' | 'adult' =
    contextMode ||
    (effectiveAge <= 2
      ? 'infant'
      : effectiveAge <= 6
      ? 'toddler'
      : effectiveAge <= 17
      ? 'school'
      : 'adult');

  const resolvedCategory =
    outfitCategory ||
    (resolvedMode === 'infant'
      ? 'infant'
      : resolvedMode === 'toddler'
      ? 'toddler'
      : resolvedMode === 'school'
      ? 'school'
      : outfitStyle);

  const resolvedHandItem: 'none' | 'toy' | 'backpack' | 'rifle' | 'sport_bag' | 'briefcase' | 'dual_cases' =
    handItem ||
    (resolvedMode === 'infant'
      ? 'none'
      : resolvedMode === 'toddler'
      ? 'toy'
      : resolvedMode === 'school'
      ? 'backpack'
      : resolvedMode === 'military'
      ? 'rifle'
      : hasBriefcase
      ? 'briefcase'
      : 'none');

  // Skin & Hair colors with 2.5D shading
  const skinBase = appearance.skinColor || '#F2C29B';
  const skinShadow = shadeColor(skinBase, -14);
  const skinDeep = shadeColor(skinBase, -26);

  // Auto-greying hair at 58+
  const rawHair = effectiveAge >= 58 ? '#94A3B8' : appearance.hairColor || '#3A2314';
  const hairBase = rawHair;
  const hairShadow = shadeColor(hairBase, -18);
  const hairHighlight = shadeColor(hairBase, 14);

  const hairStyle =
    effectiveAge >= 62 && appearance.hairStyle === 'short'
      ? 'balding'
      : appearance.hairStyle || 'short';

  // Primary suit/top & pants colors
  let primarySuit = suitColorOverride || appearance.shirtColor || '#2B3A4A';
  let pantsBase = appearance.pantsColor || '#232B35';
  let tieColor = tieColorOverride || '#B84A39';

  if (resolvedMode === 'infant') {
    primarySuit = '#8AB4CC';
    pantsBase = '#769FB8';
  } else if (resolvedMode === 'toddler') {
    primarySuit = '#D98248';
    pantsBase = '#3B5B76';
  } else if (resolvedMode === 'school') {
    primarySuit = '#3B5B76';
    pantsBase = '#283545';
  } else if (resolvedMode === 'military') {
    primarySuit = '#4B5320';
    pantsBase = '#3B4218';
  } else if (resolvedCategory === 'business' || resolvedCategory === 'luxury') {
    primarySuit = suitColorOverride || '#2B3A4A';
    pantsBase = shadeColor(primarySuit, -12);
  } else if (resolvedCategory === 'sport') {
    primarySuit = suitColorOverride || '#2E6F5E';
    pantsBase = '#243430';
  } else if (resolvedCategory === 'street') {
    primarySuit = suitColorOverride || '#5C4033';
    pantsBase = '#2C2523';
  }

  const suitShadow = shadeColor(primarySuit, -18);
  const suitHighlight = shadeColor(primarySuit, 12);
  const pantsShadow = shadeColor(pantsBase, -18);
  const shoeBase = '#231B16';
  const shoeShadow = '#140F0C';

  // Vertical scale by age so infants/toddlers/children look distinct
  const ageScale =
    effectiveAge <= 2
      ? 0.58
      : effectiveAge <= 6
      ? 0.72
      : effectiveAge <= 12
      ? 0.85
      : effectiveAge <= 16
      ? 0.94
      : 1.0;

  const isAthletic = strength >= 55 || muscleMass >= 55;
  const torsoWidth = isAthletic && effectiveAge >= 16 ? 34 : 30;
  const torsoX = 40 - torsoWidth / 2;

  const showFacialHair = effectiveAge >= 18 && facialHairId && facialHairId !== 'none';
  const showGlasses =
    hasGlassesOverride !== undefined ? hasGlassesOverride : Boolean(appearance.hasGlasses && effectiveAge >= 10);

  const isBusinessSuit =
    resolvedMode === 'adult' && (resolvedCategory === 'business' || resolvedCategory === 'luxury');

  return (
    <svg
      viewBox="0 0 80 128"
      width={Math.round(size * 0.64)}
      height={size}
      className={`select-none overflow-visible ${className}`}
      role="img"
      aria-label={`Персонаж ${effectiveAge} лет`}
    >
      {/* 1. OVAL FLOOR SHADOW (Always grounded on the floor) */}
      <ellipse cx="40" cy="120" rx={24 * ageScale + 4} ry="4.5" fill="rgba(44, 37, 35, 0.17)" />
      <ellipse cx="40" cy="120" rx={15 * ageScale + 2} ry="2.5" fill="rgba(44, 37, 35, 0.14)" />

      {/* Transform wrapper for age height scaling anchored at y=118 */}
      <g transform={`translate(40, 118) scale(${ageScale}) translate(-40, -118)`}>
        {/* 2. SCHOOL BACKPACK BEHIND TORSO (7–17 years) */}
        {resolvedHandItem === 'backpack' && (
          <g>
            <rect x={torsoX - 5} y="48" width={torsoWidth + 10} height="30" rx="3" fill="#8C4A32" />
            <rect x={torsoX - 3} y="50" width="4" height="26" fill="#6E3723" />
            <rect x={torsoX + torsoWidth - 1} y="50" width="4" height="26" fill="#6E3723" />
          </g>
        )}

        {/* 3. LEGS & TROUSERS WITH 2.5D SHADING & CREASES */}
        <g>
          {/* Left Leg */}
          <rect x="27" y="80" width="11" height="32" rx="1.5" fill={pantsBase} />
          <rect x="34" y="80" width="4" height="32" fill={pantsShadow} />
          {/* Trouser crease highlight */}
          <rect x="30" y="82" width="1.5" height="28" fill={shadeColor(pantsBase, 12)} opacity="0.6" />

          {/* Right Leg */}
          <rect x="42" y="80" width="11" height="32" rx="1.5" fill={pantsBase} />
          <rect x="49" y="80" width="4" height="32" fill={pantsShadow} />
          <rect x="45" y="82" width="1.5" height="28" fill={shadeColor(pantsBase, 12)} opacity="0.6" />

          {/* Shoes / Boots */}
          <rect x="26" y="111" width="13" height="7" rx="1.5" fill={shoeBase} />
          <rect x="26" y="115" width="13" height="3" rx="1" fill={shoeShadow} />
          <rect x="41" y="111" width="13" height="7" rx="1.5" fill={shoeBase} />
          <rect x="41" y="115" width="13" height="3" rx="1" fill={shoeShadow} />
        </g>

        {/* 4. TORSO / JACKET / UNIFORM */}
        <g>
          {/* Base Torso */}
          <rect x={torsoX} y="46" width={torsoWidth} height="36" rx="2" fill={primarySuit} />
          {/* Right-side 2.5D volume shadow on torso */}
          <rect
            x={torsoX + torsoWidth - 8}
            y="46"
            width="8"
            height="36"
            rx="1"
            fill={suitShadow}
          />
          {/* Left-side subtle highlight */}
          <rect x={torsoX} y="46" width="3" height="36" fill={suitHighlight} opacity="0.45" />

          {/* BUSINESS SUIT DETAILS: White Shirt V-Neck, Tie, and Notched Lapels */}
          {isBusinessSuit && (
            <g>
              {/* Crisp white dress shirt center */}
              <rect x="35" y="46" width="10" height="28" fill="#FAF7F2" />
              <rect x="42" y="46" width="3" height="28" fill="#E5DEC9" />
              {/* Shirt Collar points */}
              <polygon points="34,46 39,52 35,53" fill="#FFFFFF" />
              <polygon points="46,46 41,52 45,53" fill="#EAE3D5" />
              {/* Necktie */}
              <rect x="38.5" y="48" width="3" height="3.5" rx="0.5" fill={shadeColor(tieColor, -15)} />
              <polygon points="38.5,51.5 41.5,51.5 42,72 40,75 38,72" fill={tieColor} />
              {/* Jacket Notched Lapels (Left & Right) */}
              <polygon
                points={`34,46 38,46 38,68 32,56`}
                fill={suitHighlight}
              />
              <polygon
                points={`46,46 42,46 42,68 48,56`}
                fill={suitShadow}
              />
              {/* Jacket bottom split & buttons */}
              <rect x="39.3" y="73" width="1.4" height="9" fill={suitShadow} />
              <rect x="36" y="78" width="8" height="3" fill="#231B16" />
              {/* Pocket square */}
              <rect x={torsoX + 4} y="55" width="5" height="2" fill="#FAF7F2" />
            </g>
          )}

          {/* SCHOOL / STREET HOODIE DETAILS */}
          {(resolvedMode === 'school' || resolvedCategory === 'street' || resolvedCategory === 'casual') &&
            !isBusinessSuit &&
            resolvedMode !== 'military' &&
            resolvedMode !== 'infant' && (
              <g>
                {/* Collar / V-insert */}
                <rect x="35" y="46" width="10" height="5" rx="1" fill="#FAF7F2" />
                {/* Center zipper / seam */}
                <rect x="39.2" y="51" width="1.6" height="31" fill={suitShadow} />
                {/* Kangaroo pocket */}
                <rect x="31" y="66" width="18" height="10" rx="1.5" fill={suitShadow} opacity="0.55" />
                {/* Backpack shoulder straps for schoolchild */}
                {resolvedHandItem === 'backpack' && (
                  <g>
                    <rect x={torsoX + 2} y="46" width="3.5" height="24" rx="1" fill="#6E3723" />
                    <rect x={torsoX + torsoWidth - 5.5} y="46" width="3.5" height="24" rx="1" fill="#542919" />
                  </g>
                )}
              </g>
            )}

          {/* SPORT TRACKSUIT DETAILS */}
          {resolvedCategory === 'sport' && resolvedMode === 'adult' && (
            <g>
              <rect x="36" y="46" width="8" height="36" fill="#FAF7F2" opacity="0.9" />
              <rect x="39.2" y="46" width="1.6" height="36" fill={primarySuit} />
              <rect x={torsoX + 2} y="54" width={torsoWidth - 4} height="3" fill="#FAF7F2" opacity="0.8" />
            </g>
          )}

          {/* INFANT ONESIE DETAILS */}
          {resolvedMode === 'infant' && (
            <g>
              <rect x="33" y="46" width="14" height="6" rx="2" fill="#FAF7F2" />
              <circle cx="40" cy="58" r="2" fill="#FAF7F2" />
              <circle cx="40" cy="66" r="2" fill="#FAF7F2" />
            </g>
          )}

          {/* MILITARY TACTICAL ARMOR VEST & POUCHES */}
          {resolvedMode === 'military' && (
            <g>
              {/* Camo patches */}
              <rect x={torsoX + 3} y="49" width="6" height="5" fill="#333914" />
              <rect x={torsoX + 18} y="68" width="7" height="6" fill="#333914" />
              {/* Plate Carrier Vest (Бронежилет) */}
              <rect x="28" y="49" width="24" height="27" rx="2" fill="#3A3D28" stroke="#26291A" strokeWidth="1" />
              <rect x="31" y="52" width="18" height="9" rx="1" fill="#2E3120" />
              {/* 3 Ammo Mag Pouches */}
              <rect x="30" y="63" width="5.5" height="10" rx="1" fill="#4A4E35" stroke="#26291A" strokeWidth="0.7" />
              <rect x="37.2" y="63" width="5.5" height="10" rx="1" fill="#4A4E35" stroke="#26291A" strokeWidth="0.7" />
              <rect x="44.5" y="63" width="5.5" height="10" rx="1" fill="#4A4E35" stroke="#26291A" strokeWidth="0.7" />
            </g>
          )}
        </g>

        {/* 5. ARMS & HANDS */}
        <g>
          {/* Left Arm */}
          <rect x={torsoX - 7} y="47" width="7" height="26" rx="2" fill={primarySuit} />
          <rect x={torsoX - 7} y="71" width="7" height="2" fill="#FAF7F2" />
          {/* Left Hand */}
          <rect x={torsoX - 7} y="73" width="7" height="7" rx="1.5" fill={skinBase} />
          <rect x={torsoX - 2.5} y="73" width="2.5" height="7" fill={skinShadow} />

          {/* Luxury Watch on Left Wrist */}
          {hasWatch && resolvedMode === 'adult' && (
            <g>
              <rect x={torsoX - 7.5} y="70.5" width="8" height="2.8" rx="0.8" fill="#5C4033" />
              <rect x={torsoX - 5} y="70" width="3.5" height="3.5" rx="0.8" fill="#EAB308" />
            </g>
          )}

          {/* Right Arm */}
          <rect x={torsoX + torsoWidth} y="47" width="7" height="26" rx="2" fill={suitShadow} />
          <rect x={torsoX + torsoWidth} y="71" width="7" height="2" fill="#E5DEC9" />
          {/* Right Hand */}
          <rect x={torsoX + torsoWidth} y="73" width="7" height="7" rx="1.5" fill={skinBase} />
          <rect x={torsoX + torsoWidth + 4} y="73" width="3" height="7" rx="1" fill={skinShadow} />
        </g>

        {/* 6. NECK & HEAD (Blocky 2.5D Proportions with Ears, Brows, Eyes, Nose, Facial Hair) */}
        <g>
          {/* Neck */}
          <rect x="35" y="40" width="10" height="7" fill={skinBase} />
          <rect x="41" y="40" width="4" height="7" fill={skinShadow} />

          {/* Ears */}
          <rect x="23" y="24" width="3" height="7" rx="1" fill={skinBase} />
          <rect x="54" y="24" width="3" height="7" rx="1" fill={skinShadow} />

          {/* Head Block */}
          <rect x="26" y="14" width="28" height="27" rx="2.5" fill={skinBase} />
          {/* 2.5D Right-side Face Shading */}
          <rect x="47" y="14" width="7" height="27" rx="1.5" fill={skinShadow} />

          {/* Eyebrows */}
          <rect x="30" y="22" width="6" height="2.2" rx="0.5" fill={hairShadow} />
          <rect x="44" y="22" width="6" height="2.2" rx="0.5" fill={hairShadow} />

          {/* Eyes */}
          <rect x="31.5" y="25.5" width="3.2" height="3.2" rx="0.5" fill="#1E1916" />
          <rect x="45.5" y="25.5" width="3.2" height="3.2" rx="0.5" fill="#1E1916" />
          {/* Eye shine */}
          <rect x="32" y="26" width="1" height="1" fill="#FFFFFF" />
          <rect x="46" y="26" width="1" height="1" fill="#FFFFFF" />

          {/* Blocky 2.5D Nose */}
          <rect x="38.5" y="26.5" width="3.5" height="5.5" rx="0.8" fill={skinShadow} />
          <rect x="40.5" y="26.5" width="1.5" height="5.5" fill={skinDeep} />

          {/* Glasses (If purchased/equipped) */}
          {showGlasses && resolvedMode !== 'military' && (
            <g>
              <rect
                x="29"
                y="24"
                width="8.5"
                height="6"
                rx="1"
                fill="rgba(59, 91, 118, 0.16)"
                stroke="#2C2523"
                strokeWidth="1.5"
              />
              <rect
                x="42.5"
                y="24"
                width="8.5"
                height="6"
                rx="1"
                fill="rgba(59, 91, 118, 0.16)"
                stroke="#2C2523"
                strokeWidth="1.5"
              />
              <line x1="37.5" y1="26.5" x2="42.5" y2="26.5" stroke="#2C2523" strokeWidth="1.5" />
            </g>
          )}

          {/* Mouth (Visible when no full beard covers it) */}
          {(!showFacialHair || facialHairId === 'stubble' || facialHairId === 'mustache') && (
            <rect x="36.5" y="35" width="7" height="2" rx="0.8" fill="#8C523A" />
          )}

          {/* 7. FACIAL HAIR VARIATIONS (7 Styles, 18+ Only) */}
          {showFacialHair && (
            <g>
              {facialHairId === 'stubble' && (
                <rect x="27" y="32" width="26" height="9" rx="1.5" fill={hairShadow} opacity="0.28" />
              )}
              {facialHairId === 'mustache' && (
                <rect x="33" y="32.5" width="14" height="3.2" rx="1" fill={hairBase} />
              )}
              {facialHairId === 'goatee' && (
                <g>
                  <rect x="34" y="32.5" width="12" height="2.8" rx="0.8" fill={hairBase} />
                  <rect x="35.5" y="37" width="9" height="4.5" rx="1" fill={hairBase} />
                </g>
              )}
              {facialHairId === 'beard' && (
                <g>
                  <rect x="26.5" y="31" width="27" height="10.5" rx="2" fill={hairBase} />
                  <rect x="47" y="31" width="6.5" height="10.5" rx="1.5" fill={hairShadow} />
                  <rect x="35" y="34" width="10" height="3" rx="0.8" fill={skinBase} />
                  <rect x="36.5" y="35" width="7" height="1.8" rx="0.5" fill="#8C523A" />
                </g>
              )}
              {facialHairId === 'full_beard' && (
                <g>
                  <rect x="26" y="30" width="28" height="14" rx="2.5" fill={hairBase} />
                  <rect x="47" y="30" width="7" height="14" rx="2" fill={hairShadow} />
                  <rect x="35.5" y="33.5" width="9" height="2.5" rx="0.8" fill={skinBase} />
                </g>
              )}
              {facialHairId === 'mutton_chops' && (
                <g>
                  <rect x="26" y="26" width="5" height="14" rx="1" fill={hairBase} />
                  <rect x="49" y="26" width="5" height="14" rx="1" fill={hairShadow} />
                  <rect x="32" y="32.5" width="16" height="3" rx="1" fill={hairBase} />
                </g>
              )}
            </g>
          )}

          {/* 8. HAIRSTYLE GENERATOR (10+ Distinct 2.5D Blocky Hairstyles or Military Helmet) */}
          {resolvedMode === 'military' ? (
            <g>
              {/* Tactical Combat Helmet */}
              <rect x="24" y="9" width="32" height="13" rx="4" fill="#4B5320" stroke="#2E3312" strokeWidth="1" />
              <rect x="47" y="9" width="9" height="13" rx="3" fill="#394016" />
              <rect x="25" y="18" width="30" height="3.5" fill="#2E3312" />
              <rect x="36" y="11" width="8" height="5" rx="1" fill="#26291A" />
            </g>
          ) : (
            <g>
              {/* Default / Short Crop */}
              {(hairStyle === 'short' || hairStyle === 'hood') && (
                <g>
                  <rect x="25" y="9" width="30" height="8" rx="2" fill={hairBase} />
                  <rect x="47" y="9" width="8" height="8" rx="1.5" fill={hairShadow} />
                  <rect x="25" y="14" width="3.5" height="10" fill={hairBase} />
                  <rect x="51.5" y="14" width="3.5" height="10" fill={hairShadow} />
                </g>
              )}

              {/* Side Part (Пробор набок) */}
              {(hairStyle === 'side_part' || hairStyle === 'bob') && (
                <g>
                  <rect x="25" y="8" width="30" height="9" rx="2" fill={hairBase} />
                  <rect x="28" y="8" width="10" height="3" fill={hairHighlight} />
                  <polygon points="26,16 44,16 38,20 26,19" fill={hairBase} />
                  <rect x="47" y="8" width="8" height="10" rx="1.5" fill={hairShadow} />
                  <rect x="25" y="14" width="3.5" height="11" fill={hairBase} />
                  <rect x="51.5" y="14" width="3.5" height="11" fill={hairShadow} />
                </g>
              )}

              {/* Slick Back (Зачес назад) */}
              {hairStyle === 'slick_back' && (
                <g>
                  <rect x="25" y="7" width="30" height="8.5" rx="2.5" fill={hairBase} />
                  <rect x="30" y="7" width="14" height="3" fill={hairHighlight} />
                  <rect x="47" y="7" width="8" height="8.5" rx="2" fill={hairShadow} />
                  <rect x="24.5" y="13" width="3" height="12" fill={hairBase} />
                  <rect x="52.5" y="13" width="3" height="12" fill={hairShadow} />
                </g>
              )}

              {/* Long Hair (Длинные волосы до плеч) */}
              {hairStyle === 'long' && (
                <g>
                  <rect x="23" y="8" width="34" height="9" rx="2.5" fill={hairBase} />
                  <rect x="22" y="14" width="5" height="29" rx="2" fill={hairBase} />
                  <rect x="53" y="14" width="5" height="29" rx="2" fill={hairShadow} />
                  <rect x="47" y="8" width="10" height="9" rx="2" fill={hairShadow} />
                </g>
              )}

              {/* Ponytail (Мужской хвост / пучок сзади, как на референсе #1) */}
              {hairStyle === 'ponytail' && (
                <g>
                  <rect x="20" y="30" width="7" height="10" rx="2" fill={hairShadow} />
                  <rect x="25" y="8" width="30" height="8.5" rx="2.5" fill={hairBase} />
                  <rect x="47" y="8" width="8" height="8.5" rx="2" fill={hairShadow} />
                  <rect x="24.5" y="14" width="3.5" height="12" fill={hairBase} />
                  <rect x="52" y="14" width="3.5" height="12" fill={hairShadow} />
                </g>
              )}

              {/* Curly (Объёмные кудри) */}
              {hairStyle === 'curly' && (
                <g>
                  <rect x="23" y="6" width="34" height="11" rx="4" fill={hairBase} />
                  <circle cx="28" cy="10" r="4" fill={hairHighlight} />
                  <circle cx="38" cy="8" r="4.5" fill={hairBase} />
                  <circle cx="49" cy="10" r="4.5" fill={hairShadow} />
                  <rect x="23.5" y="14" width="4" height="11" rx="2" fill={hairBase} />
                  <rect x="52.5" y="14" width="4" height="11" rx="2" fill={hairShadow} />
                </g>
              )}

              {/* Fade (Высокий фейд с текстурой) */}
              {hairStyle === 'fade' && (
                <g>
                  <rect x="26" y="7" width="28" height="7.5" rx="2" fill={hairBase} />
                  <rect x="46" y="7" width="8" height="7.5" rx="1.5" fill={hairShadow} />
                  <rect x="25.5" y="14" width="2.5" height="8" fill={hairShadow} opacity="0.45" />
                  <rect x="52" y="14" width="2.5" height="8" fill={hairShadow} opacity="0.45" />
                </g>
              )}

              {/* Spiky (Колючий ёжик) */}
              {hairStyle === 'spiky' && (
                <g>
                  <polygon points="26,15 29,6 34,13 39,5 44,13 49,6 54,15" fill={hairBase} />
                  <rect x="25" y="11" width="30" height="5.5" rx="1.5" fill={hairBase} />
                  <rect x="46" y="11" width="9" height="5.5" rx="1" fill={hairShadow} />
                </g>
              )}

              {/* Top Bun (Высокий пучок) */}
              {hairStyle === 'bun' && (
                <g>
                  <rect x="34" y="2" width="12" height="7" rx="3" fill={hairShadow} />
                  <rect x="25" y="8" width="30" height="8" rx="2" fill={hairBase} />
                  <rect x="47" y="8" width="8" height="8" rx="1.5" fill={hairShadow} />
                </g>
              )}

              {/* Balding (Залысины / Зрелый стиль) */}
              {hairStyle === 'balding' && (
                <g>
                  <rect x="24" y="13" width="4" height="11" rx="1" fill={hairBase} />
                  <rect x="52" y="13" width="4" height="11" rx="1" fill={hairShadow} />
                  <rect x="33" y="9" width="14" height="3" rx="1" fill={hairBase} opacity="0.6" />
                </g>
              )}
            </g>
          )}

          {/* Temporary Injury Bandage */}
          {hasInjury && (
            <g>
              <rect x="26" y="16" width="28" height="4.5" fill="#FAF7F2" stroke="#D6CBB9" strokeWidth="0.6" />
              <rect x="32" y="17" width="4" height="2.5" fill="#B84A39" opacity="0.8" />
            </g>
          )}
        </g>

        {/* 9. STRICT CONTEXTUAL & WARDROBE HAND ACCESSORIES */}
        {/* 9A. Childhood Toy (3–6 years) */}
        {resolvedHandItem === 'toy' && (
          <g>
            <rect x={torsoX + torsoWidth - 1} y="76" width="11" height="11" rx="2.5" fill="#C87A3E" stroke="#8C4F20" strokeWidth="1" />
            <circle cx={torsoX + torsoWidth + 2} cy="75" r="2.2" fill="#C87A3E" />
            <circle cx={torsoX + torsoWidth + 7} cy="75" r="2.2" fill="#C87A3E" />
            <circle cx={torsoX + torsoWidth + 4.5} cy="81" r="1.5" fill="#2C2523" />
          </g>
        )}

        {/* 9B. Military Assault Rifle (Военная служба / Фронт) */}
        {resolvedHandItem === 'rifle' && (
          <g transform="translate(18, 56) rotate(-14)">
            {/* Rifle stock */}
            <rect x="0" y="6" width="11" height="5" rx="1" fill="#231F1D" />
            {/* Receiver body */}
            <rect x="10" y="5" width="18" height="6" rx="1" fill="#1C1917" stroke="#3F3B37" strokeWidth="0.7" />
            {/* Curved Magazine */}
            <path d="M 18 11 L 23 11 L 25 22 L 19 22 Z" fill="#292524" stroke="#141210" strokeWidth="0.6" />
            {/* Handguard & Barrel */}
            <rect x="28" y="5.5" width="10" height="4" rx="0.8" fill="#3B332B" />
            <rect x="38" y="6.8" width="11" height="1.8" fill="#1C1917" />
            {/* Optic Sight */}
            <rect x="14" y="2" width="7" height="3" rx="0.6" fill="#292524" />
          </g>
        )}

        {/* 9C. Sport Gym Bag in Right Hand (Purchased in Store) */}
        {resolvedHandItem === 'sport_bag' && (
          <g>
            {/* Handle strap */}
            <path
              d={`M ${torsoX + torsoWidth + 1} 79 L ${torsoX + torsoWidth + 1} 84 L ${torsoX + torsoWidth + 7} 84 L ${torsoX + torsoWidth + 7} 79`}
              fill="none"
              stroke="#2C2523"
              strokeWidth="2"
            />
            {/* Duffel bag body */}
            <rect
              x={torsoX + torsoWidth - 5}
              y="83"
              width="20"
              height="13"
              rx="4"
              fill="#2E6F5E"
              stroke="#1E4B3F"
              strokeWidth="1"
            />
            <rect x={torsoX + torsoWidth + 9} y="83" width="6" height="13" rx="3" fill="#205043" />
            <rect x={torsoX + torsoWidth - 1} y="87" width="12" height="3" fill="#FAF7F2" opacity="0.85" />
          </g>
        )}

        {/* 9D. Single Leather Business Briefcase in Right Hand (Purchased in Store) */}
        {resolvedHandItem === 'briefcase' && (
          <g>
            {/* Handle */}
            <rect
              x={torsoX + torsoWidth - 1}
              y="78"
              width="8"
              height="5"
              rx="1.5"
              fill="none"
              stroke="#4A2E1B"
              strokeWidth="2"
            />
            {/* Briefcase body (matching the reference image) */}
            <rect
              x={torsoX + torsoWidth - 8}
              y="82"
              width="22"
              height="16"
              rx="2"
              fill="#5C3A24"
              stroke="#3B2314"
              strokeWidth="1"
            />
            {/* 2.5D shaded right panel */}
            <rect x={torsoX + torsoWidth + 8} y="82" width="6" height="16" rx="1.5" fill="#422817" />
            {/* Top flap line */}
            <rect x={torsoX + torsoWidth - 8} y="87" width="22" height="1.5" fill="#3B2314" />
            {/* Brass clasps */}
            <rect x={torsoX + torsoWidth - 3} y="86.5" width="2.5" height="3" rx="0.5" fill="#E09F5A" />
            <rect x={torsoX + torsoWidth + 5} y="86.5" width="2.5" height="3" rx="0.5" fill="#E09F5A" />
          </g>
        )}

        {/* 9E. Dual Luxury Leather Attaché Cases in Both Hands (Purchased in Store, matching reference!) */}
        {resolvedHandItem === 'dual_cases' && (
          <g>
            {/* LEFT HAND CASE (Warm Cognac Leather) */}
            <rect
              x={torsoX - 10}
              y="78"
              width="8"
              height="5"
              rx="1.5"
              fill="none"
              stroke="#6E3B1E"
              strokeWidth="2"
            />
            <rect
              x={torsoX - 18}
              y="82"
              width="23"
              height="17"
              rx="2"
              fill="#9C522B"
              stroke="#5C2D14"
              strokeWidth="1"
            />
            <rect x={torsoX - 1} y="82" width="6" height="17" rx="1.5" fill="#783D1E" />
            <rect x={torsoX - 18} y="87.5" width="23" height="1.5" fill="#5C2D14" />
            <rect x={torsoX - 13} y="87" width="2.5" height="3" rx="0.5" fill="#F2B866" />
            <rect x={torsoX - 4} y="87" width="2.5" height="3" rx="0.5" fill="#F2B866" />

            {/* RIGHT HAND CASE (Executive Dark Slate/Brown Leather) */}
            <rect
              x={torsoX + torsoWidth - 1}
              y="78"
              width="8"
              height="5"
              rx="1.5"
              fill="none"
              stroke="#2C2523"
              strokeWidth="2"
            />
            <rect
              x={torsoX + torsoWidth - 7}
              y="82"
              width="23"
              height="17"
              rx="2"
              fill="#374352"
              stroke="#1E2630"
              strokeWidth="1"
            />
            <rect x={torsoX + torsoWidth + 10} y="82" width="6" height="17" rx="1.5" fill="#252E3A" />
            <rect x={torsoX + torsoWidth - 7} y="87.5" width="23" height="1.5" fill="#1E2630" />
            <rect x={torsoX + torsoWidth - 2} y="87" width="2.5" height="3" rx="0.5" fill="#E09F5A" />
            <rect x={torsoX + torsoWidth + 7} y="87" width="2.5" height="3" rx="0.5" fill="#E09F5A" />
          </g>
        )}
      </g>
    </svg>
  );
};

export interface CharacterSceneStageProps extends FullBodyPixelHumanProps {
  locationId: BackgroundLocationId;
  season: Season;
  weather: WeatherType;
}

/**
 * Block 2 & Block 3: Seasonal Visual Engine + Dynamic Contextual Background Locations
 * Renders the seasonal gradient, weather/season animated SVG particles, and the
 * 6 detailed contextual SVG scenes behind the 2.5D character.
 */
export const CharacterSceneStage: React.FC<CharacterSceneStageProps> = ({
  locationId,
  season,
  weather,
  ...humanProps
}) => {
  // Seasonal sky gradient classes (Warm Cream / Cozy Paper palette)
  const seasonalBgClass =
    locationId === 'frontline_dugout'
      ? 'bg-[linear-gradient(180deg,#C9C2B6_0%,#E5DEC9_100%)]'
      : season === 'Зима'
      ? 'bg-[linear-gradient(180deg,#D8E2EB_0%,#F4EFE6_100%)]'
      : season === 'Весна'
      ? 'bg-[linear-gradient(180deg,#E2EFE0_0%,#F4EFE6_100%)]'
      : season === 'Лето'
      ? 'bg-[linear-gradient(180deg,#F9E8C9_0%,#F4EFE6_100%)]'
      : 'bg-[linear-gradient(180deg,#EBD8C3_0%,#EAE3D5_100%)]';

  const windowSkyFill =
    season === 'Зима'
      ? '#CFE0EC'
      : season === 'Весна'
      ? '#D9EED7'
      : season === 'Лето'
      ? '#FCE5B4'
      : '#E8CFB2';

  return (
    <div
      data-testid={`scene-stage-${locationId}`}
      data-season={season}
      className={`relative w-full h-[212px] rounded-xl border border-[#DCD3C2] overflow-hidden flex items-end justify-center pb-1.5 ${seasonalBgClass}`}
    >
      {/* CONTEXTUAL SVG SCENE BACKGROUND (240x160 viewBox) */}
      <svg
        viewBox="0 0 240 160"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* 1. PARENTS ROOM / CHILDHOOD BEDROOM (0-17 yrs) */}
        {locationId === 'parents_room' && (
          <g>
            {/* Warm cream wall & baseboard */}
            <rect x="0" y="0" width="240" height="122" fill="#F4EFE6" opacity="0.72" />
            <rect x="0" y="120" width="240" height="4" fill="#D5C7B2" />
            {/* Cozy wooden floor */}
            <rect x="0" y="124" width="240" height="36" fill="#E3D5C1" />
            <line x1="0" y1="136" x2="240" y2="136" stroke="#D2C2AA" strokeWidth="1" />

            {/* Window showing live season outside! */}
            <g transform="translate(18, 16)">
              <rect x="0" y="0" width="54" height="62" rx="3" fill={windowSkyFill} stroke="#8C6D53" strokeWidth="3" />
              {season === 'Зима' && (
                <g>
                  <path d="M 3 52 Q 20 44 51 52 L 51 60 L 3 60 Z" fill="#FFFFFF" />
                  <circle cx="14" cy="18" r="2" fill="#FFFFFF" />
                  <circle cx="36" cy="28" r="2.2" fill="#FFFFFF" />
                  <circle cx="24" cy="38" r="1.8" fill="#FFFFFF" />
                </g>
              )}
              {season === 'Весна' && (
                <g>
                  <circle cx="16" cy="48" r="14" fill="#7FB07C" />
                  <circle cx="38" cy="46" r="12" fill="#6E9E6B" />
                  <circle cx="14" cy="42" r="2" fill="#F4B6C2" />
                  <circle cx="35" cy="40" r="2" fill="#F4B6C2" />
                </g>
              )}
              {season === 'Лето' && (
                <g>
                  <circle cx="40" cy="16" r="8" fill="#F2B84B" />
                  <circle cx="18" cy="50" r="15" fill="#5B8E55" />
                  <circle cx="38" cy="52" r="13" fill="#4A7A45" />
                </g>
              )}
              {season === 'Осень' && (
                <g>
                  <circle cx="18" cy="48" r="14" fill="#D9823B" />
                  <circle cx="38" cy="50" r="12" fill="#B84A39" />
                  <line x1="12" y1="12" x2="8" y2="26" stroke="#8DA3B5" strokeWidth="1.2" />
                  <line x1="34" y1="14" x2="30" y2="28" stroke="#8DA3B5" strokeWidth="1.2" />
                </g>
              )}
              {/* Window panes cross */}
              <line x1="27" y1="0" x2="27" y2="62" stroke="#8C6D53" strokeWidth="2.5" />
              <line x1="0" y1="31" x2="54" y2="31" stroke="#8C6D53" strokeWidth="2.5" />
              <rect x="-3" y="61" width="60" height="4" rx="1" fill="#755941" />
            </g>

            {/* Wooden Wardrobe on the Right */}
            <g transform="translate(174, 24)">
              <rect x="0" y="0" width="50" height="98" rx="2" fill="#9E7656" stroke="#6E4F37" strokeWidth="1.5" />
              <line x1="25" y1="2" x2="25" y2="96" stroke="#6E4F37" strokeWidth="1.5" />
              <circle cx="21" cy="48" r="1.8" fill="#E5DEC9" />
              <circle cx="29" cy="48" r="1.8" fill="#E5DEC9" />
            </g>

            {/* Cozy Bed on the Left */}
            <g transform="translate(10, 92)">
              <rect x="0" y="6" width="66" height="26" rx="2" fill="#7A583E" />
              <rect x="4" y="0" width="18" height="9" rx="2" fill="#FAF7F2" stroke="#DCD3C2" strokeWidth="1" />
              <rect x="20" y="3" width="44" height="16" rx="2" fill="#3B5B76" />
              <rect x="20" y="3" width="12" height="16" fill="#547896" />
            </g>
          </g>
        )}

        {/* 2. STUDENT DORM / RENTED ROOM */}
        {locationId === 'student_dorm' && (
          <g>
            <rect x="0" y="0" width="240" height="122" fill="#EFE8DC" opacity="0.78" />
            <rect x="0" y="120" width="240" height="4" fill="#C9BCAA" />
            <rect x="0" y="124" width="240" height="36" fill="#DDD0BE" />

            {/* Bunk / Simple Metal-Frame Bed on Left */}
            <g transform="translate(10, 38)">
              <rect x="0" y="0" width="3" height="84" fill="#4A5568" />
              <rect x="58" y="0" width="3" height="84" fill="#4A5568" />
              {/* Top bunk */}
              <rect x="2" y="24" width="57" height="10" rx="1" fill="#C87A3E" />
              <rect x="5" y="19" width="14" height="6" rx="1.5" fill="#FAF7F2" />
              {/* Bottom bunk */}
              <rect x="2" y="64" width="57" height="11" rx="1" fill="#2E6F5E" />
              <rect x="5" y="59" width="14" height="6" rx="1.5" fill="#FAF7F2" />
              {/* Ladder */}
              <line x1="48" y1="24" x2="48" y2="82" stroke="#4A5568" strokeWidth="2" />
              <line x1="55" y1="24" x2="55" y2="82" stroke="#4A5568" strokeWidth="2" />
              <line x1="48" y1="40" x2="55" y2="40" stroke="#4A5568" strokeWidth="1.5" />
              <line x1="48" y1="54" x2="55" y2="54" stroke="#4A5568" strokeWidth="1.5" />
            </g>

            {/* Study Desk on Right with Pile of Notes, Laptop & Instant Noodle Box */}
            <g transform="translate(148, 72)">
              {/* Desk */}
              <rect x="0" y="22" width="80" height="5" rx="1" fill="#8C6446" />
              <rect x="6" y="27" width="5" height="25" fill="#6E4D34" />
              <rect x="68" y="27" width="5" height="25" fill="#6E4D34" />
              {/* Pile of Notes & Textbooks (Гора конспектов) */}
              <rect x="4" y="16" width="20" height="6" rx="1" fill="#3B5B76" />
              <rect x="6" y="11" width="18" height="5" rx="1" fill="#C87A3E" />
              <rect x="5" y="6" width="17" height="5" rx="1" fill="#FAF7F2" stroke="#DCD3C2" strokeWidth="0.8" />
              {/* Open Laptop */}
              <rect x="30" y="6" width="24" height="15" rx="1.5" fill="#2C2523" />
              <rect x="32" y="8" width="20" height="11" fill="#5CA4A9" />
              <rect x="28" y="20" width="28" height="2.5" rx="1" fill="#6E655F" />
              {/* Instant Noodle Cup/Box (Лапша быстрого приготовления) */}
              <polygon points="62,12 73,12 71,22 64,22" fill="#B84A39" />
              <rect x="62" y="14" width="11" height="2.5" fill="#F2B84B" />
              <path d="M 66 10 Q 67 6 69 10" fill="none" stroke="#9E9489" strokeWidth="1" />
            </g>
          </g>
        )}

        {/* 3. IT OFFICE / HOME BLOGGER STUDIO */}
        {locationId === 'it_blogger_studio' && (
          <g>
            <rect x="0" y="0" width="240" height="122" fill="#EDE5D8" opacity="0.82" />
            {/* Acoustic foam panels on wall */}
            <rect x="18" y="18" width="24" height="24" rx="2" fill="#D5C8B6" />
            <rect x="46" y="18" width="24" height="24" rx="2" fill="#C9BBA7" />
            <rect x="172" y="18" width="24" height="24" rx="2" fill="#D5C8B6" />
            <rect x="0" y="122" width="240" height="38" fill="#DCD0BE" />

            {/* Studio Softbox on Left Tripod (Софтбокс) */}
            <g transform="translate(12, 34)">
              <line x1="16" y1="30" x2="16" y2="88" stroke="#2C2523" strokeWidth="2.5" />
              <line x1="16" y1="74" x2="6" y2="88" stroke="#2C2523" strokeWidth="2" />
              <line x1="16" y1="74" x2="26" y2="88" stroke="#2C2523" strokeWidth="2" />
              <polygon points="2,6 30,12 28,34 4,38" fill="#2C2523" />
              <polygon points="5,9 28,14 26,32 7,35" fill="#FFFDF9" />
            </g>

            {/* Wide Desk with 3 Monitors (Code & Charts), PC Tower & Boom Arm Mic */}
            <g transform="translate(126, 56)">
              {/* Desk surface */}
              <rect x="-8" y="38" width="114" height="5" rx="1.5" fill="#4A3728" />
              <rect x="0" y="43" width="6" height="25" fill="#2C2523" />
              <rect x="92" y="43" width="6" height="25" fill="#2C2523" />

              {/* Monitor 1 (Left - Code) */}
              <rect x="0" y="14" width="26" height="18" rx="1.5" fill="#1E1B18" stroke="#3B5B76" strokeWidth="1" />
              <rect x="3" y="17" width="14" height="2" fill="#2E6F5E" />
              <rect x="3" y="21" width="19" height="2" fill="#C87A3E" />
              <rect x="3" y="25" width="11" height="2" fill="#7FA6C4" />
              <rect x="11" y="32" width="4" height="6" fill="#2C2523" />

              {/* Monitor 2 (Center Main - Analytics Charts) */}
              <rect x="29" y="11" width="32" height="21" rx="1.5" fill="#1E1B18" stroke="#2E6F5E" strokeWidth="1.2" />
              <polyline points="32,27 39,22 46,24 55,15" fill="none" stroke="#2E6F5E" strokeWidth="2" />
              <rect x="43" y="32" width="4" height="6" fill="#2C2523" />

              {/* Monitor 3 (Right Vertical) */}
              <rect x="64" y="10" width="15" height="22" rx="1.5" fill="#1E1B18" />
              <rect x="66" y="13" width="11" height="3" fill="#B84A39" />
              <rect x="66" y="18" width="9" height="2" fill="#FAF7F2" opacity="0.7" />
              <rect x="70" y="32" width="3" height="6" fill="#2C2523" />

              {/* Custom PC Tower (Системный блок) */}
              <rect x="83" y="10" width="19" height="28" rx="2" fill="#2C2523" stroke="#6E655F" strokeWidth="1" />
              <rect x="86" y="13" width="13" height="18" rx="1" fill="#3B5B76" opacity="0.45" />
              <circle cx="92.5" cy="19" r="3.5" fill="none" stroke="#C87A3E" strokeWidth="1.5" />
              <circle cx="92.5" cy="27" r="3.5" fill="none" stroke="#2E6F5E" strokeWidth="1.5" />

              {/* Boom Arm Microphone (Микрофон на пантографе) */}
              <polyline points="-4,38 -10,20 4,14" fill="none" stroke="#2C2523" strokeWidth="2" />
              <rect x="2" y="11" width="5" height="9" rx="2.5" fill="#B84A39" stroke="#2C2523" strokeWidth="1" />
            </g>
          </g>
        )}

        {/* 4. BUSINESS CENTER / CEO OFFICE */}
        {locationId === 'ceo_office' && (
          <g>
            {/* Panoramic Window with Megapolis Skyline */}
            <rect x="8" y="8" width="224" height="108" rx="3" fill={windowSkyFill} stroke="#6E655F" strokeWidth="2" />
            {/* City skyscrapers */}
            <rect x="20" y="42" width="22" height="74" fill="#8C9BA5" opacity="0.65" />
            <rect x="46" y="28" width="28" height="88" fill="#738491" opacity="0.7" />
            <rect x="80" y="50" width="24" height="66" fill="#95A3AD" opacity="0.6" />
            <rect x="148" y="34" width="30" height="82" fill="#738491" opacity="0.7" />
            <rect x="184" y="22" width="34" height="94" fill="#627380" opacity="0.75" />
            {/* Panoramic mullions */}
            <line x1="76" y1="8" x2="76" y2="116" stroke="#6E655F" strokeWidth="2" />
            <line x1="164" y1="8" x2="164" y2="116" stroke="#6E655F" strokeWidth="2" />

            {/* Polished executive floor */}
            <rect x="0" y="116" width="240" height="44" fill="#DFD5C5" />

            {/* Growth Chart Board on Left (Графики роста) */}
            <g transform="translate(14, 24)">
              <rect x="0" y="0" width="52" height="36" rx="2" fill="#FAF7F2" stroke="#2C2523" strokeWidth="1.5" />
              <rect x="6" y="22" width="6" height="9" fill="#C87A3E" />
              <rect x="16" y="17" width="6" height="14" fill="#C87A3E" />
              <rect x="26" y="12" width="6" height="19" fill="#2E6F5E" />
              <rect x="36" y="6" width="6" height="25" fill="#2E6F5E" />
              <polyline points="8,20 19,15 29,10 39,5" fill="none" stroke="#B84A39" strokeWidth="1.8" />
            </g>

            {/* Executive Leather Chair & Minimalist CEO Desk on Right */}
            <g transform="translate(146, 66)">
              {/* Leather chair backrest */}
              <rect x="24" y="0" width="26" height="34" rx="5" fill="#6E3B1E" stroke="#3B2314" strokeWidth="1.5" />
              {/* Minimalist CEO Desk */}
              <rect x="0" y="26" width="78" height="6" rx="1.5" fill="#3B281B" />
              <rect x="6" y="32" width="8" height="24" fill="#2C2523" />
              <rect x="64" y="32" width="8" height="24" fill="#2C2523" />
              <rect x="12" y="28" width="54" height="12" fill="#5C3A24" opacity="0.85" />
            </g>
          </g>
        )}

        {/* 5. MILITARY BASE / BARRACKS (Срочная служба / Учебка) */}
        {locationId === 'military_base' && (
          <g>
            {/* Sky & Parade Ground (Плац) */}
            <rect x="0" y="0" width="240" height="98" fill={windowSkyFill} opacity="0.7" />
            <rect x="0" y="98" width="240" height="62" fill="#C2B8A3" />
            <line x1="0" y1="115" x2="240" y2="115" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="8 6" />

            {/* Perimeter Fence & Watchtower (Забор с вышкой) */}
            <rect x="0" y="78" width="240" height="20" fill="#8E8676" stroke="#5E584C" strokeWidth="1" />
            <line x1="0" y1="74" x2="240" y2="74" stroke="#4A453C" strokeWidth="1" strokeDasharray="3 3" />
            <g transform="translate(196, 26)">
              <line x1="6" y1="22" x2="2" y2="54" stroke="#4A3B2C" strokeWidth="2.5" />
              <line x1="22" y1="22" x2="26" y2="54" stroke="#4A3B2C" strokeWidth="2.5" />
              <rect x="2" y="8" width="24" height="15" fill="#5E5343" stroke="#2C2523" strokeWidth="1.2" />
              <polygon points="0,8 14,0 28,8" fill="#3A4018" />
            </g>

            {/* Olive Army Tent on Left (Армейская палатка) */}
            <g transform="translate(8, 62)">
              <polygon points="0,38 32,8 64,38" fill="#55612B" stroke="#333B18" strokeWidth="1.5" />
              <polygon points="24,38 32,20 40,38" fill="#2E3515" />
            </g>

            {/* Military Truck on Right (Военный грузовик) */}
            <g transform="translate(148, 66)">
              <rect x="0" y="4" width="44" height="24" rx="2" fill="#4B5320" stroke="#2A2E12" strokeWidth="1.2" />
              <rect x="44" y="11" width="18" height="17" rx="1.5" fill="#3D441A" stroke="#2A2E12" strokeWidth="1.2" />
              <rect x="48" y="13" width="10" height="7" fill="#9BB0C1" />
              <circle cx="12" cy="30" r="6" fill="#231F1D" />
              <circle cx="32" cy="30" r="6" fill="#231F1D" />
              <circle cx="53" cy="30" r="6" fill="#231F1D" />
            </g>
          </g>
        )}

        {/* 6. FRONTLINE DUGOUT / TRENCH (Передовая / Блиндаж) */}
        {locationId === 'frontline_dugout' && (
          <g>
            {/* Smoky Horizon Sky */}
            <rect x="0" y="0" width="240" height="72" fill="#B8B0A4" />
            <circle cx="42" cy="36" r="22" fill="#8C8479" opacity="0.45" />
            <circle cx="185" cy="28" r="26" fill="#7D756B" opacity="0.45" />
            {/* Distant glow on horizon */}
            <ellipse cx="180" cy="54" rx="28" ry="8" fill="#C87A3E" opacity="0.35" />

            {/* Trench Earth Wall & Timber Logs (Брёвна блиндажа в накат) */}
            <rect x="0" y="54" width="240" height="106" fill="#6E553E" />
            {/* Overhead timber logs */}
            <rect x="0" y="6" width="240" height="9" fill="#59412C" stroke="#3B2A1B" strokeWidth="1" />
            <rect x="0" y="15" width="240" height="8" fill="#4D3725" stroke="#3B2A1B" strokeWidth="1" />
            {/* Vertical support logs */}
            <rect x="8" y="22" width="10" height="98" fill="#59412C" />
            <rect x="222" y="22" width="10" height="98" fill="#59412C" />

            {/* Camouflage Netting (Маскировочная сеть) */}
            <path
              d="M 18 23 Q 60 36 120 24 Q 180 36 222 23"
              fill="none"
              stroke="#4B5320"
              strokeWidth="5"
              strokeDasharray="10 4"
            />

            {/* Trench Duckboards Floor */}
            <rect x="0" y="118" width="240" height="42" fill="#543F2D" />

            {/* Sandbag Parapet on Left (Мешки с песком) */}
            <g transform="translate(14, 76)">
              <rect x="0" y="24" width="26" height="11" rx="5" fill="#B5A68E" stroke="#7A6E5B" strokeWidth="1" />
              <rect x="24" y="24" width="26" height="11" rx="5" fill="#A89982" stroke="#7A6E5B" strokeWidth="1" />
              <rect x="8" y="14" width="26" height="11" rx="5" fill="#BFB199" stroke="#7A6E5B" strokeWidth="1" />
              <rect x="32" y="14" width="24" height="11" rx="5" fill="#B5A68E" stroke="#7A6E5B" strokeWidth="1" />
              <rect x="16" y="4" width="26" height="11" rx="5" fill="#C7B9A1" stroke="#7A6E5B" strokeWidth="1" />
            </g>

            {/* Olive Ammo Crates "БК" & Field Radio on Right (Ящики БК и рация) */}
            <g transform="translate(152, 78)">
              {/* Crate 1 */}
              <rect x="0" y="20" width="64" height="20" rx="1.5" fill="#4B5320" stroke="#26291A" strokeWidth="1.5" />
              <text x="22" y="34" fill="#E5DEC9" fontSize="9" fontFamily="monospace" fontWeight="bold">
                БК-7.62
              </text>
              {/* Crate 2 */}
              <rect x="6" y="4" width="48" height="16" rx="1.5" fill="#3D441A" stroke="#26291A" strokeWidth="1.2" />
              {/* Tactical Field Radio with Antenna */}
              <rect x="52" y="-4" width="14" height="24" rx="1.5" fill="#26291A" stroke="#6E655F" strokeWidth="1" />
              <circle cx="59" cy="6" r="2.2" fill="#2E6F5E" />
              <line x1="62" y1="-4" x2="66" y2="-32" stroke="#1E1B18" strokeWidth="1.8" />
            </g>
          </g>
        )}

        {/* BLOCK 2: SEASONAL WEATHER OVERLAY PARTICLES */}
        {season === 'Зима' && (
          <g>
            {/* Frost corner accents */}
            <path d="M 0 0 L 28 0 L 0 28 Z" fill="#FFFFFF" opacity="0.45" />
            <path d="M 240 0 L 212 0 L 240 28 Z" fill="#FFFFFF" opacity="0.45" />
            {/* Falling snowflakes */}
            {[24, 58, 96, 142, 184, 216].map((cx, i) => (
              <circle
                key={i}
                cx={cx}
                cy={18 + (i * 23) % 90}
                r={i % 2 === 0 ? 2.4 : 1.8}
                fill="#FFFFFF"
                opacity="0.85"
                className="animate-pulse"
              />
            ))}
          </g>
        )}

        {season === 'Весна' && (
          <g>
            {/* Floating spring blossom petals */}
            {[28, 74, 156, 204].map((cx, i) => (
              <ellipse
                key={i}
                cx={cx}
                cy={22 + i * 24}
                rx="3.2"
                ry="1.8"
                transform={`rotate(${25 + i * 20} ${cx} ${22 + i * 24})`}
                fill="#E899A8"
                opacity="0.75"
              />
            ))}
          </g>
        )}

        {season === 'Лето' && locationId !== 'frontline_dugout' && (
          <g>
            {/* Warm golden sun rays */}
            <polygon points="0,0 55,0 120,160 40,160" fill="#FCE5B4" opacity="0.18" />
            <polygon points="90,0 135,0 195,160 140,160" fill="#FCE5B4" opacity="0.14" />
          </g>
        )}

        {season === 'Осень' && (
          <g>
            {/* Swirling autumn leaves & slanted rain */}
            {[32, 82, 148, 198].map((cx, i) => (
              <ellipse
                key={i}
                cx={cx}
                cy={24 + i * 22}
                rx="3.6"
                ry="2"
                transform={`rotate(${-30 + i * 25} ${cx} ${24 + i * 22})`}
                fill={i % 2 === 0 ? '#C87A3E' : '#B84A39'}
                opacity="0.8"
              />
            ))}
            {(weather === 'Ливень' || weather === 'Туман') && (
              <g stroke="#7A8E9E" strokeWidth="1" opacity="0.45">
                <line x1="40" y1="10" x2="28" y2="38" />
                <line x1="110" y1="18" x2="98" y2="46" />
                <line x1="190" y1="12" x2="178" y2="40" />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* FOREGROUND 2.5D CHARACTER */}
      <div className="relative z-10 flex items-center justify-center">
        <FullBodyPixelHuman {...humanProps} />
      </div>
    </div>
  );
};

