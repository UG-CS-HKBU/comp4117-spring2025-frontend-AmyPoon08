const config = {
    apiBaseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/api'
      : '/api'
};

export default config;