// server.js
const is_Production = false; // Set true in production

const server = {
  dev: "http://localhost:5173",
  production: "https://backendweb-2.onrender.com",
};

// API base path
const baseURL = `${is_Production ? server.production : server.dev}/api/v1/users`;
const SERVER_URL=`${is_Production ? server.production : server.dev}`;
export default baseURL;
