import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WalletPage.css";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [balanceInput, setBalanceInput] = useState("");
  const [userName, setUserName] = useState("");

  // Kredi kartı bilgileri
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const DOCUMENT_ID = "y8069ijv9ptnvmwe89pl7ikr";

  useEffect(() => {
    fetchWalletWithUser();
    fetchTransactionsAndStocks();
  }, []);

  const fetchWalletWithUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const walletResponse = await axios.get(
        `http://localhost:1337/api/wallets/${DOCUMENT_ID}?populate=users_permissions_user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const walletData = walletResponse.data.data;

      if (!walletData) {
        console.error("Cüzdan bulunamadı, documentId hatalı olabilir.");
        setWallet(null);
        setUserName("Kullanıcı bulunamadı");
      } else {
        setWallet(walletData);
        setBalanceInput(walletData.balance);

        const user = walletData.users_permissions_user;
        setUserName(user?.username || "Ad bilgisi yok");
      }
    } catch (error) {
      console.error("Cüzdan veya kullanıcı bilgisi alınırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsAndStocks = async () => {
    try {
      const token = localStorage.getItem("token");

      // Transactions çekiliyor
      const transactionsResponse = await axios.get(
        "http://localhost:1337/api/transactions?populate=stocks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const transactionsData = transactionsResponse.data.data;

      // Stocks çekiliyor
      const stocksResponse = await axios.get(
        "http://localhost:1337/api/stocks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const stocksData = stocksResponse.data.data;

      // Transactions ile Stocks eşleştirilerek detaylar hazırlanıyor
      const transactionDetails = transactionsData.map((transaction) => {
        const stockId = transaction.stocks?.[0]?.id;
        const matchingStock = stocksData.find((stock) => stock.id === stockId);

        return {
          transactionType: transaction.Type || "Bilinmiyor",
          transactionDate: transaction.date || "Tarih bilgisi yok",
          stockName: matchingStock?.Name || "Hisse bilgisi yok",
          stockPrice: matchingStock?.Price || "Fiyat bilgisi yok",
          totalPrice: transaction.TotalPrice || "Toplam fiyat bilgisi yok",
        };
      });

      setTransactionDetails(transactionDetails);
    } catch (error) {
      console.error("İşlem ve hisse verileri alınırken hata oluştu:", error);
    }
  };

  const handleBalanceUpdateWithCard = async () => {
    if (!wallet) {
      alert("Önce cüzdan verisi çekilmelidir.");
      return;
    }

    if (!cardNumber || !expiryDate || !cvv || !balanceInput) {
      alert("Tüm alanları doldurduğunuzdan emin olun.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Kredi kartı verilerini kaydet
      await axios.post(
        "http://localhost:1337/api/cards",
        {
          data: {
            CardNumber: cardNumber,
            ExpiryDate: expiryDate,
            CVV: parseInt(cvv),
            users_permissions_user: wallet.users_permissions_user?.id || 7,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cüzdan bakiyesini güncelle
      await axios.put(
        `http://localhost:1337/api/wallets/${DOCUMENT_ID}`,
        { data: { balance: Number(wallet.balance) + Number(balanceInput) } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Bakiye başarıyla güncellendi!");
      setWallet((prev) => ({
        ...prev,
        balance: Number(prev.balance) + Number(balanceInput),
      }));

      // Kart bilgilerini sıfırla
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setBalanceInput("");
    } catch (error) {
      console.error("Kredi kartı ile bakiye güncelleme sırasında hata oluştu:", error);
      alert("Bakiye güncellenirken bir hata oluştu.");
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="wallet-container">
      {wallet ? (
        <div>
          <h1>Kullanıcı: {userName}</h1>
          <p>Current Balance: ${wallet.balance}</p>

          <div className="wallet-content">
            <div className="balance-update">
              <label htmlFor="balanceInput">Kartınızdan Eklenecek Bakiye: </label>
              <input
                id="balanceInput"
                type="number"
                onChange={(e) => setBalanceInput(e.target.value)}
              />
              <button onClick={handleBalanceUpdateWithCard}>
                Kart ile Bakiye Güncelle
              </button>
            </div>

            <div className="card-info">
              <h3>Kredi Kartı Bilgileri</h3>
              <label htmlFor="cardNumber">Kart Numarası:</label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 1234 5678"
              />

              <label htmlFor="expiryDate">Son Kullanma Tarihi:</label>
              <input
                id="expiryDate"
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
              />

              <label htmlFor="cvv">CVV:</label>
              <input
                id="cvv"
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          <h3>İşlem Geçmişi</h3>
          <div className="transaction-container">
            {transactionDetails.length > 0 ? (
              transactionDetails.map((detail, index) => (
                <div className="transaction-card" key={index}>
                  <p><strong>Hisse:</strong> {detail.stockName}</p>
                  <p><strong>Fiyat:</strong> ${detail.stockPrice}</p>
                  <p><strong>İşlem Türü:</strong> {detail.transactionType}</p>
                  <p><strong>Toplam Fiyat:</strong> ${detail.totalPrice}</p>
                  <p><strong>Tarih:</strong> {detail.transactionDate}</p>
                </div>
              ))
            ) : (
              <p>İşlem geçmişi bulunmamaktadır.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Wallet bulunamadı.</p>
      )}
    </div>
  );
};

export default WalletPage;
