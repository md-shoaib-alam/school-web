import React from 'react';
import { ClassicAcademic, ModernMinimalist, RoyalExecutive, VintageLedger, TealClean } from './ledger-templates';
import { LedgerData } from './ledger-utils';

export type { LedgerData, TabulationRow } from './ledger-utils';

export const TabularLedgerPrint = React.forwardRef<HTMLDivElement, { data: LedgerData; templateId?: string }>((props, ref) => {
  const { data, templateId = 'classic' } = props;

  let TemplateComponent = ClassicAcademic;
  if (templateId === 'modern') {
    TemplateComponent = ModernMinimalist;
  } else if (templateId === 'royal') {
    TemplateComponent = RoyalExecutive;
  } else if (templateId === 'vintage') {
    TemplateComponent = VintageLedger;
  } else if (templateId === 'teal') {
    TemplateComponent = TealClean;
  }

  return (
    <div ref={ref}>
      <TemplateComponent data={data} />
    </div>
  );
});

TabularLedgerPrint.displayName = 'TabularLedgerPrint';
