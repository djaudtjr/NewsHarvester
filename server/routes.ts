// Reference: Replit Auth blueprint - Routes with authentication
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { searchNews, getTrendingTopics } from "./newsService";
import { insertSubscriptionSchema, insertUserPreferencesSchema, insertBookmarkSchema } from "@shared/schema";
import { setupScheduler } from "./scheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Initialize email scheduler
  setupScheduler();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // News search endpoint with pagination
  app.get("/api/news/search", async (req, res) => {
    try {
      const { keyword, startDate, endDate, source = "all", page = "1", pageSize = "20" } = req.query;

      if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({ message: "Keyword is required" });
      }

      const pageNum = parseInt(page as string, 10);
      const size = parseInt(pageSize as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ message: "Invalid page number" });
      }

      if (isNaN(size) || size < 1 || size > 100) {
        return res.status(400).json({ message: "Invalid page size (1-100)" });
      }

      const allArticles = await searchNews({
        keyword,
        startDate: startDate as string,
        endDate: endDate as string,
        source: source as string,
      });

      // Calculate pagination
      const startIndex = (pageNum - 1) * size;
      const endIndex = startIndex + size;
      const paginatedArticles = allArticles.slice(startIndex, endIndex);
      const hasMore = endIndex < allArticles.length;

      res.json({
        articles: paginatedArticles,
        pagination: {
          page: pageNum,
          pageSize: size,
          total: allArticles.length,
          hasMore,
        },
      });
    } catch (error) {
      console.error("Error searching news:", error);
      res.status(500).json({ message: "Failed to search news" });
    }
  });

  // Trending topics endpoint
  app.get("/api/trends", async (req, res) => {
    try {
      const trends = await getTrendingTopics();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });

  // Subscription endpoints
  app.get("/api/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validatedData = insertSubscriptionSchema.parse({
        ...req.body,
        userId,
      });

      const subscription = await storage.createSubscription(validatedData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: "Failed to create subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Verify ownership
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteSubscription(id);
      res.json({ message: "Subscription deleted" });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // User preferences endpoints
  app.get("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      
      // Return default preferences if none exist
      if (!preferences) {
        return res.json({
          userId,
          favoriteSources: [],
          favoriteCategories: [],
          language: "ko",
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validatedData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId,
      });

      const preferences = await storage.upsertUserPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Failed to update preferences" });
    }
  });

  // Bookmark endpoints
  app.get("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validatedData = insertBookmarkSchema.parse({
        ...req.body,
        userId,
      });

      // Check if bookmark already exists
      const existingBookmark = await storage.getBookmark(userId, validatedData.articleId);
      if (existingBookmark) {
        return res.status(409).json({ 
          message: "Bookmark already exists",
          bookmark: existingBookmark 
        });
      }

      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      // Differentiate between validation errors and server errors
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/bookmarks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Get all bookmarks to verify ownership
      const userBookmarks = await storage.getBookmarks(userId);
      const bookmark = userBookmarks.find(b => b.id === id);
      
      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      await storage.deleteBookmark(id);
      res.json({ message: "Bookmark deleted" });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
