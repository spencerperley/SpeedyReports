import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SyncStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  current?: number;
  total?: number;
  message?: string;
}

interface SyncStatusProps {
  apiUrl: string;
  apiKey: string;
}

const SYNC_STEPS: { id: string; label: string }[] = [
  { id: "suppliers", label: "Suppliers" },
  { id: "outlets", label: "Outlets" },
  { id: "categories", label: "Categories" },
  { id: "products", label: "Products" },
  { id: "consignments", label: "Consignments" },
  { id: "consignment_products", label: "Consignment Products" },
  { id: "inventory", label: "Inventory" },
];

export function SyncStatus({ apiUrl, apiKey }: SyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [steps, setSteps] = useState<SyncStep[]>(
    SYNC_STEPS.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [error, setError] = useState<string | null>(null);

  const resetSteps = useCallback(() => {
    setSteps(SYNC_STEPS.map((s) => ({ ...s, status: "pending" as const })));
    setError(null);
  }, []);

  const startSync = useCallback(() => {
    resetSteps();
    setIsSyncing(true);

    const eventSource = new EventSource(`${apiUrl}/api/update_data`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { step, status, current, total, message } = data;

        if (step === "done") {
          setIsSyncing(false);
          eventSource.close();
          return;
        }

        if (step === "error") {
          setError(message || "An error occurred during sync");
          setIsSyncing(false);
          eventSource.close();
          return;
        }

        setSteps((prev) =>
          prev.map((s) =>
            s.id === step
              ? {
                  ...s,
                  status: status as SyncStep["status"],
                  current,
                  total,
                  message,
                }
              : s
          )
        );
      } catch (e) {
        console.error("Error parsing SSE data:", e);
      }
    };

    eventSource.onerror = () => {
      setError("Connection lost. Please try again.");
      setIsSyncing(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl, resetSteps]);

  const getStatusIcon = (step: SyncStep) => {
    switch (step.status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusText = (step: SyncStep) => {
    if (step.status === "completed") {
      if (step.total && step.total > 0) {
        return `${step.total.toLocaleString()} synced`;
      }
      return "Up to date";
    }
    if (step.status === "in_progress") {
      // For consignment products, show x/y format
      if (step.total && step.total > 0 && step.id === "consignment_products") {
        return `${step.current}/${step.total}`;
      }
      // For other items, show count fetched
      if (step.current && step.current > 0) {
        return `${step.current.toLocaleString()} fetched...`;
      }
      return "Starting...";
    }
    return "";
  };

  const getTextColor = (step: SyncStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Sync
          </CardTitle>
          <Button
            size="sm"
            onClick={startSync}
            disabled={isSyncing}
            data-testid="button-sync-data"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <ul className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center justify-between py-1 ${getTextColor(step)}`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(step)}
                <span className={step.status === "pending" ? "text-muted-foreground" : ""}>
                  {step.label}
                </span>
              </div>
              <span className="text-sm tabular-nums">
                {getStatusText(step)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
