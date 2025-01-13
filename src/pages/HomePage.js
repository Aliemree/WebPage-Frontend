import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
  const [stocks, setStocks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);

  const DOCUMENT_ID = "y8069ijv9ptnvmwe89pl7ikr";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Hisse senetlerini GET
      const stockResponse = await axios.get(
        "http://localhost:1337/api/stocks",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStocks(stockResponse.data.data || []);

      // Cüzdanı GET /wallets/:documentId
      const walletResponse = await axios.get(
        `http://localhost:1337/api/wallets/${DOCUMENT_ID}`,
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
    const quantity = 1; // İşlem miktarı
    const totalPrice = selectedStock.Price * quantity;

    let updatedBalance;
    let postData;

    // İşlem türüne göre farklı bakiye hesaplama ve postData oluşturma
    if (type === "buy") {
      if (wallet.balance < totalPrice) {
        alert("Yetersiz bakiye.Lütfen bakiyenizi kontrol edin.Wallet Ekranında Kartınızla İşlem Yapabilirsiniz.");
        return;
      }
      updatedBalance = wallet.balance - totalPrice;

      postData = {
        data: {
          Type: "buy ", // "buy" işlem tipi (sonunda boşluk var)
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
          Type: "sell", // "sell" işlem tipi
          TotalPrice: totalPrice,
          Quantity: quantity,
          user: wallet.users_permissions_user?.id || 7,
          stocks: [selectedStock.id],
          date: new Date().toISOString().split("T")[0],
          locale: "en",
        },
      };
    } else {
      alert("Geçersiz işlem türü!");
      return;
    }

    try {
      // 1) PUT /wallets/:documentId -> Bakiyeyi güncelle
      await axios.put(
        `http://localhost:1337/api/wallets/${DOCUMENT_ID}`,
        { data: { balance: updatedBalance } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 2) POST /transactions -> İşlem kaydı ekle
      await axios.post(
        "http://localhost:1337/api/transactions",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Lokal state güncelle
      setWallet({ ...wallet, balance: updatedBalance });

      alert(
        `${
          type === "buy" ? "Satın alındı" : "Satıldı"
        }: ${quantity} adet ${selectedStock.Name} için $${totalPrice}`
      );
    } catch (error) {
      console.error(
        `${
          type === "buy" ? "Satın alma" : "Satış"
        } işlemi sırasında hata oluştu:`,
        error.response?.data || error
      );
      alert(
        `${
          type === "buy" ? "Satın alma" : "Satış"
        } işlemi başarısız oldu. Konsolu kontrol edin.`
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
            className={`stock-item ${
              selectedStock?.id === stock.id ? "active" : ""
            }`}
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
            <div className="actions">
              <button
                className="buy-btn"
                onClick={() => handleTransaction("buy")}
              >
                Satın Al
              </button>
              <button
                className="sell-btn"
                onClick={() => handleTransaction("sell")}
              >
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