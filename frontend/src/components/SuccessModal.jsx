import { useState } from 'react';
import { X, Copy, Check, Share2, Clock } from 'lucide-react';
import { copyToClipboard, formatRelativeTime } from '../utils/helpers';

const SuccessModal = ({ isOpen, onClose, uploadResult }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !uploadResult) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(uploadResult.shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'LinkVault Share',
        text: 'Check out what I shared on LinkVault',
        url: uploadResult.shareUrl,
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card p-8 w-full max-w-lg relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
          <Check className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center mb-2 text-glow">
          Content Uploaded Successfully!
        </h3>
        <p className="text-center text-slate-400 mb-6">
          Share this link with anyone you want
        </p>

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Share Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={uploadResult.shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Type</span>
              <span className="text-white font-medium capitalize">{uploadResult.type}</span>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Expires In
              </span>
              <span className="text-white font-medium">
                {formatRelativeTime(uploadResult.expiresAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10"
            >
              <Share2 className="w-5 h-5 inline-block mr-2" />
              Share
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Upload Another
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-xs text-yellow-400 text-center">
            ⚠️ Save this link! Once you close this window, you won't be able to retrieve it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;