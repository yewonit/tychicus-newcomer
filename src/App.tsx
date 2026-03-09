import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootPage } from './pages/RootPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MainLayout } from './layouts/MainLayout';
import { RegisterPage } from './pages/RegisterPage';
import { UpdateRecentPage } from './pages/UpdateRecentPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/update-recent" element={<UpdateRecentPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

