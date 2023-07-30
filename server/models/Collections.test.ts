import { Collections } from "./Collections";
import { CollectionNotFoundError } from "../errors/CollectionNotFoundError";

describe("create", () => {
  it.only("should create a new collection", () => {
    const inst = new Collections();
    const collection = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "Split me!"
    );

    expect(collection).toMatchObject({
      id: 1,
      userId: "012bce18-3336-4f80-a2a5-998ba63e244f",
      name: "Split me!",
      chunks: expect.any(Set),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const collections = inst.getAll();
    expect(collections[0]).toMatchObject({
      id: 1,
      userId: "012bce18-3336-4f80-a2a5-998ba63e244f",
      name: "Split me!",
      chunks: expect.any(Set),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe("listAllByUser", () => {
  it("should list all collections available for a given user, and only for the given user", () => {
    const inst = new Collections();
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244f", "Split me!");
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244g", "and me");
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244f", "AND ME!!!");

    const collections = inst.listAllByUser(
      "012bce18-3336-4f80-a2a5-998ba63e244f"
    );
    expect(collections).toHaveLength(2);
  });

  it("should return an empty array if there are not any collections for the user", () => {
    const inst = new Collections();
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244z", "Split me!");

    const collections = inst.listAllByUser(
      "012bce18-3336-4f80-a2a5-998ba63e244f"
    );
    expect(collections).toHaveLength(0);
  });
});

describe("getByIdAndUser", () => {
  it("should find a given collection by id", () => {
    const inst = new Collections();
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244f", "Split me!");
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "and me"
    );
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244f", "AND ME!!!");

    const collection = inst.getByIdAndUser(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      id
    );
    expect(collection.name).toBe("Split me!");
  });
  it('should throw a "CollectionNotFoundError" if no collection with the ID exists', () => {
    const inst = new Collections();

    expect(() =>
      inst.getByIdAndUser("012bce18-3336-4f80-a2a5-998ba63e244f", 9999)
    ).toThrow(CollectionNotFoundError);
  });
  it('should throw a "CollectionNotFoundError" if the collection does not belong to the user', () => {
    const inst = new Collections();
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Split me!"
    );

    expect(() =>
      inst.getByIdAndUser("012bce18-3336-4f80-a2a5-998ba63e244f", id)
    ).toThrow(CollectionNotFoundError);
  });
});

describe("editCollectionName", () => {
  it("should edit a collection's name", () => {
    // TODO test date and time
    const inst = new Collections();
    const collection1 = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Update me"
    );
    const collection2 = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Update me too"
    );
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244z", "And not me");

    const collection = inst.editCollectionName(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      collection1.id,
      "My new name"
    );
    expect(collection).toMatchObject({
      id: 1,
      userId: "012bce18-3336-4f80-a2a5-998ba63e244z",
      name: "My new name",
      chunks: expect.any(Set),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const collections = inst.getAll();
    expect(collections[0]).toMatchObject({
      id: 1,
      userId: "012bce18-3336-4f80-a2a5-998ba63e244z",
      name: "My new name",
      chunks: expect.any(Set),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const collectio2n = inst.editCollectionName(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      collection1.id,
      "Another new name"
    );
    expect(collection2.name).toEqual("Another new name");
  });
  it('should throw a "CollectionNotFoundError" if no collection with the ID exists', () => {
    const inst = new Collections();

    expect(() =>
      inst.editCollectionName(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        9999,
        "My new name"
      )
    ).toThrow(CollectionNotFoundError);
  });
  it('should throw a "CollectionNotFoundError" if the collection does not belong to the user', () => {
    const inst = new Collections();
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Split me!"
    );

    expect(() =>
      inst.editCollectionName(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        id,
        "My new name"
      )
    ).toThrow(CollectionNotFoundError);
  });
});

describe("deleteCollection", () => {
  it("should delete a collection", () => {
    const inst = new Collections();
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244z", "Do not delete me");
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Delete me"
    );
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244z", "And me");

    inst.deleteCollection("012bce18-3336-4f80-a2a5-998ba63e244z", id);

    const collections = inst.getAll();
    expect(collections).toHaveLength(2);
    expect(collections.map((collection) => collection.id)).not.toContain(id);
  });
  it('should throw a "CollectionNotFoundError" if no collection with the ID exists', () => {
    const inst = new Collections();

    expect(() =>
      inst.deleteCollection("012bce18-3336-4f80-a2a5-998ba63e244f", 9999)
    ).toThrow(CollectionNotFoundError);
  });
  it('should throw a "CollectionNotFoundError" if the collection does not belong to the user', () => {
    const inst = new Collections();
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Split me!"
    );

    expect(() =>
      inst.deleteCollection("012bce18-3336-4f80-a2a5-998ba63e244f", id)
    ).toThrow(CollectionNotFoundError);
  });
});

describe("createChunk", () => {
  it("adds chunks to a collection", () => {
    const inst = new Collections();
    inst.create("012bce18-3336-4f80-a2a5-998ba63e244z", "Leave me be");
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      "Add chunks to be"
    );

    const collection = inst.createChunk(
      "012bce18-3336-4f80-a2a5-998ba63e244f",
      id,
      "Pretends this is several characters long."
    );
    expect(collection).toMatchObject({
      id: 1,
      userId: "012bce18-3336-4f80-a2a5-998ba63e244f",
      name: "Split me!",
      chunks: expect.any(Set),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const collections = inst.getAll();
    expect([...collections[1].chunks]).toEqual(
      "Pretends this is several characters long."
    );
  });
  it('should throw a "CollectionNotFoundError" if no collection with the ID exists', () => {
    const inst = new Collections();

    expect(() =>
      inst.createChunk(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        9999,
        "This will fail"
      )
    ).toThrow(CollectionNotFoundError);
  });
  it('should throw a "CollectionNotFoundError" if the collection does not belong to the user', () => {
    const inst = new Collections();
    const { id } = inst.create(
      "012bce18-3336-4f80-a2a5-998ba63e244z",
      "Split me!"
    );

    expect(() =>
      inst.createChunk(
        "012bce18-3336-4f80-a2a5-998ba63e244f",
        id,
        "This will fail"
      )
    ).toThrow(CollectionNotFoundError);
  });
});
