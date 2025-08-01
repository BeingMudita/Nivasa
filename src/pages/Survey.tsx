import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

declare global {
  interface Window {
    OmnidimensionWidget: any;
  }
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Survey = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState("");
  const [isOmnidimLoaded, setIsOmnidimLoaded] = useState(false);
  const omnidimWidgetRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Omnidim widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'omnidimension-web-widget';
    script.src = 'https://backend.omnidim.io/web_widget.js?secret_key=24059fb320159fe474451bccb28914cb';
    script.async = true;
    script.onload = () => {
      setIsOmnidimLoaded(true);
      initializeOmnidim();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Omnidim widget in background mode
  const initializeOmnidim = () => {
    if (window.OmnidimensionWidget) {
      omnidimWidgetRef.current = new window.OmnidimensionWidget({
        agentId: '8685',
        backgroundMode: true, // Run in background without UI
        onMessage: (message: { role: string; content: string }) => {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type: message.role === 'user' ? 'user' : 'assistant',
            content: message.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, newMessage]);
        },
        onTranscriptUpdate: (transcript: string) => {
          setCurrentTranscript(transcript);
        },
        onCallStart: () => {
          setIsRecording(true);
        },
        onCallEnd: () => {
          setIsRecording(false);
          setCurrentTranscript("");
        },
        onKeywordsExtracted: (keywords: any) => {
          // Handle extracted keywords from Omnidim
          console.log('Extracted keywords:', keywords);
          // You can store these keywords in state or send to your backend
        }
      });
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  const handleStartSurvey = (mode: 'voice' | 'text') => {
    setInputMode(mode);
    setHasStarted(true);
    
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: mode === 'voice' 
        ? "Hi! I'll help find your perfect roommate. Please speak your answers." 
        : "Hi! Let's find your perfect roommate. Please answer the following questions:\n\n1. What's most important to you in a living space?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    if (mode === 'voice' && isOmnidimLoaded && omnidimWidgetRef.current) {
      omnidimWidgetRef.current.startCall();
    }
  };

  const handleVoiceInput = () => {
    if (!isOmnidimLoaded) return;

    if (isRecording) {
      omnidimWidgetRef.current?.endCall();
    } else {
      omnidimWidgetRef.current?.startCall();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: textInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");

    // Simulate assistant responses
    const questions = [
      "What best describes your sleeping habit? (Early sleeper, On-time sleeper, Night owl)",
      "What best describes your diet? (Vegetarian, Vegan, Flexitarian, Non-vegetarian)",
      "How clean and organized do you keep your space? (1-5 scale)",
      "Which environment do you prefer in your living space? (Quiet, Balanced, Social)",
      "How comfortable are you sharing things like food or utensils? (Not comfortable, Okay with some, Very open)"
    ];

    if (messages.length < questions.length * 2) {
      const nextQuestion = questions[Math.floor(messages.length / 2)];
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: nextQuestion,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantResponse]);
    } else {
      const completionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Thank you for completing the survey! We'll use your responses to find the best roommate match for you.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
    }
  };

  const handleContinueToProfile = () => {
    navigate('/profile-review');
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="animate-fade-in">
            <img 
              src={heroImage} 
              alt="Women in cozy living space" 
              className="w-full max-w-lg mx-auto rounded-2xl shadow-floating mb-8"
            />
          </div>
          
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Hi! Let's find your 
              <span className="bg-gradient-primary bg-clip-text text-transparent"> compatible roommate</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Our AI assistant will ask you a few friendly questions to understand your lifestyle and preferences. 
              It takes just 2-3 minutes!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="xl" 
                variant="gradient" 
                onClick={() => handleStartSurvey('voice')}
                className="group"
                disabled={!isOmnidimLoaded}
              >
                <Mic className="mr-2 h-5 w-5 group-hover:animate-bounce-gentle" />
                Start Voice Survey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="xl" 
                variant="floating"
                onClick={() => handleStartSurvey('text')}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Use Text Instead
              </Button>
            </div>

            {!isOmnidimLoaded && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Loading voice assistant...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{inputMode === 'voice' ? 'Voice Survey' : 'Text Survey'}</span>
            <span>2-3 minutes</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(messages.filter(m => m.type === 'user').length / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat messages */}
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
          
          {/* Current transcript */}
          {currentTranscript && (
            <div className="flex justify-end animate-fade-in">
              <Card className="max-w-md p-4 bg-chat-user/50 text-primary-foreground rounded-br-sm border-dashed">
                <p className="leading-relaxed italic">{currentTranscript}</p>
                <div className="flex items-center mt-2">
                  <div className="animate-pulse-soft text-xs">Speaking...</div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            {inputMode === 'voice' ? (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "gradient"}
                  onClick={handleVoiceInput}
                  className={`h-16 w-16 rounded-full ${isRecording ? 'animate-pulse-soft' : 'hover:scale-110'} transition-all`}
                >
                  <Mic className={`h-6 w-6 ${isRecording ? 'animate-bounce-gentle' : ''}`} />
                </Button>
                
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isRecording ? "Listening..." : "Tap to speak"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Or <button 
                      className="underline hover:text-primary" 
                      onClick={() => setInputMode('text')}
                    >
                      switch to text input
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" variant="gradient" size="lg">
                  Send
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setInputMode('voice')}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Voice
                </Button>
              </form>
            )}

            {messages.length >= 10 && (
              <Button
                variant="floating"
                onClick={handleContinueToProfile}
                className="mt-4 ml-auto"
              >
                Review Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;