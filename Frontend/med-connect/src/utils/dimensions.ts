import { Dimensions, PixelRatio, Platform } from 'react-native';

// Obtenir les dimensions de l'écran
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dimensions de référence (iPhone 12/13/14)
const REFERENCE_WIDTH = 390;
const REFERENCE_HEIGHT = 844;

// Calculer les ratios
const widthRatio = SCREEN_WIDTH / REFERENCE_WIDTH;
const heightRatio = SCREEN_HEIGHT / REFERENCE_HEIGHT;

// Types d'appareils
export const DEVICE_TYPES = {
  SMALL: 'small',     // iPhone SE, petits Android
  MEDIUM: 'medium',   // iPhone 12/13/14, Android standard
  LARGE: 'large',     // iPhone Plus/Pro Max, grands Android
  TABLET: 'tablet'    // iPad, tablettes Android
} as const;

// Détection du type d'appareil
export const getDeviceType = () => {
  if (SCREEN_WIDTH >= 768) return DEVICE_TYPES.TABLET;
  if (SCREEN_WIDTH >= 414) return DEVICE_TYPES.LARGE;
  if (SCREEN_WIDTH >= 375) return DEVICE_TYPES.MEDIUM;
  return DEVICE_TYPES.SMALL;
};

// Fonctions de mise à l'échelle
export const scaleWidth = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size * widthRatio));
};

export const scaleHeight = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size * heightRatio));
};

// Mise à l'échelle modérée (plus conservative)
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size + (scaleWidth(size) - size) * factor));
};

// Dimensions responsive
export const responsive = {
  // Largeurs
  width: {
    xs: scaleWidth(16),   // 16px
    sm: scaleWidth(24),   // 24px
    md: scaleWidth(32),   // 32px
    lg: scaleWidth(48),   // 48px
    xl: scaleWidth(64),   // 64px
  },
  
  // Hauteurs
  height: {
    xs: scaleHeight(16),
    sm: scaleHeight(24),
    md: scaleHeight(32),
    lg: scaleHeight(48),
    xl: scaleHeight(64),
  },
  
  // Padding et margins
  spacing: {
    xs: moderateScale(4),   // 4px
    sm: moderateScale(8),   // 8px
    md: moderateScale(16),  // 16px
    lg: moderateScale(24),  // 24px
    xl: moderateScale(32),  // 32px
    xxl: moderateScale(48), // 48px
  },
  
  // Tailles de police
  fontSize: {
    xs: moderateScale(10),
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(18),
    xxl: moderateScale(20),
    xxxl: moderateScale(24),
    title: moderateScale(28),
    header: moderateScale(32),
  },
  
  // Rayons de bordure
  borderRadius: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    full: 9999,
  },
  
  // Hauteurs de composants
  component: {
    button: scaleHeight(44),
    input: scaleHeight(48),
    header: scaleHeight(60),
    tabBar: scaleHeight(80),
    fab: scaleWidth(56),
    avatar: {
      sm: scaleWidth(32),
      md: scaleWidth(48),
      lg: scaleWidth(64),
      xl: scaleWidth(96),
    },
    card: {
      minHeight: scaleHeight(120),
    }
  }
};

// Breakpoints pour les conditions
export const breakpoints = {
  small: SCREEN_WIDTH < 375,
  medium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  large: SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768,
  tablet: SCREEN_WIDTH >= 768,
};

// Informations sur l'écran
export const screenInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  ratio: SCREEN_WIDTH / SCREEN_HEIGHT,
  isSmall: breakpoints.small,
  isMedium: breakpoints.medium,
  isLarge: breakpoints.large,
  isTablet: breakpoints.tablet,
  deviceType: getDeviceType(),
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

// Fonction utilitaire pour obtenir des styles conditionnels
export const getResponsiveStyle = (styles: {
  small?: any;
  medium?: any;
  large?: any;
  tablet?: any;
  default?: any;
}) => {
  if (breakpoints.tablet && styles.tablet) return styles.tablet;
  if (breakpoints.large && styles.large) return styles.large;
  if (breakpoints.medium && styles.medium) return styles.medium;
  if (breakpoints.small && styles.small) return styles.small;
  return styles.default || {};
};

export default {
  responsive,
  scaleWidth,
  scaleHeight,
  moderateScale,
  screenInfo,
  breakpoints,
  getResponsiveStyle,
  getDeviceType,
};