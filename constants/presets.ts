
import { PresetBackground, PresetCategory } from '../types';

// Defining preset backgrounds with categories and labels
export const PRESET_BACKGROUNDS: PresetBackground[] = [
  { id: 'wedding-1', category: 'Ảnh Cưới', label: 'Lâu đài cổ điển', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000' },
  { id: 'wedding-2', category: 'Ảnh Cưới', label: 'Nhà thờ lãng mạn', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000' },
  { id: 'outdoor-1', category: 'Ngoại Cảnh', label: 'Hoàng hôn bãi biển', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'outdoor-2', category: 'Ngoại Cảnh', label: 'Rừng thông Đà Lạt', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'car-1', category: 'Siêu Xe', label: 'Porsche Showroom', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' },
  { id: 'car-2', category: 'Siêu Xe', label: 'Đường phố đêm', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000' },
  { id: 'fashion-1', category: 'Thời Trang', label: 'Studio Minimalist', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000' },
  { id: 'birthday-1', category: 'Sinh Nhật', label: 'Tiệc sang trọng', url: 'https://images.unsplash.com/photo-1464347601390-25e2842a37f7?auto=format&fit=crop&q=80&w=1000' },
];

// List of available categories for the UI
export const CATEGORIES: PresetCategory[] = ['Sinh Nhật', 'Ảnh Cưới', 'Ngoại Cảnh', 'Siêu Xe', 'Thời Trang'];
