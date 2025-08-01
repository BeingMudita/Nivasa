import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";

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

  const handleStartSurvey = () => {
    setHasStarted(true);
    // Add welcome message from assistant
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: "Hi! I'm so excited to help you find your perfect roommate. Let's start with a quick question - what's most important to you in a living space?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Mock voice interaction - in a real app this would trigger Omnidim.io voice assistant logic
    
    if (!isRecording) {
      // Simulate starting recording with interim transcript
      setCurrentTranscript("I'm looking for someone who's clean and quiet...");
      
      // Simulate completed response after 3 seconds
      setTimeout(() => {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: "I'm looking for someone who's clean, quiet, and loves to cook. I work from home so I need a peaceful environment.",
          timestamp: new Date()
        };
        
        const assistantResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "That's wonderful! A peaceful environment is so important for remote work. Tell me about your daily routine - are you an early bird or a night owl?",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage, assistantResponse]);
        setCurrentTranscript("");
        setIsRecording(false);
      }, 3000);
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
                onClick={handleStartSurvey}
                className="group"
              >
                <Mic className="mr-2 h-5 w-5 group-hover:animate-bounce-gentle" />
                Start Voice Survey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="xl" 
                variant="floating"
                onClick={handleStartSurvey}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Use Text Instead
              </Button>
            </div>
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
            <span>Voice Survey</span>
            <span>2-3 minutes</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(messages.length / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
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
                <p className="leading-relaxed">{message.content}</p>
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
        </div>

        {/* Voice input controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
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
                Or type your response below
              </p>
            </div>

            {messages.length >= 4 && (
              <Button
                variant="floating"
                onClick={handleContinueToProfile}
                className="ml-auto"
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
