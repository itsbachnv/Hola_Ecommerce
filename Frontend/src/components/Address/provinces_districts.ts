import provincesData from './provinces.json';

export interface Province {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  [key: string]: any;
}

export interface District {
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  [key: string]: any;
}

export function getProvinces(): Province[] {
  return Object.values(provincesData).map((p: any) => ({
    code: p.code,
    name: p.name,
    slug: p.slug,
    type: p.type,
    name_with_type: p.name_with_type,
  }));
}


// Trả về đầy đủ object district (bao gồm cả xa-phuong)
export function getDistricts(provinceCode: string): District[] {
  const province = (provincesData as any)[provinceCode];
  if (!province || !province['quan-huyen']) return [];
  return Object.values(province['quan-huyen']);
}

// Lấy danh sách xã/phường từ provinceCode và districtCode
export function getWards(provinceCode: string, districtCode: string): { code: string; name: string }[] {
  const province = (provincesData as any)[provinceCode];
  if (!province || !province['quan-huyen']) return [];
  const district = province['quan-huyen'][districtCode];
  if (!district || !district['xa-phuong']) return [];
  return Object.values(district['xa-phuong']).map((w: any) => ({ code: w.code, name: w.name }));
}
