import axios from "axios";
import { getToken } from './token';

const instance = axios.create({
  baseURL: "http://localhost:5000/api"
});

instance.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;


