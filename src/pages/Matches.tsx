import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// Define the type for a match
interface RoommateMatch {
  user1: string;
  user2: string;
  score: number;
  roomId: string;
  status: string;
  date: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("http://localhost:8000/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "declined": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Roommate Matches</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading matches...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : matches.length === 0 ? (
        <p className="text-muted-foreground">No matches found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map((match, index) => (
            <Card key={index} className="p-4 shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">
                  {match.user1} &amp; {match.user2}
                </h2>
                <Badge className={getStatusColor(match.status)}>
                  {match.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Room: <strong>{match.roomId}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Date: {new Date(match.date).toLocaleDateString()}
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{match.score}% compatibility</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
