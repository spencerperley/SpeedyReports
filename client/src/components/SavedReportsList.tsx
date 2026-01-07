import { useState } from "react";
import { Trash2, FileText, Calendar, FolderOpen, User } from "lucide-react";
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
    showCreator: boolean = false,
    canDelete: boolean = true,
  ) => (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1 uppercase tracking-wide">
        {title}
      </h3>
      {sectionReports.length === 0 ? (
        <div className="p-3 text-center text-muted-foreground">
          <p className="text-xs opacity-75">No reports in this section</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sectionReports.map((report) => (
            <div
              key={report.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedReportId === report.id
                  ? "bg-primary/10 border border-primary/30 shadow-sm"
                  : "bg-background hover:bg-muted/80 border border-transparent"
              }`}
              onClick={() => handleLoadReport(report)}
              data-testid={`report-item-${report.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {report.reportName}
                  </h4>
                  {showCreator && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {formatCreatedBy(report.createdBy)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {formatDate(report.startDate)} - {formatDate(report.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{report.selectedOutlets.length} outlets</span>
                    <span>{report.selectedSuppliers.length} suppliers</span>
                  </div>
                </div>
                {canDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report.id, report.reportName);
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    data-testid={`button-delete-report-${report.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className={`${className} border-0 shadow-none bg-transparent`}>
      <CardHeader className="px-1 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
          <FolderOpen className="h-4 w-4 text-primary" />
          Saved Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground rounded-lg border border-dashed border-border">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No saved reports yet</p>
            <p className="text-xs mt-1 opacity-75">
              Create your first report to see it here
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
            {renderReportSection(myReports, "My Reports", false, true)}
            {myReports.length > 0 && otherReports.length > 0 && (
              <Separator className="my-3" />
            )}
            {renderReportSection(otherReports, "Others' Reports", true, false)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
