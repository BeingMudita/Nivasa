import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  MapPin, 
  Coffee, 
  Book, 
  Music, 
  Heart,
  ArrowRight,
  Sparkles,
  Home,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoommateMatch {
  id: string;
  name: string;
  age: number;
  occupation: string;
  photo: string;
  compatibilityScore: number;
  bio: string;
  interests: string[];
  lifestyle: string[];
  room: {
    id: string;
    floor: number;
    side: string;
    features: string[];
    rent: string;
  };
  reasons: string[];
}

const Matches = () => {
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Mock data - in real app this would come from API
  const matches: RoommateMatch[] = [
    {
      id: "1",
      name: "Emma Chen",
      age: 24,
      occupation: "Software Engineer",
      photo: "EC",
      compatibilityScore: 94,
      bio: "I love quiet mornings with coffee and coding. Looking for someone who respects personal space but enjoys occasional cooking together!",
      interests: ["Reading", "Cooking", "Yoga", "Tech"],
      lifestyle: ["Early riser", "Clean", "Quiet", "Home cook"],
      room: {
        id: "A-201",
        floor: 2,
        side: "East",
        features: ["Large windows", "Built-in desk", "Shared kitchen"],
        rent: "10000 Rs./month"
      },
      reasons: [
        "You both prefer quiet nights and early mornings",
        "Similar cleanliness standards",
        "Both work remotely and respect workspace"
      ]
    },
    {
      id: "2", 
      name: "Maya Rodriguez",
      age: 27,
      occupation: "Graphic Designer",
      photo: "MR",
      compatibilityScore: 87,
      bio: "Creative soul who loves plants, good music, and weekend farmers markets. I'm tidy but not obsessive, and love making the space feel like home.",
      interests: ["Art", "Plants", "Markets", "Design"],
      lifestyle: ["Creative", "Plant lover", "Weekend explorer", "Organized"],
      room: {
        id: "B-105", 
        floor: 1,
        side: "West",
        features: ["Garden access", "Art studio space", "Large living room"],
        rent: "$1,100/month"
      },
      reasons: [
        "Both appreciate a creative, homey environment",
        "Similar work-from-home schedules",
        "Shared love for cooking and hosting"
      ]
    }
  ];

  const topMatch = matches[0];

  const handleViewProfile = (matchId: string) => {
    setSelectedMatch(matchId);
  };

  const handleContactMatch = () => {
    // Mock action - would integrate with messaging system
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-6xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-foreground">Your Perfect Match!</h1>
          </div>
          <p className="text-muted-foreground">
            We found someone amazing who shares your lifestyle and values
          </p>
        </div>

        {/* Top Match Highlight */}
        <Card className="p-8 mb-8 shadow-floating bg-gradient-primary/5 border-primary/20 animate-slide-up">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Section */}
            <div className="md:col-span-2">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {topMatch.photo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-2xl font-bold">{topMatch.name}, {topMatch.age}</h2>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      <Heart className="h-3 w-3 mr-1" />
                      Top Match
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{topMatch.occupation}</p>
                  <div className="flex items-center space-x-1 mb-4">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="text-lg font-semibold text-primary">{topMatch.compatibilityScore}% Compatible</span>
                  </div>
                  <Progress value={topMatch.compatibilityScore} className="h-2 mb-4" />
                </div>
              </div>

              <p className="text-foreground leading-relaxed mb-6">{topMatch.bio}</p>

              {/* Interests & Lifestyle */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Coffee className="h-4 w-4 mr-2 text-primary" />
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topMatch.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Home className="h-4 w-4 mr-2 text-secondary" />
                    Lifestyle
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topMatch.lifestyle.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div>
              <Card className="p-4 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-accent" />
                  Your Room
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room ID:</span>
                    <span className="font-medium">{topMatch.room.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor:</span>
                    <span className="font-medium">{topMatch.room.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Side:</span>
                    <span className="font-medium">{topMatch.room.side}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rent:</span>
                    <span className="font-semibold text-primary">{topMatch.room.rent}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-sm">Room Features</h4>
                  <div className="space-y-1">
                    {topMatch.room.features.map((feature, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Compatibility Reasons */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Why you're a great match
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {topMatch.reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-primary/5">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-foreground">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" variant="gradient" onClick={handleContactMatch} className="flex-1 group">
              Connect with {topMatch.name}
              <Heart className="ml-2 h-5 w-5 group-hover:animate-bounce-gentle" />
            </Button>
            <Button size="lg" variant="floating" onClick={() => navigate('/admin')}>
              View More Matches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Additional Matches */}
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {matches.slice(1).map((match) => (
            <Card key={match.id} className="p-6 shadow-card hover:shadow-floating transition-all cursor-pointer" 
                  onClick={() => handleViewProfile(match.id)}>
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center text-xl font-bold text-secondary-foreground">
                  {match.photo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold">{match.name}, {match.age}</h3>
                    <span className="text-sm font-medium text-secondary">{match.compatibilityScore}%</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{match.occupation}</p>
                  <Progress value={match.compatibilityScore} className="h-1" />
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-4 line-clamp-2">{match.bio}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {match.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matches;