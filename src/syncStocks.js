const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 1) Strapi API URL
const STRAPI_BASE_URL = "http://localhost:1337/api/stocks";

// 2) Strapi API Key
const STRAPI_API_KEY = "2d22ce81c2ac2e30bf1eca09fc5e53271802ef94d9374425faa916ad543e778c837e08e42bd23306f05e7d74b0afd56c343b22f2d4df336ab76bda340e6bff60b70350d2b3758606aff02dd58f4b7a49695da661605c0a6b228e6cf4958b1b470be5a6e5bbb1e9934322a9bd6ed6b0a0006b536f7e0fb916e4ca41824826075f";

// 3) JSON Dosya Yolu
const STOCKS_JSON_PATH = path.join(__dirname, "stocks.json");

async function syncStocks() {
  try {
    // A) JSON dosyasını oku
    const rawData = fs.readFileSync(STOCKS_JSON_PATH, "utf-8");
    const stocksData = JSON.parse(rawData).data; // JSON'un 'data' anahtarını kullan

    // B) Her bir hisse için işleme başla
    for (const stock of stocksData) {
      try {
        // Strapi'den GET isteği
        const { data: getData } = await axios.get(STRAPI_BASE_URL, {
          params: { 
            "filters[Name][$eq]": stock.Name 
          },
          headers: {
            Authorization: `Bearer ${STRAPI_API_KEY}`,
          },
        });

        const existingRecords = getData.data;

        if (existingRecords.length > 0) {
          // Güncelleme işlemi (PUT)
          const existingRecord = existingRecords[0];
          const strapiId = existingRecord.id;

          const updateBody = {
            data: {
              ...stock,
              documentId: existingRecord.attributes.documentId || null,
            },
          };

          await axios.put(
            `${STRAPI_BASE_URL}/${strapiId}`,
            updateBody,
            {
              headers: { 
                Authorization: `Bearer ${STRAPI_API_KEY}`,
              },
            }
          );
          console.log(`UPDATED -> Name: ${stock.Name}, ID: ${strapiId}`);
        } else {
          // Yeni kayıt oluşturma (POST)
          const createBody = { data: { ...stock } };

          await axios.post(
            STRAPI_BASE_URL,
            createBody,
            {
              headers: {
                Authorization: `Bearer ${STRAPI_API_KEY}`,
              },
            }
          );
          console.log(`CREATED -> Name: ${stock.Name}`);
        }
      } catch (err) {
        console.error(`Hata oluştu (${stock.Name}):`, err.message);
      }
    }

    console.log("Tüm senkronizasyon işlemi tamamlandı!");
  } catch (error) {
    console.error("syncStocks fonksiyonunda hata oluştu:", error.message);
  }
}

syncStocks();