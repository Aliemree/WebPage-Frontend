import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockAdvisorPage.css";

const StockAdvisorPage = () => {
  const [investmentTips, setInvestmentTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestmentTips();
  }, []);

  const fetchInvestmentTips = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:1337/api/investment-tips",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tips = response.data.data || [];
      setInvestmentTips(tips);
    } catch (error) {
      console.error("Yatırım önerilerini çekerken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (content) => {
    if (!Array.isArray(content)) return "No content available.";

    return content
      .flatMap((item) =>
        item.children
          ?.filter((child) => child.type === "text")
          ?.map((child) => child.text)
      )
      .join(" ");
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="stock-advisor-container">
      <h1>Stock Advisor</h1>
      <p>Below are some valuable investment tips to guide your decisions:</p>

      <div className="tips-container">
        {investmentTips.length > 0 ? (
          investmentTips.map((tip) => {
            const { Title, Content, Category } = tip || {};
            const parsedContent = parseContent(Content);

            return (
              <div className="tip-card" key={tip.id}>
                <h2>{Title || "Unnamed Tip"}</h2>
                <p><strong>Category:</strong> {Category || "Unknown"}</p>
                <p>{parsedContent}</p>
              </div>
            );
          })
        ) : (
          <p>No tips available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default StockAdvisorPage;
