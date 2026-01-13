
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Upload, ImageIcon, Sparkles, Download, RefreshCcw, User, Layout, 
  Palette, AlertCircle, Phone, Facebook, X, ZoomIn, Maximize2, 
  Cpu, Wand2, Zap, Trash2, CheckCircle2, Camera
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES & INTERFACES ---
type PresetCategory = 'Ảnh Cưới' | 'Thời Trang' | 'Ngoại Cảnh' | 'Siêu Xe' | 'Studio';

interface PresetBackground {
  id: string;
  category: PresetCategory;
  url: string;
  label: string;
}

interface GenerationResult {
  id: string;
  url: string;
  variation: string;
}

// --- CONSTANTS ---
const CATEGORIES: PresetCategory[] = ['Ảnh Cưới', 'Thời Trang', 'Ngoại Cảnh', 'Siêu Xe', 'Studio'];

const PRESET_BACKGROUNDS: PresetBackground[] = [
  { id: 'w1', category: 'Ảnh Cưới', label: 'Lâu đài Trắng', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000' },
  { id: 'w2', category: 'Ảnh Cưới', label: 'Sảnh Marble', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000' },
  { id: 'w3', category: 'Ảnh Cưới', label: 'Cổng Hoa Trắng', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'f1', category: 'Thời Trang', label: 'Minimalist White', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'f2', category: 'Thời Trang', label: 'Vogue Studio', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000' },
  { id: 'o1', category: 'Ngoại Cảnh', label: 'Biển Sáng', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'o2', category: 'Ngoại Cảnh', label: 'Đồi Cỏ Khô', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000' },
  { id: 's1', category: 'Siêu Xe', label: 'Showroom Hiện Đại', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' },
  { id: 's2', category: 'Siêu Xe', label: 'Đường Phố Đêm', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000' },
  { id: 'st1', category: 'Studio', label: 'Ánh Sáng Cửa Sổ', url: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&q=80&w=1000' },
  { id: 'st2', category: 'Studio', label: 'Phông Xám Luxury', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000' },
];

const HACKER_LOGS = [
  "> [CORE] KẾT NỐI NEURAL ENGINE V4.2 SUCCESS",
  "> [AI] PHÂN TÍCH HÌNH THỂ NHÂN VẬT...",
  "> [RENDER] TÁCH NỀN ĐA LỚP (ALPHA MASKING)...",
  "> [LIGHT] ĐỒNG BỘ NHIỆT ĐỘ MÀU (5600K)...",
  "> [FX] TẠO BÓNG ĐỔ VẬT LÝ (CONTACT SHADOWS)...",
  "> [COLOR] ÁP DỤNG BỘ LỌC TRẮNG SÁNG TINH TẾ...",
  "> [PIXEL] KHỬ NHIỄU VÀ TĂNG CƯỜNG ĐỘ CHI TIẾT...",
  "> [SUCCESS] HOÀN TẤT QUY TRÌNH HÀI HÒA HÌNH ẢNH."
];

// --- APP COMPONENT ---
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

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY || "" }), []);

  const getBase64Data = (dataUrl: string) => {
    if (!dataUrl) return "";
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : parts[0];
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      setProcessPercent(0);
      setLogs([]);
      let logIndex = 0;
      timer = setInterval(() => {
        setProcessPercent(p => (p >= 98 ? 98 : p + Math.random() * 5));
        if (Math.random() > 0.6 && logIndex < HACKER_LOGS.length) {
          setLogs(prev => [...prev, HACKER_LOGS[logIndex]]);
          logIndex++;
        }
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  const handleSuggestPrompt = async () => {
    if (isGeneratingPrompt) return;
    setIsGeneratingPrompt(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a high-end luxury photographer. Create a concise English prompt (max 35 words) for: "${customPrompt || "a high-fashion portrait"}". Style focus: "White Tone, clean, airy, high-key, pure elegance".`
      });
      if (response.text) setCustomPrompt(response.text.trim());
    } catch (err) {
      setError("AI không thể phản hồi. Vui lòng kiểm tra API Key.");
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
      // Netlify/Production fallback
      return url; 
    }
  };

  const handleRender = async () => {
    if (!portrait || !background) {
      setError("Vui lòng tải ảnh chân dung và chọn bối cảnh phù hợp.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const bgBase64 = await imageUrlToBase64(background);
      const variations = [
        { label: 'Tự Nhiên' },
        { label: 'Điện Ảnh' },
        { label: 'High-Key' }
      ];

      const resPromises = variations.map(async (v, i) => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: getBase64Data(portrait), mimeType: 'image/png' } },
              { inlineData: { data: getBase64Data(bgBase64), mimeType: 'image/png' } },
              { text: `MASTER TASK: Professional subject extraction from Img1. Seamlessly integrate into Img2 environment. 
                STRICT THEME: "White Tone Collection". 
                Requirements: Airy lighting, soft shadows, neutral whites, high-end skin retouching style. 
                Variation Style: ${v.label}. 
                User Prompt: ${customPrompt}` 
              }
            ]
          },
          config: { imageConfig: { aspectRatio: "3:4" } }
        });
        const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!imgPart?.inlineData) throw new Error("AI Render Error");
        return { id: `${i}-${Date.now()}`, url: `data:image/png;base64,${imgPart.inlineData.data}`, variation: v.label };
      });

      const finalResults = await Promise.all(resPromises);
      setProcessPercent(100);
      setLogs(prev => [...prev, "> [OK] TẤT CẢ TÁC PHẨM ĐÃ ĐƯỢC KẾT XUẤT THÀNH CÔNG."]);
      setTimeout(() => {
        setResults(finalResults);
        setIsProcessing(false);
      }, 1000);
    } catch (err: any) {
      setError("Lỗi xử lý AI. Vui lòng thử lại sau.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-black selection:text-white antialiased">
      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-white/60 backdrop-blur-3xl" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-[48px] p-12 max-w-sm w-full border border-gray-100 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowContact(false)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition-colors"><X /></button>
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><Sparkles className="text-white w-10 h-10" /></div>
              <h3 className="text-3xl font-serif font-bold italic mb-2 text-black">GÀ SƠN HÀ</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-10">Premium Experience</p>
              <div className="space-y-4">
                <a href="tel:0376777258" className="flex items-center p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-all text-black">
                   <Phone className="w-5 h-5 mr-4" /> <div className="text-left"><p className="text-[10px] text-gray-400 font-bold uppercase">Hotline</p><p className="font-bold">0376777258</p></div>
                </a>
                <a href="https://www.facebook.com/lemtattoo/" target="_blank" className="flex items-center p-6 bg-blue-50/30 rounded-[32px] hover:bg-blue-50/50 transition-all text-blue-900">
                   <Facebook className="w-5 h-5 mr-4 text-blue-600" /> <div className="text-left"><p className="text-[10px] text-gray-400 font-bold uppercase">Facebook</p><p className="font-bold uppercase">GÀ SƠN HÀ</p></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-16 right-0 p-4 text-white/50 hover:text-white"><X className="w-10 h-10" /></button>
            <div className="bg-white p-3 rounded-[48px] shadow-2xl overflow-hidden flex flex-col items-center">
              <img src={previewImage.url} className="max-h-[75vh] w-auto rounded-[36px]" />
              <div className="w-full p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-black">
                <div><h4 className="text-3xl font-serif font-bold italic">{previewImage.variation} Style</h4><p className="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase mt-2">White Tone Masterpiece</p></div>
                <button onClick={() => { const l = document.createElement('a'); l.href = previewImage.url; l.download='lem_wedding_ai.png'; l.click(); }} className="bg-black text-white px-12 py-5 rounded-full font-bold flex items-center gap-4 hover:bg-gray-800 transition-all shadow-2xl"><Download className="w-6 h-6" /> TẢI ẢNH</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-100 px-12 py-7 flex items-center justify-between">
        <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg"><Sparkles className="text-white w-7 h-7" /></div>
          <h1 className="text-2xl font-serif font-bold tracking-[0.2em] text-black">LEM WEDDING</h1>
        </div>
        <div className="hidden lg:flex space-x-14 text-[11px] font-bold tracking-[0.5em] uppercase text-gray-400">
          <span className="text-black border-b-2 border-black pb-1">AI Studio</span>
          <span className="hover:text-black cursor-pointer" onClick={() => setShowContact(true)}>Services</span>
          <span className="hover:text-black cursor-pointer" onClick={() => setShowContact(true)}>Gallery</span>
        </div>
        <button onClick={() => setShowContact(true)} className="bg-black text-white px-10 py-4 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-xl">Liên Hệ</button>
      </header>

      <main className="max-w-[1440px] mx-auto w-full px-10 py-24 text-black">
        <div className="text-center mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 bg-gray-50 border border-gray-100 rounded-full shadow-sm">
             <Cpu className="w-4 h-4 text-gray-400" />
             <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold">Neural Engine v4.2</span>
          </div>
          <h2 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter italic mb-12">Vẻ Đẹp Ánh Sáng</h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-2xl font-light leading-relaxed">
            Hợp nhất nhân vật và không gian với tiêu chuẩn <span className="text-black font-medium italic">"White Tone"</span> tinh khiết, 
            được tinh chỉnh bởi trí tuệ nhân tạo thế hệ mới.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-5 space-y-16">
            {/* Portrait Card */}
            <section className="bg-white rounded-[64px] p-12 border border-gray-50 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-pink-50 rounded-3xl group-hover:rotate-6 transition-transform">
                    <User className="text-pink-500 w-8 h-8" />
                  </div>
                  <div><h3 className="text-2xl font-bold font-serif italic">Chân dung</h3></div>
                </div>
              </div>
              <div onClick={() => fileInputPortrait.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-[48px] flex items-center justify-center overflow-hidden transition-all duration-700 ${portrait ? 'h-[450px] border-pink-100 shadow-2xl' : 'h-80 border-gray-100 bg-gray-50/20 hover:border-pink-200'}`}>
                {portrait ? <img src={portrait} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-10 h-10 text-gray-200 mx-auto mb-5" /><p className="text-sm font-bold text-gray-300 uppercase tracking-[0.3em]">Tải ảnh nhân vật</p></div>}
                <input type="file" ref={fileInputPortrait} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'portrait')} />
              </div>
            </section>

            {/* Background Card */}
            <section className="bg-white rounded-[64px] p-12 border border-gray-50 shadow-sm space-y-14">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-50 rounded-3xl">
                  <ImageIcon className="text-blue-500 w-8 h-8" />
                </div>
                <div><h3 className="text-2xl font-bold font-serif italic">Bối cảnh Studio</h3></div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setSelectedCategory(c)} className={`px-10 py-3.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${selectedCategory === c ? 'bg-black text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{c}</button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {PRESET_BACKGROUNDS.filter(p => p.category === selectedCategory).map(p => (
                  <div key={p.id} onClick={() => setBackground(p.url)} className={`relative h-36 rounded-[32px] overflow-hidden cursor-pointer border-2 transition-all duration-500 ${background === p.url ? 'border-black ring-8 ring-black/5 shadow-2xl' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={p.url} className="w-full h-full object-cover" /><span className="absolute bottom-5 left-5 px-3 py-1 bg-black/40 text-[9px] font-bold text-white rounded-lg uppercase tracking-widest">{p.label}</span></div>
                ))}
                <div onClick={() => fileInputBg.current?.click()} className="rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50/20 cursor-pointer h-36 hover:bg-gray-100 transition-all group">
                  <Upload className="w-6 h-6 text-gray-200 mb-2" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Tải bối cảnh riêng</span>
                  <input type="file" ref={fileInputBg} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'background')} />
                </div>
              </div>

              <div className="space-y-5 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between"><label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3"><Palette className="w-4 h-4 text-black"/> Ý tưởng sáng tạo</label><button onClick={handleSuggestPrompt} disabled={isGeneratingPrompt} className="text-[11px] font-bold text-black flex items-center gap-2 disabled:opacity-30">{isGeneratingPrompt ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-black" />} GỢI Ý BỞI AI</button></div>
                <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Ví dụ: Ánh nắng ban mai trong trẻo, tông màu trắng kem lãng mạn..." className="w-full bg-gray-50 border border-gray-100 rounded-[36px] p-8 text-base outline-none h-36 resize-none transition-all shadow-inner" />
              </div>

              <div className="flex gap-5">
                <button onClick={() => { setPortrait(null); setBackground(null); setResults([]); }} className="px-10 py-7 rounded-[36px] bg-gray-50 text-gray-400 hover:bg-gray-100"><Trash2 className="w-7 h-7" /></button>
                <button onClick={handleRender} disabled={isProcessing || !portrait || !background} className={`flex-grow py-7 rounded-[36px] flex items-center justify-center gap-5 font-bold tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${isProcessing || !portrait || !background ? 'bg-gray-100 text-gray-300 shadow-none' : 'bg-black text-white hover:bg-gray-900 transform hover:-translate-y-1'}`}>{isProcessing ? <><RefreshCcw className="w-7 h-7 animate-spin" /><span>ĐANG XỬ LÝ {Math.round(processPercent)}%</span></> : <><Sparkles className="w-7 h-7" /><span>GHÉP ẢNH NGAY</span></>}</button>
              </div>
              {error && <p className="mt-6 text-sm text-red-500 font-bold flex items-center justify-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</p>}
            </section>
          </div>

          <div className="lg:col-span-7">
            {/* Result Area */}
            {!isProcessing && results.length === 0 && (
              <div className="bg-white rounded-[80px] border border-gray-50 h-[950px] flex flex-col items-center justify-center text-center px-24 luxury-shadow"><div className="p-20 bg-gray-50 rounded-full mb-14"><Layout className="w-24 h-24 text-gray-200" /></div><h3 className="text-4xl font-serif font-bold italic mb-6">Canvas Nghệ Thuật</h3><p className="text-gray-300 font-light max-w-lg leading-loose text-2xl">Bắt đầu hành trình sáng tạo. Kết quả render "White Tone" đẳng cấp sẽ xuất hiện tại đây.</p></div>
            )}
            
            {isProcessing && (
              <div className="bg-[#050505] rounded-[80px] h-[950px] flex flex-col p-20 relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-14"><div className="flex gap-3"><div className="w-3 h-3 rounded-full bg-red-500/90" /><div className="w-3 h-3 rounded-full bg-yellow-500/90" /><div className="w-3 h-3 rounded-full bg-green-500/90" /></div><div className="text-green-500 font-mono text-4xl tabular-nums">{Math.round(processPercent)}%</div></div>
                  <div className="w-full h-1 bg-white/5 rounded-full mb-20 overflow-hidden"><div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${processPercent}%` }} /></div>
                  <div ref={logContainerRef} className="flex-grow bg-black/50 rounded-[48px] p-14 font-mono text-green-500/90 text-sm overflow-y-auto scrollbar-hide space-y-5 border border-white/5">
                    {logs.map((l, i) => <div key={i} className="flex gap-5"><span className="text-green-900">root@lem_ai:~$</span> <span>{l}</span></div>)}
                    <div className="w-3 h-6 bg-green-500 animate-pulse mt-1" />
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && !isProcessing && (
              <div className="space-y-20 animate-in fade-in duration-1000">
                <div className="flex items-end justify-between border-b border-gray-100 pb-12"><h3 className="text-6xl font-serif font-bold italic tracking-tight">Masterpiece</h3><button onClick={() => setResults([])} className="p-6 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all"><RefreshCcw className="w-7 h-7" /></button></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {results.map(res => (
                    <div key={res.id} onClick={() => setPreviewImage(res)} className="group relative bg-white rounded-[56px] overflow-hidden luxury-shadow border border-gray-100 transition-all duration-700 hover:scale-[1.05] hover:-translate-y-5 cursor-pointer">
                      <div className="aspect-[3/4] relative overflow-hidden"><img src={res.url} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-125" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]"><div className="p-7 bg-white rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500"><Maximize2 className="text-black w-8 h-8" /></div></div></div>
                      <div className="p-10 bg-white border-t border-gray-50 flex items-center justify-between group-hover:bg-gray-50 transition-colors duration-500"><div><p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] mb-2">Collection</p><h4 className="font-serif italic font-bold text-2xl">{res.variation}</h4></div><ZoomIn className="w-7 h-7 text-gray-300" /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-50 py-32 px-14 mt-32 text-center lg:text-left">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-20">
          <div><h5 className="font-serif font-bold text-4xl tracking-[0.3em] mb-8 uppercase text-black">LEM WEDDING</h5><p className="text-sm font-serif italic text-gray-300 tracking-[0.2em]">© 2025 AI STUDIO EXPERIENCE | WHITE TONE COLLECTION</p></div>
          <p className="text-[14px] font-bold tracking-[0.7em] text-gray-400 uppercase">Thiết kế bởi GÀ SƠN HÀ</p>
        </div>
      </footer>
    </div>
  );
};

// --- RENDER BOOTSTRAP ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
