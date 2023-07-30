import express, { Request, Response } from "express";
import axios from "axios";
import { IVolume } from "../models/Bookshelves";

import methodNotAllowedError from "./errors/methodNotAllowed";

import Cache from "../cache";
const searchCache = new Cache();

const router = express.Router();

router
  .route("/:bookTitle")
  .get((req: Request, res: Response) => {
    const { bookTitle } = req.params;

    if (bookTitle.length < 2) {
      searchCache.clear();
      return res.send({ status: "searching" });
    }

    searchCache.add(bookTitle);
    setTimeout(() => {
      if (searchCache.isLast(bookTitle)) {
        searchCache.clear();
        axios
          .get(
            `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}&maxAllowedMaturityRating=not-mature&maxResults=20&orderBy=relevance&printType=books&fields=items(id%2CvolumeInfo)%2CtotalItems`
          )
          .then((response) => {
            if (response.data.totalItems === 0) {
              const title = bookTitle.replace("+", " ");
              return res.send({
                status: "complete",
                message: `No books matching '${title}' found.`,
                books: [],
              });
            } else {
              const books = response.data.items.map(
                ({ id, volumeInfo }: IVolume): IVolume => {
                  return { id, ...volumeInfo };
                }
              );
              return res.send({ status: "complete", books });
            }
          });
      } else return res.send({ status: "searching" });
    }, 500);
  })
  .all(methodNotAllowedError);

export default router;
