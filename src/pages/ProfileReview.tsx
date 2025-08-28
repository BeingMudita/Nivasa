import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Edit2, Check, User, Home, Clock, Heart, Plus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface UserProfile {
  name: string;
  age: number;
  occupation: string;
  bio: string;
  lifestyle: string[];
  preferences: string[];
  schedule: string;
  budget: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  responses?: {
    sleep_pattern?: string;
    diet_type?: string;
    sharing_comfort?: string;
    cleanliness_score?: string;
    conflict_style?: string;
    autonomy?: string;
  };
}

const ProfileReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    occupation: "",
    bio: "",
    lifestyle: [],
    preferences: [],
    schedule: "",
    budget: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    createdAt: ""
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:8000/user-profile", {
          params: { uid: user.id }
        });
        
        const userData = response.data.profile;
        
        // Check if user has actual data (not just default/fallback values)
        const hasRealData = userData.firstName || userData.lastName || userData.age > 0 || 
                           userData.occupation !== 'Not specified' || userData.bio !== 'No bio provided yet';
        
        setHasData(hasRealData);
        
        // Map survey responses to profile data
        const lifestyleTraits = [];
        const preferences = [];
        
        if (userData.survey?.sleep_pattern) {
          lifestyleTraits.push(`Sleep pattern: ${userData.survey.sleep_pattern}`);
        }
        if (userData.survey?.diet_type) {
          lifestyleTraits.push(`Diet: ${userData.survey.diet_type}`);
        }
        if (userData.survey?.cleanliness_score) {
          lifestyleTraits.push(`Cleanliness: ${userData.survey.cleanliness_score}`);
          preferences.push(`Prefers ${userData.survey.cleanliness_score} spaces`);
        }
        if (userData.survey?.conflict_style) {
          preferences.push(`Conflict style: ${userData.survey.conflict_style}`);
        }
        if (userData.survey?.sharing_comfort) {
          lifestyleTraits.push(`Sharing: ${userData.survey.sharing_comfort}`);
        }
        if (userData.survey?.autonomy) {
          lifestyleTraits.push(`Autonomy: ${userData.survey.autonomy}`);
        }
        
        setProfile({
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          age: userData.age || 0,
          occupation: userData.occupation || 'Not specified',
          bio: userData.bio || 'No bio provided yet',
          lifestyle: lifestyleTraits.length > 0 ? lifestyleTraits : [],
          preferences: preferences.length > 0 ? preferences : [],
          schedule: userData.schedule || "",
          budget: userData.budget || "",
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || '',
          createdAt: userData.createdAt || '',
          responses: userData.survey || {}
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setHasData(false);
        setProfile({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
          age: 0,
          occupation: '',
          bio: '',
          lifestyle: [],
          preferences: [],
          schedule: "",
          budget: "",
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || '',
          createdAt: user.createdAt || ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user?.id) return;
    
    try {
      await axios.post("http://localhost:8000/update-profile", {
        uid: user.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        occupation: profile.occupation,
        bio: profile.bio,
        schedule: profile.schedule,
        budget: profile.budget
      });
      
      setIsEditing(false);
      setHasData(true); // User now has data after saving
    } catch (error) {
      console.error("Error saving profile changes:", error);
    }
  };

  const handleContinueToMatches = () => {
    navigate('/matches');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const compatibilityTraits = [
    { 
      icon: Home, 
      label: "Living Style", 
      value: profile.responses?.cleanliness_score ? 
        `${profile.responses.cleanliness_score.charAt(0).toUpperCase() + profile.responses.cleanliness_score.slice(1)}` : 
        "Not specified", 
      color: "bg-secondary" 
    },
    { 
      icon: Clock, 
      label: "Sleep Pattern", 
      value: profile.responses?.sleep_pattern ? 
        `${profile.responses.sleep_pattern.charAt(0).toUpperCase() + profile.responses.sleep_pattern.slice(1)}` : 
        "Not specified", 
      color: "bg-primary" 
    },
    { 
      icon: Heart, 
      label: "Sharing Style", 
      value: profile.responses?.sharing_comfort ? 
        `${profile.responses.sharing_comfort.charAt(0).toUpperCase() + profile.responses.sharing_comfort.slice(1)}` : 
        "Not specified", 
      color: "bg-accent" 
    },
    { 
      icon: User, 
      label: "Diet", 
      value: profile.responses?.diet_type ? 
        `${profile.responses.diet_type.charAt(0).toUpperCase() + profile.responses.diet_type.slice(1)}` : 
        "Not specified", 
      color: "bg-secondary" 
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {hasData ? "Let's review your profile" : "Complete your profile"}
          </h1>
          <p className="text-muted-foreground">
            {hasData 
              ? "Make sure everything looks perfect before we find your matches" 
              : "Add your information to help us find your perfect roommate match"
            }
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
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile.age || ''}
                        onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                        placeholder="Your age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation *</Label>
                      <Input
                        id="occupation"
                        value={profile.occupation}
                        onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                        placeholder="What do you do?"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">About Me *</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                      placeholder="Tell us about yourself, your interests, and what you're looking for in a roommate..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule">Daily Schedule</Label>
                      <Input
                        id="schedule"
                        value={profile.schedule}
                        onChange={(e) => setProfile({...profile, schedule: e.target.value})}
                        placeholder="e.g., 9 AM - 6 PM work hours"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input
                        id="budget"
                        value={profile.budget}
                        onChange={(e) => setProfile({...profile, budget: e.target.value})}
                        placeholder="e.g., 10000 - 15000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveChanges} 
                      className="flex-1"
                      disabled={!profile.firstName || !profile.occupation || !profile.bio}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {profile.firstName?.charAt(0) || profile.name.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name || "Unknown User"}</h3>
                      <p className="text-muted-foreground">
                        {profile.occupation || "No occupation specified"}
                      </p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">About Me</h4>
                    <p className="text-foreground leading-relaxed">
                      {profile.bio || "No bio provided yet. Click edit to add information about yourself."}
                    </p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Member since: {formatDate(profile.createdAt)}</p>
                    <p>Role: {profile.role || "Not specified"}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Lifestyle Traits */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Lifestyle</h3>
                {!hasData && (
                  <Info className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {profile.lifestyle.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {trait}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No lifestyle information yet</p>
                  <p className="text-sm">This will be populated from your survey responses</p>
                </div>
              )}
            </Card>

            {/* Preferences */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Roommate Preferences</h3>
                {!hasData && (
                  <Info className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {profile.preferences.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.map((pref, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {pref}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No preference information yet</p>
                  <p className="text-sm">This will be populated from your survey responses</p>
                </div>
              )}
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{trait.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{trait.value}</p>
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
                  <span className="font-medium">{profile.schedule || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">
                    {profile.budget ? `₹${profile.budget}` : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{profile.role || "Not specified"}</span>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              variant="gradient"
              onClick={handleContinueToMatches}
              className="w-full group"
              disabled={!hasData}
            >
              {hasData ? "Find My Matches" : "Complete Profile First"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {!hasData && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Please complete your profile information to find matches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileReview;