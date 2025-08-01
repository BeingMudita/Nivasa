import mongoose from "mongoose";

const GuestProfileSchema = new mongoose.Schema({
  name: String,
  sleep: String,
  eating: String,
  cleanliness: Number,
  sociability: String,
  sharing: String,
  roomPreference: String,
  // Additional fields as needed
});

export default mongoose.model("GuestProfile", GuestProfileSchema);
