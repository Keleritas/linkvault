import { useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isLogin) {
        // Firebase login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess({ 
          email: userCredential.user.email,
          uid: userCredential.user.uid 
        });
      } else {
        // Firebase signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess({ 
          email: userCredential.user.email,
          uid: userCredential.user.uid 
        });
      }
    } catch (err) {
      // Firebase error handling
      const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-credential': 'Invalid email or password',
      };
      
      setError(errorMessages[err.code] || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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

      {/* Login Card */}
      <div className="glass-card p-8 w-full max-w-md relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg glow-effect">
          {isLogin ? (
            <LogIn className="w-8 h-8 text-white" />
          ) : (
            <UserPlus className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-glow">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isLogin ? 'Sign in to access your LinkVault' : 'Sign up to start sharing securely'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="inline-block w-4 h-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Lock className="inline-block w-4 h-4 mr-1" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {/* Confirm Password Field (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline-block w-4 h-4 mr-1" />
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl glow-effect"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {isLogin ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </>
                )}
              </span>
            )}
          </button>
        </form>

        {/* Toggle Between Login/Signup */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            disabled={loading}
          >
            {isLogin ? (
              <>
                Don't have an account? <span className="font-semibold">Sign up</span>
              </>
            ) : (
              <>
                Already have an account? <span className="font-semibold">Sign in</span>
              </>
            )}
          </button>
        </div>

        {/* Forgot Password (Login Only) */}
        {isLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                // TODO: Implement forgot password
                console.log('Forgot password clicked');
              }}
              className="text-slate-400 hover:text-slate-300 transition-colors text-sm"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;