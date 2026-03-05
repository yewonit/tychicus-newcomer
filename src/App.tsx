import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootPage } from './pages/RootPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MainLayout } from './layouts/MainLayout';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          {/* TODO: 최근 새가족 정보 수정 페이지 컴포넌트 연결 */}
          <Route path="/update-recent" element={<PlaceholderPage title="최근 새가족 정보 수정" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-lg font-medium text-gray-400">{title}</p>
    </div>
  );
}

export default App;

