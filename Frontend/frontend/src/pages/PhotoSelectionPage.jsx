import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/layout/Background';
import Navbar from '../components/layout/Navbar';
import { uploadPhotos } from '../api/auth';

export default function PhotoSelectionPage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      setErrMsg("Maximum 5 photos allowed.");
      return;
    }
    setFiles([...files, ...selected]);
    const newPreviews = selected.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleUpload = async () => {
    if (files.length < 3) {
      setErrMsg("Please upload at least 3 photos.");
      return;
    }
    setStatus('loading');
    const formData = new FormData();
    files.forEach(file => formData.append('uploaded_images', file));

    try {
      await uploadPhotos(formData);
      navigate('/discover');
    } catch (err) {
      setStatus('error');
      setErrMsg("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans text-text-dark">
      <Background />
      <Navbar />
      <main className="relative z-10 max-w-[540px] mx-auto px-6 pt-12">
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-semibold mb-3 text-text-dark">Show your setup 📸</h1>
          <p className="text-text-soft text-[15px]">At least 3 photos required to launch your profile.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {previews.map((url, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-lavender-100 shadow-sm bg-white">
              <img src={url} className="w-full h-full object-cover" />
            </div>
          ))}
          {files.length < 5 && (
            <label className="aspect-[3/4] flex items-center justify-center rounded-2xl border-2 border-dashed border-lavender-200 bg-white/50 cursor-pointer hover:bg-lavender-50 transition-all">
              <span className="text-2xl text-lavender-400">+</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {errMsg && <p className="text-red-500 font-mono text-xs mb-4">{errMsg}</p>}

        <button
          onClick={handleUpload}
          disabled={status === 'loading' || files.length < 3}
          className="w-full py-[18px] rounded-2xl font-medium text-white shadow-lg"
          style={{ 
            background: files.length < 3 ? '#cbd5e1' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            cursor: files.length < 3 ? 'not-allowed' : 'pointer'
          }}
        >
          {status === 'loading' ? 'Uploading...' : 'Launch Findev 🚀'}
        </button>
      </main>
    </div>
  );
}