import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";

const API = process.env.REACT_APP_API_URL;

const HomePage = () => {
  const [stocks, setStocks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const DOCUMENT_ID = "dqbahymad5r5wsynalii8acw";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Hisse senetlerini GET
      const stockResponse = await axios.get(
        `${API}/api/stocks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStocks(stockResponse.data.data || []);

      // Cüzdanı GET /wallets/:documentId
      const walletResponse = await axios.get(
        `${API}/api/wallets/${DOCUMENT_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const walletData = walletResponse.data.data;
      if (!walletData) {
        console.error("Cüzdan bulunamadı!");
      } else {
        setWallet(walletData);
      }
    } catch (error) {
      console.error("Veriler getirilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (type) => {
    if (!selectedStock || !wallet) {
      alert("Lütfen bir hisse seçin ve cüzdan yüklendiğinden emin olun.");
      return;
    }

    const token = localStorage.getItem("token");
    const totalPrice = selectedStock.Price * quantity;

    let updatedBalance;
    let postData;

    if (type === "buy") {
      if (wallet.balance < totalPrice) {
        alert("Yetersiz bakiye.Lütfen bakiyenizi kontrol edin.Wallet Ekranında Kartınızla İşlem Yapabilirsiniz.");
        return;
      }
      updatedBalance = wallet.balance - totalPrice;

      postData = {
        data: {
          Type: "buy ",
          TotalPrice: totalPrice,
          Quantity: quantity,
          user: wallet.users_permissions_user?.id || 7,
          stocks: [selectedStock.id],
          date: new Date().toISOString().split("T")[0],
          locale: "en",
        },
      };
    } else if (type === "sell") {
      updatedBalance = wallet.balance + totalPrice;

      postData = {
        data: {
          Type: "sell",
          TotalPrice: totalPrice,
          Quantity: quantity,
          user: wallet.users_permissions_user?.id || 7,
          stocks: [selectedStock.id],
          date: new Date().toISOString().split("T")[0],
          locale: "en",
        },
      };
    }

    try {
      await axios.put(
        `${API}/api/wallets/${DOCUMENT_ID}`,
        { data: { balance: updatedBalance } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await axios.post(
        `${API}/api/transactions`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setWallet({ ...wallet, balance: updatedBalance });

      alert(
        `${type === "buy" ? "Satın alındı" : "Satıldı"}: ${quantity} adet ${selectedStock.Name} için $${totalPrice}`
      );
    } catch (error) {
      console.error(
        `${type === "buy" ? "Satın alma" : "Satış"} işlemi sırasında hata oluştu:`,
        error.response?.data || error
      );
      alert(
        `${type === "buy" ? "Satın alma" : "Satış"} işlemi başarısız oldu. Konsolu kontrol edin.`
      );
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="stock-container">
      <div className="stocks-list">
        <h2>Hisse Senetleri</h2>
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className={`stock-item ${selectedStock?.id === stock.id ? "active" : ""}`}
            onClick={() => setSelectedStock(stock)}
          >
            <p className="stock-name">{stock.Name}</p>
            <p className="stock-symbol">Sembol: {stock.Symbol}</p>
          </div>
        ))}
      </div>

      <div className="stock-details">
        {selectedStock ? (
          <>
            <h2>{selectedStock.Name}</h2>
            <p>
              <strong>Sembol:</strong> {selectedStock.Symbol}
            </p>
            <p>
              <strong>Fiyat:</strong> ${selectedStock.Price}
            </p>
            <p>
              <strong>Değişim:</strong> {selectedStock.Change}%
            </p>

            <div className="quantity-selector">
              <label htmlFor="quantity">İşlem Adedi:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
              <p className="total-price">
                <strong>Toplam Tutar:</strong> ${(selectedStock.Price * quantity).toFixed(2)}
              </p>
            </div>

            <div className="actions">
              <button className="buy-btn" onClick={() => handleTransaction("buy")}>
                Satın Al
              </button>
              <button className="sell-btn" onClick={() => handleTransaction("sell")}>
                Sat
              </button>
            </div>
            <p>
              <strong>Cüzdan Bakiyesi:</strong> ${wallet?.balance}
            </p>
          </>
        ) : (
          <p>Bir hisse seçin.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;