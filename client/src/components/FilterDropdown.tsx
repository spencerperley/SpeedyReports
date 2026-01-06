import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  selected,
  onSelectionChange,
  searchPlaceholder = "Search...",
  className = ""
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

  // Filter options by search term
  const filteredOptions = safeOptions.filter(option =>
    option && typeof option === 'string' && option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort options so selected items appear first
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aSelected = selected.includes(a);
    const bSelected = selected.includes(b);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const isAllSelected = selected.length === filteredOptions.length && filteredOptions.length > 0;
  const isPartialSelected = selected.length > 0 && selected.length < filteredOptions.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered options
      const newSelected = selected.filter(item => !filteredOptions.includes(item));
      onSelectionChange(newSelected);
    } else {
      // Select all filtered options
      const newSelected = Array.from(new Set([...selected, ...filteredOptions]));
      onSelectionChange(newSelected);
    }
  };

  const handleToggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onSelectionChange(newSelected);
  };

  const displayText = selected.length === 0 
    ? `Select ${label.toLowerCase()}...` 
    : `${selected.length} ${label.toLowerCase()}${selected.length === 1 ? '' : 's'} selected`;

  return (
    <div className={className}>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}-filter`}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 text-foreground" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid={`input-search-${label.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </div>
            {filteredOptions.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                  id={`select-all-${label}`}
                  checked={isAllSelected}
                  ref={(ref) => {
                    if (ref && 'indeterminate' in ref) {
                      (ref as any).indeterminate = isPartialSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  data-testid={`checkbox-select-all-${label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <label 
                  htmlFor={`select-all-${label}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All
                </label>
              </div>
            )}
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {sortedOptions.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                No options found
              </p>
            ) : (
              sortedOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2 p-2 hover-elevate rounded-md">
                  <Checkbox
                    id={`${label}-${option}`}
                    checked={selected.includes(option)}
                    onCheckedChange={() => handleToggleOption(option)}
                    data-testid={`checkbox-${label.toLowerCase().replace(/\s+/g, '-')}-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <label
                    htmlFor={`${label}-${option}`}
                    className="text-sm cursor-pointer flex-1 text-foreground"
                  >
                    {option}
                  </label>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}