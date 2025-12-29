import { useState, useEffect } from "react";
import { Moon, Sun, LogIn, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportForm } from "./ReportForm";
import { SavedReportsList } from "./SavedReportsList";
import { SyncStatus } from "./SyncStatus";
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
  const [darkMode, setDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<
    Partial<ReportData>
  >({});
  const [apiKey, setApiKey] = useState<string>("");
  const [keyInput, setKeyInput] = useState("");
  const currentUserName = apiKey.split("|")[1] || "";

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

  // Dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
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

  // Show login screen if no API key
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="absolute top-4 right-4">
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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Light Speed Order Manager</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter your API key to continue
            </p>
          </CardHeader>
          <CardContent>
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
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your API key..."
                  data-testid="input-api-key"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!keyInput.trim()}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
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
      <header className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">
            Light Speed Order Manager
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Logged in as: <span className="font-medium text-foreground">{currentUserName || apiKey.substring(0, 20)}...</span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
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
          <div className="p-4 space-y-4">
            <SyncStatus apiUrl={API_URL} apiKey={apiKey} />
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
