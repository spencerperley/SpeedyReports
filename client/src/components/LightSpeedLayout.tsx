import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportForm } from "./ReportForm";
import { SavedReportsList } from "./SavedReportsList";

interface ReportData {
  reportName: string;
  startDate: string;
  endDate: string;
  selectedOutlets: string[];
  selectedSuppliers: string[];
  selectedCategories: string[];
  includeNonzeroOnly: boolean;
}

interface SavedReport {
  id: string;
  name: string;
  dateCreated: string;
  createdBy: string;
  dateRange: {
    start: string;
    end: string;
  };
  outlets: string[];
  suppliers: string[];
  categories: string[];
  includeNonzeroOnly: boolean;
}

export function LightSpeedLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<Partial<ReportData>>({});
  const [currentUserEmail, setCurrentUserEmail] = useState('user@example.com');

  // Dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    console.log('Dark mode toggled:', newDarkMode);
  };

  // Mock data for demo //todo: remove mock functionality
  useEffect(() => {
    // Simulate fetching suppliers and categories
    const mockSuppliers = [
      "ABC Electronics Ltd", "TechCorp Solutions", "Global Components Inc",
      "Prime Manufacturing", "Advanced Systems Co", "MegaTech Industries",
      "Universal Supplies", "Quality Parts Ltd", "NextGen Materials", 
      "Superior Components", "Elite Manufacturing", "ProTech Solutions",
      "Innovative Systems", "Alpha Components", "Beta Electronics"
    ];
    
    const mockCategories = [
      "Electronics", "Components", "Materials", "Hardware", "Software",
      "Tools", "Equipment", "Supplies", "Parts", "Accessories", 
      "Machinery", "Instruments", "Cables", "Connectors"
    ];

    const mockSavedReports = [
      {
        id: "1",
        name: "Q4 Purchase Orders",
        dateCreated: "2024-01-15",
        createdBy: "user@example.com",
        dateRange: { start: "2024-10-01", end: "2024-12-31" },
        outlets: ["Ute Mountaineer", "Neptune"],
        suppliers: ["ABC Electronics Ltd", "TechCorp Solutions"],
        categories: ["Electronics", "Components"],
        includeNonzeroOnly: true
      },
      {
        id: "2",
        name: "Monthly Electronics Report", 
        dateCreated: "2024-01-10",
        createdBy: "manager@company.com",
        dateRange: { start: "2024-01-01", end: "2024-01-31" },
        outlets: ["Ute Mountaineer"],
        suppliers: ["Global Components Inc"],
        categories: ["Electronics"],
        includeNonzeroOnly: false
      },
      {
        id: "3",
        name: "Annual Summary",
        dateCreated: "2024-01-08",
        createdBy: "other@company.com",
        dateRange: { start: "2024-01-01", end: "2024-12-31" },
        outlets: ["Ute Mountaineer", "Neptune"],
        suppliers: ["ABC Electronics Ltd", "Prime Manufacturing"],
        categories: ["Electronics", "Materials"],
        includeNonzeroOnly: true
      }
    ];

    setSuppliers(mockSuppliers);
    setCategories(mockCategories);
    setSavedReports(mockSavedReports);
  }, []);

  const handleGenerateReport = async (data: ReportData) => {
    setIsGenerating(true);
    console.log('Generating report with data:', data);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/generate-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // Simulate CSV download
      setTimeout(() => {
        setIsGenerating(false);
        console.log('Report generated and downloaded successfully');
        // Simulate file download trigger
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,Report%20Name,Date%20Range,Outlets%0A' + 
                   encodeURIComponent(data.reportName) + ',' + 
                   data.startDate + '%20to%20' + data.endDate + ',' +
                   data.selectedOutlets.join('%3B');
        link.download = `${data.reportName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 2000);
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating report:', error);
    }
  };

  const handleSaveReport = async (data: ReportData) => {
    setIsSaving(true);
    console.log('Saving report with data:', data);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/save-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      // Simulate API response
      setTimeout(() => {
        const newReport: SavedReport = {
          id: Date.now().toString(),
          name: data.reportName,
          dateCreated: new Date().toISOString().split('T')[0],
          createdBy: currentUserEmail,
          dateRange: {
            start: data.startDate,
            end: data.endDate
          },
          outlets: data.selectedOutlets,
          suppliers: data.selectedSuppliers,
          categories: data.selectedCategories,
          includeNonzeroOnly: data.includeNonzeroOnly
        };
        
        setSavedReports(prev => [newReport, ...prev]);
        setIsSaving(false);
        console.log('Report saved successfully');
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    console.log('Deleting report:', reportId);
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/delete-report/${reportId}`, { method: 'DELETE' });
      
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      console.log('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleLoadReport = (report: SavedReport) => {
    const reportData: Partial<ReportData> = {
      reportName: report.name,
      startDate: report.dateRange.start,
      endDate: report.dateRange.end,
      selectedOutlets: report.outlets,
      selectedSuppliers: report.suppliers,
      selectedCategories: report.categories,
      includeNonzeroOnly: report.includeNonzeroOnly
    };
    setCurrentReportData(reportData);
    console.log('Report loaded:', report.name);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">
            Light Speed Order Manager
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="user-email">
                Current User Email*:
              </label>
              <input
                id="user-email"
                type="email"
                value={currentUserEmail}
                onChange={(e) => {
                  setCurrentUserEmail(e.target.value);
                  console.log('User email changed:', e.target.value);
                }}
                className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter email..."
                data-testid="input-user-email"
              />
              <span className="text-xs text-muted-foreground">*Will be derived from Google auth</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleDarkMode}
              data-testid="button-theme-toggle"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Main Form Area */}
        <main className="flex-1 p-8">
          <ReportForm
            suppliers={suppliers}
            categories={categories}
            onGenerateReport={handleGenerateReport}
            onSaveReport={handleSaveReport}
            initialData={currentReportData}
            isGenerating={isGenerating}
            isSaving={isSaving}
          />
        </main>

        {/* Saved Reports Sidebar */}
        <aside className="w-80 border-l border-border">
          <div className="p-4">
            <SavedReportsList
              reports={savedReports}
              currentUserEmail={currentUserEmail}
              onDeleteReport={handleDeleteReport}
              onLoadReport={handleLoadReport}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}