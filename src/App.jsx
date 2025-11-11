// src/App.js
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import LandingPage from "./components/landingPage";
import "./App.css";
import SignIn from "./Auth/authentication";
import { AuthProvider } from "./constants/AuthContext";
import VideoMeet from "./components/VideoMeet";
import withAuth from "./constants/withAuth";

const ProtectedHome = withAuth(Home);
const ProtectedVideoMeet = withAuth(VideoMeet);

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<SignIn />} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedHome />} />
          <Route path="/:url" element={<ProtectedVideoMeet />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
