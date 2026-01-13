
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, ImageIcon, Sparkles, Download, RefreshCcw, User, Layout, 
  Palette, AlertCircle, Phone, Facebook, X, ZoomIn, Maximize2, 
  Terminal, Cpu, Wand2, Zap, Camera, Trash2
} from 'lucide-react';
import { CATEGORIES, PRESET_BACKGROUNDS } from './constants/presets';
import { PresetCategory, GenerationResult } from './types';
import { geminiService } from './services/geminiService';

const HACKER_LOGS = [
  "> [SYSTEM] INITIALIZING NEURAL ENGINE V3.2...",
  "> [DATA] ANALYZING SUBJECT GEOMETRY AND SCALE...",
  "> [MASK] GENERATING HIGH-PRECISION ALPHA CHANNEL...",
  "> [LIGHT] SYNCHRONIZING COLOR TEMPERATURE TO 5500K...",
  "> [RENDER] CALCULATING SOFT CONTACT SHADOWS...",
  "> [POST] APPLYING WHITE-TONE NEUTRAL GRADING...",
  "> [EDGE] REFINING SUB-PIXEL EDGE SMOOTHING...",
  "> [COMP] FINALIZING SPATIAL HARMONIZATION...",
  "> [SUCCESS] RENDER COMPLETED AT 100% FIDELITY."
];

