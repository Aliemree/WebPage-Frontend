import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutUs.css'; // CSS dosyasını import ediyoruz

const AboutUs = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:1337/api/about-uses?populate=*') // API'yi çağırıyoruz
      .then((response) => {
        setData(response.data.data || []); // Gelen veriyi kontrol edip state'e set ediyoruz
      })
      .catch((error) => {
        console.error('Error fetching About Us data:', error); // Hataları konsola yazdırıyoruz
      });
  }, []);

  if (!data || data.length === 0) {
    return <div className="loading">Hiçbir veri bulunamadı.</div>; // Eğer veri yoksa
  }

  return (
    <div className="about-us-container">
      {data.map((item) => (
        <div key={item.id} className="about-us-item">
          {/* Başlık */}
          <h1 className="about-us-title">
            {item.Title || 'Başlık Bulunamadı'}
          </h1>

          {/* Açıklama */}
          <div className="about-us-description">
            {item.Description && Array.isArray(item.Description)
              ? item.Description.map((paragraph, index) => (
                  <div key={index} className="description-paragraph">
                    {paragraph.children &&
                      paragraph.children.map((child, childIndex) => (
                        <span key={childIndex}>{child.text}</span>
                      ))}
                  </div>
                ))
              : 'Açıklama Eklenmemiş.'}
          </div>

          {/* Görsel Gösterimi */}
          {item.Image?.data && item.Image.data.length > 0 ? (
            <img
              src={`http://localhost:1337${item.Image.data[0].attributes.url}`}
              alt={item.Title || 'Görsel'}
              className="about-us-image"
            />
          ) : (
            <p className="no-image">Resim Bulunamadı.</p>
          )}

          {/* Oluşturulma Tarihi */}
          <p className="created-at">Oluşturulma Tarihi: {item.createdAt}</p>
        </div>
      ))}
    </div>
  );
};

export default AboutUs;
