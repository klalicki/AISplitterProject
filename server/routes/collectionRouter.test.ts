import request from "supertest";
import app from "../app";
import { collections } from "../models/Collections";
import { generateAccessToken } from "../services/authServices";

type CollectionResponse = {
  id: number;
  userId: string;
  name: string;
  chucks: string[];
  createdAt: string;
  updatedAt: string;
};

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2023-07-30T21:46:39.625Z"));
});

afterEach(() => {
  collections.clear();
});

describe("POST /api/collection", () => {
  it("should create a collection and return the collection", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "My new collection",
      })
      .expect(201);

    expect(body).toMatchObject({
      id: 1,
      name: "My new collection",
      chunks: expect.any(Array),
      createdAt: "2023-07-30T21:46:39.625Z",
      updatedAt: "2023-07-30T21:46:39.625Z",
    });
  });
  it.skip("should return a validation error if missing the collection name", async () => {});
  it("should return a 401 if the user has not logged in", async () => {
    await request(app)
      .post("/api/collection")
      .send({
        name: "My new collection",
      })
      .expect(401);
  });
  it("should return an error if access token is invalid", async () => {
    await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer invalid`)
      .send({
        name: "My new collection",
      })
      .expect(401);
  });
});

describe("GET /api/collection", () => {
  it("should return a list of collections", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body: collection1 } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 1",
      });

    const { body: collection2 } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 2",
      });

    const { body } = await request(app)
      .get("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body).toHaveLength(2);
    expect(body.map((collection: CollectionResponse) => collection.id)).toEqual(
      [collection1.id, collection2.id]
    );
    expect(body[0]).toMatchObject({
      id: collection1.id,
      name: "Collection 1",
      chunks: expect.any(Array),
      createdAt: "2023-07-30T21:46:39.625Z",
      updatedAt: "2023-07-30T21:46:39.625Z",
    });
  });
  it("should not return any collections that do not belong to the user", async () => {
    const otherUserId = "133f4c89-ba53-43d2-b188-3dec3cff74bz";
    const otherToken = generateAccessToken(otherUserId);

    await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Collection 1",
      });

    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body } = await request(app)
      .get("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body).toHaveLength(0);
  });
  it("should return 401 if the user has not logged in", async () => {
    await request(app).get("/api/collection").expect(401);
  });
});

describe("GET /api/collection/:id", () => {
  it("should return a collection that matches a given id", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const { body: collection } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 1",
      });

    await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 2",
      });

    const { body } = await request(app)
      .get(`/api/collection/${collection.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body).toMatchObject({
      id: collection.id,
      name: "Collection 1",
      chunks: expect.any(Array),
      createdAt: "2023-07-30T21:46:39.625Z",
      updatedAt: "2023-07-30T21:46:39.625Z",
    });
  });
  it("should return 404 if a collection is not found", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .get(`/api/collection/999`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
  it("should return a 404 if a collection does not belong to the user", async () => {
    const otherUserId = "133f4c89-ba53-43d2-b188-3dec3cff74bz";
    const otherToken = generateAccessToken(otherUserId);

    const {
      body: { id },
    } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Collection 1",
      });

    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .get(`/api/collection/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
  it("should return a 401 if the user is not logged in", async () => {
    await request(app).get("/api/collection/1").expect(401);
  });
});

describe("PUT /api/collection/:id", () => {
  it("should change the name of a collection", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const {
      body: { id },
    } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 1",
      });

    const { body } = await request(app)
      .put(`/api/collection/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 2",
      })
      .expect(200);

    expect(body).toMatchObject({
      id: id,
      name: "Collection 2",
      chunks: expect.any(Array),
      createdAt: "2023-07-30T21:46:39.625Z",
      updatedAt: "2023-07-30T21:46:39.625Z", // TODO change dates
    });
  });
  it("should return a 404 if the collection is not found", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .put(`/api/collection/999`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "This will fail",
      })
      .expect(404);
  });
  it("should not be able to change the name of any collections that do not belong to the user", async () => {
    const otherUser = "133f4c89-ba53-43d2-b188-3dec3cff74bz";
    const otherToken = generateAccessToken(otherUser);

    const {
      body: { id },
    } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Collection 1",
      });

    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .put(`/api/collection/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 2",
      })
      .expect(404);
  });
  it.skip("should validate collection name", async () => {});
  it("should return 401 if the user is not logged in", async () => {
    await request(app)
      .put(`/api/collection/999`)
      .send({
        name: "This will fail",
      })
      .expect(401);
  });
});

describe("DELETE /api/collection/:collectionId", () => {
  it("should delete a collection", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    const {
      body: { id },
    } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection 1",
      });

    await request(app)
      .delete(`/api/collection/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
  it("should return a 404 if the collection is not found", async () => {
    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .delete("/api/collection/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
  it("should not change any collections that belong to a user", async () => {
    const otherUser = "133f4c89-ba53-43d2-b188-3dec3cff74bz";
    const otherToken = generateAccessToken(otherUser);

    const {
      body: { id },
    } = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Collection 1",
      });

    const userId = "133f4c89-ba53-43d2-b188-3dec3cff74b3";
    const token = generateAccessToken(userId);

    await request(app)
      .delete("/api/collection/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
  it("should return 401 if the user is not logged in", async () => {
    await request(app).delete(`/api/collection/1`).expect(401);
  });
});
