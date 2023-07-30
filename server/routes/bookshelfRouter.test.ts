import request from "supertest";
import app from "../app";
import Bookshelves, { IVolume, IBook } from "../models/Bookshelves";
import { generateAccessToken } from "../services/authServices";
import books from "../assets/starterBookshelves";

beforeEach(() => {
  Bookshelves.refreshBookshelf();
});

describe("GET /api/bookshelf/", () => {
  it("should return a 401 if the API request is unauthorized", async () => {
    await request(app).get("/api/bookshelf/").send().expect(401);
  });

  it("should get a list of all books inside of the user's bookshelf", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .get("/api/bookshelf/")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(body.books).toMatchObject({
      wantToRead: expect.any(Array),
      currentlyReading: expect.any(Array),
      read: expect.any(Array),
    });
    expect(body.books.currentlyReading[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
    });
  });

  // TODO book's description stripped HTML tags

  it("should not include any books from another user's bookshelf", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .get("/api/bookshelf/")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    const userBooks: string[] = books
      .filter((book: IBook) => book.userId === userId)
      .map((book: IBook): string => book.id);

    // @ts-ignore
    const resBooks: IVolume[] = Object.values(body.books).flat();
    const hasOnlyUserBooks = resBooks.every((book: IVolume) =>
      userBooks.includes(book.id)
    );
    expect(hasOnlyUserBooks).toBe(true);
  });

  it("should not return the user id in the response", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .get("/api/bookshelf/")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(body.books.currentlyReading[0]).not.toMatchObject({
      userId: expect.anything(),
    });
  });
});

describe("PUT /api/bookshelf/:bookId/:shelfName", () => {
  it("should return a 401 if the API request is unauthorized", async () => {
    await request(app)
      .put("/api/bookshelf/oy3psgEACAAJ/read")
      .send()
      .expect(401);
  });

  it("should add a new book to a user's bookshelf and return the entire bookshelf in the response", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const bookId = "RRLmDwAAQBAJ";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .put(`/api/bookshelf/${bookId}/wantToRead`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(body.books.wantToRead).toHaveLength(4);

    const books: IBook[] = Object.values(body.books.wantToRead) as IBook[];
    const newBook: IBook = books.find(
      (book: IBook) => book.id === bookId
    ) as IBook;
    expect(newBook).toMatchObject({
      id: bookId,
      title: expect.any(String),
      shelf: "wantToRead",
    });
  });

  it("should move a book from one shelf to another and return the entire bookshelf in the response", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const bookId = "ppjUtAEACAAJ";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .put(`/api/bookshelf/${bookId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(body.books.currentlyReading).toHaveLength(0);
    expect(body.books.read).toHaveLength(4);

    const books: IBook[] = Object.values(body.books.read) as IBook[];
    const newBook: IBook = books.find(
      (book: IBook) => book.id === bookId
    ) as IBook;
    expect(newBook).toMatchObject({
      id: bookId,
      title: expect.any(String),
      shelf: "read",
    });
  });

  // TODO book's description stripped HTML tags

  it("should return 404 if a book does not exist", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const token = generateAccessToken(userId);

    await request(app)
      .put(`/api/bookshelf/invalid123/wantToRead`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(404);
  });

  it("should return 400 if the shelf name is invalid", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const token = generateAccessToken(userId);

    await request(app)
      .put(`/api/bookshelf/ppjUtAEACAAJ/invalid`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(400);
  });
});

describe("DELETE /api/bookshelf/:bookId", () => {
  it("should return a 401 if the API request is unauthorized", async () => {
    await request(app).delete("/api/bookshelf/oy3psgEACAAJ").send().expect(401);
  });

  it("should delete a book from a user's bookshelf and return the entire bookshelf in the response", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const bookId = "qKydDAAAQBAJ";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .delete(`/api/bookshelf/${bookId}`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(body.books.wantToRead).toHaveLength(2);

    expect(body.books).toMatchObject({
      wantToRead: expect.any(Array),
      currentlyReading: expect.any(Array),
      read: expect.any(Array),
    });
    expect(body.books.currentlyReading[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
    });

    // @ts-ignore
    const allBooks: IVolume[] = Object.values(body.books).flat();
    const hasBookStill = allBooks.find((book: IVolume) => book.id === bookId);
    expect(hasBookStill).toBeFalsy();
  });

  // TODO book's description stripped HTML tags

  it("should return 404 if a book is not in a user's bookshelf", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const token = generateAccessToken(userId);

    await request(app)
      .delete("/api/bookshelf/invalid")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(404);
  });

  it("should return a 404 instead of deleting a book in another user's bookshelf", async () => {
    const userId = "012bce18-3336-4f80-a2a5-998ba63e244f";
    const token = generateAccessToken(userId);

    await request(app)
      .delete("/api/bookshelf/oy3psgEACAAJ")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(404);
  });
});
