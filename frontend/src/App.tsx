import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Импортируйте компоненты страниц (пока Hero будет на главной)
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import PopularWishes from './components/PopularWishes';
import CTA from './components/CTA';

import Community from './pages/Community';
import Wishlist from './pages/Wishlist';
import Campaign from './pages/Campaign';
import Profile from './pages/Profile';
import OAuthCallback from "./pages/OAuthCallback";
import WishDetails from './pages/WishDetails';
import PublicInfluencerWishlists from './pages/PublicInfluencerWishlists';

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <PopularWishes />
      <div className="my-8 text-center">
        <Link
          to="/influencer-wishlists"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg"
        >
          View Influencer Wishlists
        </Link>
      </div>
      <CTA />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
		  <Route path="/wishlist" element={<Wishlist />} />
		  <Route path="/community" element={<Community />} />
		  <Route path="/campaigns" element={<Campaign />} />
		  <Route path="/profile" element={<Profile />} />
		  <Route path="/oauth-callback" element={<OAuthCallback />} />
		  <Route path="/wishes/:wishId" element={<WishDetails />} />
		  <Route path="/influencer-wishlists" element={<PublicInfluencerWishlists />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
