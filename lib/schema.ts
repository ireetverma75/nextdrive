import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
// We use simple UUID via random string natively or provide one if standard uuid string is needed
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const files = sqliteTable("files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  filename: text("filename").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: text("fileType").notNull(),
  size: integer("size").notNull(),
  publicId: text("publicId").notNull().unique(),
  uploadedBy: text("uploadedBy").notNull().references(() => users.id),
  createdAt: integer("createdAt", { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  isTrashed: integer("isTrashed", { mode: 'boolean' }).default(false),
});
