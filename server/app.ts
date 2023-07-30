import { resolve } from "path";
import { existsSync } from "fs";
import express, { Request, Response, NextFunction } from "express";
import { exec } from "child_process";

import authRouter from "./routes/authRouter";
import bookshelfRouter from "./routes/bookshelfRouter";
import bookSearchRouter from "./routes/bookSearchRouter";
import bookRouter from "./routes/bookRouter";

import fileNotFoundError from "./errors/fileNotFound";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.log(
      "Hey there. There could be a problem with your request or it could be that your instructors didn't write a fool-proof server. Check your request first. If you think it is OK, please copy and paste the stack trace below and send it your instructors."
    );
    console.error(err);
    console.log("\n");
    return res.status(500).send({
      message:
        "This is no fun. An unexpected error occurred that may be server related. Please take a look at the command line output.",
    });
  }
});

/**
 * `npm run build` transform your project into static assets:
 * - index.html
 * - single .js file (or multiple if you use code splitting)
 * - CSS files
 * - image files
 * - favicon
 * - manifest
 * This line "serves" or shares your static files that you created with "npm run build".
 */
app.use(express.static(resolve("./client/build")));

/**
 * APIs
 */
app.use("/api/bookshelf", bookshelfRouter);
app.use("/api/book/search", bookSearchRouter);
app.use("/api/book", bookRouter);
app.use("/api/", authRouter);

app.get("/api/transcriptApi/", (req: Request, res: Response) => {
  const { url } = req.query;
  const formattedUrl = encodeURIComponent(url as string);
  exec(`python3 server/scripts/you_transcript_api.py ${formattedUrl}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: "Failed to execute Python script" });
    }
    const result = JSON.parse(stdout); // Parse the stdout as JSON
    res.send({ message: "Python script executed", result: result });
  });
});



app.all("/api/*", fileNotFoundError);

app.get("*", (_, res: Response) => {
  if (existsSync(resolve("./client/build", "index.html"))) {
    /**
     * Routes all other GET requests that are not a part of your API above to your React app, where React Router will handle all other routes
     */
    return res.sendFile(resolve("./client/build", "index.html"));
  }
  const text =
    "Its running!\nTo use the API, please refer to the Project README.md.";
  res.send(text);
});









export default app;
