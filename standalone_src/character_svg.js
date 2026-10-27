// PROCEDURAL SVG CHARACTER GENERATOR FOR LIFE SIMULATOR EX

function adjustColor(hex, percent) {
  if (!hex || typeof hex !== 'string') return '#2b3a4a';
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

function renderCharacter(state, size = 130) {
  const age = state ? (state.age !== undefined ? state.age : 20) : 20;
  const muscleMass = state ? (state.muscleMass || 10) : 10;
  const strength = state ? (state.strength || 10) : 10;
  const career = state ? state.career : null;
  const outfitStyle = state ? (state.outfitStyle || (career ? 'business' : 'casual')) : 'business';
  let hairStyle = state ? (state.hairstyle || 'short') : 'short';
  const facialHair = state ? (state.facialHair || 'none') : 'none';

  // Base colors
  const skin = '#f2c9a1';
  const skinLight = adjustColor(skin, 15);
  const skinDark = adjustColor(skin, -20);
  const skinShadow = adjustColor(skin, -35);

  let hairColor = '#2c1e14';
  if (age >= 55) {
    hairColor = '#94a3b8'; // Grey / silver hair for age 55+
  }
  const hairLight = adjustColor(hairColor, 20);
  const hairDark = adjustColor(hairColor, -25);

  const eyes = '#1f2937';

  // Palette by outfit / career
  let jacketBase = '#2b3a4a'; // default navy business
  let pantsBase = '#1e2834';
  let tieBase = '#c53030'; // red tie

  if (outfitStyle === 'sport' || (state && state.focus && state.focus.includes('Спорт'))) {
    jacketBase = '#22543d';
    pantsBase = '#1c4532';
    tieBase = '#ffffff';
  } else if (age < 18 && age >= 6) {
    jacketBase = '#1e3a8a'; // School blue
    pantsBase = '#172554';
    tieBase = '#fbbf24'; // Gold school tie
  } else if (outfitStyle === 'casual' || !career) {
    jacketBase = '#4a5568';
    pantsBase = '#2d3748';
    tieBase = '#9b2c2c';
  } else if (career === 'businessman' || career === 'politician' || (state && state.money > 200000)) {
    jacketBase = '#1c1917'; // Luxury dark suit
    pantsBase = '#0c0a09';
    tieBase = '#d97706'; // Gold/amber tie
  }

  const jacketLight = adjustColor(jacketBase, 18);
  const jacketDark = adjustColor(jacketBase, -20);
  const pantsLight = adjustColor(pantsBase, 18);
  const pantsDark = adjustColor(pantsBase, -22);
  const tieLight = adjustColor(tieBase, 20);
  const tieDark = adjustColor(tieBase, -20);

  const shoes = '#171923';
  const shoesLight = adjustColor(shoes, 25);
  const shoesDark = adjustColor(shoes, -20);

  // Growth & Proportion scaling by age
  const isBaby = age <= 3;
  const isChild = age > 3 && age <= 12;
  const isTeen = age > 12 && age <= 19;
  const isAdult = age >= 20;

  // Muscle Bonus (adults / teens): widens shoulders and torso
  let muscleBonus = 0;
  if (!isBaby) {
    if (muscleMass > 85) {
      muscleBonus = 4;
    } else if (muscleMass > 60) {
      muscleBonus = 2;
    }
  }

  // Adult with career holds a classic briefcase
  const hasBriefcase = isAdult && (career !== null || (state && state.businesses && state.businesses.length > 0));
  const briefcaseColor = '#8D5B36';
  const briefcaseLight = adjustColor(briefcaseColor, 25);
  const briefcaseDark = adjustColor(briefcaseColor, -25);

  const width = Math.round(size * (64 / 96));
  const height = size;

  let content = '';

  // 1. Oval Drop Shadow
  content += `<ellipse cx="32" cy="91" rx="${isBaby ? '12' : '18'}" ry="3.5" fill="rgba(60,45,30,0.35)" />`;

  if (isBaby) {
    // ── BABY / TODDLER FORM (Age 0-3) ──
    content += `
      <g id="baby">
        <!-- Head -->
        <rect x="22" y="44" width="20" height="18" rx="3" fill="${skinLight}" />
        <rect x="32" y="44" width="10" height="18" rx="3" fill="${skinDark}" />
        <!-- Big Eyes -->
        <circle cx="27" cy="52" r="2.5" fill="${eyes}" />
        <circle cx="28" cy="51" r="0.8" fill="#ffffff" />
        <circle cx="36" cy="52" r="2.5" fill="${eyes}" />
        <circle cx="37" cy="51" r="0.8" fill="#ffffff" />
        <!-- Romper Clothes -->
        <rect x="24" y="62" width="16" height="16" rx="2" fill="${jacketLight}" />
        <rect x="32" y="62" width="8" height="16" rx="2" fill="${jacketDark}" />
        <!-- Tiny tuft -->
        <rect x="29" y="41" width="6" height="4" rx="2" fill="${hairLight}" />
        <!-- Feet -->
        <rect x="25" y="78" width="5" height="4" rx="1" fill="${shoesLight}" />
        <rect x="34" y="78" width="5" height="4" rx="1" fill="${shoesDark}" />
      </g>
    `;
  } else {
    // ── FULL BODY BLOCKY BUSINESSMAN / CHARACTER ──
    const legY = isChild ? 58 : (isTeen ? 52 : 48);
    const legHeight = isChild ? 26 : (isTeen ? 32 : 36);
    const torsoY = isChild ? 36 : 24;
    const torsoHeight = isChild ? 22 : 24;

    content += '<g id="fullbody-char">';

    // Visible Trapezius Muscle if muscleMass > 60
    if (muscleMass > 60 && isAdult) {
      content += `
        <polygon points="${22 - muscleBonus},${torsoY} 32,${torsoY - 3} ${42 + muscleBonus},${torsoY}" fill="${jacketDark}" />
      `;
    }

    // 2. Legs (Separate legs with gap, light left, dark right)
    // Left Leg
    content += `<rect x="${isChild ? 26 : 25}" y="${legY}" width="${isChild ? 5 : 6}" height="${legHeight}" fill="${pantsLight}" />`;
    content += `<rect x="${isChild ? 30 : 29}" y="${legY}" width="2" height="${legHeight}" fill="${pantsBase}" />`;
    // Right Leg
    content += `<rect x="${isChild ? 33 : 33}" y="${legY}" width="${isChild ? 5 : 6}" height="${legHeight}" fill="${pantsDark}" />`;
    content += `<rect x="${isChild ? 37 : 37}" y="${legY}" width="2" height="${legHeight}" fill="${adjustColor(pantsDark, -15)}" />`;

    // 3. Shoes (Rounded dark rectangles)
    content += `<rect x="${isChild ? 25 : 24}" y="84" width="7" height="6" rx="1" fill="${shoesLight}" />`;
    content += `<rect x="${isChild ? 25 : 24}" y="88" width="7" height="2" fill="${adjustColor(shoesLight, -20)}" />`;
    content += `<rect x="${isChild ? 33 : 33}" y="84" width="7" height="6" rx="1" fill="${shoesDark}" />`;
    content += `<rect x="${isChild ? 33 : 33}" y="88" width="7" height="2" fill="${adjustColor(shoesDark, -20)}" />`;

    // 4. Body / Torso (Main suit rectangle with lighter shirt strip in center)
    // Left Torso
    content += `<rect x="${23 - muscleBonus}" y="${torsoY}" width="${9 + muscleBonus}" height="${torsoHeight}" fill="${jacketLight}" />`;
    // Right Torso
    content += `<rect x="32" y="${torsoY}" width="${9 + muscleBonus}" height="${torsoHeight}" fill="${jacketDark}" />`;

    // White shirt center strip
    const shirtH = isChild ? 14 : 18;
    content += `<rect x="30" y="${torsoY}" width="4" height="${shirtH}" fill="#ffffff" />`;
    content += `<rect x="32" y="${torsoY}" width="2" height="${shirtH}" fill="#e2e8f0" />`;

    // Tie (colored rectangle & diamond/knot)
    const tieY = isChild ? 38 : 26;
    const tieH = isChild ? 10 : 14;
    content += `<rect x="31" y="${tieY}" width="2" height="${tieH}" fill="${tieLight}" />`;
    content += `<rect x="32" y="${tieY}" width="1" height="${tieH}" fill="${tieDark}" />`;
    content += `<rect x="30.5" y="${torsoY}" width="3" height="3" fill="${tieLight}" />`;

    // Suit Lapels (triangles)
    const lapelMidY = isChild ? 43 : 32;
    const lapelBotY = isChild ? 47 : 36;
    content += `<polygon points="30,${torsoY} ${27 - muscleBonus},${lapelMidY} 30,${lapelBotY}" fill="${jacketLight}" />`;
    content += `<polygon points="34,${torsoY} ${37 + muscleBonus},${lapelMidY} 34,${lapelBotY}" fill="${jacketDark}" />`;

    // Extra shoulder mass for muscleMass > 85
    if (muscleMass > 85 && isAdult) {
      content += `<rect x="${16 - muscleBonus}" y="${torsoY + 1}" width="4" height="6" fill="${jacketLight}" />`;
      content += `<rect x="${44 + muscleBonus}" y="${torsoY + 1}" width="4" height="6" fill="${jacketDark}" />`;
    }

    // 5. Arms & Hands
    const armY = isChild ? 37 : 25;
    const armH = isChild ? 20 : 22;
    const handY = isChild ? 57 : 47;
    // Left Arm (Light)
    content += `<rect x="${18 - muscleBonus}" y="${armY}" width="5" height="${armH}" fill="${jacketLight}" />`;
    content += `<rect x="${18 - muscleBonus}" y="${handY}" width="5" height="4" rx="1" fill="${skinLight}" />`;
    // Right Arm (Dark)
    content += `<rect x="${41 + muscleBonus}" y="${armY}" width="5" height="${armH}" fill="${jacketDark}" />`;
    content += `<rect x="${41 + muscleBonus}" y="${handY}" width="5" height="4" rx="1" fill="${skinDark}" />`;

    // School Backpack shape if child
    if (isChild) {
      content += `<rect x="15" y="38" width="4" height="14" rx="1" fill="#b45309" />`;
      content += `<rect x="45" y="38" width="4" height="14" rx="1" fill="#92400e" />`;
    }

    // Briefcase in right hand if adult with career/business
    if (hasBriefcase) {
      content += `
        <g id="briefcase">
          <rect x="${10 - muscleBonus}" y="44" width="13" height="15" rx="1" fill="${briefcaseLight}" />
          <rect x="${16 - muscleBonus}" y="44" width="7" height="15" rx="1" fill="${briefcaseDark}" />
          <path d="M ${14 - muscleBonus} 44 L ${14 - muscleBonus} 41 L ${19 - muscleBonus} 41 L ${19 - muscleBonus} 44" stroke="#d69e2e" stroke-width="1.5" fill="none" />
          <rect x="${12 - muscleBonus}" y="49" width="2" height="2" fill="#ecc94b" />
          <rect x="${18 - muscleBonus}" y="49" width="2" height="2" fill="#d69e2e" />
        </g>
      `;
    }

    // 6. Neck
    const neckY = isChild ? 32 : 20;
    content += `<rect x="29" y="${neckY}" width="3" height="4" fill="${skinLight}" />`;
    content += `<rect x="32" y="${neckY}" width="3" height="4" fill="${skinDark}" />`;

    // 7. Head & Face (Blocky stylized, split shading)
    const headY = isChild ? 16 : 6;
    const headH = isChild ? 16 : 14;
    content += `<rect x="23" y="${headY}" width="9" height="${headH}" rx="1" fill="${skinLight}" />`;
    content += `<rect x="32" y="${headY}" width="9" height="${headH}" rx="1" fill="${skinDark}" />`;

    // Eyebrows
    const browY = isChild ? 21 : 10;
    content += `<rect x="25" y="${browY}" width="4" height="1.5" fill="${hairLight}" />`;
    content += `<rect x="35" y="${browY}" width="4" height="1.5" fill="${hairDark}" />`;

    // Eyes (Square pixel eyes with white shine highlight)
    const eyeY = isChild ? 23 : 12;
    content += `<rect x="26" y="${eyeY}" width="3" height="3" fill="${eyes}" />`;
    content += `<rect x="26" y="${eyeY}" width="1.5" height="1.5" fill="#ffffff" />`;
    content += `<rect x="35" y="${eyeY}" width="3" height="3" fill="${eyes}" />`;
    content += `<rect x="35" y="${eyeY}" width="1.5" height="1.5" fill="#ffffff" />`;

    // Mouth / Smile
    const mouthY = isChild ? 28 : 17;
    content += `<rect x="29" y="${mouthY}" width="6" height="1.5" fill="${skinShadow}" />`;

    // Facial hair (only if adult and != 'none')
    if (isAdult && facialHair !== 'none') {
      if (facialHair === 'stubble') {
        content += `<rect x="24" y="16" width="16" height="4" fill="${hairDark}" opacity="0.35" />`;
      } else if (facialHair === 'mustache') {
        content += `<rect x="27" y="15.5" width="10" height="2" fill="${hairDark}" />`;
      } else if (facialHair === 'goatee') {
        content += `<rect x="28" y="15.5" width="8" height="2" fill="${hairDark}" />`;
        content += `<rect x="29" y="17.5" width="6" height="2.5" fill="${hairDark}" />`;
      } else if (facialHair === 'beard' || facialHair === 'full_beard') {
        content += `
          <rect x="23" y="14" width="3" height="6" fill="${hairLight}" />
          <rect x="38" y="14" width="3" height="6" fill="${hairDark}" />
          <rect x="24" y="16" width="16" height="4" fill="${hairDark}" />
          <rect x="25" y="18" width="14" height="2.5" fill="${adjustColor(hairDark, -15)}" />
        `;
      }
    }

    // 8. Hair Styles
    const hairY = isChild ? 13 : 3;
    content += '<g id="hair">';
    if (hairStyle === 'short' || !hairStyle) {
      content += `
        <rect x="22" y="${hairY}" width="10" height="5" fill="${hairLight}" />
        <rect x="32" y="${hairY}" width="10" height="5" fill="${hairDark}" />
        <rect x="22" y="${hairY + 2}" width="2" height="6" fill="${hairLight}" />
        <rect x="40" y="${hairY + 2}" width="2" height="6" fill="${hairDark}" />
      `;
    } else if (hairStyle === 'spiky') {
      const spkBase = isChild ? 16 : 6;
      content += `
        <polygon points="22,${spkBase} 25,${spkBase - 5} 28,${spkBase}" fill="${hairLight}" />
        <polygon points="27,${spkBase} 31,${spkBase - 6} 34,${spkBase}" fill="${hairLight}" />
        <polygon points="33,${spkBase} 37,${spkBase - 6} 40,${spkBase}" fill="${hairDark}" />
        <polygon points="38,${spkBase} 41,${spkBase - 5} 42,${spkBase}" fill="${hairDark}" />
        <rect x="22" y="${spkBase - 2}" width="20" height="3" fill="${hairLight}" />
      `;
    } else if (hairStyle === 'fade') {
      content += `
        <rect x="23" y="${hairY}" width="9" height="4" fill="${hairLight}" />
        <rect x="32" y="${hairY}" width="9" height="4" fill="${hairDark}" />
        <rect x="22" y="${hairY + 4}" width="1.5" height="4" fill="${hairLight}" opacity="0.5" />
        <rect x="40.5" y="${hairY + 4}" width="1.5" height="4" fill="${hairDark}" opacity="0.5" />
      `;
    } else if (hairStyle === 'long') {
      content += `
        <rect x="21" y="${hairY}" width="11" height="5" fill="${hairLight}" />
        <rect x="32" y="${hairY}" width="11" height="5" fill="${hairDark}" />
        <rect x="20" y="${hairY + 2}" width="3.5" height="15" fill="${hairLight}" />
        <rect x="40.5" y="${hairY + 2}" width="3.5" height="15" fill="${hairDark}" />
      `;
    } else if (hairStyle === 'curly') {
      content += `
        <circle cx="24" cy="${hairY + 1}" r="3" fill="${hairLight}" />
        <circle cx="29" cy="${hairY}" r="3.5" fill="${hairLight}" />
        <circle cx="34" cy="${hairY}" r="3.5" fill="${hairDark}" />
        <circle cx="39" cy="${hairY + 1}" r="3" fill="${hairDark}" />
        <rect x="22" y="${hairY + 1}" width="20" height="4" fill="${hairLight}" />
      `;
    }
    content += '</g>';

    content += '</g>'; // end fullbody-char
  }

  return `
    <svg viewBox="0 0 64 96" width="${width}" height="${height}" style="shape-rendering: crispEdges;" xmlns="http://www.w3.org/2000/svg">
      ${content}
    </svg>
  `;
}
