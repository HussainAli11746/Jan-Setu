import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import ChatInterface from './components/Chat/ChatInterface';
import SchemeList from './components/Schemes/SchemeList';
import ApplicationTracker from './components/Application/ApplicationTracker';
import About from './pages/About';

function App() {
  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#FAFAF8' }}>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/"                       element={<ChatInterface />} />
          <Route path="/schemes"                element={<SchemeList />} />
          <Route path="/track/:applicationId"   element={
            <div className="p-6 max-w-lg mx-auto">
              <ApplicationTracker />
            </div>
          } />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1C1917',
            color: '#FAFAF8',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '10px 16px',
          },
          success: { iconTheme: { primary: '#0A6B3C', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

export default App;
