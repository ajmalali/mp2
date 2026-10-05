import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout/Layout';
import SearchPage from './pages/SearchPage/SearchPage';
import GalleryPage from './pages/GalleryPage/GalleryPage';
import CharacterPage from './pages/CharacterPage/CharacterPage';
import EpisodePage from './pages/EpisodePage/EpisodePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/search" replace />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="character/:id" element={<CharacterPage />} />
        <Route path="episode/:id" element={<EpisodePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
