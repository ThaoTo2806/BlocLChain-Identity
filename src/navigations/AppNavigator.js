import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';

import routes, {getDefaultRoute} from '../routes';
import Loading from '../components/Loading';
import ScreenSizeProvider from '../context/ScreenSizeProvider';
import colors from '../assets/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const fetchInitialRoute = async () => {
      const route = await getDefaultRoute();
      setInitialRoute(route);
    };

    fetchInitialRoute();
  }, []);

  if (initialRoute === null) {
    return <Loading title="Đang tải" />;
  }

  return (
    <ScreenSizeProvider>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {backgroundColor: colors.primaryColor},
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {routes.map((route, index) => (
          <Stack.Screen
            key={index}
            name={route.path}
            component={route.component}
            options={route.options}
          />
        ))}
      </Stack.Navigator>
    </ScreenSizeProvider>
  );
};

export default AppNavigator;
