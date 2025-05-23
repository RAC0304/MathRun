// src/MateriPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./materi.css";

export default function MateriPage() {
  const { chapterIndex, levelIndex } = useParams();
  const navigate = useNavigate();

  const handleLanjut = () => {
    // Navigasi ke halaman Category daripada langsung ke game
    navigate('/category');
  };

  return (
    <div className="materi-page">
      <h1>Materi Pembelajaran</h1>
      <p>Ini adalah materi untuk Bab {parseInt(chapterIndex) + 1}, Level {parseInt(levelIndex) + 1}</p>
      <button onClick={handleLanjut}>Lanjut ke Game</button>
    </div>
  );
} 
