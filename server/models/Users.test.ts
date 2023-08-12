import Users from "./Users";

describe("find()", () => {
  it("should return the user if a user with a matching user id exists", () => {
    const user = Users.find("012bce18-3336-4f80-a2a5-998ba63e244f");
    expect(user).toEqual({
      id: "012bce18-3336-4f80-a2a5-998ba63e244f",
      username: "wall-e",
      password: "eve",
    });
  });

  it("should throw an error if no user is found", () => {
    const fn = () => Users.find("1234");
    expect(fn).toThrow();
  });
});

describe("isValidCredentials()", () => {
  it("should return the user that has the matching username and password", () => {
    const user = Users.findByCredentials("r2-d2", "c-3po");
    expect(user).toEqual({
      id: "133f4c89-ba53-43d2-b188-3dec3cff74b3",
      username: "r2-d2",
      password: "c-3po",
    });
  });

  it("should return undefined if no user is found", () => {
    const fn = () => Users.findByCredentials("r2-d2", "nogo");
    expect(fn).toThrow();
  });
});
