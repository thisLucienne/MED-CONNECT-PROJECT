import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenDimensions {
  window: ScaledSize;
  screen: ScaledSize;
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isTablet: boolean;
}

export const useScreenDimensions = (): ScreenDimensions => {
  const [screenData, setScreenData] = useState(() => {
    const window = Dimensions.get('window');
    const screen = Dimensions.get('screen');
    
    return {
      window,
      screen,
      isLandscape: window.width > window.height,
      isPortrait: window.height > window.width,
      isSmallScreen: window.width < 375,
      isMediumScreen: window.width >= 375 && window.width < 414,
      isLargeScreen: window.width >= 414 && window.width < 768,
      isTablet: window.width >= 768,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setScreenData({
        window,
        screen,
        isLandscape: window.width > window.height,
        isPortrait: window.height > window.width,
        isSmallScreen: window.width < 375,
        isMediumScreen: window.width >= 375 && window.width < 414,
        isLargeScreen: window.width >= 414 && window.width < 768,
        isTablet: window.width >= 768,
      });
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
};

export default useScreenDimensions;