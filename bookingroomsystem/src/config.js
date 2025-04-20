const config = {
    apiBaseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://roombookingsystem-etc7bfeeg8hndfbc.eastasia-01.azurewebsites.net/api'  // Replace with your actual backend API URL
      : '/api'  // Local development URL
  };
  
  export default config;