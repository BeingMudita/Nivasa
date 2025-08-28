import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-illustration.jpg";
import { surveyQuestions } from "@/data/surveyQuestions";


interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Survey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartSurvey = () => {
    setHasStarted(true);
    setCurrentQuestionIndex(0);

    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "assistant",
      content: "Hi! Let's find your perfect roommate. I'll ask you a few questions about your preferences.",
      timestamp: new Date(),
    };

    const firstQuestion: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: surveyQuestions[0].question,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage, firstQuestion]);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !user) return;

    const currentQuestion = surveyQuestions[currentQuestionIndex];

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: textInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save locally
    setUserResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: textInput,
    }));

    // Clear input
    setTextInput("");

    // Move to next question or finish
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextQuestion = surveyQuestions[nextQuestionIndex];

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: nextQuestion.question,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentQuestionIndex(nextQuestionIndex);
      }, 500);
    } else {
      // Survey completed: send all responses at once
      setTimeout(async () => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "Thank you for completing the survey! We'll use your responses to find the best roommate match for you.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, completionMessage]);

        try {
          const payload = {
            uid: user.id,
            email: user.email,
            responses: userResponses,
          };

          const res = await fetch("http://localhost:8000/survey-response", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const err = await res.json();
            console.error("Backend error:", err);
            alert("Failed to save survey to backend.");
          } else {
            console.log("Survey saved to backend:", payload);
          }
        } catch (err) {
          console.error("Error sending survey to backend:", err);
        }
      }, 500);
    }
  };

  const handleContinueToMatches = () => {
    navigate("/matches");
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <img
            src={heroImage}
            alt="Women in cozy living space"
            className="w-full max-w-lg mx-auto rounded-2xl shadow-floating mb-8 animate-fade-in"
          />
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Hi! Let's find your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                compatible roommate
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Answer a few questions about your lifestyle and preferences to find your perfect match.
              It takes just 2–3 minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                variant="gradient" 
                onClick={handleStartSurvey}
                className="text-lg px-8 py-6"
              >
                Start Survey
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSurveyComplete = currentQuestionIndex >= surveyQuestions.length - 1 && 
                          messages[messages.length - 1]?.type === 'assistant' &&
                          messages[messages.length - 1]?.content.includes("Thank you");

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Roommate Compatibility Survey</span>
            <span>{currentQuestionIndex + 1} of {surveyQuestions.length}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / surveyQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 mb-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <Card className={`max-w-md p-4 ${
                message.type === 'user'
                  ? 'bg-chat-user text-primary-foreground rounded-br-sm'
                  : 'bg-chat-assistant text-secondary-foreground rounded-bl-sm'
              } shadow-soft`}>
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            {!isSurveyComplete ? (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={messages[messages.length - 1]?.type !== 'assistant'}
                />
                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg"
                  disabled={!textInput.trim() || messages[messages.length - 1]?.type !== 'assistant'}
                >
                  Send
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <Button
                  variant="floating"
                  onClick={handleContinueToMatches}
                  className="mx-auto"
                >
                  View Your Matches <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;