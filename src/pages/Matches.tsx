import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  MapPin, 
  Coffee, 
  Home,
  Heart,
  ArrowRight,
  Sparkles
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

  const matches: RoommateMatch[] = [
    // existing three
    {
      id: "1",
      name: "Richa Bharti",
      age: 24,
      occupation: "Software Engineer",
      photo: "RB",
      compatibilityScore: 94,
      bio: "I love quiet mornings with coffee and coding. Looking for someone who respects personal space but enjoys occasional cooking together!",
      interests: ["Reading", "Cooking", "Yoga", "Tech"],
      lifestyle: ["Early riser", "Clean", "Quiet", "Home cook"],
      room: { id: "A-201", floor: 2, side: "East", features: ["Large windows", "Built‑in desk", "Shared kitchen"], rent: "10000 Rs./month" },
      reasons: [
        "You both prefer quiet nights and early mornings",
        "Similar cleanliness standards",
        "Both work remotely and respect workspace"
      ]
    },
    {
      id: "2",
      name: "Priti Darshini",
      age: 20,
      occupation: "Data Scientist",
      photo: "PR",
      compatibilityScore: 87,
      bio: "Creative soul who loves plants, good music, and weekend farmers markets. I'm tidy but not obsessive, and love making the space feel like home.",
      interests: ["Art", "Plants", "Markets", "Design"],
      lifestyle: ["Creative", "Plant lover", "Weekend explorer", "Organized"],
      room: { id: "B-166", floor: 1, side: "West", features: ["Garden access", "Art studio space", "Large living room"], rent: "₹11,000/month" },
      reasons: [
        "Both appreciate a creative, homey environment",
        "Similar work‑from‑home schedules",
        "Shared love for cooking and hosting"
      ]
    },
    {
      id: "3",
      name: "Mudita Jain",
      age: 20,
      occupation: "Graphic Designer",
      photo: "RS",
      compatibilityScore: 65,
      bio: "Creative soul who loves plants, good music, and weekend farmers markets. I'm tidy but not obsessive, and love making the space feel like home.",
      interests: ["Designs", "Games", "Shopping", "Reading"],
      lifestyle: ["Creative", "Plant lover", "Weekend explorer", "Organized"],
      room: { id: "B-115", floor: 1, side: "East", features: ["Garden access", "Art studio space", "Large living room"], rent: "₹11,000/month" },
      reasons: [
        "Both appreciate a creative, homey environment",
        "Similar work‑from‑home schedules",
        "Shared love for cooking and hosting"
      ]
    },
    // New profiles
    {
      id: "4",
      name: "Richa Bharti",
      age: 23,
      occupation: "Interior Designer",
      photo: "AM",
      compatibilityScore: 82,
      bio: "I thrive in aesthetically pleasing, clean spaces. I'm social on weekends and quiet during the week.",
      interests: ["Home decor", "Photography", "Baking"],
      lifestyle: ["Early riser", "Clean", "Social", "Creative"],
      room: { id: "C-102", floor: 1, side: "North", features: ["Decorative lighting", "Private workspace", "Shared balcony"], rent: "₹10,500/month" },
      reasons: [
        "You both value a clean and calm home",
        "Aligned sleep/wake schedules",
        "Enjoy DIY and decor hobbies"
      ]
    },
    
    
    
  ];

  const topMatch = matches[0];

  const handleViewProfile = (matchId: string) => setSelectedMatch(matchId);
  const handleContactMatch = () => navigate('/admin');

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-6xl mx-auto p-4 pt-8">
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
          {/* ...top match content unchanged */}
        </Card>

        {/* Popup */}
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-x-0 top-24 flex justify-center animate-fade-in-down">
            <Card className="bg-white px-6 py-4 shadow-lg rounded-lg pointer-events-auto">
              🎉 You’ve been matched! Explore your matches below.
            </Card>
          </div>
        </div>

        {/* Additional Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-slide-up mt-4">
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
                  {match.interests.slice(0, 3).map((int, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                      {int}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm">View Profile</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matches;
