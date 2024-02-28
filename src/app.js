import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//for json file size limit
app.use(express.json({ limit: "16kb" }));

//using search
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//to store images or pdf publicly
app.use(express.static("public"));

//to access cookies from server and store in client browser and vice versa
app.use(cookieParser());

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
export { app };