const App: React.FC = () => {
  const [portrait, setPortrait] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('Ảnh Cưới');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [previewImage, setPreviewImage] = useState<GenerationResult | null>(null);

  const fileInputPortrait = useRef<HTMLInputElement>(null);
  const fileInputBg = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll hacker logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate progress when processing
  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      setProcessPercent(0);
      setLogs([]);
      let logIndex = 0;
      
      timer = setInterval(() => {
        setProcessPercent(p => {
          if (p >= 98) return 98;
          return p + Math.random() * 3;
        });

        if (Math.random() > 0.5 && logIndex < HACKER_LOGS.length) {
          setLogs(prev => [...prev, `${HACKER_LOGS[logIndex]}`]);
          logIndex++;
        }
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  const handleSuggestPrompt = async () => {
    if (isGeneratingPrompt) return;
    setIsGeneratingPrompt(true);
    try {
      const suggested = await geminiService.generateCreativePrompt(customPrompt);
      setCustomPrompt(suggested);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'portrait' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'portrait') setPortrait(reader.result as string);
        else setBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const imageUrlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((res) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result as string);
        r.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to load image from URL:", url);
      return url;
    }
  };

  const handleRender = async () => {
    if (!portrait || !background) {
      setError("Vui lòng tải ảnh nhân vật và lựa chọn bối cảnh phù hợp.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const bgBase64 = await imageUrlToBase64(background);
      const variations = [
        { key: 'natural', label: 'Tự Nhiên' },
        { key: 'cinematic', label: 'Điện Ảnh' },
        { key: 'studio', label: 'Studio' }
      ];

      const res = await Promise.all(variations.map(async (v, i) => {
        const url = await geminiService.blendImages(portrait, bgBase64, customPrompt, v.key);
        return { id: `${i}-${Date.now()}`, url, variation: v.label };
      }));

      setProcessPercent(100);
      setLogs(prev => [...prev, "> [OK] ALL RENDER TASKS COMPLETED SUCCESSFULLY."]);
      
      setTimeout(() => {
        setResults(res);
        setIsProcessing(false);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setError("Hệ thống AI đang quá tải hoặc gặp lỗi kết nối. Vui lòng thử lại sau.");
      setIsProcessing(false);
    }
  };

  const clearInputs = () => {
    setPortrait(null);
    setBackground(null);
    setResults([]);
    setCustomPrompt('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-gray-800 font-sans selection:bg-black selection:text-white antialiased">
      {/* Contact Modal */}
      {showContact && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/40 backdrop-blur-2xl animate-in fade-in duration-300" 
          onClick={() => setShowContact(false)}
        >
          <div 
            className="bg-white rounded-[48px] p-12 max-w-sm w-full border border-gray-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] relative" 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowContact(false)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Sparkles className="text-white w-10 h-10" />
              </div>
              <h3 className="text-3xl font-serif font-bold italic mb-2">GÀ SƠN HÀ</h3>
              <p className="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase mb-10">Premium Experience</p>
              <div className="space-y-4">
                <a href="tel:0376777258" className="flex items-center p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-all group">
                  <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Phone className="w-5 h-5 text-black" /></div>
                  <div className="ml-5 text-left"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hotline</p><p className="font-bold text-lg">0376777258</p></div>
                </a>
                <a href="https://www.facebook.com/lemtattoo/" target="_blank" rel="noopener noreferrer" className="flex items-center p-6 bg-blue-50/30 rounded-[32px] hover:bg-blue-50/50 transition-all group">
                  <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Facebook className="w-5 h-5 text-blue-600" /></div>
                  <div className="ml-5 text-left"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook</p><p className="font-bold text-blue-900 text-lg uppercase">GÀ SƠN HÀ</p></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in" 
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-6xl w-full flex flex-col items-center animate-in zoom-in-95 duration-500" 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setPreviewImage(null)} className="absolute -top-20 right-0 p-4 text-white/50 hover:text-white transition-all">
              <X className="w-10 h-10" />
            </button>
            <div className="bg-white p-3 rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center max-h-[90vh]">
              <img src={previewImage.url} className="max-h-[75vh] w-auto rounded-[32px] shadow-inner" alt="Render Preview" />
              <div className="w-full p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-3xl font-serif font-bold italic text-black">{previewImage.variation} Masterpiece</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100 uppercase tracking-widest">Hi-Fi Composite</span>
                    <p className="text-xs text-gray-400 font-medium">Rendered with Neural Blend v3.2</p>
                  </div>
                </div>
                <button 
                  onClick={() => { const l = document.createElement('a'); l.href = previewImage.url; l.download=`LEM_WEDDING_${previewImage.variation}.png`; l.click(); }} 
                  className="bg-black text-white px-12 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl flex items-center gap-3 active:scale-95 group"
                >
                  <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> TẢI ẢNH CHẤT LƯỢNG CAO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-100 px-10 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-[0.2em] text-black">LEM WEDDING</h1>
        </div>
        <div className="hidden md:flex space-x-12 text-[11px] font-bold tracking-[0.4em] uppercase text-gray-400">
          <span className="text-black border-b-2 border-black pb-1">AI Studio</span>
          <span className="hover:text-black cursor-pointer transition-colors" onClick={() => setShowContact(true)}>Services</span>
          <span className="hover:text-black cursor-pointer transition-colors" onClick={() => setShowContact(true)}>Contact</span>
        </div>
        <button 
          onClick={() => setShowContact(true)} 
          className="bg-black text-white px-10 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-all shadow-xl active:scale-95"
        >
          Liên Hệ
        </button>
      </header>

      <main className="max-w-[1440px] mx-auto w-full px-8 py-20 flex-grow">
        {/* Hero Section */}
        <div className="text-center mb-28 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-full shadow-sm">
             <Cpu className="w-4 h-4 text-gray-400" />
             <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold">Neural Harmonization Engine</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-10 italic">Vẻ Đẹp Ánh Sáng</h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-2xl font-light leading-relaxed">
            Hợp nhất nhân vật và không gian bằng thuật toán White-Tone độc bản, 
            mang đến sự tinh khiết và sang trọng tuyệt đối.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-5 space-y-12">
            {/* Subject Upload */}
            <section className="bg-white rounded-[56px] p-12 border border-gray-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] group transition-all">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-pink-50 rounded-3xl group-hover:rotate-6 transition-transform">
                    <User className="text-pink-500 w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif italic">Ảnh nhân vật</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Portrait subject</p>
                  </div>
                </div>
                {portrait && (
                  <button onClick={() => setPortrait(null)} className="p-3 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div 
                onClick={() => fileInputPortrait.current?.click()} 
                className={`relative cursor-pointer border-2 border-dashed rounded-[44px] flex items-center justify-center overflow-hidden transition-all duration-700 
                  ${portrait ? 'h-96 border-pink-100 shadow-2xl' : 'h-72 border-gray-100 bg-gray-50/20 hover:border-pink-200'}`}
              >
                {portrait ? (
                  <div className="w-full h-full relative group/img">
                    <img src={portrait} className="w-full h-full object-cover transition-transform duration-[2s] group-hover/img:scale-110" alt="Portrait" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-white/90 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                        <RefreshCcw className="w-4 h-4 text-black" />
                        <span className="text-[11px] font-bold text-black uppercase tracking-widest">Thay đổi ảnh</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 space-y-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Kéo thả hoặc bấm để tải lên</p>
                  </div>
                )}
                <input type="file" ref={fileInputPortrait} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'portrait')} />
              </div>
            </section>

            {/* Background & Prompt */}
            <section className="bg-white rounded-[56px] p-12 border border-gray-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] space-y-12">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-50 rounded-3xl">
                  <ImageIcon className="text-blue-500 w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-serif italic">Bối cảnh Studio</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Environment selection</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                  {CATEGORIES.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedCategory(c)} 
                      className={`px-8 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all 
                        ${selectedCategory === c ? 'bg-black text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {PRESET_BACKGROUNDS.filter(p => p.category === selectedCategory).map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setBackground(p.url)} 
                      className={`relative h-32 rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-500
                        ${background === p.url ? 'border-black ring-8 ring-black/5 shadow-2xl' : 'border-transparent opacity-60 hover:opacity-100 shadow-sm'}`}
                    >
                      <img src={p.url} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-125" alt={p.label} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-xl border border-white/20 text-[9px] font-bold text-white rounded-lg uppercase tracking-widest">
                        {p.label}
                      </span>
                    </div>
                  ))}
                  <div 
                    onClick={() => fileInputBg.current?.click()} 
                    className="rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50/20 cursor-pointer h-32 hover:bg-gray-100 transition-all group"
                  >
                    <Upload className="w-6 h-6 text-gray-200 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Tải bối cảnh riêng</span>
                    <input type="file" ref={fileInputBg} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'background')} />
                  </div>
                </div>
              </div>

              {/* Prompt Engine */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4"/> Ý tưởng sáng tạo
                  </label>
                  <button 
                    onClick={handleSuggestPrompt} 
                    disabled={isGeneratingPrompt} 
                    className="text-[11px] font-bold text-black flex items-center gap-2 hover:opacity-70 transition-all group active:scale-95 disabled:opacity-30"
                  >
                    {isGeneratingPrompt ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                    GỢI Ý BỞI AI
                  </button>
                </div>
                <textarea 
                  value={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  placeholder="Ví dụ: Ánh sáng trong vắt, tông màu trắng kem lãng mạn, chiều sâu trường ảnh mỏng..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[32px] p-8 text-base font-medium focus:border-black focus:ring-4 focus:ring-black/5 outline-none h-32 resize-none transition-all shadow-inner" 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={clearInputs}
                  className="px-8 py-6 rounded-[32px] bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleRender} 
                  disabled={isProcessing || !portrait || !background} 
                  className={`flex-grow py-6 rounded-[32px] flex items-center justify-center gap-4 font-bold tracking-[0.3em] transition-all shadow-2xl active:scale-95
                    ${isProcessing || !portrait || !background 
                      ? 'bg-gray-100 text-gray-300 shadow-none' 
                      : 'bg-black text-white hover:bg-gray-900 transform hover:-translate-y-1'}`}
                >
                  {isProcessing ? (
                    <><RefreshCcw className="w-6 h-6 animate-spin" /><span>ĐANG XỬ LÝ {Math.round(processPercent)}%</span></>
                  ) : (
                    <><Sparkles className="w-6 h-6" /><span>GHÉP ẢNH NGAY</span></>
                  )}
                </button>
              </div>
              {error && <p className="mt-6 text-sm text-red-500 font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top-4"><AlertCircle className="w-5 h-5" /> {error}</p>}
            </section>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7">
            {!isProcessing && results.length === 0 && (
              <div className="bg-white rounded-[80px] border border-gray-50 h-[900px] flex flex-col items-center justify-center text-center px-24 luxury-shadow relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none transition-transform duration-[20s] group-hover:scale-110">
                   <div className="absolute top-20 left-20 w-64 h-64 border-2 border-black rounded-full" />
                   <div className="absolute bottom-40 right-40 w-96 h-96 border-4 border-black rounded-full" />
                </div>
                <div className="p-16 bg-gray-50 rounded-full mb-12 shadow-inner group-hover:scale-110 transition-transform duration-700">
                   <Layout className="w-24 h-24 text-gray-200" />
                </div>
                <h3 className="text-4xl font-serif font-bold italic mb-6">Canvas Nghệ Thuật</h3>
                <p className="text-gray-300 font-light max-w-lg leading-loose text-xl">
                  Bắt đầu hành trình sáng tạo của bạn. Những tác phẩm render với tiêu chuẩn "White Tone" đẳng cấp sẽ xuất hiện tại đây.
                </p>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[11px] font-bold text-gray-200 tracking-[0.6em] uppercase">
                   <span>Input</span> <div className="w-16 h-px bg-gray-100" /> <span>Neural processing</span> <div className="w-16 h-px bg-gray-100" /> <span>Result</span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="bg-[#050505] rounded-[80px] h-[900px] flex flex-col p-16 relative overflow-hidden border border-white/5 shadow-2xl shadow-black/60">
                {/* Hacker Terminal UI */}
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="ml-6 text-green-500/40 font-mono text-[10px] uppercase tracking-[0.4em]">Neural Studio Terminal v3.2</span>
                    </div>
                    <div className="text-green-500 font-mono text-3xl tabular-nums drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{Math.round(processPercent)}%</div>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full h-1 bg-white/5 rounded-full mb-16 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.8)]" 
                      style={{ width: `${processPercent}%` }} 
                    />
                  </div>

                  {/* Log Screen */}
                  <div 
                    ref={logContainerRef} 
                    className="flex-grow bg-black/50 rounded-[40px] p-12 font-mono text-green-500/90 text-sm overflow-y-auto scrollbar-hide space-y-4 border border-white/5 backdrop-blur-md"
                  >
                    {logs.map((l, i) => (
                      <div key={i} className="flex gap-4 animate-in slide-in-from-left-4 duration-300">
                        <span className="text-green-900 select-none">studio@lem_ai:~$</span> 
                        <span className="drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">{l}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-5 bg-green-500 animate-pulse mt-1 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col items-center">
                    <Zap className="w-12 h-12 text-green-500/10 mb-5 animate-pulse" />
                    <p className="text-green-500/20 text-[10px] font-mono tracking-[0.6em] uppercase">Simulating Physically Based Lighting Integration...</p>
                  </div>
                </div>

                {/* Matrix Glow Effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden font-mono text-[9px] leading-none text-green-500 whitespace-nowrap">
                  {Array.from({length: 60}).map((_, i) => (
                    <div key={i} className="animate-pulse py-1" style={{ animationDelay: `${i * 150}ms`, opacity: Math.random() }}>
                       {Array.from({length: 80}).map(() => Math.random().toString(36).substring(2, 5)).join('  ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && !isProcessing && (
              <div className="space-y-16 animate-in fade-in slide-in-from-right-12 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-10 gap-8">
                  <div>
                    <h3 className="text-5xl font-serif font-bold italic tracking-tight text-black">Masterpiece Collection</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.5em] mt-5">Nhấn vào ảnh để xem chi tiết & tải về</p>
                  </div>
                  <button 
                    onClick={() => setResults([])} 
                    className="p-5 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 group"
                  >
                    <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {results.map(res => (
                    <div 
                      key={res.id} 
                      onClick={() => setPreviewImage(res)} 
                      className="group relative bg-white rounded-[56px] overflow-hidden luxury-shadow border border-gray-100 transition-all duration-700 hover:scale-[1.05] hover:-translate-y-4 cursor-pointer"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <img src={res.url} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-125" alt={res.variation} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px] space-y-6">
                          <div className="p-6 bg-white rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500">
                            <Maximize2 className="text-black w-8 h-8" />
                          </div>
                          <span className="text-white text-[11px] font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Xem Tuyệt Tác</span>
                        </div>
                        {/* Style Badge */}
                        <div className="absolute top-8 left-8">
                           <div className="px-5 py-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full">
                              <p className="text-[9px] font-bold text-white uppercase tracking-widest">{res.variation} Style</p>
                           </div>
                        </div>
                      </div>
                      <div className="p-8 bg-white border-t border-gray-50 flex items-center justify-between group-hover:bg-gray-50 transition-colors duration-500">
                        <div>
                          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] mb-1.5">Collection</p>
                          <h4 className="font-serif italic font-bold text-2xl text-black">Neural Blend</h4>
                        </div>
                        <div className="w-14 h-14 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:bg-black transition-all group-hover:rotate-12">
                          <ZoomIn className="w-6 h-6 text-gray-300 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Studio CTA */}
                <div className="p-16 bg-black text-white rounded-[72px] shadow-3xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.07] to-transparent pointer-events-none transition-opacity group-hover:opacity-20" />
                  <div className="relative z-10 text-center md:text-left">
                    <h4 className="text-4xl font-serif font-bold italic mb-3">Sẵn sàng in ấn?</h4>
                    <p className="text-white/40 text-[11px] font-bold tracking-[0.4em] uppercase">Nhận tư vấn hậu kỳ & in album từ các nghệ sĩ</p>
                  </div>
                  <button 
                    onClick={() => setShowContact(true)} 
                    className="relative z-10 bg-white text-black px-14 py-6 rounded-full font-bold tracking-[0.3em] uppercase hover:scale-105 transition-all active:scale-95 shadow-2xl flex items-center gap-4"
                  >
                    LIÊN HỆ STUDIO <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-50 py-32 px-12 mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="text-center md:text-left">
            <h5 className="font-serif font-bold text-3xl tracking-[0.3em] mb-6">LEM WEDDING</h5>
            <p className="text-sm font-serif italic text-gray-300 tracking-[0.2em]">© 2025 AI STUDIO EXPERIENCE | WHITE TONE COLLECTION</p>
            <p className="text-[10px] text-gray-200 mt-4 uppercase font-bold tracking-[0.5em]">Crafted with intelligence, designed for eternity</p>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-6">
            <p className="text-[13px] font-bold tracking-[0.6em] text-gray-400 uppercase">Thiết kế bởi GÀ SƠN HÀ</p>
            <div className="h-0.5 w-64 bg-gray-50 rounded-full" />
            <div className="flex gap-6 opacity-5">
               <div className="w-3 h-3 rounded-full bg-black"/>
               <div className="w-3 h-3 rounded-full bg-black"/>
               <div className="w-3 h-3 rounded-full bg-black"/>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
