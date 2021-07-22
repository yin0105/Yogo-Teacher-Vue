import axios from 'axios';
import router from '../router';

const apiRoot = process.env.VUE_APP_API_ROOT;
if (!apiRoot) {
  alert(
    'You need to select which API to use. Please specify an VUE_APP_API_ROOT in .env\nAlso, for local development, you need to specify clientId in the same file.',
  );
}


const yogoApi = axios.create({
  baseURL: apiRoot,
});

yogoApi.interceptors.response.use(
  response => response.data,
  (error) => {
    console.log('Intercepted response error');
    if (error.response.status === 401 || error.response.status === 403) {
      window.localStorage.removeItem('accessToken');
      window.sessionStorage.removeItem('accessToken');

      console.log(`Error code ${error.response.status}. Clearing access token and redirecting to login.`);

      router.push({ name: 'Login' });
    }
    return Promise.reject(error);
  },
);

yogoApi.interceptors.request.use(
  (config) => {
    const headers = config.headers || {};

    if (config.url.indexOf('/login') > -1) {
      // Don't send access token to login
      if (headers.Authorization) delete headers.Authorization;
    } else {
      // Send access- token to all other routes, if available
      const accessToken = window.localStorage.getItem('accessToken')
        || window.sessionStorage.getItem('accessToken');

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    headers['X-Yogo-Request-Context'] = 'teacher';
    headers['X-Yogo-Client-Accepts-Extended-Error-Format'] = 1;

    const clientId = process.env.VUE_APP_CLIENT_ID;
    if (clientId) {
      headers['X-Yogo-Client-ID'] = clientId;
    }
    config.headers = headers;

    return config;
  },
  error => console.log(error.message),
);

export default yogoApi;
