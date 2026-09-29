import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft01Icon as ChevronLeft,
  InformationCircleIcon as InfoIcon,
  CheckmarkCircle02Icon as CheckIcon
} from 'hugeicons-react';
import { SEO } from './SeoComponent';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const navTabs = [
  { label: 'Disclaimer', path: '/disclaimer' },
  { label: 'Terms of Use', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Cookie Policy', path: '/cookie-policy' },
];

const LegalLayout = ({ title, subtitle, lastUpdated, children }: LegalLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <SEO
        title={`${title} - Legal & Transparency`}
        description={subtitle}
        type="website"
      />

      <div className="min-h-screen bg-black text-white px-4 py-8 md:px-8 md:py-12 max-w-4xl mx-auto selection:bg-accent/30">

        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn-glass-beveled anim-btn flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white/90 cursor-pointer"
            aria-label="Return to Home"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
            <span>Home</span>
          </button>

          <span className="badge-glass px-3 py-1 rounded-full text-[11px] font-semibold tabular-nums text-white/70">
            Updated: {lastUpdated}
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight text-white text-balance">
            {title}
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed text-pretty max-w-2xl">
            {subtitle}
          </p>
        </div>

        <div className="glass-debossed p-1.5 rounded-2xl flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'btn-beveled-solid'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-6 pb-20">
          {children}
        </div>
      </div>
    </>
  );
};

export const DisclaimerPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout
      title="Legal Disclaimer"
      subtitle={`Transparent disclosure regarding content indexing, external links, and safe harbor operation on ${appName}.`}
      lastUpdated={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    >

      <div className="p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex gap-4 items-start">
        <InfoIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-white/80 leading-relaxed text-pretty">
          <strong>Important Notice:</strong> {appName} operates strictly as an automated indexing service and media aggregator. We do not host, broadcast, or store media files on our infrastructure.
        </div>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          1. Content Hosting & Third-Party Indexing
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 text-pretty">
          <strong>{appName} does NOT host, upload, store, or transmit any video, audio, media, or other copyrighted materials on our servers.</strong> We operate strictly as an indexing service and search aggregator, linking to content hosted on third-party, independent platforms and cyberlockers.
        </p>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          All media displayed, streamed, or embedded on this website is provided by external domains. We do not exercise editorial, financial, or technical control over the content hosted on these external servers.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          2. DMCA & Copyright Infringement (Safe Harbor)
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 text-pretty">
          We strongly respect intellectual property rights. However, because {appName} does not host any media files, <strong>we cannot remove any content from the internet.</strong> If you believe your copyrighted material is being distributed without authorization, you must issue a Digital Millennium Copyright Act (DMCA) takedown notice directly to the third-party video host storing the file.
        </p>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          Removing a link on our website does not remove the file from the external server. If you are a copyright owner and wish to have links to your content removed from our index, please provide official verification of your copyright claim and we will blacklist the URL from our search results.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          3. External Embeds & Recommendations
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 text-pretty">
          Because we embed media players provided by third-party hosts, you may encounter advertisements, pop-ups, or redirects served within those external player frames. <strong>{appName} has zero control over third-party advertisements.</strong>
        </p>
        <div className="flex items-center gap-2 text-xs md:text-sm text-white/80 bg-white/[0.04] p-3.5 rounded-xl border border-white/5">
          <CheckIcon className="w-4 h-4 text-accent shrink-0" />
          <span>We strongly recommend using an ad-blocker (such as uBlock Origin) for a clean, secure browsing experience.</span>
        </div>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          4. Limitation of Liability
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          Under no circumstances shall {appName}, its developers, or its operators be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the website. You access and use this service entirely at your own risk.
        </p>
      </div>
    </LegalLayout>
  );
};

export const TermsPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout
      title="Terms of Use"
      subtitle={`The terms, conditions, and guidelines governing your access to and use of ${appName}.`}
      lastUpdated={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    >
      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          1. Acceptance of Terms
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          By accessing and using {appName}, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          2. User Conduct & Lawful Use
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 text-pretty">
          Our service acts strictly as an aggregator and indexer of media links. We expect all users to utilize this service responsibly:
        </p>
        <ul className="space-y-2 text-xs md:text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>You must be at least the age of majority in your jurisdiction to use this service.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>You are solely responsible for ensuring your consumption of media complies with copyright laws in your jurisdiction.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>You agree not to deploy automated scraping bots or perform denial-of-service attacks against our infrastructure.</span>
          </li>
        </ul>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          3. Disclaimer of Warranties
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          The materials on {appName} are provided on an 'as is' basis. We make no warranties, expressed or implied, regarding uptime, availability, accuracy, or uninterrupted service.
        </p>
      </div>
    </LegalLayout>
  );
};

export const PrivacyPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`Our zero-tracking philosophy: no accounts, no telemetry, and complete local privacy.`}
      lastUpdated={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    >
      <div className="p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex gap-4 items-start">
        <CheckIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-white/80 leading-relaxed text-pretty">
          <strong>Zero Server Data:</strong> We do not ask for personal information, require user accounts, or store personal browsing data on our servers.
        </div>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          1. Information We Collect (Or Rather, Don't)
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          We do not collect names, email addresses, passwords, or personal identifying information (PII). All personal preferences (such as your Continue Watching list, bookmarks, or theme choices) are stored strictly inside <strong>your own browser's Local Storage</strong> and never leave your device.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          2. Server Logs & Edge Protection
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          Like all web servers, standard edge hosting providers (such as Cloudflare or Vercel) log incoming HTTP requests (IP address, browser user-agent, timestamp) strictly for DDoS mitigation, load balancing, and network security.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          3. Embedded Third-Party Players
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          When playing embedded video content, the third-party player provider may log your IP address and set cookies in accordance with their independent privacy policy. We recommend using privacy-protecting browser extensions.
        </p>
      </div>
    </LegalLayout>
  );
};

export const CookiePolicyPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle={`How ${appName} utilizes lightweight Local Storage instead of third-party tracking cookies.`}
      lastUpdated={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    >
      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          1. What Are Cookies & Local Storage?
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          Cookies are small text files stored on your device by websites. Modern web applications also use <strong>HTML5 Local Storage</strong>, which stores data on your computer without sending it over the network with every request.
        </p>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          2. How {appName} Uses Local Storage
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4 text-pretty">
          {appName} does <strong>not</strong> set tracking or marketing cookies. We use HTML5 Local Storage strictly for client-side state:
        </p>
        <ul className="space-y-2 text-xs md:text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span><strong>Continue Watching:</strong> Remembering what episode or movie you watched and your progress.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span><strong>Watchlist:</strong> Storing the movies and TV shows you have bookmarked.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span><strong>Search History:</strong> Keeping your recent searches accessible for fast navigation.</span>
          </li>
        </ul>
      </div>

      <div className="glass-debossed p-6 md:p-8 rounded-2xl">
        <h2 className="text-base md:text-lg font-bold text-white mb-3">
          3. Managing Your Preferences
        </h2>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed text-pretty">
          You can clear your stored data at any time directly through your browser's site settings or privacy options by clearing cookies and site data for this domain.
        </p>
      </div>
    </LegalLayout>
  );
};
