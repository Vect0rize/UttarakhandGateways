export interface AmenityOption {
  id: string;
  labelEn: string;
  labelHi: string;
}

// Only keep the most essential and important amenities for Uttarakhand properties
export const IMPORTANT_AMENITIES: AmenityOption[] = [
  { id: 'water_supply', labelEn: '24/7 Water Supply', labelHi: '24/7 पानी आपूर्ति' },
  { id: 'electricity', labelEn: 'Electricity Connection', labelHi: 'बिजली कनेक्शन' },
  { id: 'power_backup', labelEn: 'Power Backup / Inverter', labelHi: 'पावर बैकअप / इन्वर्टर' },
  { id: 'car_parking', labelEn: 'Dedicated Car Parking', labelHi: 'समर्पित कार पार्किंग' },
  { id: 'road_access', labelEn: 'Wide Pitch / Paved Road Access', labelHi: 'पक्की चौड़ी सड़क पहुंच' },
  { id: 'mountain_view', labelEn: 'Mountain & Valley View', labelHi: 'पहाड़ी व घाटी का दृश्य' },
  { id: 'gated_security', labelEn: 'Gated Society / 24x7 Security', labelHi: 'गेटेड सोसाइटी व सुरक्षा' },
  { id: 'modular_kitchen', labelEn: 'Modular Kitchen', labelHi: 'मॉड्यूलर किचन (Modular Kitchen)' },
  { id: 'wifi', labelEn: 'High-Speed Wi-Fi / Fiber', labelHi: 'हाई-स्पीड इंटरनेट / वाई-फाई' },
];

export const POPULAR_AMENITIES = IMPORTANT_AMENITIES;

export const DEFAULT_QUICK_AMENITIES: string[] = [
  '24/7 Water Supply',
  'Electricity Connection',
  'Dedicated Car Parking',
  'Modular Kitchen',
  'Wide Pitch / Paved Road Access',
  'Mountain & Valley View',
  'Gated Society / 24x7 Security',
];
