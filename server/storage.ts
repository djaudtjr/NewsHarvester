// Reference: Replit Auth blueprint & PostgreSQL database blueprint - Storage layer
import {
  users,
  subscriptions,
  articles,
  emailLogs,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type Article,
  type InsertArticle,
  type EmailLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, gte, lte, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subscription operations
  getSubscriptions(userId: string): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  deleteSubscription(id: string): Promise<void>;
  getAllActiveSubscriptions(): Promise<Subscription[]>;
  
  // Article operations
  getArticles(limit?: number): Promise<Article[]>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article | undefined>;
  searchArticles(params: {
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
    source?: string;
  }): Promise<Article[]>;
  
  // Email log operations
  createEmailLog(log: {
    subscriptionId: string;
    status: string;
    articleCount: number;
    errorMessage?: string;
  }): Promise<EmailLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subscription operations
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getAllActiveSubscriptions(): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isActive, true));
  }

  // Article operations
  async getArticles(limit: number = 100): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  async getArticleByUrl(url: string): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.url, url));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article | undefined> {
    try {
      // Normalize publishedAt to UTC to avoid timezone drift issues
      const normalizedArticle = {
        ...article,
        publishedAt: new Date(article.publishedAt.toISOString()),
      };
      
      const [created] = await db
        .insert(articles)
        .values(normalizedArticle)
        .returning();
      return created;
    } catch (error: any) {
      // If unique constraint violation (duplicate URL), fetch existing article
      if (error?.code === '23505') {
        const existing = await this.getArticleByUrl(article.url);
        return existing;
      }
      throw error;
    }
  }

  async searchArticles(params: {
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
    source?: string;
  }): Promise<Article[]> {
    let query = db.select().from(articles);

    const conditions = [];

    // Keyword filtering: search in title and description (case-insensitive)
    if (params.keyword) {
      const keywordPattern = `%${params.keyword}%`;
      conditions.push(
        or(
          ilike(articles.title, keywordPattern),
          ilike(articles.description, keywordPattern)
        )!
      );
    }

    if (params.startDate) {
      conditions.push(gte(articles.publishedAt, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(articles.publishedAt, params.endDate));
    }

    if (params.source && params.source !== "all") {
      conditions.push(eq(articles.source, params.source));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(articles.publishedAt)).limit(100);
  }

  // Email log operations
  async createEmailLog(log: {
    subscriptionId: string;
    status: string;
    articleCount: number;
    errorMessage?: string;
  }): Promise<EmailLog> {
    const [created] = await db
      .insert(emailLogs)
      .values(log)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
