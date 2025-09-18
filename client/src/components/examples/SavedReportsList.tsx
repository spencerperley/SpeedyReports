import { useState } from "react";
import { SavedReportsList } from "../SavedReportsList";

export default function SavedReportsListExample() {
  // Mock saved reports data for demo //todo: remove mock functionality
  const [mockReports, setMockReports] = useState([
    {
      id: "1",
      name: "Q4 Purchase Orders",
      dateCreated: "2024-01-15",
      dateRange: {
        start: "2024-10-01",
        end: "2024-12-31"
      },
      outlets: ["Ute Mountaineer", "Neptune"],
      suppliers: ["ABC Electronics Ltd", "TechCorp Solutions"],
      categories: ["Electronics", "Components"],
      includeNonzeroOnly: true
    },
    {
      id: "2", 
      name: "Monthly Electronics Report",
      dateCreated: "2024-01-10",
      dateRange: {
        start: "2024-01-01",
        end: "2024-01-31"
      },
      outlets: ["Ute Mountaineer"],
      suppliers: ["Global Components Inc", "Prime Manufacturing"],
      categories: ["Electronics"],
      includeNonzeroOnly: false
    },
    {
      id: "3",
      name: "All Suppliers Overview",
      dateCreated: "2024-01-05",
      dateRange: {
        start: "2024-01-01", 
        end: "2024-12-31"
      },
      outlets: ["Ute Mountaineer", "Neptune"],
      suppliers: ["ABC Electronics Ltd", "TechCorp Solutions", "Global Components Inc"],
      categories: ["Electronics", "Components", "Materials"],
      includeNonzeroOnly: true
    }
  ]);

  const handleDeleteReport = (reportId: string) => {
    setMockReports(reports => reports.filter(r => r.id !== reportId));
  };

  const handleLoadReport = (report: any) => {
    console.log('Loading report:', report);
  };

  return (
    <div className="w-80 h-96">
      <SavedReportsList
        reports={mockReports}
        onDeleteReport={handleDeleteReport}
        onLoadReport={handleLoadReport}
      />
    </div>
  );
}