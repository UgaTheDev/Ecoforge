import { WasteType } from '../types';

export const getWasteTypeColor = (wasteType: WasteType): string => {
  const colors: Record<WasteType, string> = {
    [WasteType.FOOD]: '#f59e0b',
    [WasteType.PLASTIC]: '#3b82f6',
    [WasteType.PAPER]: '#8b5cf6',
    [WasteType.GLASS]: '#06b6d4',
    [WasteType.METAL]: '#64748b',
    [WasteType.ELECTRONIC]: '#ef4444',
    [WasteType.ORGANIC]: '#10b981',
    [WasteType.TEXTILE]: '#ec4899',
    [WasteType.HAZARDOUS]: '#dc2626',
    [WasteType.OTHER]: '#6b7280',
  };

  return colors[wasteType] || '#6b7280';
};

export const getWasteTypeIcon = (wasteType: WasteType): string => {
  const icons: Record<WasteType, string> = {
    [WasteType.FOOD]: 'fast-food-outline',
    [WasteType.PLASTIC]: 'water-outline',
    [WasteType.PAPER]: 'document-text-outline',
    [WasteType.GLASS]: 'wine-outline',
    [WasteType.METAL]: 'construct-outline',
    [WasteType.ELECTRONIC]: 'phone-portrait-outline',
    [WasteType.ORGANIC]: 'leaf-outline',
    [WasteType.TEXTILE]: 'shirt-outline',
    [WasteType.HAZARDOUS]: 'warning-outline',
    [WasteType.OTHER]: 'trash-outline',
  };

  return icons[wasteType] || 'trash-outline';
};
