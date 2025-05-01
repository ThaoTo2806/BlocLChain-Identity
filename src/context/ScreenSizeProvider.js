import React, {createContext, useState, useEffect} from 'react';
import {Dimensions} from 'react-native';

export const ScreenSizeContext = createContext();

function ScreenSizeProvider({children}) {
  const [screenSize, setScreenSize] = useState({
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height,
      });
    };

    const subscription = Dimensions.addEventListener(
      'change',
      updateScreenSize,
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

export default ScreenSizeProvider;
