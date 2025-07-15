// Complete country data with ISO 3166-1 alpha-2 and alpha-3 codes
export interface CountryData {
  id: string; // ISO 3166-1 alpha-3 (3-letter)
  code2: string; // ISO 3166-1 alpha-2 (2-letter)
  nameEn: string;
  nameZh: string;
  continent: string;
  region: string;
}

export const COUNTRIES: CountryData[] = [
  // Asia
  { id: 'CHN', code2: 'CN', nameEn: 'China', nameZh: '中国', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'JPN', code2: 'JP', nameEn: 'Japan', nameZh: '日本', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'KOR', code2: 'KR', nameEn: 'South Korea', nameZh: '韩国', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'IND', code2: 'IN', nameEn: 'India', nameZh: '印度', continent: 'Asia', region: 'Southern Asia' },
  { id: 'SGP', code2: 'SG', nameEn: 'Singapore', nameZh: '新加坡', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'THA', code2: 'TH', nameEn: 'Thailand', nameZh: '泰国', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'VNM', code2: 'VN', nameEn: 'Vietnam', nameZh: '越南', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'MYS', code2: 'MY', nameEn: 'Malaysia', nameZh: '马来西亚', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'IDN', code2: 'ID', nameEn: 'Indonesia', nameZh: '印度尼西亚', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'PHL', code2: 'PH', nameEn: 'Philippines', nameZh: '菲律宾', continent: 'Asia', region: 'South-Eastern Asia' },
  { id: 'HKG', code2: 'HK', nameEn: 'Hong Kong', nameZh: '香港', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'TWN', code2: 'TW', nameEn: 'Taiwan', nameZh: '台湾', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'MAC', code2: 'MO', nameEn: 'Macao', nameZh: '澳门', continent: 'Asia', region: 'Eastern Asia' },
  { id: 'IRN', code2: 'IR', nameEn: 'Iran', nameZh: '伊朗', continent: 'Asia', region: 'Southern Asia' },
  { id: 'IRQ', code2: 'IQ', nameEn: 'Iraq', nameZh: '伊拉克', continent: 'Asia', region: 'Western Asia' },
  { id: 'ISR', code2: 'IL', nameEn: 'Israel', nameZh: '以色列', continent: 'Asia', region: 'Western Asia' },
  { id: 'SAU', code2: 'SA', nameEn: 'Saudi Arabia', nameZh: '沙特阿拉伯', continent: 'Asia', region: 'Western Asia' },
  { id: 'ARE', code2: 'AE', nameEn: 'United Arab Emirates', nameZh: '阿拉伯联合酋长国', continent: 'Asia', region: 'Western Asia' },

  // Europe
  { id: 'DEU', code2: 'DE', nameEn: 'Germany', nameZh: '德国', continent: 'Europe', region: 'Western Europe' },
  { id: 'GBR', code2: 'GB', nameEn: 'United Kingdom', nameZh: '英国', continent: 'Europe', region: 'Northern Europe' },
  { id: 'FRA', code2: 'FR', nameEn: 'France', nameZh: '法国', continent: 'Europe', region: 'Western Europe' },
  { id: 'ITA', code2: 'IT', nameEn: 'Italy', nameZh: '意大利', continent: 'Europe', region: 'Southern Europe' },
  { id: 'ESP', code2: 'ES', nameEn: 'Spain', nameZh: '西班牙', continent: 'Europe', region: 'Southern Europe' },
  { id: 'NLD', code2: 'NL', nameEn: 'Netherlands', nameZh: '荷兰', continent: 'Europe', region: 'Western Europe' },
  { id: 'BEL', code2: 'BE', nameEn: 'Belgium', nameZh: '比利时', continent: 'Europe', region: 'Western Europe' },
  { id: 'CHE', code2: 'CH', nameEn: 'Switzerland', nameZh: '瑞士', continent: 'Europe', region: 'Western Europe' },
  { id: 'AUT', code2: 'AT', nameEn: 'Austria', nameZh: '奥地利', continent: 'Europe', region: 'Western Europe' },
  { id: 'SWE', code2: 'SE', nameEn: 'Sweden', nameZh: '瑞典', continent: 'Europe', region: 'Northern Europe' },
  { id: 'NOR', code2: 'NO', nameEn: 'Norway', nameZh: '挪威', continent: 'Europe', region: 'Northern Europe' },
  { id: 'DNK', code2: 'DK', nameEn: 'Denmark', nameZh: '丹麦', continent: 'Europe', region: 'Northern Europe' },
  { id: 'FIN', code2: 'FI', nameEn: 'Finland', nameZh: '芬兰', continent: 'Europe', region: 'Northern Europe' },
  { id: 'POL', code2: 'PL', nameEn: 'Poland', nameZh: '波兰', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'CZE', code2: 'CZ', nameEn: 'Czech Republic', nameZh: '捷克', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'HUN', code2: 'HU', nameEn: 'Hungary', nameZh: '匈牙利', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'ROU', code2: 'RO', nameEn: 'Romania', nameZh: '罗马尼亚', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'BGR', code2: 'BG', nameEn: 'Bulgaria', nameZh: '保加利亚', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'GRC', code2: 'GR', nameEn: 'Greece', nameZh: '希腊', continent: 'Europe', region: 'Southern Europe' },
  { id: 'PRT', code2: 'PT', nameEn: 'Portugal', nameZh: '葡萄牙', continent: 'Europe', region: 'Southern Europe' },
  { id: 'IRL', code2: 'IE', nameEn: 'Ireland', nameZh: '爱尔兰', continent: 'Europe', region: 'Northern Europe' },
  { id: 'RUS', code2: 'RU', nameEn: 'Russia', nameZh: '俄罗斯', continent: 'Europe', region: 'Eastern Europe' },
  { id: 'UKR', code2: 'UA', nameEn: 'Ukraine', nameZh: '乌克兰', continent: 'Europe', region: 'Eastern Europe' },

  // North America
  { id: 'USA', code2: 'US', nameEn: 'United States', nameZh: '美国', continent: 'North America', region: 'Northern America' },
  { id: 'CAN', code2: 'CA', nameEn: 'Canada', nameZh: '加拿大', continent: 'North America', region: 'Northern America' },
  { id: 'MEX', code2: 'MX', nameEn: 'Mexico', nameZh: '墨西哥', continent: 'North America', region: 'Central America' },

  // South America
  { id: 'BRA', code2: 'BR', nameEn: 'Brazil', nameZh: '巴西', continent: 'South America', region: 'South America' },
  { id: 'ARG', code2: 'AR', nameEn: 'Argentina', nameZh: '阿根廷', continent: 'South America', region: 'South America' },
  { id: 'CHL', code2: 'CL', nameEn: 'Chile', nameZh: '智利', continent: 'South America', region: 'South America' },
  { id: 'COL', code2: 'CO', nameEn: 'Colombia', nameZh: '哥伦比亚', continent: 'South America', region: 'South America' },
  { id: 'PER', code2: 'PE', nameEn: 'Peru', nameZh: '秘鲁', continent: 'South America', region: 'South America' },

  // Africa
  { id: 'ZAF', code2: 'ZA', nameEn: 'South Africa', nameZh: '南非', continent: 'Africa', region: 'Southern Africa' },
  { id: 'EGY', code2: 'EG', nameEn: 'Egypt', nameZh: '埃及', continent: 'Africa', region: 'Northern Africa' },
  { id: 'NGA', code2: 'NG', nameEn: 'Nigeria', nameZh: '尼日利亚', continent: 'Africa', region: 'Western Africa' },
  { id: 'KEN', code2: 'KE', nameEn: 'Kenya', nameZh: '肯尼亚', continent: 'Africa', region: 'Eastern Africa' },
  { id: 'MAR', code2: 'MA', nameEn: 'Morocco', nameZh: '摩洛哥', continent: 'Africa', region: 'Northern Africa' },

  // Oceania
  { id: 'AUS', code2: 'AU', nameEn: 'Australia', nameZh: '澳大利亚', continent: 'Oceania', region: 'Australia and New Zealand' },
  { id: 'NZL', code2: 'NZ', nameEn: 'New Zealand', nameZh: '新西兰', continent: 'Oceania', region: 'Australia and New Zealand' },
];

// Helper function to get country by 2-letter code
export function getCountryByCode2(code2: string): CountryData | undefined {
  return COUNTRIES.find(country => country.code2.toLowerCase() === code2.toLowerCase());
}

// Helper function to get country by 3-letter code  
export function getCountryByCode3(code3: string): CountryData | undefined {
  return COUNTRIES.find(country => country.id.toLowerCase() === code3.toLowerCase());
}

// Helper function to get country by name (English or Chinese)
export function getCountryByName(name: string): CountryData | undefined {
  const searchName = name.toLowerCase();
  return COUNTRIES.find(country => 
    country.nameEn.toLowerCase() === searchName || 
    country.nameZh.toLowerCase() === searchName
  );
} 