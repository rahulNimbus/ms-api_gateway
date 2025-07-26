import dotenv from "dotenv";
dotenv.config();

const { PORT, JWT_SECRET_KEY } = process.env;

export const config = {
  PORT,
  JWT_SECRET_KEY,
};
