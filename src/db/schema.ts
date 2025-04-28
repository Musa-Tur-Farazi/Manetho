import { integer, pgTable, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar("clerkId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  imageUrl: text("imageUrl"),
  username: varchar("username", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  age: integer("age"),
  isActive: boolean("isActive").notNull().default(true),
  bio: text("bio"),
  preferences: text("preferences"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
