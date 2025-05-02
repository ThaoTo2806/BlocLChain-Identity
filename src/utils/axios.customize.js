import { MMKV } from 'react-native-mmkv';
import axios from 'axios';

// Tạo một đối tượng storage của MMKV để dùng cho việc lưu/đọc token
const storage = new MMKV();

// Địa chỉ backend (API server)
const backend = 'http://blockchain.onlineai.vn:3001';
console.log('backend', backend);

// Tạo một instance của axios với cấu hình sẵn baseURL
const instance = axios.create({
  baseURL: backend,
});

// ✅ Interceptor trước khi gửi request
// Mục đích: gắn token vào header Authorization nếu có
instance.interceptors.request.use(
  function (config) {
    const access_token = storage.getString('access_token');
    if (access_token) {
      config.headers['Authorization'] = `Bearer ${access_token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// xử lý dữ liệu trả về, trả về response.data nếu có
instance.interceptors.response.use(
  function (response) {
    // Nếu có dữ liệu, trả ra response.data (thường là { success, data, ... })
    if (response?.data) return response.data;
    return response; // Nếu không có, trả về nguyên response
  },
  function (error) {
    // Nếu response có lỗi, trả về phần lỗi có chứa dữ liệu từ server
    if (error?.response?.data) return error.response.data;
    return Promise.reject(error); // Trả về lỗi nếu không có data cụ thể
  }
);

export default instance;
