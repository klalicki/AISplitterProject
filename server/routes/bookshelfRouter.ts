import express, { Request, Response } from "express";
import axios from "axios";

import Bookshelves from "../models/Bookshelves";

import methodNotAllowedError from "./errors/methodNotAllowed";
import { getUserId, auth } from "../middlewares/auth";

const router = express.Router();
router.use(getUserId);
router.use(auth);

router
  .route("/:bookId/:shelf")
  .put((req: Request, res: Response) => {
    const { bookId, shelf } = req.params;
    const { userId } = req.body;

    if (!["wantToRead", "currentlyReading", "read"].includes(shelf)) {
      return res.status(400).send({
        message: `Pst! Shelf '${shelf}' is not an option. Your shelf should be either 'wantToRead', 'currentlyReading', or 'read'.`,
      });
    }

    try {
      // @ts-ignore
      const book = Bookshelves.getBook(userId, bookId);
      // @ts-ignore
      Bookshelves.updateBookshelf(userId, book.id, book, shelf);
      // @ts-ignore
      const bookshelf = Bookshelves.getBookshelf(userId);
      return res.send({ books: bookshelf });
    } catch (err) {
      axios
        .get(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
        .then((response) => {
          const { id, volumeInfo } = response.data;
          // @ts-ignore
          Bookshelves.updateBookshelf(userId, id, volumeInfo, shelf);
          // @ts-ignore
          const books = Bookshelves.getBookshelf(userId);
          return res.send({ books });
        })
        .catch((err) => {
          // TODO log
          return res
            .status(404)
            .send({ message: `No book with book ID ${bookId} found.` });
        });
    }
  })
  .all(methodNotAllowedError);

router
  .route("/:bookId")
  .delete((req: Request, res: Response) => {
    const { bookId } = req.params;
    const { userId } = req.body;

    try {
      // @ts-ignore
      const book = Bookshelves.getBook(userId, bookId);
      // @ts-ignore
      Bookshelves.deleteBook(userId, book.id);
      // @ts-ignore
      const bookshelf = Bookshelves.getBookshelf(userId);
      return res.send({ books: bookshelf });
    } catch (err) {
      // TODO log
      return res.status(404).send({
        message: `No book with book ID ${bookId} found in your bookshelf.`,
      });
    }
  })
  .all(methodNotAllowedError);

router
  .route("/")
  .get((req: Request, res: Response) => {
    const { userId } = req.body;
    // @ts-ignore
    const bookshelf = Bookshelves.getBookshelf(userId);
    res.send({ books: bookshelf });
  })
  .all(methodNotAllowedError);

export default router;
