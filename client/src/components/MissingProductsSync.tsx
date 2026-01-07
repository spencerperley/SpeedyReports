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
    <Card className="border-border/50 bg-background/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            Missing Products
          </CardTitle>
          <Button
            size="sm"
            onClick={startSync}
            disabled={isSyncing}
            variant={status === "completed" ? "outline" : "outline"}
            className="h-7 text-xs px-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Syncing
              </>
            ) : status === "completed" ? (
              <>
                <Check className="h-3 w-3 mr-1.5 text-green-600" />
                Done
              </>
            ) : (
              <>
                <Package className="h-3 w-3 mr-1.5" />
                Sync
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {error && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {status !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="tabular-nums">
                {current.toLocaleString()} / {total.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
            {message && (
              <p className={`text-xs ${status === "completed" ? "text-green-600" : "text-muted-foreground"}`}>
                {message}
              </p>
            )}
          </div>
        )}

        {status === "idle" && (
          <p className="text-xs text-muted-foreground/80">
            Sync products missed during previous syncs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
