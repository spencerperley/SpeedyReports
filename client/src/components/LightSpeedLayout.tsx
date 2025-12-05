import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportForm } from "./ReportForm";
import { SavedReportsList } from "./SavedReportsList";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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
  reportName: string;
  createdBy: string;
  startDate: string;
  endDate: string;

  selectedOutlets: string[];
  selectedSuppliers: string[];
  selectedCategories: string[];
  includeNonzeroOnly: boolean;
}

export function LightSpeedLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<
    Partial<ReportData>
  >({});
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const currentUserName = currentUserEmail.split("|")[1]

  // Fetch suppliers from API
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: () =>
      fetch("http://localhost:3000/api/suppliers").then((res) => res.json()),
  });

  // Fetch categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () =>
      fetch("http://localhost:3000/api/categories").then((res) => res.json()),
  });
  const outlets = ["Ute Mountaineer", "Neptune Mountaineering", "AXCC"];
  // Fetch outlets from API
  // const { data: outlets = [], isLoading: outletsLoading } = useQuery{
  //   queryKey: ["/api/outlets"],
  //     queryFn: () =>
  //     fetch("http://localhost:3000/api/outlets").then((res) => res.json())
  // });

  // Fetch saved reports from API
  const {
    data: savedReports = [],
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["/api/saved_reports"],
    queryFn: () =>
      fetch("http://localhost:3000/api/saved_reports").then((res) =>
        res.json(),
      ),
  });

  // Dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
    console.log("Dark mode toggled:", newDarkMode);
  };

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (data: ReportData) =>
      fetch("http://localhost:3000/api/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.blob()),
    onSuccess: (blob, data) => {
      // Create download link for CSV
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.reportName.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log("Report generated and downloaded successfully");
    },
    onError: (error) => {
      console.error("Error generating report:", error);
    },
  });

  // Save report mutation
  const saveReportMutation = useMutation({
    mutationFn: (data: ReportData & { createdBy: string }) => {
      console.log("Saving report with data:", data); // log before request
      return fetch("http://localhost:3000/api/save_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved_reports"] });
      console.log("Report saved successfully");
    },
    onError: (error) => {
      console.error("Error saving report:", error);
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) =>
      fetch(`http://localhost:3000/api/delete_report/${reportId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved_reports"] });
      console.log("Report deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
    },
  });

  const handleGenerateReport = async (data: ReportData) => {
    console.log("Generating report with data:", data);
    generateReportMutation.mutate(data);
  };

  const handleSaveReport = async (data: ReportData) => {
    console.log("Saving report with data:", data);
    saveReportMutation.mutate({ ...data, createdBy: currentUserEmail });
  };

  const handleDeleteReport = async (reportId: string) => {
    console.log("Deleting report:", reportId);
    deleteReportMutation.mutate(reportId);
  };

  const handleLoadReport = (report: SavedReport) => {
    const reportData: Partial<ReportData> = {
      reportName: report.reportName,
      startDate: report.startDate,
      endDate: report.endDate,
      selectedOutlets: report.selectedOutlets,
      selectedSuppliers: report.selectedSuppliers,
      selectedCategories: report.selectedCategories,
      includeNonzeroOnly: report.includeNonzeroOnly,
    };
    setCurrentReportData(reportData);
    console.log("Report loaded:", report.name);
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
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="user-email"
              >
                Current User Key:
              </label>
              <input
                id="user-email"
                type="email"
                value={currentUserEmail}
                onChange={(e) => {
                  setCurrentUserEmail(e.target.value);
                  console.log("User email changed:", e.target.value);
                }}
                className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter Key..."
                data-testid="input-user-email"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleDarkMode}
              data-testid="button-theme-toggle"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
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
            outlets={outlets}
            onGenerateReport={handleGenerateReport}
            onSaveReport={handleSaveReport}
            initialData={currentReportData}
            isGenerating={generateReportMutation.isPending}
            isSaving={saveReportMutation.isPending}
          />
        </main>

        {/* Saved Reports Sidebar */}
        <aside className="w-80 border-l border-border">
          <div className="p-4">
            <SavedReportsList
              reports={savedReports}
              currentUserName={currentUserName}
              onDeleteReport={handleDeleteReport}
              onLoadReport={handleLoadReport}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
