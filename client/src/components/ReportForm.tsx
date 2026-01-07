import { useState, useEffect } from "react";
import { FileText, Download, Save, RotateCcw, Filter, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  excludeContinuations: boolean;
  fileType: "csv" | "xlsx";
}

interface ReportFormProps {
  suppliers: string[];
  categories: string[];
  outlets: string[];
  onGenerateReport: (data: ReportFormData) => void;
  onSaveReport: (data: ReportFormData) => void;
  onClearReport?: () => void;
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
  onClearReport,
  initialData = {},
  isGenerating = false,
  isSaving = false,
  className = "",
}: ReportFormProps) {
  const getDefaultFormData = (): ReportFormData => ({
    reportName: "",
    startDate: "",
    endDate: "",
    selectedOutlets: [],
    selectedSuppliers: [],
    selectedCategories: [],
    includeNonzeroOnly: false,
    excludeContinuations: false,
    fileType: "csv",
  });

  const [formData, setFormData] = useState<ReportFormData>({
    ...getDefaultFormData(),
    ...initialData,
  });

  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    setFormData({
      ...getDefaultFormData(),
      ...initialData,
    });
    setShowValidationErrors(false);
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
    if (!isFormValid()) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    onGenerateReport(formData);
    console.log("Generate report triggered with data:", formData);
  };

  const handleSaveReport = () => {
    if (!isFormValid()) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    onSaveReport(formData);
    console.log("Save report triggered with data:", formData);
  };

  const handleClearReport = () => {
    setFormData(getDefaultFormData());
    setShowValidationErrors(false);
    onClearReport?.();
    console.log("Report form cleared");
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!formData.reportName.trim()) {
      errors.push("Report name is required");
    }
    if (!formData.startDate) {
      errors.push("Start date is required");
    }
    if (!formData.endDate) {
      errors.push("End date is required");
    }
    if (formData.startDate && formData.endDate && !isValidDateRange(formData.startDate, formData.endDate)) {
      errors.push("Start date must be before or equal to end date");
    }
    return errors;
  };

  const isFormValid = () => {
    return getValidationErrors().length === 0;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-6 w-6" />
          </div>
          Purchase Order Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Report Basics Section */}
        <div className="space-y-4">
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
              className="text-base"
              data-testid="input-report-name"
            />
          </div>

          <DateRangePicker
            startDate={formData.startDate}
            endDate={formData.endDate}
            onStartDateChange={(date) => handleInputChange("startDate", date)}
            onEndDateChange={(date) => handleInputChange("endDate", date)}
          />
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Filters</span>
          </div>

          <FilterDropdown
            label="Outlet Filter"
            options={outlets}
            selected={formData.selectedOutlets}
            onSelectionChange={(selected) =>
              handleInputChange("selectedOutlets", selected)
            }
            searchPlaceholder="Search outlets..."
          />

          <FilterDropdown
            label="Supplier Filter"
            options={suppliers}
            selected={formData.selectedSuppliers}
            onSelectionChange={(selected) =>
              handleInputChange("selectedSuppliers", selected)
            }
            searchPlaceholder="Search suppliers..."
          />

          <FilterDropdown
            label="Category Filter"
            options={categories}
            selected={formData.selectedCategories}
            onSelectionChange={(selected) =>
              handleInputChange("selectedCategories", selected)
            }
            searchPlaceholder="Search categories..."
          />
        </div>

        {/* Options Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Options</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
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
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Include only nonzero quantities
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Checkbox
                id="exclude-continuations"
                checked={formData.excludeContinuations}
                onCheckedChange={(checked) =>
                  handleInputChange("excludeContinuations", checked as boolean)
                }
                data-testid="checkbox-exclude-continuations"
              />
              <Label
                htmlFor="exclude-continuations"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Exclude continuations ([cont], etc.)
              </Label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Export Format
            </Label>
            <Select
              value={formData.fileType}
              onValueChange={(value) => handleInputChange("fileType", value)}
            >
              <SelectTrigger className="w-full sm:w-48 text-foreground" data-testid="select-file-type">
                <SelectValue placeholder="Select format..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="csv" className="text-foreground hover:bg-accent">CSV (.csv)</SelectItem>
                <SelectItem value="xlsx" className="text-foreground hover:bg-accent">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Validation Errors */}
        {showValidationErrors && getValidationErrors().length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {getValidationErrors().map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            size="lg"
            className="flex-1 min-w-[200px] text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
            data-testid="button-generate-report"
          >
            <Download className="h-5 w-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveReport}
            disabled={isSaving}
            size="lg"
            data-testid="button-save-report"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearReport}
            size="lg"
            data-testid="button-clear-report"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
