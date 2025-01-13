import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Aktif sayfayı kontrol etmek için

  // Check if the user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.logo}>FinancAli</div>
        <div style={styles.navLinks}>
          {isLoggedIn ? (
            <>
              <Link
                to="/"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/" ? styles.activeLink : {}),
                }}
              >
                Home
              </Link>
              <Link
                to="/wallet"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/wallet" ? styles.activeLink : {}),
                }}
              >
                Wallet
              </Link>
              <Link
                to="/about-us"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/about-us"
                    ? styles.activeLink
                    : {}),
                }}
              >
                About Us
              </Link>
              <Link
                to="/stocks"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/stocks" ? styles.activeLink : {}),
                }}
              >
                Stocks
              </Link>
              <Link
                to="/stock-advisor"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/stock-advisor"
                    ? styles.activeLink
                    : {}),
                }}
              >
                Stock Advisor
              </Link>
              <button onClick={handleLogout} style={styles.button}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/login" ? styles.activeLink : {}),
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  ...styles.link,
                  ...(location.pathname === "/register"
                    ? styles.activeLink
                    : {}),
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    width: "100%",
    padding: "px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#7a5fc0",
    textDecoration: "none",
    cursor: "pointer",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    textDecoration: "none",
    color: "#555",
    fontSize: "16px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  activeLink: {
    color: "#7a5fc0",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  button: {
    backgroundColor: "#7a5fc0",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default Navbar;
