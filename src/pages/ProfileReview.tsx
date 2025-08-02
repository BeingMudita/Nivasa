import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Edit2, Check, User, Home, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface UserProfile {
  name: string;
  age: number;
  occupation: string;
  bio: string;
  lifestyle: string[];
  preferences: string[];
  schedule: string;
  budget: string;
}

const ProfileReview = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Mudita Jain",
    age: 26,
    occupation: "UX Designer",
    bio: "Remote worker who loves cooking and quiet evenings. Looking for a clean, peaceful environment to call home.",
    lifestyle: ["Clean & organized", "Quiet evenings", "Loves cooking", "Remote worker", "Early riser"],
    preferences: ["Non-smoker", "Pet-free", "Quiet hours after 9pm", "Shared kitchen time", "Common area respect"],
    schedule: "9 AM - 6 PM work schedule",
    budget: "10800 - 12000"
  });

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Mock API call to save profile
  };

  const handleContinueToMatches = () => {
    navigate('/matches');
  };

  const compatibilityTraits = [
    { icon: Home, label: "Living Style", value: "Clean & Organized", color: "bg-secondary" },
    { icon: Clock, label: "Schedule", value: "Early Bird", color: "bg-primary" },
    { icon: Heart, label: "Social Level", value: "Quiet & Peaceful", color: "bg-accent" },
    { icon: User, label: "Work Style", value: "Remote Worker", color: "bg-secondary" }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Let's review your profile
          </h1>
          <p className="text-muted-foreground">
            Make sure everything looks perfect before we find your matches
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up">
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Personal Information
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={profile.occupation}
                      onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSaveChanges} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}, {profile.age}</h3>
                      <p className="text-muted-foreground">{profile.occupation}</p>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </Card>

            {/* Lifestyle Traits */}
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Your Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {profile.lifestyle.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {trait}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Roommate Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.map((pref, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {pref}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Compatibility Summary */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Compatibility Traits</h3>
              <div className="space-y-3">
                {compatibilityTraits.map((trait, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${trait.color}/20`}>
                      <trait.icon className={`h-4 w-4 ${trait.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{trait.label}</p>
                      <p className="text-xs text-muted-foreground">{trait.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 shadow-card bg-gradient-secondary/10">
              <h3 className="text-lg font-semibold mb-2">Quick Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium">{profile.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{profile.budget}</span>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              variant="gradient"
              onClick={handleContinueToMatches}
              className="w-full group"
            >
              Find My Matches
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileReview;