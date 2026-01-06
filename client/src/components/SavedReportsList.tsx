import { useState } from "react";
import { Trash2, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

interface SavedReportsListProps {
  reports: SavedReport[];
  currentUserName: string;
  onDeleteReport: (reportId: string) => void;
  onLoadReport: (report: SavedReport) => void;
  className?: string;
}

// Helper to partially hide the API key (show username or masked key)
function formatCreatedBy(createdBy: string): string {
  if (!createdBy) return "Unknown";

  // Check if the format is "token|username"
  if (createdBy.includes("|")) {
    const username = createdBy.split("|")[1];
    if (username) return username;
  }

  // Otherwise show first 8 chars + ... + last 4 chars
  if (createdBy.length > 16) {
    return `${createdBy.substring(0, 8)}...${createdBy.substring(createdBy.length - 4)}`;
  }

  return createdBy.substring(0, 8) + "...";
}

export function SavedReportsList({
  reports,
  currentUserName,
  onDeleteReport,
  onLoadReport,
  className = "",
}: SavedReportsListProps) {
  console.log("reports prop:", reports);
  console.log("type:", typeof reports, Array.isArray(reports));
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleLoadReport = (report: SavedReport) => {
    setSelectedReportId(report.id);
    onLoadReport(report);
    console.log("Report loaded:", report.reportName);
  };

  const handleDeleteReport = (reportId: string, reportName: string) => {
    onDeleteReport(reportId);
    console.log("Report deleted:", reportName);
    if (selectedReportId === reportId) {
      setSelectedReportId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper to extract username from createdBy (format: "token|username" or just key)
  const getUsernameFromCreatedBy = (createdBy: string): string => {
    if (createdBy.includes("|")) {
      return createdBy.split("|")[1] || createdBy;
    }
    return createdBy;
  };

  // Split reports into "My Reports" and "Other"
  const myReports = reports.filter(
    (report) => getUsernameFromCreatedBy(report.createdBy) === currentUserName,
  );
  const otherReports = reports.filter(
    (report) => getUsernameFromCreatedBy(report.createdBy) !== currentUserName,
  );

  const renderReportSection = (
    sectionReports: SavedReport[],
    title: string,
    startIndex: number = 0,
  ) => (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-2 px-4">
        {title}
      </h3>
      {sectionReports.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-xs">No reports in this section</p>
        </div>
      ) : (
        <div className="space-y-0">
          {sectionReports.map((report, index) => (
            <div key={report.id}>
              <div
                className={`p-4 hover-elevate cursor-pointer transition-colors ${
                  selectedReportId === report.id ? "bg-accent" : ""
                }`}
                onClick={() => handleLoadReport(report)}
                data-testid={`report-item-${report.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {report.reportName}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(report.startDate)} -{" "}
                        {formatDate(report.endDate)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created by: {formatCreatedBy(report.createdBy)}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {report.selectedOutlets.length} outlets,{" "}
                      {report.selectedSuppliers.length} suppliers
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report.id, report.reportName);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    data-testid={`button-delete-report-${report.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {index < sectionReports.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Saved Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved reports yet</p>
            <p className="text-xs mt-1">
              Create your first report to see it here
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {renderReportSection(myReports, "My Reports")}
            {myReports.length > 0 && otherReports.length > 0 && (
              <Separator className="my-4" />
            )}
            {renderReportSection(otherReports, "Other")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
