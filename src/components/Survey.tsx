import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-illustration.jpg";
import { surveyQuestions } from "@/data/surveyQuestions";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: Array<{label: string, value: string | number}>;
}

const Survey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string | number>>({});
  const [isSurveyComplete, setIsSurveyComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to matches when survey is complete
  useEffect(() => {
    if (isSurveyComplete) {
      // Wait a moment to show the completion message, then redirect
      const timer = setTimeout(() => {
        navigate("/matches");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSurveyComplete, navigate]);

  const handleStartSurvey = () => {
    setHasStarted(true);
    setCurrentQuestionIndex(0);
    setIsSurveyComplete(false);

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
      options: surveyQuestions[0].options
    };

    setMessages([welcomeMessage, firstQuestion]);
  };

  const handleOptionSelect = (value: string | number) => {
    if (!user) return;

    const currentQuestion = surveyQuestions[currentQuestionIndex];
    
    // Add user's selection as a message
    const selectedOption = currentQuestion.options.find(opt => opt.value === value);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: selectedOption ? selectedOption.label : String(value),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save response
    setUserResponses(prev => ({
      ...prev,
      [currentQuestion.mlField]: value
    }));

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
          options: nextQuestion.options
        };
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentQuestionIndex(nextQuestionIndex);
      }, 800);
    } else {
      // Survey completed
      setTimeout(async () => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Thank you for completing the survey! We'll use your responses to find the best roommate match for you.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, completionMessage]);
        
        // Mark survey as complete - this will trigger the redirect
        setIsSurveyComplete(true);

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
            // Don't alert the user since we're redirecting anyway
          } else {
            console.log("Survey saved to backend:", payload);
          }
        } catch (err) {
          console.error("Error sending survey to backend:", err);
        }
      }, 800);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Remove the last question and user response
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Keep messages up to the previous question
      const assistantMessages = messages.filter(msg => msg.type === 'assistant');
      const lastAssistantIndex = assistantMessages.length - 1;
      
      if (lastAssistantIndex >= 1) {
        const keepUntilId = assistantMessages[lastAssistantIndex - 1].id;
        const keepUntilIndex = messages.findIndex(msg => msg.id === keepUntilId);
        setMessages(prev => prev.slice(0, keepUntilIndex + 1));
      }
      
      // Remove the last response
      const currentQuestion = surveyQuestions[newIndex];
      setUserResponses(prev => {
        const newResponses = {...prev};
        delete newResponses[currentQuestion.mlField];
        return newResponses;
      });
    }
  };

  const handleGoHome = () => {
    navigate("/");
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
              {user ? (
                <Button 
                  size="lg" 
                  variant="gradient" 
                  onClick={handleStartSurvey}
                  className="text-lg px-8 py-6"
                >
                  Start Survey
                </Button>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Please <span className="text-primary cursor-pointer" onClick={() => navigate("/auth")}>log in</span> to start the survey.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <div className="mb-8 flex items-center">
          {currentQuestionIndex > 0 && !isSurveyComplete && (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mr-4"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={handleGoHome}
            className="mr-4"
          >
            <Home className="w-4 h-4" /> Home
          </Button>
          
          <div className="flex-1">
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
                
                {message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start h-auto py-2 whitespace-normal"
                        onClick={() => handleOptionSelect(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
                
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
            {isSurveyComplete ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Redirecting to matches...</p>
                <Button
                  variant="floating"
                  onClick={() => navigate("/matches")}
                  className="mx-auto"
                >
                  Go to Matches Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Select an option above to continue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;