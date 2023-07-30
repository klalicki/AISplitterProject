import { Request, Response } from "express";

const fileNotFound = (req: Request, res: Response): Response => {
  return res.status(404).send({
    message: `File Not Found. Take another look at your URL.`,
  });
};

export default fileNotFound;
