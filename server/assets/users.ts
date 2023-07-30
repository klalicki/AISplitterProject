import { IUser } from "../models/Users";

/**
 * Usually, we would store our users in a database instead of a plain text file
 * that we are committing to git. However, for the purposes of demonstrating
 * the front-end of student portfolio piece, this works fine.
 */
const users: IUser[] = [
  {
    id: "012bce18-3336-4f80-a2a5-998ba63e244f",
    username: "wall-e",
    password: "eve",
  },
  {
    id: "133f4c89-ba53-43d2-b188-3dec3cff74b3",
    username: "r2-d2",
    password: "c-3po",
  },
];

export default users;
