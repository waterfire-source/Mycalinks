const pxToRem = (value: number) => {
  return `${value / 16}rem`;
};

export const typography = {
  fontFamily: ['Noto Sans JP', 'sans-serif'].join(','),
  h1: {
    fontSize: pxToRem(22), // h1 を 22px
    lineHeight: 1.25,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(17),
    },
  },
  h2: {
    fontSize: pxToRem(20), // h2 を 20px
    lineHeight: 1.3,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(18),
    },
  },
  h3: {
    fontSize: pxToRem(18), // h3 を 18px
    lineHeight: 1.35,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(16),
    },
  },
  h4: {
    fontSize: pxToRem(16), // h4 を 16px
    lineHeight: 1.4,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(14),
    },
  },
  h5: {
    fontSize: pxToRem(14), // h5 を 14px
    lineHeight: 1.5,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(12),
    },
  },
  h6: {
    fontSize: pxToRem(12), // h6 を 12px
    lineHeight: 1.6,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(10),
    },
  },
  body1: {
    fontSize: pxToRem(16),
    lineHeight: 1.75,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(12),
    },
  },
  body2: {
    fontSize: pxToRem(16),
    lineHeight: 1.8,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(12),
    },
  },
  caption: {
    fontSize: pxToRem(11),
    lineHeight: 1.5,
    [`@media (max-width:1400px)`]: {
      fontSize: pxToRem(9),
    },
  },
};
