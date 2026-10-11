import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import path from "path";

dotenv.config();
const app = express();
connectDB();
 
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:8080",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map(u => u.trim().replace(/\/$/, ""))
    .filter(Boolean)
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); 
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));


app.use(express.json());
app.use(morgan("dev"));


const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
