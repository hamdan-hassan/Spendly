export interface PremiumThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    default: string;
    light: string;
  };
  accent: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
  };
}

export interface PremiumThemeDef {
  id: string;
  name: string;
  icon: string;
  cost: number;
  isDark: boolean;
  colors: PremiumThemeColors;
}

export const premiumThemes: PremiumThemeDef[] = [
  {
    id: 'frutiger-aero',
    name: 'Frutiger Aero',
    icon: 'star',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#F0F9FF',
        secondary: '#E0F2FE',
        tertiary: '#BAE6FD',
      },
      text: {
        primary: '#171a1c',
        secondary: '#526d7a',
        tertiary: '#7aa3b8',
      },
      border: {
        default: '#a3daf5',
        light: '#d1ecfa',
      },
      accent: {
        primary: '#0EA5E9',
        secondary: '#38BDF8',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'neon-gold',
    name: 'Neon Gold',
    icon: 'planet',
    cost: 2000,
    isDark: true,
    colors: {
      bg: {
        primary: '#29210a',
        secondary: '#41340b',
        tertiary: '#5c470a',
      },
      text: {
        primary: '#f4f3f1',
        secondary: '#c2baa3',
        tertiary: '#a69359',
      },
      border: {
        default: '#997300',
        light: '#664d00',
      },
      accent: {
        primary: '#ffbf00',
        secondary: '#ccff33',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    icon: 'leaf',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#14181f',
        secondary: '#1b2232',
        tertiary: '#1f2c47',
      },
      text: {
        primary: '#f1f2f4',
        secondary: '#a3adc2',
        tertiary: '#5973a6',
      },
      border: {
        default: '#1f3d7a',
        light: '#142952',
      },
      accent: {
        primary: '#3366cc',
        secondary: '#705cd6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: 'flame',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#290a1f',
        secondary: '#410b2f',
        tertiary: '#5c0a41',
      },
      text: {
        primary: '#f4f1f3',
        secondary: '#c2a3b8',
        tertiary: '#a6598c',
      },
      border: {
        default: '#990066',
        light: '#660044',
      },
      accent: {
        primary: '#ff00aa',
        secondary: '#ff3355',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    icon: 'water',
    cost: 2000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f1f4f2',
        tertiary: '#e0ebe4',
      },
      text: {
        primary: '#171c19',
        secondary: '#527a5f',
        tertiary: '#7ab88f',
      },
      border: {
        default: '#b8e0c5',
        light: '#dbf0e2',
      },
      accent: {
        primary: '#4db36f',
        secondary: '#70c2b4',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    icon: 'moon',
    cost: 2000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fcf9f8',
        secondary: '#f9f0ec',
        tertiary: '#f5e0d6',
      },
      text: {
        primary: '#1c1917',
        secondary: '#7a5f52',
        tertiary: '#b88f7a',
      },
      border: {
        default: '#f5bea3',
        light: '#fadfd1',
      },
      accent: {
        primary: '#e65d19',
        secondary: '#ebcf47',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    icon: 'sunny',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#0d1a26',
        secondary: '#0f263d',
        tertiary: '#0f3357',
      },
      text: {
        primary: '#f1f2f4',
        secondary: '#a3b3c2',
        tertiary: '#5980a6',
      },
      border: {
        default: '#084d91',
        light: '#053361',
      },
      accent: {
        primary: '#0d80f2',
        secondary: '#3d3df5',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'ruby-red',
    name: 'Ruby Red',
    icon: 'flash',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#240f13',
        secondary: '#39131a',
        tertiary: '#52141f',
      },
      text: {
        primary: '#f4f1f1',
        secondary: '#c2a3a8',
        tertiary: '#a65966',
      },
      border: {
        default: '#8a0f24',
        light: '#5c0a18',
      },
      accent: {
        primary: '#e6193c',
        secondary: '#eb7e47',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    icon: 'diamond',
    cost: 2000,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a141f',
        secondary: '#261b32',
        tertiary: '#331f47',
      },
      text: {
        primary: '#f2f1f4',
        secondary: '#b3a3c2',
        tertiary: '#8059a6',
      },
      border: {
        default: '#4d1f7a',
        light: '#331452',
      },
      accent: {
        primary: '#8033cc',
        secondary: '#d65cd6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    icon: 'color-palette',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f2f2f2',
        tertiary: '#e8e3e8',
      },
      text: {
        primary: '#1c171c',
        secondary: '#7a527a',
        tertiary: '#b87ab8',
      },
      border: {
        default: '#dbbddb',
        light: '#eddeed',
      },
      accent: {
        primary: '#a659a6',
        secondary: '#b87a99',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'hacker-green',
    name: 'Hacker Green',
    icon: 'rose',
    cost: 2000,
    isDark: true,
    colors: {
      bg: {
        primary: '#0a290a',
        secondary: '#0b410b',
        tertiary: '#0a5c0a',
      },
      text: {
        primary: '#f1f4f1',
        secondary: '#a3c2a3',
        tertiary: '#59a659',
      },
      border: {
        default: '#009900',
        light: '#006600',
      },
      accent: {
        primary: '#00ff00',
        secondary: '#33ff99',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    icon: 'snow',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a1a1a',
        secondary: '#262626',
        tertiary: '#333333',
      },
      text: {
        primary: '#f4f1f1',
        secondary: '#c2a3a3',
        tertiary: '#a65959',
      },
      border: {
        default: '#4d4d4d',
        light: '#333333',
      },
      accent: {
        primary: '#808080',
        secondary: '#999999',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'sakura',
    name: 'Sakura',
    icon: 'hardware-chip',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f4f1f2',
        tertiary: '#ebe0e4',
      },
      text: {
        primary: '#1c1719',
        secondary: '#7a525f',
        tertiary: '#b87a8f',
      },
      border: {
        default: '#e0b8c5',
        light: '#f0dbe2',
      },
      accent: {
        primary: '#b34d6e',
        secondary: '#c27e70',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    icon: 'star',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f2f1f4',
        tertiary: '#e4e0eb',
      },
      text: {
        primary: '#19171c',
        secondary: '#5f527a',
        tertiary: '#8f7ab8',
      },
      border: {
        default: '#c5b8e0',
        light: '#e2dbf0',
      },
      accent: {
        primary: '#6e4db3',
        secondary: '#b470c2',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    icon: 'planet',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#f9fbfa',
        secondary: '#eef6f4',
        tertiary: '#dbf0e9',
      },
      text: {
        primary: '#171c1a',
        secondary: '#527a6d',
        tertiary: '#7ab8a3',
      },
      border: {
        default: '#adebd6',
        light: '#d6f5eb',
      },
      accent: {
        primary: '#33cc99',
        secondary: '#5cc2d6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    icon: 'leaf',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#1d0f24',
        secondary: '#2d1339',
        tertiary: '#3d1452',
      },
      text: {
        primary: '#f3f1f4',
        secondary: '#b8a3c2',
        tertiary: '#8c59a6',
      },
      border: {
        default: '#610f8a',
        light: '#410a5c',
      },
      accent: {
        primary: '#a219e6',
        secondary: '#eb47cf',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'coffee-bean',
    name: 'Coffee Bean',
    icon: 'flame',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#211a12',
        secondary: '#362617',
        tertiary: '#4d331a',
      },
      text: {
        primary: '#f4f2f1',
        secondary: '#c2b3a3',
        tertiary: '#a68059',
      },
      border: {
        default: '#824d17',
        light: '#57330f',
      },
      accent: {
        primary: '#d98026',
        secondary: '#e0e052',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    icon: 'water',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f4f3f1',
        tertiary: '#ebe7e0',
      },
      text: {
        primary: '#1c1a17',
        secondary: '#7a6d52',
        tertiary: '#b8a37a',
      },
      border: {
        default: '#e0d3b8',
        light: '#f0e9db',
      },
      accent: {
        primary: '#b3914d',
        secondary: '#b4c270',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'arctic-ice',
    name: 'Arctic Ice',
    icon: 'moon',
    cost: 2000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f2f2f2',
        tertiary: '#e3e7e8',
      },
      text: {
        primary: '#171b1c',
        secondary: '#52747a',
        tertiary: '#7aadb8',
      },
      border: {
        default: '#bdd6db',
        light: '#deebed',
      },
      accent: {
        primary: '#5999a6',
        secondary: '#7a8fb8',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'volcano',
    name: 'Volcano',
    icon: 'sunny',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#26110d',
        secondary: '#3d170f',
        tertiary: '#571b0f',
      },
      text: {
        primary: '#f4f1f1',
        secondary: '#c2a8a3',
        tertiary: '#a66659',
      },
      border: {
        default: '#911f08',
        light: '#611405',
      },
      accent: {
        primary: '#f2330d',
        secondary: '#f5b83d',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'lunar-vibes',
    name: 'Lunar Vibes',
    icon: 'flash',
    cost: 1500,
    isDark: false,
    colors: {
      bg: {
        primary: '#fbf9fb',
        secondary: '#f5eef6',
        tertiary: '#eddbf0',
      },
      text: {
        primary: '#1b171c',
        secondary: '#74527a',
        tertiary: '#ae7ab8',
      },
      border: {
        default: '#e1adeb',
        light: '#f0d6f5',
      },
      accent: {
        primary: '#b533cc',
        secondary: '#d65cab',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'terra-breeze',
    name: 'Terra Breeze',
    icon: 'diamond',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#faf8fb',
        secondary: '#f4edf7',
        tertiary: '#e9d9f2',
      },
      text: {
        primary: '#1a171c',
        secondary: '#6c527a',
        tertiary: '#a27ab8',
      },
      border: {
        default: '#d7a8f0',
        light: '#ebd4f7',
      },
      accent: {
        primary: '#9a26d9',
        secondary: '#e052cb',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'velvet-dawn',
    name: 'Velvet Dawn',
    icon: 'color-palette',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a1a1a',
        secondary: '#272428',
        tertiary: '#342b3b',
      },
      text: {
        primary: '#f2f1f4',
        secondary: '#b5a3c2',
        tertiary: '#8659a6',
      },
      border: {
        default: '#513267',
        light: '#362145',
      },
      accent: {
        primary: '#8753ac',
        secondary: '#bd75b7',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'crystal-flare',
    name: 'Crystal Flare',
    icon: 'rose',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafaf9',
        secondary: '#f5f1f0',
        tertiary: '#ede3de',
      },
      text: {
        primary: '#1c1817',
        secondary: '#7a5e52',
        tertiary: '#b88d7a',
      },
      border: {
        default: '#e4c2b4',
        light: '#f2e1d9',
      },
      accent: {
        primary: '#bd6742',
        secondary: '#cab668',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'electric-wave',
    name: 'Electric Wave',
    icon: 'snow',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a1a1a',
        secondary: '#262627',
        tertiary: '#322d39',
      },
      text: {
        primary: '#f2f1f4',
        secondary: '#afa3c2',
        tertiary: '#7759a6',
      },
      border: {
        default: '#473564',
        light: '#2f2343',
      },
      accent: {
        primary: '#7658a7',
        secondary: '#b179b9',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aqua-breeze',
    name: 'Aqua Breeze',
    icon: 'hardware-chip',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#0e1e25',
        secondary: '#122f3b',
        tertiary: '#124054',
      },
      text: {
        primary: '#f1f3f4',
        secondary: '#a3b9c2',
        tertiary: '#598fa6',
      },
      border: {
        default: '#0c668d',
        light: '#08445e',
      },
      accent: {
        primary: '#14aaeb',
        secondary: '#4366ef',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aurora-shift',
    name: 'Aurora Shift',
    icon: 'star',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#1d1a16',
        secondary: '#2f281d',
        tertiary: '#443722',
      },
      text: {
        primary: '#f4f3f1',
        secondary: '#c2b6a3',
        tertiary: '#a68859',
      },
      border: {
        default: '#755624',
        light: '#4e3918',
      },
      accent: {
        primary: '#c38f3c',
        secondary: '#c2cf63',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aqua-vibes',
    name: 'Aqua Vibes',
    icon: 'planet',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#14171f',
        secondary: '#1b2132',
        tertiary: '#1f2a47',
      },
      text: {
        primary: '#f1f2f4',
        secondary: '#a3acc2',
        tertiary: '#596fa6',
      },
      border: {
        default: '#1f397a',
        light: '#142652',
      },
      accent: {
        primary: '#335ecc',
        secondary: '#765cd6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'vintage-dawn',
    name: 'Vintage Dawn',
    icon: 'leaf',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#f9fcf8',
        secondary: '#f0f9eb',
        tertiary: '#e1f6d5',
      },
      text: {
        primary: '#191c17',
        secondary: '#617a52',
        tertiary: '#91b87a',
      },
      border: {
        default: '#c0f7a1',
        light: '#e0fbd0',
      },
      accent: {
        primary: '#63ec13',
        secondary: '#42f059',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'shadow-flare',
    name: 'Shadow Flare',
    icon: 'flame',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#171b1c',
        secondary: '#1e292e',
        tertiary: '#233943',
      },
      text: {
        primary: '#f1f3f4',
        secondary: '#a3b9c2',
        tertiary: '#598fa6',
      },
      border: {
        default: '#255c74',
        light: '#193d4d',
      },
      accent: {
        primary: '#3e9ac1',
        secondary: '#657acd',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aurora-glow',
    name: 'Aurora Glow',
    icon: 'water',
    cost: 1500,
    isDark: false,
    colors: {
      bg: {
        primary: '#fbf9fb',
        secondary: '#f6eef7',
        tertiary: '#f0daf1',
      },
      text: {
        primary: '#1c171c',
        secondary: '#7a527a',
        tertiary: '#b77ab8',
      },
      border: {
        default: '#ecabed',
        light: '#f5d5f6',
      },
      accent: {
        primary: '#ce2ed1',
        secondary: '#da589b',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'velvet-breeze',
    name: 'Velvet Breeze',
    icon: 'moon',
    cost: 1500,
    isDark: false,
    colors: {
      bg: {
        primary: '#f9fbfa',
        secondary: '#eff6f2',
        tertiary: '#dcefe6',
      },
      text: {
        primary: '#171c1a',
        secondary: '#527a67',
        tertiary: '#7ab89b',
      },
      border: {
        default: '#aeeace',
        light: '#d7f4e6',
      },
      accent: {
        primary: '#36c984',
        secondary: '#5ed0d4',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'velvet-glow',
    name: 'Velvet Glow',
    icon: 'sunny',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#0e1e25',
        secondary: '#102f3c',
        tertiary: '#114155',
      },
      text: {
        primary: '#f1f3f4',
        secondary: '#a3b9c2',
        tertiary: '#598fa6',
      },
      border: {
        default: '#0a678f',
        light: '#07455f',
      },
      accent: {
        primary: '#11acee',
        secondary: '#4064f2',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'nebula-glow',
    name: 'Nebula Glow',
    icon: 'flash',
    cost: 1500,
    isDark: false,
    colors: {
      bg: {
        primary: '#f7fdf9',
        secondary: '#eafbef',
        tertiary: '#d2f9df',
      },
      text: {
        primary: '#171c19',
        secondary: '#527a5f',
        tertiary: '#7ab88f',
      },
      border: {
        default: '#9cfcbc',
        light: '#cdfedd',
      },
      accent: {
        primary: '#06f957',
        secondary: '#38fada',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'crystal-dawn',
    name: 'Crystal Dawn',
    icon: 'diamond',
    cost: 2000,
    isDark: true,
    colors: {
      bg: {
        primary: '#0f2421',
        secondary: '#133a34',
        tertiary: '#145249',
      },
      text: {
        primary: '#f1f4f3',
        secondary: '#a3c2bd',
        tertiary: '#59a69a',
      },
      border: {
        default: '#0f8a78',
        light: '#0a5c50',
      },
      accent: {
        primary: '#18e7c8',
        secondary: '#46b2ec',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'cosmic-glow',
    name: 'Cosmic Glow',
    icon: 'color-palette',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#1c240f',
        secondary: '#2a3b12',
        tertiary: '#395313',
      },
      text: {
        primary: '#f3f4f1',
        secondary: '#b6c2a3',
        tertiary: '#87a659',
      },
      border: {
        default: '#598c0d',
        light: '#3b5d09',
      },
      accent: {
        primary: '#95e916',
        secondary: '#55ee44',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aero-spark',
    name: 'Aero Spark',
    icon: 'rose',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#1c1917',
        secondary: '#2e231f',
        tertiary: '#422d24',
      },
      text: {
        primary: '#f4f2f1',
        secondary: '#c2aca3',
        tertiary: '#a66f59',
      },
      border: {
        default: '#723c27',
        light: '#4c281a',
      },
      accent: {
        primary: '#be6441',
        secondary: '#cbb567',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'shadow-glow',
    name: 'Shadow Glow',
    icon: 'snow',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#211221',
        secondary: '#351735',
        tertiary: '#4c1a4b',
      },
      text: {
        primary: '#f4f1f3',
        secondary: '#c2a3c1',
        tertiary: '#a659a4',
      },
      border: {
        default: '#811880',
        light: '#561055',
      },
      accent: {
        primary: '#d728d5',
        secondary: '#df5397',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aqua-spark',
    name: 'Aqua Spark',
    icon: 'hardware-chip',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#f8fbfb',
        secondary: '#edf7f7',
        tertiary: '#d8f3f1',
      },
      text: {
        primary: '#171c1c',
        secondary: '#527a78',
        tertiary: '#7ab8b4',
      },
      border: {
        default: '#a8f0eb',
        light: '#d3f8f5',
      },
      accent: {
        primary: '#25dace',
        secondary: '#51a3e1',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aurora-wave',
    name: 'Aurora Wave',
    icon: 'star',
    cost: 2500,
    isDark: true,
    colors: {
      bg: {
        primary: '#12211a',
        secondary: '#183528',
        tertiary: '#1b4b35',
      },
      text: {
        primary: '#f1f4f2',
        secondary: '#a3c2b4',
        tertiary: '#59a683',
      },
      border: {
        default: '#188152',
        light: '#105636',
      },
      accent: {
        primary: '#29d688',
        secondary: '#54d7de',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'aqua-wave',
    name: 'Aqua Wave',
    icon: 'planet',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a1b18',
        secondary: '#292c21',
        tertiary: '#394026',
      },
      text: {
        primary: '#f3f4f1',
        secondary: '#bac2a3',
        tertiary: '#91a659',
      },
      border: {
        default: '#5d6f2a',
        light: '#3e4a1c',
      },
      accent: {
        primary: '#9ab946',
        secondary: '#81c76b',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'cosmic-dawn',
    name: 'Cosmic Dawn',
    icon: 'leaf',
    cost: 2500,
    isDark: false,
    colors: {
      bg: {
        primary: '#fbf8fc',
        secondary: '#f7ebf9',
        tertiary: '#f1d5f6',
      },
      text: {
        primary: '#1b171c',
        secondary: '#74527a',
        tertiary: '#ad7ab8',
      },
      border: {
        default: '#e9a0f8',
        light: '#f4d0fb',
      },
      accent: {
        primary: '#c912ed',
        secondary: '#f141b6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'radiant-glow',
    name: 'Radiant Glow',
    icon: 'flame',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#1a1a1a',
        secondary: '#262627',
        tertiary: '#332d39',
      },
      text: {
        primary: '#f2f1f4',
        secondary: '#b1a3c2',
        tertiary: '#7d59a6',
      },
      border: {
        default: '#4b3564',
        light: '#322343',
      },
      accent: {
        primary: '#7d58a7',
        secondary: '#b779b9',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'vintage-pulse',
    name: 'Vintage Pulse',
    icon: 'water',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f1f1f4',
        tertiary: '#e0e1eb',
      },
      text: {
        primary: '#17171c',
        secondary: '#52557a',
        tertiary: '#7a80b8',
      },
      border: {
        default: '#b7bbe1',
        light: '#dbddf0',
      },
      accent: {
        primary: '#4b54b4',
        secondary: '#926fc3',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'nebula-shift',
    name: 'Nebula Shift',
    icon: 'moon',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#180f24',
        secondary: '#24123a',
        tertiary: '#301353',
      },
      text: {
        primary: '#f2f1f4',
        secondary: '#b1a3c2',
        tertiary: '#7c59a6',
      },
      border: {
        default: '#460e8b',
        light: '#2f095d',
      },
      accent: {
        primary: '#7517e8',
        secondary: '#e445ed',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'solar-breeze',
    name: 'Solar Breeze',
    icon: 'sunny',
    cost: 1500,
    isDark: true,
    colors: {
      bg: {
        primary: '#201913',
        secondary: '#342619',
        tertiary: '#4a321c',
      },
      text: {
        primary: '#f4f2f1',
        secondary: '#c2b2a3',
        tertiary: '#a67e59',
      },
      border: {
        default: '#7e4b1b',
        light: '#543212',
      },
      accent: {
        primary: '#d27d2d',
        secondary: '#dbd957',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'nebula-dusk',
    name: 'Nebula Dusk',
    icon: 'flash',
    cost: 1000,
    isDark: false,
    colors: {
      bg: {
        primary: '#fcfcf8',
        secondary: '#f9f9eb',
        tertiary: '#f6f5d5',
      },
      text: {
        primary: '#1c1c17',
        secondary: '#7a7952',
        tertiary: '#b8b67a',
      },
      border: {
        default: '#f7f4a1',
        light: '#fbf9d0',
      },
      accent: {
        primary: '#ebe314',
        secondary: '#9fef43',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'cosmic-flare',
    name: 'Cosmic Flare',
    icon: 'diamond',
    cost: 1500,
    isDark: false,
    colors: {
      bg: {
        primary: '#f9fbf9',
        secondary: '#eff6f0',
        tertiary: '#dcefe0',
      },
      text: {
        primary: '#171c18',
        secondary: '#527a5b',
        tertiary: '#7ab889',
      },
      border: {
        default: '#afe9bc',
        light: '#d7f4de',
      },
      accent: {
        primary: '#37c859',
        secondary: '#5fd3b4',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'velvet-wave',
    name: 'Velvet Wave',
    icon: 'color-palette',
    cost: 2000,
    isDark: true,
    colors: {
      bg: {
        primary: '#11270c',
        secondary: '#183f0e',
        tertiary: '#1c590d',
      },
      text: {
        primary: '#f1f4f1',
        secondary: '#a9c2a3',
        tertiary: '#69a659',
      },
      border: {
        default: '#219405',
        light: '#166303',
      },
      accent: {
        primary: '#38f708',
        secondary: '#39f973',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
  {
    id: 'lunar-wave',
    name: 'Lunar Wave',
    icon: 'rose',
    cost: 1000,
    isDark: true,
    colors: {
      bg: {
        primary: '#171a1c',
        secondary: '#1f282e',
        tertiary: '#243642',
      },
      text: {
        primary: '#f1f2f4',
        secondary: '#a3b5c2',
        tertiary: '#5986a6',
      },
      border: {
        default: '#265373',
        light: '#1a374d',
      },
      accent: {
        primary: '#408abf',
        secondary: '#666fcc',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      }
    }
  },
];
