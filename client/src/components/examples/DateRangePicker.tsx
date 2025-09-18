import { useState } from "react";
import { DateRangePicker } from "../DateRangePicker";

export default function DateRangePickerExample() {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  return (
    <div className="w-80 p-4">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    </div>
  );
}