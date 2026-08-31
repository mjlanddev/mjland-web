import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft01Icon as ChevronLeft } from 'hugeicons-react';

const LegalLayout = ({ title, lastUpdated, children }: { title: string, lastUpdated: string, children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-white px-6 py-12 md:px-12 max-w-4xl mx-auto selection:bg-accent/30">
      <button 
        onClick={() => navigate('/')}
        className="btn-glass-beveled flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold hover:text-white mb-10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>
      
      <div className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">{title}</h1>
        <p className="text-accent text-sm font-semibold uppercase tracking-wider">Effective Date: {lastUpdated}</p>
      </div>
      
      <div className="prose prose-invert max-w-none text-[#8f98b0] 
        prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-3
        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
        prose-p:leading-loose prose-p:mb-6
        prose-strong:text-white
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:mb-2 prose-li:leading-relaxed"
      >
        {children}
      </div>
    </div>
  );
};

export const DisclaimerPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout title="Legal Disclaimer" lastUpdated={new Date().toLocaleDateString()}>
      <p>
        The following Legal Disclaimer governs your use of the {appName} website and its associated services. By accessing our website, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
      </p>

      <h2>1. Content Hosting & Third-Party Indexing</h2>
      <p>
        <strong>{appName} does NOT host, upload, store, or transmit any video, audio, media, or other copyrighted materials on our servers.</strong> We operate strictly as an indexing service and search engine, aggregating publicly available links to content hosted on third-party, non-affiliated platforms and cyberlockers.
      </p>
      <p>
        All media displayed, streamed, or embedded on this website is provided by external domains. We do not exercise any editorial or technical control over the content hosted on these external servers, and we do not monitor them for copyright infringement.
      </p>

      <h2>2. DMCA & Copyright Infringement (Safe Harbor)</h2>
      <p>
        We strongly respect the intellectual property rights of others. However, because {appName} does not host any media files, <strong>we cannot remove any content from the internet.</strong> If you believe your copyrighted material is being distributed, you must issue a Digital Millennium Copyright Act (DMCA) takedown notice directly to the third-party video host (the server actually storing the file). 
      </p>
      <p>
        Removing a link on our website will not remove the infringing file from the underlying server. If you are a copyright owner and wish to have links to your content removed from our index, please contact us with official verification of your copyright claim, and we will blacklist the URL from our search results.
      </p>

      <h2>3. Advertisements & Intrusive Media</h2>
      <p>
        Because we embed media players provided by third-party hosts, you may encounter advertisements, pop-ups, or redirects embedded within those external players. <strong>{appName} has zero control over these third-party advertisements.</strong> 
      </p>
      <p>
        We highly recommend utilizing a robust adblocker (such as uBlock Origin) when browsing the internet to ensure a safe, uninterrupted viewing experience. We hold no liability for any malicious software, intrusive ads, or damages resulting from interaction with third-party video players.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        Under no circumstances shall {appName}, its administrators, or its operators be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the website. You access and use this service entirely at your own risk.
      </p>
    </LegalLayout>
  );
};

export const TermsPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout title="Terms of Use" lastUpdated={new Date().toLocaleDateString()}>
      <p>
        Welcome to {appName}. These Terms of Use govern your access to and use of our website. By continuing to use the service, you agree to comply with all applicable terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing the website at {appName}, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>

      <h2>2. User Conduct & Legal Compliance</h2>
      <p>
        Our service acts strictly as an aggregator and indexer of media links. We expect all users to utilize this service lawfully. 
      </p>
      <ul>
        <li>You must be at least the age of majority in your jurisdiction to use this service.</li>
        <li>You are solely responsible for ensuring that your consumption of indexed media complies with the copyright laws of your country.</li>
        <li>You agree not to use automated scraping bots, perform denial-of-service attacks, or otherwise disrupt the website's infrastructure.</li>
      </ul>

      <h2>3. Disclaimer of Warranties</h2>
      <p>
        The materials on {appName}'s website are provided on an 'as is' basis. {appName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
      </p>

      <h2>4. Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in accordance with standard international law, and you irrevocably submit to the exclusive jurisdiction of the courts in your region regarding any disputes.
      </p>
    </LegalLayout>
  );
};

export const PrivacyPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={new Date().toLocaleDateString()}>
      <p>
        Your privacy is critically important to us. At {appName}, we have a few fundamental principles: we don't ask you for personal information, and we don't store your data on our servers.
      </p>

      <h2>1. Information We Collect (Or Rather, Don't)</h2>
      <p>
        We do not require user accounts, emails, or personal identifying information (PII) to use our platform. All data regarding your usage (such as your "Continue Watching" list or theme preferences) is stored entirely in <strong>your browser's Local Storage</strong>. This data never touches our servers.
      </p>

      <h2>2. Server Logs</h2>
      <p>
        Like most website operators, our hosting providers may collect non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. This is strictly for security and anti-DDoS purposes.
      </p>

      <h2>3. Third-Party Embeds & Services</h2>
      <p>
        {appName} embeds video players from third-party hosting providers. When you load a page containing an embedded player, or click play, that third-party provider may:
      </p>
      <ul>
        <li>Log your IP address.</li>
        <li>Set tracking cookies in your browser.</li>
        <li>Serve targeted advertisements.</li>
      </ul>
      <p>
        We do not control the privacy practices of these third-party services. We recommend reviewing their respective privacy policies and utilizing privacy-protecting browser extensions.
      </p>

      <h2>4. Security</h2>
      <p>
        We take all reasonable measures to protect our infrastructure against unauthorized access, use, alteration, or destruction. We utilize SSL encryption for all traffic to ensure your connection to {appName} remains private.
      </p>
    </LegalLayout>
  );
};

export const CookiePolicyPage = () => {
  const appName = import.meta.env.VITE_APP_NAME || 'mjland';
  return (
    <LegalLayout title="Cookie Policy" lastUpdated={new Date().toLocaleDateString()}>
      <p>
        This Cookie Policy explains what cookies are and how we use them on {appName}.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. Alternatively, modern browsers use a technology called <em>Local Storage</em>, which functions similarly but does not send data back to the server with every request.
      </p>

      <h2>2. How We Use Local Storage</h2>
      <p>
        {appName} aims to be as lightweight and privacy-respecting as possible. We do <strong>not</strong> use traditional tracking cookies. Instead, we use HTML5 Local Storage strictly for essential, functional purposes:
      </p>
      <ul>
        <li><strong>Preferences:</strong> Saving whether you have dismissed our Cookie Consent banner.</li>
        <li><strong>Application State:</strong> Saving your "Continue Watching" progress, your recently searched items, and your favorite bookmarks locally on your device.</li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>
        While we do not set tracking cookies, the third-party video players embedded on our watch pages absolutely do. When you interact with a third-party embedded video, that provider may place cookies on your device to track your session, deliver advertisements, or gather analytics. 
      </p>
      <p>
        {appName} has no access to or control over these cookies. You must manage them via your browser settings or ad-blocking extensions.
      </p>

      <h2>4. Managing Your Preferences</h2>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. You can also clear your browser's Local Storage at any time by clearing your site data. Note that doing so will reset your "Continue Watching" progress on {appName}.
      </p>
    </LegalLayout>
  );
};
