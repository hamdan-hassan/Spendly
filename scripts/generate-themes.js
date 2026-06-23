const fs = require('fs');
const path = require('path');

const baseThemes = [
  { id: 'frutiger-aero', name: 'Frutiger Aero', hue: 200, sat: 80, val: 90, isDark: false }, // Frutiger Aero (glassy blue/green)
  { id: 'neon-gold', name: 'Neon Gold', hue: 45, sat: 100, val: 50, isDark: true },
  { id: 'midnight-blue', name: 'Midnight Blue', hue: 220, sat: 60, val: 20, isDark: true },
  { id: 'cyberpunk', name: 'Cyberpunk', hue: 320, sat: 100, val: 30, isDark: true },
  { id: 'forest-zen', name: 'Forest Zen', hue: 140, sat: 40, val: 80, isDark: false },
  { id: 'sunset-orange', name: 'Sunset Orange', hue: 20, sat: 80, val: 90, isDark: false },
  { id: 'deep-ocean', name: 'Deep Ocean', hue: 210, sat: 90, val: 15, isDark: true },
  { id: 'ruby-red', name: 'Ruby Red', hue: 350, sat: 80, val: 25, isDark: true },
  { id: 'amethyst', name: 'Amethyst', hue: 270, sat: 60, val: 20, isDark: true },
  { id: 'pastel-dream', name: 'Pastel Dream', hue: 300, sat: 30, val: 95, isDark: false },
  { id: 'hacker-green', name: 'Hacker Green', hue: 120, sat: 100, val: 10, isDark: true },
  { id: 'monochrome', name: 'Monochrome', hue: 0, sat: 0, val: 50, isDark: true },
  { id: 'sakura', name: 'Sakura', hue: 340, sat: 40, val: 95, isDark: false },
  { id: 'lavender', name: 'Lavender', hue: 260, sat: 40, val: 95, isDark: false },
  { id: 'mint-fresh', name: 'Mint Fresh', hue: 160, sat: 60, val: 90, isDark: false },
  { id: 'royal-purple', name: 'Royal Purple', hue: 280, sat: 80, val: 30, isDark: true },
  { id: 'coffee-bean', name: 'Coffee Bean', hue: 30, sat: 70, val: 20, isDark: true },
  { id: 'desert-sand', name: 'Desert Sand', hue: 40, sat: 40, val: 90, isDark: false },
  { id: 'arctic-ice', name: 'Arctic Ice', hue: 190, sat: 30, val: 95, isDark: false },
  { id: 'volcano', name: 'Volcano', hue: 10, sat: 90, val: 20, isDark: true },
];

// Helper to convert HSL to Hex
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate the remaining themes
const adjectives = ['Cosmic', 'Vintage', 'Electric', 'Lunar', 'Solar', 'Mystic', 'Crystal', 'Shadow', 'Radiant', 'Aero', 'Aqua', 'Terra', 'Nebula', 'Aurora', 'Velvet'];
const nouns = ['Vibes', 'Glow', 'Pulse', 'Wave', 'Breeze', 'Dawn', 'Dusk', 'Flare', 'Spark', 'Shift'];

let generatedCount = baseThemes.length;

while (generatedCount < 50) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const name = `${adj} ${noun}`;
  const id = name.toLowerCase().replace(' ', '-');
  
  if (!baseThemes.find(t => t.id === id)) {
    const hue = Math.floor(Math.random() * 360);
    const sat = 30 + Math.floor(Math.random() * 70);
    const isDark = Math.random() > 0.5;
    const val = isDark ? 15 + Math.floor(Math.random() * 20) : 85 + Math.floor(Math.random() * 10);
    
    baseThemes.push({ id, name, hue, sat, val, isDark });
    generatedCount++;
  }
}

const icons = ['star', 'planet', 'leaf', 'flame', 'water', 'moon', 'sunny', 'flash', 'diamond', 'color-palette', 'rose', 'snow', 'hardware-chip'];

const themesTS = `import type { ThemeColors } from './colors';

export interface PremiumThemeDef {
  id: string;
  name: string;
  icon: string;
  cost: number;
  isDark: boolean;
  colors: ThemeColors;
}

export const premiumThemes: PremiumThemeDef[] = [
${baseThemes.map((t, i) => {
  const icon = icons[i % icons.length];
  const cost = 1000 + Math.floor(Math.random() * 4) * 500; // 1000, 1500, 2000, 2500
  
  const bgL = t.isDark ? 10 : 98;
  const bgSecL = t.isDark ? 15 : 95;
  const bgTerL = t.isDark ? 20 : 90;
  
  const textL = t.isDark ? 95 : 10;
  const textSecL = t.isDark ? 70 : 40;
  const textTerL = t.isDark ? 50 : 60;
  
  // Custom Frutiger Aero logic
  let bgPrimary = hslToHex(t.hue, t.sat, bgL);
  let accentPrimary = hslToHex(t.hue, t.sat, 50);
  
  if (t.id === 'frutiger-aero') {
     bgPrimary = '#E0F2FE'; // light blue
     accentPrimary = '#0284C7'; // glossy blue
  }

  return `  {
    id: '${t.id}',
    name: '${t.name}',
    icon: '${icon}',
    cost: ${t.id === 'frutiger-aero' ? 2500 : cost},
    isDark: ${t.isDark},
    colors: {
      bg: {
        primary: '${t.id === 'frutiger-aero' ? '#F0F9FF' : hslToHex(t.hue, Math.max(0, t.sat - 40), bgL)}',
        secondary: '${t.id === 'frutiger-aero' ? '#E0F2FE' : hslToHex(t.hue, Math.max(0, t.sat - 30), bgSecL)}',
        tertiary: '${t.id === 'frutiger-aero' ? '#BAE6FD' : hslToHex(t.hue, Math.max(0, t.sat - 20), bgTerL)}',
      },
      text: {
        primary: '${hslToHex(t.hue, 10, textL)}',
        secondary: '${hslToHex(t.hue, 20, textSecL)}',
        tertiary: '${hslToHex(t.hue, 30, textTerL)}',
      },
      border: {
        default: '${hslToHex(t.hue, t.sat, t.isDark ? 30 : 80)}',
        light: '${hslToHex(t.hue, t.sat, t.isDark ? 20 : 90)}',
      },
      accent: {
        primary: '${t.id === 'frutiger-aero' ? '#0EA5E9' : hslToHex(t.hue, t.sat, 50)}',
        secondary: '${t.id === 'frutiger-aero' ? '#38BDF8' : hslToHex((t.hue + 30) % 360, t.sat, 60)}',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },`;
}).join('\n')}
];
`;

fs.writeFileSync(path.join(__dirname, '../src/theme/premiumThemes.ts'), themesTS);
console.log('Generated 50 themes successfully.');
