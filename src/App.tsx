import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { GithubPopup } from './components/GithubPopup';
import { CookiePopup } from './components/CookiePopup';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SplashScreen } from './components/SplashScreen';
import { Toast } from './components/Toast';

const HomePage = lazy(() => import('./components/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./components/SearchPage').then(m => ({ default: m.SearchPage })));
const MovieDetails = lazy(() => import('./components/MovieDetails').then(m => ({ default: m.MovieDetails })));
const StudioDetails = lazy(() => import('./components/StudioDetails').then(m => ({ default: m.StudioDetails })));
const NetworkDetails = lazy(() => import('./components/NetworkDetails').then(m => ({ default: m.NetworkDetails })));
const LanguageDetails = lazy(() => import('./components/LanguageDetails').then(m => ({ default: m.LanguageDetails })));
const GenreDetails = lazy(() => import('./components/GenreDetails').then(m => ({ default: m.GenreDetails })));
const PersonDetails = lazy(() => import('./components/PersonDetails').then(m => ({ default: m.PersonDetails })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MoviesPage = lazy(() => import('./components/MoviesPage').then(m => ({ default: m.MoviesPage })));
const TVPage = lazy(() => import('./components/TVPage').then(m => ({ default: m.TVPage })));
const GenresPage = lazy(() => import('./components/GenresPage').then(m => ({ default: m.GenresPage })));
const LanguagesPage = lazy(() => import('./components/LanguagesPage').then(m => ({ default: m.LanguagesPage })));
const RandomPage = lazy(() => import('./components/RandomPage').then(m => ({ default: m.RandomPage })));
const WatchPage = lazy(() => import('./components/WatchPage').then(m => ({ default: m.WatchPage })));
const DisclaimerPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.DisclaimerPage })));
const TermsPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.PrivacyPage })));
const CookiePolicyPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.CookiePolicyPage })));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export default function App() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <Toast />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className={`min-h-screen bg-black text-white selection:bg-accent/30 flex justify-center relative ${isWatchPage ? '' : 'pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-0'}`}>
        <ScrollToTop />
        <div className="max-w-[2000px] w-full flex relative z-10">
          {!isWatchPage && <Sidebar />}

          <main className={isWatchPage ? 'w-full h-screen' : 'flex-1 w-full min-w-0 md:pr-6 md:pl-2'}>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie" element={<MoviesPage />} />
                <Route path="/tv" element={<TVPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/watch/:type/:id" element={<WatchPage />} />
                <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />
                <Route path="/:type/:id" element={<MovieDetails />} />
                <Route path="/studio/:id" element={<StudioDetails />} />
                <Route path="/network/:id" element={<NetworkDetails />} />
                <Route path="/language/:code" element={<LanguageDetails />} />
                <Route path="/languages" element={<LanguagesPage />} />
                <Route path="/genre/:id" element={<GenreDetails />} />
                <Route path="/genres" element={<GenresPage />} />
                <Route path="/person/:id" element={<PersonDetails />} />
                <Route path="/random" element={<RandomPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              </Routes>
            </Suspense>
            {!isWatchPage && <Footer />}
            <GithubPopup />
            <CookiePopup />
          </main>
        </div>

        {!isWatchPage && <MobileNav />}
      </div>
    </>
  );
}
