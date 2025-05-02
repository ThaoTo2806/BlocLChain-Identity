import {MMKV} from 'react-native-mmkv';
import config from '../configs/index';
import Intro from '../screens/Intro/Intro';
import Login from '../screens/Login/Login';
import Register from '../screens/Register/Register';
import HomeAd from '../screens/Admin/HomeAd';
import Home from '../screens/User/Home';

// Khởi tạo MMKV storage
const storage = new MMKV();

const routes = [
  {
    path: config.routes.intro,
    component: Intro,
    options: {headerShown: false},
  },
  {
    path: config.routes.register,
    component: Register,
    options: {headerShown: false},
  },
  {
    path: config.routes.login,
    component: Login,
    options: {headerShown: false},
  },
  {
    path: config.routes.homeAdmin,
    component: HomeAd,
    options: {title: 'Trang chủ (Admin)', headerBackVisible: false},
  },
  {
    path: config.routes.homeUser,
    component: Home,
    options: {title: 'Trang chủ', headerBackVisible: false},
  },
  // Route trong Home
];

export const getDefaultRoute = async () => {
  try {
    // Lấy dữ liệu người dùng từ MMKV
    const token = storage.getString('token');
    const userName = storage.getString('userName');
    const role = storage.getNumber('role'); // Giả sử `role` được lưu là số (0 hoặc 1)

    if (token && userName) {
      // Kiểm tra token và userName
      if (role === 0) {
        return config.routes.homeAdmin; // HomeAd (Admin)
      } else if (role === 1) {
        return config.routes.homeUser; // Home (User)
      }
    }
  } catch (error) {
    console.log('Error fetching authentication data:', error);
  }
  return config.routes.intro; // Nếu không có token hoặc userName thì vào trang Intro
};

export default routes;
