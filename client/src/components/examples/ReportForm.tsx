import { useState } from "react";
import { ReportForm } from "../ReportForm";

export default function ReportFormExample() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data for demo //todo: remove mock functionality
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

  const mockCategories = [
    "Electronics",
    "Components", 
    "Materials",
    "Hardware",
    "Software",
    "Tools",
    "Equipment",
    "Supplies",
    "Parts",
    "Accessories"
  ];

  const handleGenerateReport = (data: any) => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Report generated successfully');
    }, 2000);
  };

  const handleSaveReport = (data: any) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      console.log('Report saved successfully');
    }, 1000);
  };

  return (
    <div className="max-w-2xl">
      <ReportForm
        suppliers={mockSuppliers}
        categories={mockCategories}
        onGenerateReport={handleGenerateReport}
        onSaveReport={handleSaveReport}
        isGenerating={isGenerating}
        isSaving={isSaving}
      />
    </div>
  );
}