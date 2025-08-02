import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  Heart,
  Home,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

// Types
interface UserProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  joinDate: string;
  status: string;
  compatibilityScore?: number;
  roomAssignment?: string;
}

interface Match {
  id: string;
  user1: string;
  user2: string;
  score: number;
  roomId: string;
  status: string;
  date: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "matches" | "rooms">("users");

  // Route protection
  if (!user) return <Navigate to="/login" />;
  if (!user.isAdmin) return <Navigate to="/" />;

  // Mock Data
  const users: UserProfile[] = [
    {
      id: "1",
      name: "Mudita Jain",
      age: 26,
      occupation: "UX Designer",
      joinDate: "2024-01-15",
      status: "matched",
      compatibilityScore: 94,
      roomAssignment: "A-201",
    },
    {
      id: "2",
      name: "Richa Bhati",
      age: 24,
      occupation: "Software Engineer",
      joinDate: "2024-01-12",
      status: "matched",
      compatibilityScore: 94,
      roomAssignment: "A-201",
    },
    {
      id: "3",
      name: "Pritidarshani Biswal",
      age: 27,
      occupation: "Graphic Designer",
      joinDate: "2024-01-20",
      status: "active",
      compatibilityScore: 87,
    },
  ];

  const matches: Match[] = [
    {
      id: "1",
      user1: "Sarah Johnson",
      user2: "Emma Chen",
      score: 94,
      roomId: "A-201",
      status: "confirmed",
      date: "2024-01-15",
    },
    {
      id: "2",
      user1: "Maya Rodriguez",
      user2: "Zoe Williams",
      score: 82,
      roomId: "B-105",
      status: "pending",
      date: "2024-01-22",
    },
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.occupation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "matched":
        return "bg-success/20 text-success border-success/30";
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      case "confirmed":
        return "bg-success/20 text-success border-success/30";
      case "declined":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Matches",
      value: matches.filter((m) => m.status === "confirmed").length,
      icon: Heart,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Rooms Occupied",
      value: new Set(users.filter((u) => u.roomAssignment).map((u) => u.roomAssignment)).size,
      icon: Home,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Avg Compatibility",
      value: "89%",
      icon: Star,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  const tabs: { key: "users" | "matches" | "rooms"; label: string; icon: React.ElementType }[] = [
    { key: "users", label: "User Profiles", icon: Users },
    { key: "matches", label: "Matches", icon: Heart },
    { key: "rooms", label: "Room Assignments", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-7xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage user profiles, view matches, and monitor room assignments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 shadow-card hover:shadow-floating transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "gradient" : "floating"}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Search and Controls */}
        <Card className="p-4 mb-6 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="floating" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="floating" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Content Sections */}
        <Card className="shadow-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {activeTab === "users" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">User Profiles</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compatibility</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.occupation}</TableCell>
                      <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.compatibilityScore ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-primary fill-current" />
                            <span>{user.compatibilityScore}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.roomAssignment ? (
                          <Badge variant="outline">{user.roomAssignment}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Match Results</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match ID</TableHead>
                    <TableHead>User 1</TableHead>
                    <TableHead>User 2</TableHead>
                    <TableHead>Compatibility</TableHead>
                    <TableHead>Room ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>#{match.id}</TableCell>
                      <TableCell>{match.user1}</TableCell>
                      <TableCell>{match.user2}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-primary fill-current" />
                          <span>{match.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{match.roomId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Room Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["A-201", "B-105", "C-301", "D-204"].map((roomId) => {
                  const roomUsers = users.filter((u) => u.roomAssignment === roomId);
                  const isEmpty = roomUsers.length === 0;
                  return (
                    <Card key={roomId} className={`p-4 ${isEmpty ? "border-dashed border-muted" : "shadow-soft"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{roomId}</h3>
                        <Badge variant={isEmpty ? "outline" : "secondary"}>
                          {isEmpty ? "Available" : "Occupied"}
                        </Badge>
                      </div>
                      {roomUsers.length > 0 ? (
                        <div className="space-y-2">
                          {roomUsers.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                                {user.name.charAt(0)}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No current residents</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
