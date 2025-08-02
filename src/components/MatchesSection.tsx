// src/components/MatchesSection.tsx
const matches = [
  {
    name: "Priti Sharma",
    age: 23,
    location: "Pune",
    compatibility: "92%",
    image: "https://i.pravatar.cc/150?img=45",
    interests: ["Books", "Cooking", "Quiet Environment"],
  },
  {
    name: "Aarushi Mehta",
    age: 24,
    location: "Bangalore",
    compatibility: "89%",
    image: "https://i.pravatar.cc/150?img=47",
    interests: ["Yoga", "Cleanliness", "Early Riser"],
  },
];

export default function MatchesSection() {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">🤝 Your Matches</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {matches.map((match, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={match.image}
                alt={match.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{match.name}</h3>
                <p className="text-sm text-gray-500">
                  {match.age}, {match.location}
                </p>
                <p className="text-sm">Compatibility: {match.compatibility}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Shared Interests: {match.interests.join(", ")}
            </p>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                View Profile
              </button>
              <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
