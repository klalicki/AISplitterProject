import Bookshelves from "./Bookshelves";
import testBook from "../tests/data/books";

beforeEach(() => {
  Bookshelves.refreshBookshelf();
});

describe("getBookshelf()", () => {
  it("should return a user's entire bookshelf", () => {
    const bookshelf = Bookshelves.getBookshelf(
      "012bce18-3336-4f80-a2a5-998ba63e244f"
    );
    expect(bookshelf).toMatchObject({
      wantToRead: expect.any(Array),
      currentlyReading: expect.any(Array),
      read: expect.any(Array),
    });
    expect(bookshelf.wantToRead[0]).toMatchObject({
      title: expect.any(String),
      shelf: expect.any(String),
    });
  });

  it("should not return the user id inside any of the results", () => {
    const bookshelf = Bookshelves.getBookshelf(
      "012bce18-3336-4f80-a2a5-998ba63e244f"
    );
    expect(Object.keys(bookshelf.wantToRead[0])).not.toContain("userId");
  });

  it("should return an empty skeleton if a user does not have any books on the bookshelf", () => {
    const bookshelf = Bookshelves.getBookshelf("1234");
    expect(bookshelf).toEqual({
      wantToRead: [],
      currentlyReading: [],
      read: [],
    });
  });

  it("should only return books that belong to a user", () => {
    const bookshelf = Bookshelves.getBookshelf(
      "012bce18-3336-4f80-a2a5-998ba63e244f"
    );
    const books = [
      ...Object.values(bookshelf["wantToRead"]),
      ...Object.values(bookshelf["currentlyReading"]),
      ...Object.values(bookshelf["read"]),
    ];
    const book = books.find((book) => book.id === "oy3psgEACAAJ");
    expect(book).toBeUndefined();
  });
});

describe("getBook()", () => {
  it("should return the book that belongs to a user", () => {
    const book = Bookshelves.getBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "ppjUtAEACAAJ"
    );
    expect(book).toMatchObject({
      title: "Fullstack React",
      shelf: "currentlyReading",
    });
  });

  it("should not return the user id inside the results", () => {
    const book = Bookshelves.getBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "ppjUtAEACAAJ"
    );
    expect(Object.keys(book)).not.toContain("userId");
  });

  it("should throw an error if no book is found", () => {
    const fn = () => {
      Bookshelves.getBook(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        "notarealbook"
      );
    };
    expect(fn).toThrow();
  });

  it("should only return books that belong to a user", () => {
    const fn = () => {
      Bookshelves.getBook(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        "oy3psgEACAAJ"
      );
    };
    expect(fn).toThrow();
  });
});

describe("hasBook()", () => {
  it("should return true is a user has a book", () => {
    const hasBook = Bookshelves.hasBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "ppjUtAEACAAJ"
    );
    expect(hasBook).toBe(true);
  });

  it("should return false if the book is not on the shelf", () => {
    const hasBook = Bookshelves.hasBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "notarealbook"
    );
    expect(hasBook).toBe(false);
  });

  it("should return false if the book is on a shelf, but does not belong to the user", () => {
    const hasBook = Bookshelves.hasBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "oy3psgEACAAJ"
    );
    expect(hasBook).toBe(false);
  });
});

describe("findShelfForBook()", () => {
  it("should return the shelf that a user's book is sitting on", () => {
    const shelf = Bookshelves.findShelfForBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "ppjUtAEACAAJ"
    );
    expect(shelf).toBe("currentlyReading");
  });

  it("should return undefined if the book is not on a user's shelf", () => {
    const shelf = Bookshelves.findShelfForBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "notarealbook"
    );
    expect(shelf).toBeUndefined();
  });

  it("should return undefined if the book is on a shelf, but on another user's bookshelf", () => {
    const shelf = Bookshelves.findShelfForBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "oy3psgEACAAJ"
    );
    expect(shelf).toBeUndefined();
  });
});

describe("updateBookshelf()", () => {
  it("should add a book to a user's bookshelf if the book is not already on a user's bookshelf", () => {
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "wantToRead"
    );
    const book = Bookshelves.getBook(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ"
    );
    expect(book).toMatchObject({
      id: "wZ69DwAAQBAJ",
      title: "Salmon",
      shelf: "wantToRead",
      description: expect.any(String),
    });
  });

  it("should add a move a user's book from one bookshelf to another if the user has the book on a different shelf", () => {
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "wantToRead"
    );
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "currentlyReading"
    );
    const book = Bookshelves.getBook(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ"
    );
    expect(book).toMatchObject({
      id: "wZ69DwAAQBAJ",
      title: "Salmon",
      shelf: "currentlyReading",
      description: expect.any(String),
    });
  });

  it("should not change the location of another user's book on the bookshelf", () => {
    Bookshelves.updateBookshelf(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "wZ69DwAAQBAJ",
      testBook,
      "wantToRead"
    );
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "currentlyReading"
    );
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "read"
    );
    const book = Bookshelves.getBook(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "wZ69DwAAQBAJ"
    );
    expect(book).toMatchObject({
      id: "wZ69DwAAQBAJ",
      title: "Salmon",
      shelf: "wantToRead",
      description: expect.any(String),
    });
  });

  it("should add strip html from the description", () => {
    Bookshelves.updateBookshelf(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ",
      testBook,
      "wantToRead"
    );
    const book = Bookshelves.getBook(
      "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      "wZ69DwAAQBAJ"
    );
    expect(book.description).toBe(
      "WINNER OF THE JOHN AVERY AWARD AT THE ANDRÉ SIMON AWARDS Over the centuries, salmon have been a vital resource, a dietary staple and an irresistible catch. But there is so much more to this extraordinary fish. As Mark Kurlansky reveals, salmon persist as a barometer for the health of our planet. Centuries of our greatest assaults on nature can be seen in their harrowing yet awe-inspiring life cycle. Full of all Kurlansky’s characteristic curiosity and insight, Salmon is a magisterial history of a wondrous creature."
    );
  });
});
