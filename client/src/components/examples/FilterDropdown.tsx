import { useState } from "react";
import { FilterDropdown } from "../FilterDropdown";

export default function FilterDropdownExample() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  
  // Mock supplier data for demo
  const mockSuppliers = [
    "ABC Electronics Ltd",
    "TechCorp Solutions",
    "Global Components Inc",
    "Prime Manufacturing",
    "Advanced Systems Co",
    "MegaTech Industries",
    "Universal Supplies",
    "Quality Parts Ltd",
    "NextGen Materials",
    "Superior Components"
  ];

  return (
    <div className="w-80 p-4">
      <FilterDropdown
        label="Suppliers"
        options={mockSuppliers}
        selected={selectedSuppliers}
        onSelectionChange={setSelectedSuppliers}
        searchPlaceholder="Search suppliers..."
      />
    </div>
  );
}