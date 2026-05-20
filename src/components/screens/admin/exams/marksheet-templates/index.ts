import { ClassicAcademy } from './ClassicAcademy';
import { ModernMinimalist } from './ModernMinimalist';
import { RoyalGold } from './RoyalGold';
import { CreativeCompact } from './CreativeCompact';

export { ClassicAcademy } from './ClassicAcademy';
export { ModernMinimalist } from './ModernMinimalist';
export { RoyalGold } from './RoyalGold';
export { CreativeCompact } from './CreativeCompact';

export const MARKSHEET_TEMPLATES = [
  { id: 'classic', name: 'Classic Academy', component: ClassicAcademy },
  { id: 'modern', name: 'Modern Minimalist', component: ModernMinimalist },
  { id: 'royal', name: 'Royal Gold Elite', component: RoyalGold },
  { id: 'creative', name: 'Creative Compact', component: CreativeCompact },
];
