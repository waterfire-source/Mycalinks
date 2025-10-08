export const Color = {
  WHITE: '#FFFFFF',
  PALE_GRAY: '#F9F9F9',
  PALE_GRAY_2: '#D8D8D8',
  SILVER: '#C7C7C7',
  GRAY: '#979797',
  BLACK: '#000000',
  // TODO テーマカラーの決定
  // THEME: '#FF9605',
  // PALE_THEME: '#FFA632',
  RED: '#F53649',
  LIGHT_CORAL: '#F08080',
  LIGHT_BLUE: '#ADD8E6',
  BROWN: '#9D5B00',
  SUCCESS: '#52C41A',
  ERROR: '#FF4D4F',
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export const FontSize = {
  XXXS: '0.375rem',
  XXS: '0.5rem',
  XS: '0.75rem',
  SMALL: '0.875rem',
  MEDIUM: '1rem',
  LARGE: '1.25rem',
  XL: '1.5rem',
  XXL: '2rem',
  XXXL: '2.5rem',
  XXXXL: '3rem',
} as const;
export type FontSize = (typeof FontSize)[keyof typeof FontSize];

export const FontWeight = {
  HAIRLINE: '100',
  THIN: '200',
  RIGHT: '300',
  NORMAL: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
  BLACK: '900',
} as const;
export type FontWeight = (typeof FontWeight)[keyof typeof FontWeight];

export const Space = {
  ZERO: '0',
  XXXS: '0.25rem',
  XXS: '0.375rem',
  XS: '0.5rem',
  SMALL: '0.75rem',
  MEDIUM: '1rem',
  LARGE: '1.5rem',
  XL: '2rem',
  XXL: '3rem',
  XXXL: '4.5rem',
  XXXXL: '6rem',
} as const;
export type Space = (typeof Space)[keyof typeof Space];

export const BorderRadii = {
  ZERO: '0',
  XS: '0.125rem',
  SMALL: '0.25rem',
  MEDIUM: '0.5rem',
  LARGE: '1rem',
  XL: '2rem',
  XXL: '4rem',
  XXXL: '8rem',
  MAX: '9999px',
  HALF: '50%',
  FULL: '100%',
} as const;
export type BorderRadii = (typeof BorderRadii)[keyof typeof BorderRadii];

export const MediaQuery = {
  PC_XL: 1600,
  PC_LARGE: 1360,
  PC: 1024,
  TABLET: 768,
  SP_LANDSCAPE: 480,
  SP_PORTRAIT: 320,
} as const;
export type MediaQuery = (typeof MediaQuery)[keyof typeof MediaQuery];
