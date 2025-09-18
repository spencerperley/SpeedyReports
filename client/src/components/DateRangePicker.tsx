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

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-foreground mb-2 block">
        Date Range
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-xs text-muted-foreground">
            From
          </Label>
          <div className="relative">
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="pl-10"
              data-testid="input-start-date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-xs text-muted-foreground">
            To
          </Label>
          <div className="relative">
            <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="pl-10"
              data-testid="input-end-date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}