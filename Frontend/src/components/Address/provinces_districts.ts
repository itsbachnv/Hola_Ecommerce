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

export function getDistricts(provinceCode: string): District[] {
  const province = (provincesData as any)[provinceCode];
  if (!province || !province['quan-huyen']) return [];
  return Object.values(province['quan-huyen']).map((d: any) => ({
    code: d.code,
    name: d.name,
    slug: d.slug,
    type: d.type,
    name_with_type: d.name_with_type,
  }));
}
