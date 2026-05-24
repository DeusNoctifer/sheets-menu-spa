import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuPage } from './pages/MenuPage';
import { BuilderPage } from './pages/BuilderPage';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/builder" element={<BuilderPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}