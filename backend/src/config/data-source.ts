import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false, // tắt auto migrate db
  logging: true,

  entities: [
    process.env.NODE_ENV === "production"
      ? "dist/entities/**/*.js"
      : "src/entities/**/*.ts",
  ],
  migrations: [
    process.env.NODE_ENV === "production"
      ? "dist/migrations/*.js"
      : "src/migrations/*.ts",
  ],
});
