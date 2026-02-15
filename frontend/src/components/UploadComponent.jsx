import { useState } from 'react';
import { Upload, File, Type, Lock, Eye, Clock, Loader2, Check } from 'lucide-react';
import { uploadText, uploadFile } from '../utils/api';

const UploadComponent = ({ onUploadSuccess }) => {
  const [uploadType, setUploadType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [password, setPassword] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [oneTimeView, setOneTimeView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const options = {
        expiryMinutes: parseInt(expiryMinutes),
        password: password || null,
        maxViews: maxViews ? parseInt(maxViews) : null,
        oneTimeView
      };

      let result;
      if (uploadType === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter some text');
        }
        result = await uploadText(textContent, options);
      } else {
        if (!selectedFile) {
          throw new Error('Please select a file');
        }
        result = await uploadFile(selectedFile, options);
      }

      onUploadSuccess(result);
      
      // Reset form
      setTextContent('');
      setSelectedFile(null);
      setPassword('');
      setMaxViews('');
      setOneTimeView(false);
      setExpiryMinutes(10);
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-glow mb-2">Share Your Content</h2>
        <p className="text-slate-400">Upload text or files securely with expiring links</p>
      </div>

      {/* Upload Type Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setUploadType('text')}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            uploadType === 'text'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-300'
          }`}
        >
          <Type className="inline-block mr-2 w-5 h-5" />
          Text
        </button>
        <button
          onClick={() => setUploadType('file')}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            uploadType === 'file'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-300'
          }`}
        >
          <File className="inline-block mr-2 w-5 h-5" />
          File
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        {uploadType === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Text
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative"
          >
            <input
              type="file"
              id="file-input"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
            >
              {selectedFile ? (
                <div className="text-center">
                  <Check className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="text-lg font-medium text-white">{selectedFile.name}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Click to change file</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-lg font-medium text-white">Drop your file here</p>
                  <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                  <p className="text-xs text-slate-500 mt-2">Max size: 10MB</p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Basic Options */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Clock className="inline-block w-4 h-4 mr-1" />
              Expiry Time
            </label>
            <select
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="360">6 hours</option>
              <option value="720">12 hours</option>
              <option value="1440">24 hours</option>
              <option value="10080">7 days</option>
            </select>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline-block w-4 h-4 mr-1" />
                Password Protection (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Eye className="inline-block w-4 h-4 mr-1" />
                Maximum Views (Optional)
              </label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Leave empty for unlimited"
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="one-time"
                checked={oneTimeView}
                onChange={(e) => setOneTimeView(e.target.checked)}
                className="w-5 h-5 rounded bg-white/5 border-white/20"
                disabled={isLoading}
              />
              <label htmlFor="one-time" className="text-sm text-slate-300">
                Delete after first view (one-time link)
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (uploadType === 'text' && !textContent.trim()) || (uploadType === 'file' && !selectedFile)}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl glow-effect"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Upload className="w-5 h-5 mr-2" />
              Generate Secure Link
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadComponent;