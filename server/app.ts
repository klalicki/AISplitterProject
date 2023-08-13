import { resolve } from "path";
import { existsSync } from "fs";
import express, { Request, Response, NextFunction } from "express";

import authRouter from "./routes/authRouter";
import collectionRouter from "./routes/collectionRouter";
import { fetchTranscript } from "./scripts/fetchTranscript";

import fileNotFoundError from "./routes/errors/fileNotFound";

const app = express();
app.use(express.json());

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.log(
      "Hey there. There could be a problem with your request or it could be that your instructors didn't write a fool-proof server. Check your request first. If you think it is OK, please copy and paste the stack trace below and send it your instructors."
    );
    console.log(err);
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
app.use("/api/collection", collectionRouter);

app.get("/api/youtube-transcript", async (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).send({
      message: 'You need to include the "url" as a query parameter',
    });
  }

  try {
    const result = await fetchTranscript(url);
    res.send({ message: "Successfully fetched transcript", result: result });
  } catch (error) {
    console.error(`Failed to fetch transcript: ${error}`);
    return res.status(500).send({ message: "Failed to fetch transcript" });
  }
});

app.use("/api/", authRouter);

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
