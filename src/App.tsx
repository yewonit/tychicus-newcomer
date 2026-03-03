import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootPage } from './pages/RootPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 로그인 후 사이드바가 포함된 메인 레이아웃 */}
        <Route element={<MainLayout />}>
          {/* TODO: 새가족 등록 페이지 컴포넌트 연결 */}
          <Route path="/register" element={<PlaceholderPage title="새가족 등록" />} />
          {/* TODO: 최근 새가족 정보 수정 페이지 컴포넌트 연결 */}
          <Route path="/update-recent" element={<PlaceholderPage title="최근 새가족 정보 수정" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

/** 실제 페이지가 구현되기 전까지 사용할 임시 컴포넌트 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-lg font-medium text-gray-400">{title}</p>
    </div>
  );
}

export default App;

