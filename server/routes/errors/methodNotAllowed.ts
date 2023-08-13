import { Request, Response } from "express";

const methodNotAllowed = (req: Request, res: Response): Response => {
  return res.status(405).send({
    message: `Method Not Allowed. Take a look your method. Hint: it should NOT be ${req.method}.`,
  });
};

export default methodNotAllowed;
