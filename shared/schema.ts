import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Reference: Replit Auth blueprint - Session storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Reference: Replit Auth blueprint - User storage table
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Email subscriptions for personalized news delivery
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keywords: text("keywords").array().notNull(), // Array of search keywords
  deliveryHour: integer("delivery_hour").notNull(), // 0-23, hour of day for delivery
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// News articles (cached for deduplication and display)
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull().unique(),
  imageUrl: text("image_url"),
  source: varchar("source").notNull(), // e.g., "Naver", "Bing"
  publishedAt: timestamp("published_at").notNull(),
  content: text("content"), // Full text content if available
  category: varchar("category"), // tech, business, sports, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Email delivery logs
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at").defaultNow(),
  status: varchar("status").notNull(), // "sent", "failed"
  articleCount: integer("article_count").default(0),
  errorMessage: text("error_message"),
});

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [emailLogs.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export type EmailLog = typeof emailLogs.$inferSelect;

// User preferences for personalized news experience
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  favoriteSources: text("favorite_sources").array().default(sql`ARRAY[]::text[]`), // ["newsapi", "naver", "bing"]
  favoriteCategories: text("favorite_categories").array().default(sql`ARRAY[]::text[]`), // ["technology", "business", ...]
  language: varchar("language").default("ko"), // "ko", "en"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// TypeScript interfaces for API responses
export interface NewsSearchParams {
  keyword: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  source?: string; // "naver" | "bing" | "all"
}

export interface TrendData {
  category: string;
  trendDirection: "up" | "down" | "stable";
  articleCount: number;
  changePercent: number;
}
