import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { generateCodeVerifier, generateCodeChallenge } from './utils/pkce';

import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import PopularWishes from './components/PopularWishes';
import CTA from './components/CTA';

import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext';

import Community from './pages/Community';
import Wishlist from './pages/Wishlist';
import Campaign from './pages/Campaign';
import Profile from './pages/Profile';
import OAuthCallback from "./pages/OAuthCallback";
import WishDetails from './pages/WishDetails';
import PublicInfluencerWishlists from './pages/PublicInfluencerWishlists';

import * as VKID from '@vkid/sdk';
import { VK_CLIENT_ID, VK_REDIRECT_URI } from './config';

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
          Посмотреть желания блогеров
        </Link>
      </div>
      <CTA />
    </>
  );
}

function App() {

  useEffect(() => {
    (async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      localStorage.setItem("vk_code_verifier", verifier);

      console.log('VK_CLIENT_ID:', VK_CLIENT_ID);


      VKID.Config.set({
        app_id: VK_CLIENT_ID,
        redirect_uri: VK_REDIRECT_URI,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });
    })();
  }, []);

  return (
    <AuthModalProvider>
      <Router>
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
      </Router>
    </AuthModalProvider>
  );
}

export default App;
