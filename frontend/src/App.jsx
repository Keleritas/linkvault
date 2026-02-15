import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ViewContent from './components/ViewContent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/share/:id" element={<ViewContent />} />
      </Routes>
    </Router>
  );
}

export default App;