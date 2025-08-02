import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);
const db = client.db("nivasa");
const adminCollection = db.collection("admin_emails");
router.post("/check-admin", async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await adminCollection.findOne({ email });

    res.status(200).json({ isAdmin: !!admin });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

module.exports = router;
