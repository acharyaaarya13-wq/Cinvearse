// App.jsx — unchanged from Lesson 4/5

import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ChatPage from './components/HeroSection';
import MovieModal from './components/MovieModal';

function AppInner() {
  const { showModal } = useApp();
  return (
    <div className="app-root">
      <Navbar />
      <ChatPage />
      {showModal && <MovieModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
