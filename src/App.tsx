import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ServiceDetails from './pages/service-details';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service-details" element={<ServiceDetails />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;