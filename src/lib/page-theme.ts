/** Theme form — New Season 1 (xám tối + tím) */

export const cardShell = 'ns-form-card';
export const cardHead = 'ns-form-head';
export const cardBody = 'ns-form-body';
export const stackGap = 'flex flex-col gap-4';
export const gridGap = 'grid gap-4';

export const inputModern = 'ns-input';
export const labelModern = 'ns-label';

export const sectionTitleModern = 'ns-home-title';

export const btnPrimaryClass = 'ns-btn';
export const btnPrimaryStyle = {} as const;

export const linkAccent = 'ns-link';

export const accentText = 'ns-link';

export function newsBadgeClass(type: string): string {
  return `ns-badge t-${(type || 'notice').toLowerCase()}`;
}

