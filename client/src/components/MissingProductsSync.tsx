import { useState, useCallback } from "react";
import { Package, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MissingProductsSyncProps {
  apiUrl: string;
  apiKey: string;
}

export function MissingProductsSync({ apiUrl, apiKey }: MissingProductsSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "in_progress" | "completed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setCurrent(0);
    setTotal(0);
    setMessage("");
    setStatus("idle");
    setError(null);
  }, []);

  const startSync = useCallback(() => {
    reset();
    setIsSyncing(true);
    setStatus("in_progress");

    const eventSource = new EventSource(`${apiUrl}/api/sync_missing_products`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCurrent(data.current || 0);
        setTotal(data.total || 0);
        setMessage(data.message || "");

        if (data.status === "completed") {
          setStatus("completed");
          setIsSyncing(false);
          eventSource.close();
          return;
        }

        if (data.status === "error") {
          setError(data.message || "An error occurred");
          setStatus("error");
          setIsSyncing(false);
          eventSource.close();
          return;
        }
      } catch (e) {
        console.error("Error parsing SSE data:", e);
      }
    };

    eventSource.onerror = () => {
      setError("Connection lost. Please try again.");
      setStatus("error");
      setIsSyncing(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl, reset]);

  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon()}
            Sync Missing Products
          </CardTitle>
          <Button
            size="sm"
            onClick={startSync}
            disabled={isSyncing}
            variant={status === "completed" ? "outline" : "default"}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : status === "completed" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Start Sync
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

        {status !== "idle" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="tabular-nums font-medium">
                {current.toLocaleString()} / {total.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {message && (
              <p className={`text-sm ${status === "completed" ? "text-green-600" : "text-muted-foreground"}`}>
                {message}
              </p>
            )}
          </div>
        )}

        {status === "idle" && (
          <p className="text-sm text-muted-foreground">
            Sync consignment products that were missed during previous syncs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
