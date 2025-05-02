import axios from '../utils/axios.customize';

export const registerAPI = (
  username,
  email,
  citizen_id,
  common_name,
  organization,
  organizational_unit,
  country,
  state,
  locality,
  role,
  dob,
) => {
  const url = `/api/v1/auth/register`;
  return axios.post(url, {
    username,
    email,
    citizen_id,
    common_name,
    organization,
    organizational_unit,
    country,
    state,
    locality,
    role,
    dob,
  });
};

export const loginAPI = (username, password) => {
  const url = `/api/v1/auth/login`;
  return axios.post(url, {username: username, password});
};
