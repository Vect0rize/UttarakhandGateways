export interface AmenityOption {
  id: string;
  labelEn: string;
  labelHi: string;
  category: 'Utilities' | 'Parking & Road' | 'Nature & View' | 'Security & Legal' | 'Living Comfort';
}

export const AMENITY_CATEGORIES = [
  { key: 'all', labelEn: 'All Amenities', labelHi: 'सभी सुविधाएं' },
  { key: 'Utilities', labelEn: 'Water & Utilities', labelHi: 'पानी व बिजली' },
  { key: 'Parking & Road', labelEn: 'Parking & Road Access', labelHi: 'पार्किंग व सड़क' },
  { key: 'Nature & View', labelEn: 'Views & Outdoors', labelHi: 'पहाड़ी दृश्य व गार्डन' },
  { key: 'Security & Legal', labelEn: 'Security & Title', labelHi: 'सुरक्षा व टाइटल' },
  { key: 'Living Comfort', labelEn: 'Living Comforts', labelHi: 'आधुनिक सुविधाएं' },
] as const;

export const POPULAR_AMENITIES: AmenityOption[] = [
  // Utilities
  { id: 'water_supply', labelEn: '24/7 Water Supply', labelHi: '24/7 पानी आपूर्ति', category: 'Utilities' },
  { id: 'electricity', labelEn: 'Electricity Connection', labelHi: 'बिजली कनेक्शन', category: 'Utilities' },
  { id: 'power_backup', labelEn: 'Power Backup / Inverter', labelHi: 'पावर बैकअप / इन्वर्टर', category: 'Utilities' },
  { id: 'solar_power', labelEn: 'Solar Water Heater / Solar Power', labelHi: 'सोलर वाटर हीटर / सोलर', category: 'Utilities' },
  { id: 'rainwater_harvesting', labelEn: 'Rainwater Harvesting', labelHi: 'वर्षा जल संचयन', category: 'Utilities' },

  // Parking & Road
  { id: 'car_parking', labelEn: 'Dedicated Car Parking', labelHi: 'समर्पित कार पार्किंग', category: 'Parking & Road' },
  { id: 'road_access', labelEn: 'Wide Pitch / Paved Road Access', labelHi: 'पक्की चौड़ी सड़क पहुंच', category: 'Parking & Road' },
  { id: 'highway_proximity', labelEn: 'Close to Main Highway', labelHi: 'मुख्य हाइवे के नजदीक', category: 'Parking & Road' },

  // Nature & View
  { id: 'himalayan_view', labelEn: 'Himalayan Snow Peak View', labelHi: 'हिमालय हिमशिखर दृश्य', category: 'Nature & View' },
  { id: 'valley_view', labelEn: 'Valley & Forest View', labelHi: 'घाटी व देवदार जंगल दृश्य', category: 'Nature & View' },
  { id: 'private_garden', labelEn: 'Private Lawn / Garden', labelHi: 'निजी बगीचा / लॉन', category: 'Nature & View' },
  { id: 'terrace_balcony', labelEn: 'Terrace & Mountain Balcony', labelHi: 'छत व पहाड़ी बालकनी', category: 'Nature & View' },

  // Security & Legal
  { id: 'gated_compound', labelEn: 'Gated Compound / Boundary Wall', labelHi: 'गेटेड बाउंड्री वॉल', category: 'Security & Legal' },
  { id: 'cctv_security', labelEn: '24x7 Security & CCTV', labelHi: '24x7 सुरक्षा व सीसीटीवी', category: 'Security & Legal' },
  { id: 'clear_title', labelEn: '143 Converted / Freehold Title', labelHi: '143 दाखिल खारिज क्लियर टाइटल', category: 'Security & Legal' },

  // Living Comfort
  { id: 'wifi_fiber', labelEn: 'High-Speed Wi-Fi / Fiber', labelHi: 'हाई-स्पीड इंटरनेट / वाई-फाई', category: 'Living Comfort' },
  { id: 'fireplace_heating', labelEn: 'Fireplace / Room Heating', labelHi: 'अंगीठी / रूम हीटिंग', category: 'Living Comfort' },
  { id: 'modular_kitchen', labelEn: 'Modular Kitchen', labelHi: 'मॉड्यूलर किचन', category: 'Living Comfort' },
  { id: 'nearby_market', labelEn: 'Nearby Market & Medical', labelHi: 'नजदीकी बाजार व अस्पताल', category: 'Living Comfort' },
  { id: 'furnished', labelEn: 'Fully / Semi-Furnished', labelHi: 'फर्निश्ड / सेमी-फर्निश्ड', category: 'Living Comfort' },
];

export const DEFAULT_QUICK_AMENITIES: string[] = [
  '24/7 Water Supply',
  'Electricity Connection',
  'Dedicated Car Parking',
  'Wide Pitch / Paved Road Access',
  'Himalayan Snow Peak View',
  'Gated Compound / Boundary Wall',
];
