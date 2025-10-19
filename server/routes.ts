// Reference: Replit Auth blueprint - Routes with authentication
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { searchNews, getTrendingTopics } from "./newsService";
import { insertSubscriptionSchema } from "@shared/schema";
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

  // News search endpoint
  app.get("/api/news/search", async (req, res) => {
    try {
      const { keyword, startDate, endDate, source = "all" } = req.query;

      if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({ message: "Keyword is required" });
      }

      const articles = await searchNews({
        keyword,
        startDate: startDate as string,
        endDate: endDate as string,
        source: source as string,
      });

      res.json(articles);
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

  const httpServer = createServer(app);

  return httpServer;
}
