import { useState, useEffect, useRef } from "react";
import { Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportForm } from "./ReportForm";
import { SavedReportsList } from "./SavedReportsList";
import { SyncStatus, SyncStatusHandle } from "./SyncStatus";
import { MissingProductsSync } from "./MissingProductsSync";
import { FeedbackForm } from "./FeedbackForm";
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
  excludeContinuations: boolean;
  fileType: "csv" | "xlsx";
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

// Cookie helper functions
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// API URL from environment variable - easily configurable
const API_URL = import.meta.env.VITE_API_URL || "https://lightspeedordermanager.onrender.com";

export function LightSpeedLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<
    Partial<ReportData>
  >({});
  const [apiKey, setApiKey] = useState<string>("");
  const [keyInput, setKeyInput] = useState("");
  const currentUserName = apiKey.split("|")[1] || "";
  const syncStatusRef = useRef<SyncStatusHandle>(null);

  // Load API key from cookie on mount
  useEffect(() => {
    const savedKey = getCookie("api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Helper function to create headers with API key
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
  });

  // Fetch suppliers from API (only when authenticated)
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers", apiKey],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/suppliers`, {
        headers: { "X-API-Key": apiKey },
      });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiKey,
  });

  // Fetch categories from API (only when authenticated)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories", apiKey],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/categories`, {
        headers: { "X-API-Key": apiKey },
      });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiKey,
  });

  // Fetch outlets from API (only when authenticated)
  const { data: outlets = [], isLoading: outletsLoading } = useQuery({
    queryKey: ["/api/outlets", apiKey],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/outlets`, {
        headers: { "X-API-Key": apiKey },
      });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiKey,
  });

  // Fetch saved reports from API (only when authenticated)
  const {
    data: savedReports = [],
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["/api/saved_reports", apiKey],
    queryFn: () =>
      fetch(`${API_URL}/api/saved_reports`, {
        headers: { "X-API-Key": apiKey },
      }).then((res) => res.json()),
    enabled: !!apiKey,
  });

  // Dark mode toggle - default to dark if no preference saved
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === null ? true : saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Handle login
  const handleLogin = () => {
    if (keyInput.trim()) {
      setCookie("api_key", keyInput.trim());
      setApiKey(keyInput.trim());
      setKeyInput("");
    }
  };

  // Handle logout
  const handleLogout = () => {
    deleteCookie("api_key");
    setApiKey("");
    queryClient.clear();
  };

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
      fetch(`${API_URL}/api/generate_report`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then((res) => res.blob()),
    onSuccess: (blob, data) => {
      // Create download link for CSV or Excel
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = data.fileType === "xlsx" ? "xlsx" : "csv";
      link.download = `${data.reportName.replace(/[^a-zA-Z0-9]/g, "_")}.${extension}`;
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
      console.log("Saving report with data:", data);
      return fetch(`${API_URL}/api/save_report`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved_reports", apiKey] });
      console.log("Report saved successfully");
    },
    onError: (error) => {
      console.error("Error saving report:", error);
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) =>
      fetch(`${API_URL}/api/delete_report/${reportId}`, {
        method: "DELETE",
        headers: { "X-API-Key": apiKey },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved_reports", apiKey] });
      console.log("Report deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
    },
  });

  const handleGenerateReport = async (data: ReportData) => {
    console.log("Syncing data before generating report...");

    // First, sync data using the SyncStatus component
    try {
      if (syncStatusRef.current) {
        await syncStatusRef.current.startSync();
        console.log("Sync completed, generating report...");
      }
    } catch (error) {
      console.error("Sync error:", error);
      // Continue with report generation even if sync fails
    }

    console.log("Generating report with data:", data);
    generateReportMutation.mutate(data);
  };

  const handleSaveReport = async (data: ReportData) => {
    console.log("Saving report with data:", data);
    saveReportMutation.mutate({ ...data, createdBy: apiKey });
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
    console.log("Report loaded:", report.reportName);
  };

  const handleClearReport = () => {
    setCurrentReportData({});
    console.log("Report form cleared");
  };

  // Show login screen if no API key
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleDarkMode}
            className="rounded-full"
            data-testid="button-theme-toggle"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <img
              src="https://images.squarespace-cdn.com/content/v1/5cb9e195af4683da40b666a1/1563386393577-6L4GO7ED9WEYMMCLVSGI/UteTextLogo_PNG24_TRANS.png"
              alt="Ute Mountaineer"
              className="h-24 w-auto mx-auto mb-4 dark:invert dark:brightness-200"
            />
            <CardTitle className="text-2xl font-bold">Order Manager</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Purchase Order Reports
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium text-foreground block mb-2"
                  htmlFor="api-key-input"
                >
                  API Key
                </label>
                <input
                  id="api-key-input"
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  className="w-full px-4 py-3 text-sm border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Enter your API key..."
                  data-testid="input-api-key"
                />
              </div>
              <Button
                className="w-full h-11 text-base font-semibold"
                onClick={handleLogin}
                disabled={!keyInput.trim()}
                data-testid="button-login"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-4">
            <img
              src="https://images.squarespace-cdn.com/content/v1/5cb9e195af4683da40b666a1/1563386393577-6L4GO7ED9WEYMMCLVSGI/UteTextLogo_PNG24_TRANS.png"
              alt="Ute Mountaineer"
              className="h-20 w-auto dark:invert dark:brightness-200"
            />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Order Manager
              </h1>
              <p className="text-xs text-muted-foreground">Purchase Order Reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {currentUserName || apiKey.substring(0, 12) + "..."}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleDarkMode}
              className="rounded-full"
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
        <main className="flex-1 p-8 space-y-8">
          <ReportForm
            suppliers={suppliers}
            categories={categories}
            outlets={outlets}
            onGenerateReport={handleGenerateReport}
            onSaveReport={handleSaveReport}
            onClearReport={handleClearReport}
            initialData={currentReportData}
            isGenerating={generateReportMutation.isPending}
            isSaving={saveReportMutation.isPending}
            className="shadow-lg border-2"
          />
          <FeedbackForm apiUrl={API_URL} apiKey={apiKey} className="max-w-2xl" />
        </main>

        {/* Saved Reports Sidebar */}
        <aside className="w-80 border-l border-border bg-muted/30">
          <div className="p-4 space-y-4">
            <SavedReportsList
              reports={savedReports}
              currentUserName={currentUserName}
              onDeleteReport={handleDeleteReport}
              onLoadReport={handleLoadReport}
            />
            <div className="pt-2 border-t border-border space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Data Sync</p>
              <SyncStatus ref={syncStatusRef} apiUrl={API_URL} apiKey={apiKey} />
              <MissingProductsSync apiUrl={API_URL} apiKey={apiKey} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
