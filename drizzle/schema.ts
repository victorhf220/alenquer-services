import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories of services (e.g., Eletricista, Encanador, Pedreiro, etc.)
 */
export const serviceCategories = mysqlTable("service_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // lucide-react icon name
  synonyms: text("synonyms"), // JSON array of synonyms for NLP search
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

/**
 * Neighborhoods in Alenquer
 */
export const neighborhoods = mysqlTable("neighborhoods", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Neighborhood = typeof neighborhoods.$inferSelect;
export type InsertNeighborhood = typeof neighborhoods.$inferInsert;

/**
 * Service providers (prestadores de serviço)
 */
export const serviceProviders = mysqlTable("service_providers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(), // WhatsApp number
  categoryId: int("categoryId").notNull(),
  neighborhoodId: int("neighborhoodId").notNull(),
  description: text("description"), // Short bio or service description
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  isFeatured: int("isFeatured").default(0).notNull(), // Admin can manually highlight
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;

/**
 * Extend users table to include provider-specific fields
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  userType: mysqlEnum("userType", ["customer", "provider", "admin"]).default("customer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;