import express from "express";
const GuestProfile = require("../models/GuestProfile");
import { enrichProfile } from "../utils/profileEnrichment";

const router = express.Router();

// Create profile
router.post("/", async (req, res) => {
  try {
    // surveyData from frontend
    let profile = enrichProfile(req.body);
    const newProfile = new GuestProfile(profile);
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
