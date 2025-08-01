import {express} from "express";
import {cors} from "cors";
import {bodyParser} from "body-parser";
import {dotenv} from "dotenv";
import {mongoose }from "mongoose";

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

import {profileRoutes} from './routes/profiles';
app.use("/api/profiles", profileRoutes);


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Add your API routes here (see below)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
