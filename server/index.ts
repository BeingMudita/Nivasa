import type { Express } from "express";
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

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
