import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(routeName) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: routeName}],
    });
  }
}

/**
 * Reset navigation stack với nhiều màn hình và chỉ định màn hình hiển thị sau reset.
 *
 * @param {Array<{name: string, params?: object}>} routesArray - Mảng chứa thông tin màn hình cần reset.
 * @param {number} index - Chỉ mục của màn hình sẽ được hiển thị sau khi reset (mặc định là 0).
 *
 * @example
 * // Reset stack với hai màn hình và truyền params vào HomeScreen
 * resetWithRoutes([{ name: 'LoginScreen' }, { name: 'HomeScreen', params: { userId: 123 } }], 1);
 */
export function resetWithRoutes(routesArray, index = 0) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index,
      routes: routesArray.map(route => ({
        name: route.name,
        params: route.params || {},
      })),
    });
  }
}
