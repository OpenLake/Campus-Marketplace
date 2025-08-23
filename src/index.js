import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js";

console.log("Server file is running ..");

dotenv.config({quiet: true});
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})