"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer, FileText } from "lucide-react";
import { AdmitCardVisual } from "./AdmitCardVisual";

interface ViewCardDialogProps {
  card: any | null;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
  templateId?: string;
}

export function ViewCardDialog({
  card,
  onOpenChange,
  onPrint,
  templateId = 'classic_quad',
}: ViewCardDialogProps) {
  return (
    <Dialog open={!!card} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[850px] max-h-[95vh] overflow-y-auto bg-zinc-950 border-zinc-800 p-0">
        <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="size-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <span>Admit Card, <span className="text-amber-400">{card?.student.name}</span></span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and print student admit card.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="size-5" />
          </Button>
        </div>

        {card && (
          <div className="p-8 flex flex-col items-center gap-6 bg-zinc-950/50">
            <div className="scale-[0.8] sm:scale-100 origin-top shadow-2xl shadow-black/50">
              <div className="bg-white p-4 rounded-lg">
                <AdmitCardVisual card={card} templateId={templateId} />
              </div>
            </div>
            
            <Button
              onClick={onPrint}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 px-8 h-12 text-base font-semibold"
            >
              <Printer className="size-5" />
              Download PDF / Print
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
