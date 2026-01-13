
export type PresetCategory = 'Sinh Nhật' | 'Ảnh Cưới' | 'Ngoại Cảnh' | 'Siêu Xe' | 'Thời Trang';

export interface PresetBackground {
  id: string;
  category: PresetCategory;
  url: string;
  label: string;
}

export interface GenerationResult {
  id: string;
  url: string;
  variation: string;
}
