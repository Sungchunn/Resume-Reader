import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AnalysisPage from './pages/AnalysisPage';
import PDFPage from './pages/PDFPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/pdf" element={<PDFPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
