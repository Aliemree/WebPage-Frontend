import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";
import AboutUs from "./pages/AboutUs";
import StocksPage from "./pages/StocksPage";
import StockAdvisorPage from "./pages/StockAdvisorPage";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Kullanıcı giriş yapmış mı kontrol eden bir PrivateRoute fonksiyonu
const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <PrivateRoute>
              <WalletPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/about-us"
          element={
            <PrivateRoute>
              <AboutUs />
            </PrivateRoute>
          }
        />
        <Route
          path="/stocks"
          element={
            <PrivateRoute>
              <StocksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/stock-advisor"
          element={
            <PrivateRoute>
              <StockAdvisorPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;