import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Parser from "rss-parser";
import dotenv from "dotenv";
import { URL } from "url";
import authRoutes from "./routes/auth.js";

import preferencesRoutes from "./routes/preferences.js";

import sendArticlesRoutes from "./routes/sendArticles.js";

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/articles', sendArticlesRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  const mongoURL = new URL(MONGO_URI);
  mongoURL.searchParams.delete("useNewUrlParser");
  mongoURL.searchParams.delete("useUnifiedTopology");

  mongoose
    .connect(mongoURL.toString())
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log(err));
} else {
  console.error("MONGO_URI not found in .env file");
  process.exit(1);
}

