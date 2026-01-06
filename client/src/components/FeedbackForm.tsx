import { useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
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
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Bug reports, feature requests, or just thoughts — give me your smallest nitpicks and loftiest aspirations.
          One item per send please! The more detail, the better.
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          {submitted ? (
            <span className="text-xs text-green-600 dark:text-green-400">
              Thanks for your feedback!
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {content.length > 0 ? `${content.length} characters` : ""}
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
