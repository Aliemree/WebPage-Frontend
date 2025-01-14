import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutUs.css'; 

const API = process.env.REACT_APP_API_URL;

const AboutUs = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    
    axios
      .get(`${API}/api/about-uses?populate=*`) 
      .then((response) => {
        setData(response.data.data || []); 
      })
      .catch((error) => {
        console.error('Error fetching About Us data:', error); 
      });
  }, []);

  if (!data || data.length === 0) {
    return <div className="loading">Hiçbir veri bulunamadı.</div>; 
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
          {/* Oluşturulma Tarihi */}
          <p className="created-at">Oluşturulma Tarihi: {item.createdAt}</p>
        </div>
      ))}
    </div>
  );
};

export default AboutUs;
