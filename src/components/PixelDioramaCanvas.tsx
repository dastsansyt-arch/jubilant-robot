import React, { useEffect, useRef } from 'react';
import {
  CharacterAppearance,
  Season,
  WeatherType,
  PetItem,
  HouseItem,
  BrandItem,
  VehicleItem,
  OutfitStyle,
  FacialHairId,
} from '../game/types';

interface PixelDioramaProps {
  appearance: CharacterAppearance;
  season: Season;
  weather: WeatherType;
  pet: PetItem | null;
  house: HouseItem;
  equippedBrands: BrandItem[];
  age: number;
  strength?: number;
  muscleMass?: number;
  vehicle?: VehicleItem | null;
  hasNeonTuning?: boolean;
  hasSpoilerTuning?: boolean;
  hasSmartHomeTuning?: boolean;
  cityName: string;
  countryName: string;
  regionGroup?: string;
  urbexFlashTrigger?: number;
  isTitleMode?: boolean;
  hasInjury?: boolean;
  outfitStyle?: OutfitStyle;
  hairstyleId?: string;
  facialHairId?: FacialHairId;
  hasMask?: boolean;
  hasCareer?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

const MAX_PARTICLES = 95;

export const PixelDioramaCanvas: React.FC<PixelDioramaProps> = ({
  appearance,
  season,
  weather,
  pet,
  house,
  equippedBrands,
  age,
  strength = 24,
  muscleMass = 20,
  vehicle = null,
  hasNeonTuning = false,
  hasSpoilerTuning = false,
  hasSmartHomeTuning = false,
  cityName,
  countryName,
  regionGroup = '',
  urbexFlashTrigger = 0,
  isTitleMode = false,
  hasInjury = false,
  outfitStyle = 'casual',
  hairstyleId,
  facialHairId = 'none',
  hasMask = false,
  hasCareer = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({
    appearance,
    season,
    weather,
    pet,
    house,
    equippedBrands,
    age,
    strength,
    muscleMass,
    vehicle,
    hasNeonTuning,
    hasSpoilerTuning,
    hasSmartHomeTuning,
    cityName,
    countryName,
    regionGroup,
    urbexFlashTrigger,
    isTitleMode,
    hasInjury,
    outfitStyle,
    hairstyleId,
    facialHairId,
    hasMask,
    hasCareer,
  });

  useEffect(() => {
    propsRef.current = {
      appearance,
      season,
      weather,
      pet,
      house,
      equippedBrands,
      age,
      strength,
      muscleMass,
      vehicle,
      hasNeonTuning,
      hasSpoilerTuning,
      hasSmartHomeTuning,
      cityName,
      countryName,
      regionGroup,
      urbexFlashTrigger,
      isTitleMode,
      hasInjury,
      outfitStyle,
      hairstyleId,
      facialHairId,
      hasMask,
      hasCareer,
    };
  }, [
    appearance,
    season,
    weather,
    pet,
    house,
    equippedBrands,
    age,
    strength,
    muscleMass,
    vehicle,
    hasNeonTuning,
    hasSpoilerTuning,
    hasSmartHomeTuning,
    cityName,
    countryName,
    regionGroup,
    urbexFlashTrigger,
    isTitleMode,
    hasInjury,
    outfitStyle,
    hairstyleId,
    facialHairId,
    hasMask,
    hasCareer,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Higher-resolution Hi-Bit Pixel Art canvas (520x208) for detailed skins, muscles & vehicles
    const W = 520;
    const H = 208;
    canvas.width = W;
    canvas.height = H;

    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: -0.5,
      vy: 2.5 + Math.random() * 1.8,
      size: 1.5,
      alpha: 0.45 + Math.random() * 0.5,
    }));

    let animId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let shakeTrauma = 0;
    let lastFlashSeen = propsRef.current.urbexFlashTrigger;

    // Detailed Hi-Bit Pixel Character Renderer with Dynamic Muscle & Age Morphology
    const drawHiBitCharacter = (
      g: CanvasRenderingContext2D,
      cx: number,
      bottomY: number,
      scale: number,
      skin: string,
      hair: string,
      shirt: string,
      pants: string,
      shoes: string,
      hairStyle: CharacterAppearance['hairStyle'],
      hasGlasses: boolean,
      hasCamera: boolean,
      hasBrandBadge: boolean,
      muscleLevel: number, // 0 to 100
      charAge: number,
      bobOffset: number,
      injury: boolean = false,
      hasBriefcase: boolean = false,
      outfit: OutfitStyle = 'casual',
      facialHair: FacialHairId = 'none',
      mask: boolean = false
    ) => {
      const p = scale;
      // Muscle tier expands torso and biceps width!
      const extraTorsoW = muscleLevel >= 75 ? 4 : muscleLevel >= 45 ? 2 : 0;
      const armThickness = muscleLevel >= 65 ? 2.2 : muscleLevel >= 35 ? 1.6 : 1.2;
      const heightBlocks = charAge < 4 ? 14 : charAge < 13 ? 17 : charAge < 17 ? 20 : 22;

      const y0 = Math.round(bottomY - heightBlocks * p + bobOffset);
      const baseTorsoW = 8 + extraTorsoW;
      const x0 = Math.round(cx - (baseTorsoW * p) / 2);

      // Ground ambient occlusion shadow
      g.fillStyle = 'rgba(0, 0, 0, 0.48)';
      g.fillRect(cx - (baseTorsoW / 2 + 2) * p, bottomY - p, (baseTorsoW + 4) * p, 2.5 * p);

      // Head coordinates (always centered)
      const headW = 8 * p;
      const headH = 7 * p;
      const headX = Math.round(cx - 4 * p);
      const headY = y0;

      // Dark outer silhouette for head & body
      g.fillStyle = '#070a0e';
      g.fillRect(headX - p, headY - p, headW + 2 * p, headH + 2 * p);
      g.fillRect(
        x0 - (armThickness + 1) * p,
        headY + headH,
        (baseTorsoW + armThickness * 2 + 2) * p,
        (heightBlocks - 7) * p
      );

      // Skin head with shading
      g.fillStyle = skin;
      g.fillRect(headX, headY + p, headW, headH - p);

      // 3D Split vertical shading on head (light left, shadow right)
      g.fillStyle = 'rgba(255, 255, 255, 0.16)';
      g.fillRect(headX, headY + p, headW / 2, headH - p);
      g.fillStyle = 'rgba(0, 0, 0, 0.18)';
      g.fillRect(headX + headW / 2, headY + p, headW / 2, headH - p);

      // Chin/jaw shadow
      g.fillStyle = 'rgba(0,0,0,0.2)';
      g.fillRect(headX, headY + headH - p, headW, p);

      // Hair (with silver highlights if senior age >= 60)
      g.fillStyle = charAge >= 62 ? '#cbd5e1' : hair;
      g.fillRect(headX - 0.5 * p, headY - 0.5 * p, headW + p, 2.5 * p);
      g.fillRect(headX - 0.5 * p, headY + p, 1.5 * p, 3 * p);
      g.fillRect(headX + headW - p, headY + p, 1.5 * p, 3 * p);

      if (hairStyle === 'spiky' || hairStyle === 'bun') {
        g.fillRect(headX + 2 * p, headY - 1.5 * p, 4 * p, p);
      } else if (hairStyle === 'long' || hairStyle === 'curly') {
        g.fillRect(headX - p, headY + 2 * p, 1.5 * p, 5 * p);
        g.fillRect(headX + headW - 0.5 * p, headY + 2 * p, 1.5 * p, 5 * p);
      }

      // Eyes with white sclera + pupil
      g.fillStyle = '#f8fafc';
      g.fillRect(headX + 1.5 * p, headY + 3.5 * p, 2 * p, 1.5 * p);
      g.fillRect(headX + 4.5 * p, headY + 3.5 * p, 2 * p, 1.5 * p);
      g.fillStyle = '#0f172a';
      g.fillRect(headX + 2.2 * p, headY + 3.5 * p, 1.2 * p, 1.5 * p);
      g.fillRect(headX + 5.2 * p, headY + 3.5 * p, 1.2 * p, 1.5 * p);

      // Glasses
      if (hasGlasses) {
        g.fillStyle = '#fbbf24';
        g.fillRect(headX + p, headY + 3 * p, 6 * p, 0.7 * p);
      }

      // Facial Hair (Mustache or Beard)
      if (facialHair === 'mustache' || facialHair === 'full_beard' || facialHair === 'goatee') {
        g.fillStyle = charAge >= 62 ? '#cbd5e1' : hair;
        g.fillRect(headX + 2.5 * p, headY + 5 * p, 3 * p, 0.8 * p);
      }
      if (facialHair === 'beard' || facialHair === 'full_beard') {
        g.fillStyle = charAge >= 62 ? '#cbd5e1' : hair;
        g.fillRect(headX + 1.5 * p, headY + 5.5 * p, 5 * p, 1.2 * p);
      }
      if (facialHair === 'stubble') {
        g.fillStyle = 'rgba(0, 0, 0, 0.28)';
        g.fillRect(headX + 2 * p, headY + 5.2 * p, 4 * p, 1 * p);
      }

      // Criminal / Tactical Mask
      if (mask) {
        g.fillStyle = '#0f172a';
        g.fillRect(headX, headY + 4 * p, headW, headH - 4 * p);
      }

      // Injury Bandage
      if (injury) {
        g.fillStyle = '#f8fafc';
        g.fillRect(headX, headY + 2 * p, headW, 1.2 * p);
        g.fillStyle = '#ef4444';
        g.fillRect(headX + 4.5 * p, headY + 2 * p, 1.2 * p, 1.2 * p);
      }

      // Torso / Shirt / Jacket
      const torsoY = headY + headH + 0.5 * p;
      const torsoH = (heightBlocks - 13) * p;
      g.fillStyle = shirt;
      g.fillRect(x0, torsoY, baseTorsoW * p, torsoH);

      // 3D Split Shading on Torso (Left highlight, right shadow)
      g.fillStyle = 'rgba(255, 255, 255, 0.12)';
      g.fillRect(x0, torsoY, (baseTorsoW / 2) * p, torsoH);
      g.fillStyle = 'rgba(0, 0, 0, 0.18)';
      g.fillRect(cx, torsoY, (baseTorsoW / 2) * p, torsoH);

      // Collar and Necktie for Business / Formal / Career
      if (outfit === 'business' || hasBriefcase) {
        // White shirt triangular collar
        g.fillStyle = '#f8fafc';
        g.fillRect(cx - 1.5 * p, torsoY, 3 * p, 2.5 * p);
        // Red / Dark necktie
        g.fillStyle = '#dc2626';
        g.fillRect(cx - 0.5 * p, torsoY + p, p, 3.5 * p);
        // Suit lapels
        g.fillStyle = shirt;
        g.fillRect(cx - 2.5 * p, torsoY, p, 3.5 * p);
        g.fillRect(cx + 1.5 * p, torsoY, p, 3.5 * p);
      }

      // Chest / Pectoral & Abs shading when muscular!
      if (muscleLevel >= 40) {
        g.fillStyle = 'rgba(255,255,255,0.16)';
        g.fillRect(x0 + p, torsoY + p, (baseTorsoW / 2 - 1.5) * p, 2.5 * p);
        g.fillRect(cx + 0.5 * p, torsoY + p, (baseTorsoW / 2 - 1.5) * p, 2.5 * p);
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.fillRect(cx - 0.4 * p, torsoY + p, 0.8 * p, torsoH - p);
      }

      // Muscular Arms / Biceps
      g.fillStyle = muscleLevel >= 55 ? skin : shirt;
      g.fillRect(x0 - armThickness * p, torsoY + 0.5 * p, armThickness * p, torsoH - p);
      g.fillRect(x0 + baseTorsoW * p, torsoY + 0.5 * p, armThickness * p, torsoH - p);
      // Hands
      g.fillStyle = skin;
      g.fillRect(x0 - armThickness * p, torsoY + torsoH - 1.5 * p, armThickness * p, 1.5 * p);
      g.fillRect(x0 + baseTorsoW * p, torsoY + torsoH - 1.5 * p, armThickness * p, 1.5 * p);

      // Business Briefcase / Diplomat (held in right hand)
      if (hasBriefcase) {
        const bx = x0 + baseTorsoW * p + armThickness * p - 0.5 * p;
        const by = torsoY + torsoH - p;
        g.fillStyle = '#451a03';
        g.fillRect(bx, by, 4.5 * p, 3.5 * p);
        g.fillStyle = '#facc15';
        g.fillRect(bx + 1.8 * p, by + 1.2 * p, p, 0.8 * p);
        g.fillStyle = '#1c1917';
        g.fillRect(bx + 1.2 * p, by - 0.8 * p, 2.2 * p, 0.8 * p);
      }

      // Brand Badge on Sleeve
      if (hasBrandBadge) {
        g.fillStyle = '#facc15';
        g.fillRect(x0 - armThickness * p, torsoY + 1.5 * p, 1.2 * p, 1.2 * p);
      }

      // Camera Gear
      if (hasCamera) {
        g.fillStyle = '#1e293b';
        g.fillRect(cx + p, torsoY + 2 * p, 3.5 * p, 2.5 * p);
        g.fillStyle = '#ef4444';
        g.fillRect(cx + 3.2 * p, torsoY + 2.2 * p, p, p);
      }

      // Legs / Pants
      const legsY = torsoY + torsoH;
      const legsH = 5 * p;
      const legW = Math.max(2.5, baseTorsoW * 0.36) * p;
      g.fillStyle = pants;
      g.fillRect(x0 + 0.5 * p, legsY, legW, legsH);
      g.fillRect(x0 + baseTorsoW * p - legW - 0.5 * p, legsY, legW, legsH);

      // Shading on legs
      g.fillStyle = 'rgba(255, 255, 255, 0.1)';
      g.fillRect(x0 + 0.5 * p, legsY, legW / 2, legsH);
      g.fillStyle = 'rgba(0, 0, 0, 0.15)';
      g.fillRect(x0 + baseTorsoW * p - legW / 2 - 0.5 * p, legsY, legW / 2, legsH);

      // Sneakers / Footwear
      g.fillStyle = shoes;
      g.fillRect(x0 + 0.2 * p, legsY + legsH - p, legW + 0.5 * p, 1.2 * p);
      g.fillRect(x0 + baseTorsoW * p - legW - 0.3 * p, legsY + legsH - p, legW + 0.5 * p, 1.2 * p);
    };

    // Detailed Hi-Bit Vehicle (Bicycle / Motorcycle / Car / SUV / Hypercar / Yacht / Helicopter / Jet) with Tuning Effects
    const drawParkedVehicle = (
      g: CanvasRenderingContext2D,
      vx: number,
      groundY: number,
      veh: VehicleItem,
      neon: boolean,
      spoiler: boolean
    ) => {
      if (veh.type === 'bicycle' || veh.type === 'motorcycle') {
        const y = groundY - 22;
        if (neon) {
          g.fillStyle = 'rgba(168, 85, 247, 0.45)';
          g.fillRect(vx - 2, groundY - 2, 46, 4);
        }
        // Wheels
        g.fillStyle = '#090d12';
        g.fillRect(vx + 2, groundY - 11, 11, 11);
        g.fillRect(vx + 29, groundY - 11, 11, 11);
        g.fillStyle = '#94a3b8';
        g.fillRect(vx + 5, groundY - 8, 5, 5);
        g.fillRect(vx + 32, groundY - 8, 5, 5);
        // Bike Frame
        g.fillStyle = veh.bodyColor;
        if (veh.type === 'bicycle') {
          g.fillRect(vx + 8, y + 8, 24, 3);
          g.fillRect(vx + 10, y + 5, 4, 3);
          g.fillRect(vx + 28, y + 3, 4, 6);
        } else {
          g.fillRect(vx + 10, y + 6, 22, 8);
          g.fillRect(vx + 24, y + 2, 10, 6);
        }
        // Headlight
        g.fillStyle = '#fef08a';
        g.fillRect(vx + 34, y + 4, 4, 3);
        return;
      }

      if (veh.type === 'helicopter' || veh.type === 'jet') {
        // Hovering / VIP Helipad or Jet Silhouette
        const hy = groundY - 36;
        g.fillStyle = 'rgba(56, 189, 248, 0.25)';
        g.fillRect(vx - 4, groundY - 3, 92, 4);
        // Rotor or Wings
        g.fillStyle = '#94a3b8';
        g.fillRect(vx - 8, hy - 6, 98, 2);
        g.fillRect(vx + 38, hy - 6, 4, 6);
        // Cabin & Tail
        g.fillStyle = veh.bodyColor;
        g.fillRect(vx + 14, hy, 54, 18);
        g.fillRect(vx - 6, hy + 5, 22, 6);
        g.fillStyle = '#38bdf8';
        g.fillRect(vx + 42, hy + 3, 22, 9);
        g.fillStyle = veh.accentColor;
        g.fillRect(vx + 12, hy + 13, 56, 3);
        // Skids / Landing Gear
        g.fillStyle = '#cbd5e1';
        g.fillRect(vx + 18, groundY - 6, 46, 3);
        return;
      }

      if (veh.type === 'yacht') {
        const yy = groundY - 30;
        // Water reflection glow
        g.fillStyle = 'rgba(14, 165, 233, 0.35)';
        g.fillRect(vx - 6, groundY - 4, 96, 6);
        // Hull
        g.fillStyle = veh.bodyColor;
        g.fillRect(vx, yy + 12, 84, 14);
        g.fillRect(vx + 14, yy + 2, 50, 10);
        // Accent Deck & Windows
        g.fillStyle = veh.accentColor;
        g.fillRect(vx + 4, yy + 12, 76, 3);
        g.fillStyle = '#0f172a';
        g.fillRect(vx + 20, yy + 5, 36, 5);
        return;
      }

      // Sportscar / SUV / Hypercar
      const isSuv = veh.type === 'suv';
      const isHyper = veh.type === 'hypercar';
      const carW = isSuv ? 82 : isHyper ? 84 : 78;
      const carH = isSuv ? 30 : isHyper ? 23 : 26;
      const cy = groundY - carH;

      // Neon Underglow from Tuning
      if (neon) {
        const neonGrad = g.createRadialGradient(vx + carW / 2, groundY, 2, vx + carW / 2, groundY, 44);
        neonGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        neonGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        g.fillStyle = neonGrad;
        g.fillRect(vx - 8, groundY - 6, carW + 16, 12);
      } else {
        g.fillStyle = 'rgba(0,0,0,0.5)';
        g.fillRect(vx + 2, groundY - 2, carW - 4, 4);
      }

      // Carbon Rear Wing Spoiler from Tuning or Hypercar
      if (spoiler || isHyper) {
        g.fillStyle = '#0f172a';
        g.fillRect(vx + 2, cy + 2, 8, 6);
        g.fillRect(vx - 2, cy, 12, 3);
      }

      // Car Silhouette & Cabin
      g.fillStyle = '#070a0f';
      g.fillRect(vx - 2, cy + 7, carW + 4, isSuv ? 18 : 15);
      g.fillRect(vx + (isSuv ? 8 : 14), cy - 1, isSuv ? 54 : 44, isSuv ? 12 : 10);

      // Main Body Paint
      g.fillStyle = veh.bodyColor;
      g.fillRect(vx, cy + 9, carW, isSuv ? 14 : 11);
      g.fillRect(vx + (isSuv ? 10 : 16), cy + 1, isSuv ? 50 : 40, isSuv ? 10 : 9);

      // Tinted Windows with sky reflection
      g.fillStyle = '#1e293b';
      g.fillRect(vx + 19, cy + 3, 15, 6);
      g.fillRect(vx + 37, cy + 3, 16, 6);
      g.fillStyle = 'rgba(148, 163, 184, 0.35)';
      g.fillRect(vx + 20, cy + 3, 4, 5);

      // Accent Stripe / Calipers
      g.fillStyle = veh.accentColor;
      g.fillRect(vx + 4, cy + 15, carW - 8, 2);

      // LED Headlights & Taillights
      g.fillStyle = '#ef4444';
      g.fillRect(vx, cy + 11, 4, 4);
      g.fillStyle = '#fef08a';
      g.fillRect(vx + carW - 5, cy + 11, 5, 4);

      // Headlight beam cone
      const beam = g.createLinearGradient(vx + carW, cy + 12, vx + carW + 45, cy + 24);
      beam.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
      beam.addColorStop(1, 'rgba(254, 240, 138, 0)');
      g.fillStyle = beam;
      g.fillRect(vx + carW, cy + 8, 45, 18);

      // Alloy Wheels
      g.fillStyle = '#090d12';
      g.fillRect(vx + 11, groundY - 12, 14, 12);
      g.fillRect(vx + 53, groundY - 12, 14, 12);
      g.fillStyle = '#cbd5e1';
      g.fillRect(vx + 14, groundY - 9, 8, 6);
      g.fillRect(vx + 56, groundY - 9, 8, 6);
    };

    const drawPixelPet = (
      g: CanvasRenderingContext2D,
      x: number,
      bottomY: number,
      petItem: PetItem,
      time: number
    ) => {
      const p = 2.4;
      const hop = Math.round(Math.abs(Math.sin(time * 5)) * 1.8);
      const y = bottomY - 6 * p - hop;

      g.fillStyle = 'rgba(0,0,0,0.42)';
      g.fillRect(x - p, bottomY - 2, 9 * p, 2.5);

      g.fillStyle = '#090c10';
      g.fillRect(x - p, y - p, 9 * p, 7 * p);

      g.fillStyle = petItem.primaryColor;
      g.fillRect(x, y + 2 * p, 5 * p, 3 * p);
      g.fillRect(x + 4 * p, y, 3 * p, 3 * p);

      g.fillStyle = petItem.secondaryColor;
      g.fillRect(x + 4 * p, y - p, p, p);
      g.fillRect(x + 6 * p, y - p, p, p);
      const tailY = Math.sin(time * 12) > 0 ? y + p : y + 2 * p;
      g.fillRect(x - p, tailY, p, p);

      g.fillStyle = '#090c10';
      g.fillRect(x + 6 * p, y + p, p, p);

      g.fillStyle = petItem.primaryColor;
      g.fillRect(x, y + 5 * p, p, p);
      g.fillRect(x + 4 * p, y + 5 * p, p, p);
    };

    const renderFrame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastTime = now;
      elapsed += dt;

      const {
        appearance: app,
        season: curSeason,
        weather: curWeather,
        pet: curPet,
        house: curHouse,
        equippedBrands: brands,
        age: curAge,
        strength: curStr = 24,
        muscleMass: curMuscle = 20,
        vehicle: curVehicle,
        hasNeonTuning: neonTune,
        hasSpoilerTuning: spoilerTune,
        hasSmartHomeTuning: smartHomeTune,
        regionGroup: curRegion = '',
        urbexFlashTrigger: flashTrig,
        isTitleMode: titleMode,
        hasInjury: curHasInjury = false,
        outfitStyle: curOutfitStyle = 'casual',
        hairstyleId: curHairstyleId,
        facialHairId: curFacialHairId = 'none',
        hasMask: curHasMask = false,
        hasCareer: curHasCareer = false,
      } = propsRef.current;

      const isResort = curRegion.includes('Курорты');
      const isUkraineOrCis = curRegion.includes('Украина') || curRegion.includes('СНГ');
      const isEurope = curRegion.includes('Евросоюз');

      if (flashTrig !== lastFlashSeen) {
        lastFlashSeen = flashTrig;
        shakeTrauma = 0.65;
      }

      if (shakeTrauma > 0) {
        shakeTrauma = Math.max(0, shakeTrauma - dt * 1.8);
      }

      ctx.save();
      if (shakeTrauma > 0) {
        const shakeAmt = shakeTrauma * shakeTrauma * 6;
        ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
      }

      // 1. Dynamic Season & Location Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (isResort && (curSeason === 'Лето' || curWeather === 'Жара' || curWeather === 'Ясно')) {
        skyGrad.addColorStop(0, '#082f49');
        skyGrad.addColorStop(0.55, '#0369a1');
        skyGrad.addColorStop(1, '#f59e0b');
      } else if (curSeason === 'Зима' || curWeather === 'Снегопад') {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.65, '#1e293b');
        skyGrad.addColorStop(1, '#475569');
      } else if (curSeason === 'Осень') {
        skyGrad.addColorStop(0, '#131626');
        skyGrad.addColorStop(0.6, '#272038');
        skyGrad.addColorStop(1, '#4a2c2a');
      } else if (curSeason === 'Весна') {
        skyGrad.addColorStop(0, '#0c192c');
        skyGrad.addColorStop(0.6, '#1a365d');
        skyGrad.addColorStop(1, '#2b4c6f');
      } else {
        skyGrad.addColorStop(0, '#0c1726');
        skyGrad.addColorStop(0.6, '#182c44');
        skyGrad.addColorStop(1, '#264461');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      if ((curWeather === 'Гроза' && Math.sin(elapsed * 7) > 0.96) || shakeTrauma > 0.4) {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
        ctx.fillRect(0, 0, W, H);
      }

      const groundY = 172;

      // 2. Stars / Sun & Clouds
      if (curSeason === 'Лето' || isResort) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.85)';
        ctx.fillRect(442, 22, 18, 18);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      const starCoords = [
        [34, 18], [98, 26], [172, 14], [250, 22], [330, 16], [418, 24], [480, 15],
      ];
      for (let i = 0; i < starCoords.length; i++) {
        const [sx, sy] = starCoords[i];
        if (Math.sin(elapsed * 2 + i) > -0.3) {
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      const drawCloud = (cx: number, cy: number, cw: number) => {
        ctx.fillStyle = curSeason === 'Зима' ? '#64748b' : '#334155';
        ctx.fillRect(cx, cy, cw, 12);
        ctx.fillRect(cx + 8, cy - 5, cw - 16, 5);
        ctx.fillStyle = curSeason === 'Зима' ? '#94a3b8' : '#475569';
        ctx.fillRect(cx + 3, cy + 2, cw - 6, 7);
      };
      const cloudDrift = (elapsed * 5) % W;
      drawCloud((110 + cloudDrift * 0.2) % (W - 60), 20, 64);
      drawCloud((350 - cloudDrift * 0.15 + W) % (W - 60), 16, 72);

      // 3. Location-Specific Distant Skyline & Landmarks
      if (isResort) {
        // Ocean horizon & sandy beach strip
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(80, groundY - 26, 330, 26);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(96, groundY - 18, 60, 2);
        ctx.fillRect(220, groundY - 12, 80, 2);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(80, groundY - 7, 330, 7);
        // Palm trees
        for (const px of [118, 304, 378]) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px, groundY - 46, 5, 46);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(px - 14, groundY - 52, 32, 7);
          ctx.fillRect(px - 8, groundY - 57, 20, 6);
        }
      } else {
        const bgBuildings = [
          { x: 86, w: 54, h: 98 },
          { x: 144, w: 62, h: 118 },
          { x: 210, w: 48, h: 88 },
          { x: 262, w: 68, h: 124 },
          { x: 334, w: 52, h: 94 },
        ];
        for (const b of bgBuildings) {
          ctx.fillStyle = '#161e27';
          ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
          // Regional roof architecture: Golden cathedral domes for UA/CIS, Gothic spires for EU
          if (isUkraineOrCis && b.x === 210) {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(b.x + 16, groundY - b.h - 14, 16, 14);
            ctx.fillRect(b.x + 22, groundY - b.h - 22, 4, 8);
          } else if (isEurope && (b.x === 144 || b.x === 262)) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(b.x + 20, groundY - b.h - 18, 20, 18);
            ctx.fillRect(b.x + 28, groundY - b.h - 28, 4, 10);
          }
          ctx.fillStyle = curSeason === 'Зима' ? '#38bdf8' : '#eab308';
          for (let wy = groundY - b.h + 10; wy < groundY - 16; wy += 14) {
            for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 12) {
              if ((wx + wy) % 3 === 0) {
                ctx.fillRect(wx, wy, 5, 4);
              }
            }
          }
        }
      }

      // Seasonal Park Trees along the street
      const treeFoliageColor =
        curSeason === 'Зима'
          ? '#e2e8f0'
          : curSeason === 'Осень'
          ? '#ea580c'
          : curSeason === 'Весна'
          ? '#f472b6'
          : '#16a34a';
      for (const tx of [104, 300]) {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tx, groundY - 26, 6, 26);
        ctx.fillStyle = treeFoliageColor;
        ctx.fillRect(tx - 10, groundY - 44, 26, 20);
        ctx.fillRect(tx - 6, groundY - 50, 18, 8);
      }

      // 4. Left Foreground Apartment Block
      const aptX = 10;
      const aptY = 38;
      const aptW = 78;
      const aptH = groundY - aptY;

      ctx.fillStyle = '#090d12';
      ctx.fillRect(aptX - 2, aptY - 2, aptW + 4, aptH + 2);
      ctx.fillStyle = '#38424d';
      ctx.fillRect(aptX, aptY, aptW, aptH);
      ctx.fillStyle = '#28313b';
      ctx.fillRect(aptX + 4, aptY + 4, aptW - 8, aptH - 4);

      // Mortar lines across apartment facade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      for (let my = aptY + 4; my < groundY - 4; my += 7) {
        ctx.fillRect(aptX, my, aptW, 1);
      }

      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 3; col++) {
          const wx = aptX + 10 + col * 21;
          const wy = aptY + 10 + row * 17;
          const isLit = (row + col) % 2 === 0 || (row === 2 && col === 1);
          if (isLit) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
            ctx.fillRect(wx - 2, wy - 2, 16, 12);
            ctx.fillStyle = '#fcd34d';
            ctx.fillRect(wx, wy, 12, 8);
            // Window curtain details
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(wx, wy, 2, 8);
            ctx.fillRect(wx + 10, wy, 2, 8);
          } else {
            ctx.fillStyle = '#475569';
            ctx.fillRect(wx, wy, 12, 8);
          }
        }
      }

      // AC Units on Floor 2 & Floor 4
      const drawAcUnit = (acx: number, acy: number) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(acx, acy, 11, 7);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(acx + 1, acy + 1, 9, 5);
        ctx.fillStyle = '#334155';
        ctx.fillRect(acx + 2, acy + 2, 4, 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(acx + 8, acy + 2, 1, 1);
      };
      drawAcUnit(aptX + 34, aptY + 42);
      drawAcUnit(aptX + 56, aptY + 76);

      // Balcony Railing on 3rd floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(aptX + 8, aptY + 62, 26, 6);
      ctx.fillStyle = '#475569';
      for (let bx = aptX + 9; bx < aptX + 33; bx += 3) {
        ctx.fillRect(bx, aptY + 62, 1, 6);
      }

      // Vertical Drainpipe along apartment side
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(aptX + aptW - 2, aptY, 3, aptH);
      ctx.fillStyle = '#475569';
      for (let dy = aptY + 12; dy < groundY - 6; dy += 24) {
        ctx.fillRect(aptX + aptW - 3, dy, 5, 2);
      }

      // Entrance
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(aptX + 28, groundY - 20, 22, 20);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(aptX + 32, groundY - 16, 14, 16);

      // 5. Right Owned House / Residence with Smart Tuning
      const houseW = 96;
      const houseH = 50 + (curHouse.floors - 1) * 16;
      const houseX = 408;
      const houseY = groundY - houseH;

      // Pitched Roof
      ctx.fillStyle = curHouse.roofColor || '#2d6a6e';
      for (let r = 0; r < 18; r++) {
        const inset = (18 - r) * 2.2;
        ctx.fillRect(houseX - 6 + inset, houseY - 18 + r, houseW + 12 - inset * 2, 2);
      }
      // Roof shingle horizontal stripes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let ry = houseY - 16; ry < houseY; ry += 3) {
        ctx.fillRect(houseX - 2, ry, houseW + 4, 1);
      }

      // Smart Home Solar Panels on Roof
      if (smartHomeTune) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(houseX + 18, houseY - 12, 24, 8);
        ctx.fillRect(houseX + 52, houseY - 12, 24, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(houseX + 20, houseY - 10, 20, 2);
        ctx.fillRect(houseX + 54, houseY - 10, 20, 2);
      }

      ctx.fillStyle = '#090d12';
      ctx.fillRect(houseX - 2, houseY, houseW + 4, houseH);
      ctx.fillStyle = curHouse.wallColor || '#5c6670';
      ctx.fillRect(houseX, houseY + 2, houseW, houseH - 2);

      // Brick siding horizontal texture on house
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let hy = houseY + 6; hy < groundY - 2; hy += 6) {
        ctx.fillRect(houseX, hy, houseW, 1);
      }

      // House Windows
      ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.fillRect(houseX + 12, houseY + 14, 20, 16);
      ctx.fillRect(houseX + 64, houseY + 14, 20, 16);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(houseX + 14, houseY + 16, 16, 12);
      ctx.fillRect(houseX + 66, houseY + 16, 16, 12);

      // Flower boxes under house windows
      const drawFlowerBox = (fbx: number, fby: number) => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(fbx, fby, 16, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(fbx + 2, fby - 2, 2, 2);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(fbx + 7, fby - 2, 2, 2);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(fbx + 12, fby - 2, 2, 2);
      };
      drawFlowerBox(houseX + 14, houseY + 28);
      drawFlowerBox(houseX + 66, houseY + 28);

      // House Door & Porch Lamp
      ctx.fillStyle = '#78350f';
      ctx.fillRect(houseX + 41, groundY - 22, 14, 22);
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(houseX + 51, groundY - 11, 2, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(houseX + 37, groundY - 24, 3, 4);

      // 6. Sidewalk & Street Asphalt (with Winter Snow Layer if Зима)
      ctx.fillStyle = curSeason === 'Зима' ? '#e2e8f0' : '#475569';
      ctx.fillRect(0, groundY, W, 5);
      ctx.fillStyle = curSeason === 'Зима' ? '#334155' : '#1e252d';
      ctx.fillRect(0, groundY + 5, W, H - (groundY + 5));

      ctx.fillStyle = '#64748b';
      for (let dx = 10; dx < W; dx += 30) {
        ctx.fillRect(dx, groundY + 18, 16, 3);
      }

      // Street Lamp (Iron post with ornate lantern & volumetric light cone)
      const lampX = 112;
      const lampTopY = groundY - 54;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lampX - 1, lampTopY + 8, 3, 46);
      ctx.fillRect(lampX - 3, groundY - 3, 7, 3);
      ctx.fillRect(lampX, lampTopY + 2, 8, 2);
      ctx.fillRect(lampX + 6, lampTopY + 2, 2, 6);
      ctx.fillRect(lampX + 4, lampTopY + 6, 6, 2);
      ctx.fillRect(lampX + 4, lampTopY + 12, 6, 1);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lampX + 5, lampTopY + 8, 4, 4);

      // Volumetric Light Cone from Street Lamp onto sidewalk
      const streetLightCone = ctx.createRadialGradient(lampX + 7, lampTopY + 10, 2, lampX + 7, groundY, 48);
      streetLightCone.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
      streetLightCone.addColorStop(0.5, 'rgba(253, 224, 71, 0.18)');
      streetLightCone.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = streetLightCone;
      ctx.beginPath();
      ctx.moveTo(lampX + 4, lampTopY + 12);
      ctx.lineTo(lampX + 10, lampTopY + 12);
      ctx.lineTo(lampX + 36, groundY + 4);
      ctx.lineTo(lampX - 22, groundY + 4);
      ctx.closePath();
      ctx.fill();

      // Wooden Park Bench on Sidewalk
      const benchX = 286;
      const benchY = groundY - 8;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(benchX, benchY, 2, 8);
      ctx.fillRect(benchX + 22, benchY, 2, 8);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(benchX - 2, benchY - 6, 28, 2);
      ctx.fillRect(benchX - 2, benchY - 3, 28, 2);
      ctx.fillRect(benchX - 2, benchY, 28, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(benchX - 2, benchY - 4, 2, 4);
      ctx.fillRect(benchX + 24, benchY - 4, 2, 4);

      // 7. Parked Vehicle (Car or Motorcycle) with Tuning
      if (curVehicle) {
        drawParkedVehicle(ctx, 318, groundY + 2, curVehicle, neonTune, spoilerTune);
      }

      // 8. Family & Protagonist with Dynamic Muscle/Strength & Age 0+ Scaling
      const bob1 = Math.sin(elapsed * 3.0) * 1.2;
      const bob2 = Math.sin(elapsed * 3.6 + 1) * 1.2;
      const bobPlayer = Math.sin(elapsed * 4.0 + 2) * 1.4;

      const equippedOuter = brands.find((b) => b.slot === 'outerwear');
      const hasCamera = brands.some((b) => b.slot === 'gear');
      const hasBrandBadge = brands.length > 0;
      const playerShirt = equippedOuter ? equippedOuter.spriteAccentColor : app.shirtColor;

      // Father (Left)
      drawHiBitCharacter(
        ctx,
        142,
        groundY + 1,
        2.35,
        app.skinColor,
        '#271911',
        '#334155',
        '#1e293b',
        '#94a3b8',
        'short',
        false,
        false,
        false,
        35,
        39,
        bob1
      );

      // Mother
      drawHiBitCharacter(
        ctx,
        178,
        groundY + 1,
        2.25,
        app.skinColor,
        '#3f271d',
        '#0ea5e9',
        '#1e293b',
        '#f8fafc',
        'long',
        false,
        false,
        false,
        15,
        36,
        bob2
      );

      // Protagonist (Centerpiece — scales height from Age 0 baby/toddler to adult, and expands chest/biceps by muscleMass & strength!)
      const playerScale =
        curAge <= 2
          ? 1.35
          : curAge <= 6
          ? 1.65
          : curAge < 14
          ? 2.1
          : curAge < 18
          ? 2.35
          : 2.55;
      const effectiveMuscle = curAge < 10 ? 10 : Math.max(curMuscle, curStr);
      drawHiBitCharacter(
        ctx,
        220,
        groundY + 1,
        playerScale,
        app.skinColor,
        app.hairColor,
        playerShirt,
        app.pantsColor,
        app.shoeColor,
        app.hairStyle,
        app.hasGlasses,
        hasCamera,
        hasBrandBadge,
        effectiveMuscle,
        curAge,
        bobPlayer,
        curHasInjury,
        curHasCareer,
        curOutfitStyle,
        curFacialHairId,
        curHasMask
      );

      // Sibling / Best Friend
      drawHiBitCharacter(
        ctx,
        258,
        groundY + 1,
        2.1,
        app.skinColor,
        '#1c1917',
        '#8b5cf6',
        '#1e1b4b',
        '#e2e8f0',
        'bob',
        false,
        false,
        false,
        20,
        14,
        bob1
      );

      // Optional Active Pet (drawn only if curPet is not null!)
      if (curPet) {
        drawPixelPet(ctx, 282, groundY + 1, curPet, elapsed);
      }

      // 9. Weather Particles
      if (curWeather === 'Дождь' || curWeather === 'Гроза') {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.58)';
        for (let i = 0; i < MAX_PARTICLES; i++) {
          const pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy * 1.5;
          if (pt.y >= groundY + 4) {
            ctx.fillRect(pt.x - 1, groundY + 2, 3, 1);
            pt.y = -4;
            pt.x = Math.random() * W;
          }
          if (pt.x < 0) pt.x = W;
          ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 1, 5);
        }
      } else if (curWeather === 'Снегопад') {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
        for (let i = 0; i < MAX_PARTICLES; i++) {
          const pt = particles[i];
          pt.x += Math.sin(elapsed + i) * 0.35;
          pt.y += pt.vy * 0.5;
          if (pt.y >= groundY + 4) {
            pt.y = -2;
            pt.x = Math.random() * W;
          }
          ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2.5, 2.5);
        }
      }

      if (!titleMode) {
        const vig = ctx.createLinearGradient(0, 0, 0, H);
        vig.addColorStop(0, 'rgba(8, 12, 17, 0.25)');
        vig.addColorStop(0.5, 'rgba(8, 12, 17, 0)');
        vig.addColorStop(1, 'rgba(8, 12, 17, 0.35)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();
      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#121822]" data-testid="pixel-diorama-container">
      <canvas
        ref={canvasRef}
        className="w-full aspect-[520/208] max-h-[235px] block pixelated-canvas"
        aria-label="Детализированная пиксельная сцена Life Simulator EX с семьёй, транспортом и недвижимостью"
      />
    </div>
  );
};
