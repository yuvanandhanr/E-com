export interface DeviceModel {
  id: string;
  brand: string;
  name: string;
  type: 'SMARTPHONE' | 'LAPTOP' | 'ACCESSORY';
  baseMSRP: number;
  baseValuation: number; // Base buyback value if like-new
  supportedStorages: string[];
}

export const SUPPORTED_DEVICES: DeviceModel[] = [
  {
    id: 'apple-iphone-15-pro-max',
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    type: 'SMARTPHONE',
    baseMSRP: 159900,
    baseValuation: 88000,
    supportedStorages: ['256GB', '512GB', '1TB'],
  },
  {
    id: 'apple-iphone-14-pro',
    brand: 'Apple',
    name: 'iPhone 14 Pro',
    type: 'SMARTPHONE',
    baseMSRP: 129900,
    baseValuation: 62000,
    supportedStorages: ['128GB', '256GB', '512GB'],
  },
  {
    id: 'apple-iphone-13',
    brand: 'Apple',
    name: 'iPhone 13',
    type: 'SMARTPHONE',
    baseMSRP: 79900,
    baseValuation: 36000,
    supportedStorages: ['128GB', '256GB', '512GB'],
  },
  {
    id: 'samsung-s24-ultra',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    type: 'SMARTPHONE',
    baseMSRP: 129999,
    baseValuation: 75000,
    supportedStorages: ['256GB', '512GB', '1TB'],
  },
  {
    id: 'samsung-s23-ultra',
    brand: 'Samsung',
    name: 'Galaxy S23 Ultra',
    type: 'SMARTPHONE',
    baseMSRP: 124999,
    baseValuation: 52000,
    supportedStorages: ['256GB', '512GB'],
  },
  {
    id: 'google-pixel-8-pro',
    brand: 'Google',
    name: 'Pixel 8 Pro',
    type: 'SMARTPHONE',
    baseMSRP: 106999,
    baseValuation: 48000,
    supportedStorages: ['128GB', '256GB'],
  },
  {
    id: 'apple-macbook-pro-m2',
    brand: 'Apple',
    name: 'MacBook Pro 14" (M2 Pro/Max)',
    type: 'LAPTOP',
    baseMSRP: 199900,
    baseValuation: 95000,
    supportedStorages: ['512GB', '1TB'],
  },
  {
    id: 'dell-xps-15',
    brand: 'Dell',
    name: 'Dell XPS 15 (9520/9530)',
    type: 'LAPTOP',
    baseMSRP: 185000,
    baseValuation: 68000,
    supportedStorages: ['512GB', '1TB'],
  },
  {
    id: 'satechi-dock-tradein',
    brand: 'Satechi',
    name: 'Universal USB-C / Thunderbolt Dock',
    type: 'ACCESSORY',
    baseMSRP: 22000,
    baseValuation: 9000,
    supportedStorages: ['Standard'],
  },
  {
    id: 'anker-gan-tradein',
    brand: 'Anker',
    name: 'GaN 100W+ High Power Adapter / Power Bank',
    type: 'ACCESSORY',
    baseMSRP: 12000,
    baseValuation: 4500,
    supportedStorages: ['Standard'],
  },
];

export interface ConditionForm {
  deviceId: string;
  storage: string;
  screenCondition: 'FLAWLESS' | 'MINOR_SCRATCHES' | 'CRACKED';
  bodyCondition: 'FLAWLESS' | 'MINOR_SCUFFS' | 'DENTED';
  batteryHealth: 'GOOD' | 'NORMAL' | 'DEGRADED'; // >90%, 80-90%, <80%
  camerasFunctional: boolean;
  portsFunctional: boolean;
  hasOriginalBox: boolean;
  hasOriginalCharger: boolean;
}

export function calculateTradeInValue(form: ConditionForm): {
  finalQuote: number;
  breakdown: { item: string; amount: number }[];
} {
  const device = SUPPORTED_DEVICES.find((d) => d.id === form.deviceId);
  if (!device) {
    return { finalQuote: 0, breakdown: [] };
  }

  let base = device.baseValuation;
  const breakdown: { item: string; amount: number }[] = [
    { item: `Base Valuation for ${device.name}`, amount: base },
  ];

  // Storage bonus
  if (form.storage === '512GB') {
    const storageBonus = Math.round(base * 0.1);
    base += storageBonus;
    breakdown.push({ item: '512GB High Capacity Storage Bonus', amount: +storageBonus });
  } else if (form.storage === '1TB') {
    const storageBonus = Math.round(base * 0.2);
    base += storageBonus;
    breakdown.push({ item: '1TB Pro Storage Bonus', amount: +storageBonus });
  }

  // Screen Condition deductions
  if (form.screenCondition === 'MINOR_SCRATCHES') {
    const deduction = Math.round(base * 0.12);
    base -= deduction;
    breakdown.push({ item: 'Minor Display Micro-Scratches Deduction', amount: -deduction });
  } else if (form.screenCondition === 'CRACKED') {
    const deduction = Math.round(base * 0.45);
    base -= deduction;
    breakdown.push({ item: 'Cracked Display Panel Refurbishment Cost', amount: -deduction });
  }

  // Body Condition deductions
  if (form.bodyCondition === 'MINOR_SCUFFS') {
    const deduction = Math.round(base * 0.08);
    base -= deduction;
    breakdown.push({ item: 'Bezel / Edge Minor Wear', amount: -deduction });
  } else if (form.bodyCondition === 'DENTED') {
    const deduction = Math.round(base * 0.22);
    base -= deduction;
    breakdown.push({ item: 'Chassis Dent / Deep Scuffs', amount: -deduction });
  }

  // Battery deductions
  if (form.batteryHealth === 'DEGRADED') {
    const deduction = Math.round(base * 0.15);
    base -= deduction;
    breakdown.push({ item: 'Battery Servicing Required (<80% health)', amount: -deduction });
  }

  // Functional issues
  if (!form.camerasFunctional) {
    const deduction = Math.round(base * 0.25);
    base -= deduction;
    breakdown.push({ item: 'Camera System Malfunction', amount: -deduction });
  }

  if (!form.portsFunctional) {
    const deduction = Math.round(base * 0.15);
    base -= deduction;
    breakdown.push({ item: 'Charging Port / Audio issue', amount: -deduction });
  }

  // Accessories bonus
  if (form.hasOriginalBox) {
    const bonus = 1000;
    base += bonus;
    breakdown.push({ item: 'Original Retail Packaging Bonus', amount: +bonus });
  }

  if (form.hasOriginalCharger) {
    const bonus = 1200;
    base += bonus;
    breakdown.push({ item: 'Original Fast Charger Included Bonus', amount: +bonus });
  }

  const finalQuote = Math.max(1000, Math.round(base / 100) * 100);

  return { finalQuote, breakdown };
}

