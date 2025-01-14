import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StocksPage.css";


const API = process.env.REACT_APP_API_URL;

const StocksPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const stocksPerPage = 15; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/api/stocks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allStocks = response.data.data || [];
        setStocks(allStocks);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        setError(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stocks.length) {
    return <div>No stocks available.</div>;
  }

  // Sayfa başına gösterilecek verileri hesapla
  const indexOfLastStock = currentPage * stocksPerPage;
  const indexOfFirstStock = indexOfLastStock - stocksPerPage;
  const currentStocks = stocks.slice(indexOfFirstStock, indexOfLastStock);

  // Sayfa sayısı
  const totalPages = Math.ceil(stocks.length / stocksPerPage);

  return (
    <div className="stocks-container">
      <h1>Stocks Page</h1>
      <h2>All Stocks</h2>
      <div className="stocks-grid">
        {currentStocks.map((stock, index) => (
          <div className="stock-card" key={index}>
            <h3>{stock.Name || "Unknown Name"}</h3>
            <p>Symbol: {stock.Symbol || "N/A"}</p>
            <p>Price: ${stock.Price || "N/A"}</p>
            <p>Change: {stock.Change || 0}%</p>

            {stock.isPopular && (
              <p className="is-popular">This stock is popular!</p>
            )}

            {stock.HistoricalData && (
              <div className="historical-data">
                <strong>Historical Data:</strong>
                {Object.entries(stock.HistoricalData).map(([date, details]) => (
                  <span key={date}>
                    {date} - Price: {details.price || "N/A"}, Volume: {details.volume || "N/A"}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sayfa geçiş düğmeleri */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StocksPage;
