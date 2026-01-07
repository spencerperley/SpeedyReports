import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackFormProps {
  apiUrl: string;
  apiKey: string;
  className?: string;
}

export function FeedbackForm({ apiUrl, apiKey, className = "" }: FeedbackFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          content: content.trim(),
          submitted_by: "",
        }),
      });

      if (response.ok) {
        setContent("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`${className} border-border bg-card`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          Share Your Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bug reports, feature requests, or just thoughts — give me your{" "}
          <span className="italic text-foreground font-medium">smallest nitpicks</span> and{" "}
          <span className="italic text-foreground font-medium">loftiest aspirations</span>.
        </p>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <MessageSquarePlus className="h-3 w-3" />
          One item per send
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? The more detail, the better..."
          className="w-full h-28 px-3 py-2.5 text-sm border-2 border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          {submitted ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Thanks for your feedback!
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {content.length > 0 ? `${content.length} characters` : ""}
            </span>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-4"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
