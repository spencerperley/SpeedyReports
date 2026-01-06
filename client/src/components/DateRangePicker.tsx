import { CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = ""
}: DateRangePickerProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartDateChange(e.target.value);
    console.log('Start date changed:', e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEndDateChange(e.target.value);
    console.log('End date changed:', e.target.value);
  };

  // Validate that start date is not after end date
  const isInvalidRange = startDate && endDate && startDate > endDate;

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-foreground mb-2 block">
        Due Date Range
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-xs text-muted-foreground">
            From
          </Label>
          <div
            className="relative cursor-pointer"
            onClick={() => document.getElementById('start-date')?.showPicker?.()}
          >
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className={`pl-10 cursor-pointer ${isInvalidRange ? 'border-red-500' : ''}`}
              data-testid="input-start-date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-xs text-muted-foreground">
            To
          </Label>
          <div
            className="relative cursor-pointer"
            onClick={() => document.getElementById('end-date')?.showPicker?.()}
          >
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className={`pl-10 cursor-pointer ${isInvalidRange ? 'border-red-500' : ''}`}
              data-testid="input-end-date"
            />
          </div>
        </div>
      </div>
      {isInvalidRange && (
        <p className="text-sm text-red-500 mt-2">
          Start date must be before or equal to end date
        </p>
      )}
    </div>
  );
}

// Helper to check if date range is valid (exported for use in form validation)
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true; // Empty dates are valid (other validation handles required fields)
  return startDate <= endDate;
}