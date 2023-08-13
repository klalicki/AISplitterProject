/**
 * The server is for the Book Store project
 * @author CanCode Communities
 */
import app from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\nYour server is running on http://localhost:${PORT}/`);
  console.log(`\nPress ctrl+c to stop\n`);
});
