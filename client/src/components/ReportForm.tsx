import { useState, useEffect } from "react";
import { FileText, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterDropdown } from "./FilterDropdown";
import { DateRangePicker, isValidDateRange } from "./DateRangePicker";

interface ReportFormData {
  reportName: string;
  startDate: string;
  endDate: string;
  selectedOutlets: string[];
  selectedSuppliers: string[];
  selectedCategories: string[];
  includeNonzeroOnly: boolean;
}

interface ReportFormProps {
  suppliers: string[];
  categories: string[];
  outlets: string[];
  onGenerateReport: (data: ReportFormData) => void;
  onSaveReport: (data: ReportFormData) => void;
  initialData?: Partial<ReportFormData>;
  isGenerating?: boolean;
  isSaving?: boolean;
  className?: string;
}

export function ReportForm({
  suppliers,
  categories,
  outlets,
  onGenerateReport,
  onSaveReport,
  initialData = {},
  isGenerating = false,
  isSaving = false,
  className = "",
}: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reportName: initialData?.reportName ?? "",
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
    selectedOutlets: initialData?.selectedOutlets ?? [],
    selectedSuppliers: initialData?.selectedSuppliers ?? [],
    selectedCategories: initialData?.selectedCategories ?? [],
    includeNonzeroOnly: initialData?.includeNonzeroOnly ?? false,
  });

  useEffect(() => {
    setFormData({
      reportName: initialData?.reportName ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
      selectedOutlets: initialData?.selectedOutlets ?? [],
      selectedSuppliers: initialData?.selectedSuppliers ?? [],
      selectedCategories: initialData?.selectedCategories ?? [],
      includeNonzeroOnly: initialData?.includeNonzeroOnly ?? false,
    });
  }, [initialData]);

  console.log("ReportForm initialData:", initialData);

  // const outlets = ["Ute Mountaineer", "Neptune Mountaineering", "AXCC"]; // Fixed outlets as specified

  const handleInputChange = (field: keyof ReportFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    console.log(`${field} changed:`, value);
  };

  const handleGenerateReport = () => {
    onGenerateReport(formData);
    console.log("Generate report triggered with data:", formData);
  };

  const handleSaveReport = () => {
    onSaveReport(formData);
    console.log("Save report triggered with data:", formData);
  };

  const isFormValid = () => {
    return formData.reportName.trim() && isValidDateRange(formData.startDate, formData.endDate);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Purchase Order Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Name */}
        <div>
          <Label
            htmlFor="report-name"
            className="text-sm font-medium text-foreground mb-2 block"
          >
            Report Name
          </Label>
          <Input
            id="report-name"
            placeholder="Enter report name..."
            value={formData.reportName}
            onChange={(e) => handleInputChange("reportName", e.target.value)}
            data-testid="input-report-name"
          />
        </div>

        {/* Date Range */}
        <DateRangePicker
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={(date) => handleInputChange("startDate", date)}
          onEndDateChange={(date) => handleInputChange("endDate", date)}
        />

        {/* Outlet Filter */}
        <FilterDropdown
          label="Outlet Filter"
          options={outlets}
          selected={formData.selectedOutlets}
          onSelectionChange={(selected) =>
            handleInputChange("selectedOutlets", selected)
          }
          searchPlaceholder="Search outlets..."
        />

        {/* Supplier Filter */}
        <FilterDropdown
          label="Supplier Filter"
          options={suppliers}
          selected={formData.selectedSuppliers}
          onSelectionChange={(selected) =>
            handleInputChange("selectedSuppliers", selected)
          }
          searchPlaceholder="Search suppliers..."
        />

        {/* Category Filter */}
        <FilterDropdown
          label="Category Filter"
          options={categories}
          selected={formData.selectedCategories}
          onSelectionChange={(selected) =>
            handleInputChange("selectedCategories", selected)
          }
          searchPlaceholder="Search categories..."
        />

        {/* Include Only Nonzero Quantities */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-nonzero"
            checked={formData.includeNonzeroOnly}
            onCheckedChange={(checked) =>
              handleInputChange("includeNonzeroOnly", checked as boolean)
            }
            data-testid="checkbox-include-nonzero-only"
          />
          <Label
            htmlFor="include-nonzero"
            className="text-sm font-medium cursor-pointer"
          >
            Include only nonzero quantities
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleGenerateReport}
            disabled={!isFormValid() || isGenerating}
            className="flex-1"
            data-testid="button-generate-report"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveReport}
            disabled={!isFormValid() || isSaving}
            data-testid="button-save-report"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
