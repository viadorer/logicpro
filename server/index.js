import express from "express";
import cors from "cors";
import listingsRouter from "./routes/listings.js";
import { getDb } from "./db.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Init DB on startup
getDb();

// API routes
app.use("/api", listingsRouter);

app.listen(PORT, () => {
  console.log(`\n  LogicPro API running at http://localhost:${PORT}\n`);
});
