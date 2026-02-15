import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import Login from "../components/Login";
import { Shield, Lock, Clock, Eye, Zap, Github } from 'lucide-react';
import UploadComponent from '../components/UploadComponent';
import SuccessModal from '../components/SuccessModal';

const Home = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthLoading(false);
    });
  return () => unsub();
  }, []);

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setUploadResult(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle" style={{
          width: '300px',
          height: '300px',
          top: '10%',
          left: '10%',
          animationDelay: '0s'
        }}></div>
        <div className="particle" style={{
          width: '200px',
          height: '200px',
          top: '60%',
          right: '15%',
          animationDelay: '5s'
        }}></div>
        <div className="particle" style={{
          width: '250px',
          height: '250px',
          bottom: '10%',
          left: '20%',
          animationDelay: '10s'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg glow-effect">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-glow">LinkVault</h1>
                  <p className="text-xs text-slate-400">Secure Sharing</p>
                </div>
              </div>
              
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
              >
                <Github className="w-5 h-5 text-slate-300" />
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-glow leading-tight">
                Share Content<br />
                <span className="animated-gradient bg-clip-text text-transparent">
                  Securely & Temporarily
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Upload text or files and generate secure, expiring links. Perfect for sharing sensitive information that shouldn't last forever.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Password Protected</h3>
                <p className="text-sm text-slate-400">
                  Add an extra layer of security with password protection
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Auto-Expiring</h3>
                <p className="text-sm text-slate-400">
                  Content automatically deletes after your chosen time
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">View Limits</h3>
                <p className="text-sm text-slate-400">
                  Set maximum views or one-time access for your content
                </p>
              </div>

              <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-slate-400">
                  Instant uploads and blazing-fast content delivery
                </p>
              </div>
            </div>

            {/* Upload Component / Login */}
            <div className="flex justify-center">
            {authLoading ? null : !user ? (
                <Login onLoginSuccess={() => {}} />
            ) : (
                <UploadComponent onUploadSuccess={handleUploadSuccess} />
            )}
            </div>


            {/* How It Works */}
            <div className="mt-16 glass-card p-8">
              <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Upload Content</h4>
                  <p className="text-sm text-slate-400">
                    Paste your text or upload any file type
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Get Secure Link</h4>
                  <p className="text-sm text-slate-400">
                    Receive a unique, hard-to-guess URL
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Share Safely</h4>
                  <p className="text-sm text-slate-400">
                    Content expires automatically after set time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center text-slate-400 text-sm">
              <p className="mb-2">
                Built with React, Node.js, and Express
              </p>
              <p>
                © {new Date().getFullYear()} LinkVault. Secure sharing made simple.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        uploadResult={uploadResult}
      />
    </div>
  );
};

export default Home;