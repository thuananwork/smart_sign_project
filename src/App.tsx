// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import SignaturePage from "./pages/SignaturePage/SignaturePage";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signature" element={<SignaturePage />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
};

export default App;
