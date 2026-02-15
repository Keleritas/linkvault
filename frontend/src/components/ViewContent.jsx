import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Copy, Lock, Eye, Clock, FileText, Loader2, AlertCircle, Check } from 'lucide-react';
import { getContent, downloadFile } from '../utils/api';
import { copyToClipboard, formatFileSize, formatDate, getFileIcon } from '../utils/helpers';

const ViewContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async (pwd = null) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getContent(id, pwd);
      setContent(data);
      setRequiresPassword(false);
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.requiresPassword) {
        setRequiresPassword(true);
        setError('This content is password protected');
      } else if (err.response?.status === 410) {
        setError('This content has expired or been deleted');
      } else if (err.response?.status === 404) {
        setError('Content not found. The link may be invalid.');
      } else {
        setError(errorData?.error || 'Failed to load content');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password) {
      fetchContent(password);
    }
  };

  const handleCopy = async () => {
    if (content.type === 'text') {
      const success = await copyToClipboard(content.content);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownload = () => {
    const downloadUrl = downloadFile(id, requiresPassword ? password : null);
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Content Unavailable</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Protected Content</h2>
          <p className="text-slate-400 text-center mb-6">
            This content is password protected. Enter the password to view.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Unlock Content
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-glow mb-2">
            {content.type === 'text' ? 'Shared Text' : 'Shared File'}
          </h2>
          <p className="text-slate-400">
            View the content shared with you
          </p>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center text-sm text-slate-400 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              Created
            </div>
            <div className="text-white font-medium text-sm">
              {formatDate(content.createdAt)}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center text-sm text-slate-400 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              Expires
            </div>
            <div className="text-white font-medium text-sm">
              {formatDate(content.expiresAt)}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center text-sm text-slate-400 mb-1">
              <Eye className="w-4 h-4 mr-1" />
              Views
            </div>
            <div className="text-white font-medium text-sm">
              {content.viewCount}
            </div>
          </div>
        </div>

        {/* Content Display */}
        {content.type === 'text' ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Text Content
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                {content.content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              File Information
            </label>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">
                  {getFileIcon(content.mimeType)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {content.fileName}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {formatFileSize(content.fileSize)} • {content.mimeType}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            ← Create your own secure link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContent;