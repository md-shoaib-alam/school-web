'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({ date, onChange, placeholder = 'Pick a date', className, disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-9 justify-start gap-2 text-left font-normal px-3 bg-background border-muted-foreground/20 hover:bg-muted/50 transition-all",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
          <span className="text-[11px] font-medium truncate">
            {date ? format(date, "PP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
