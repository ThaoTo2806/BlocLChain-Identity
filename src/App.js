import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from './navigation/RootNavigation';
import AppNavigator from './navigation/AppNavigator';
import ToastProvider from './context/ToastProvider';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NetworkChecker from './context/NetworkChecker';

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <NetworkChecker>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </NetworkChecker>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
