import { searchNews } from "./newsService";
import { storage } from "./storage";
import { sendNotificationToUser } from "./websocket";
import type { Article, Subscription } from "@shared/schema";

// Track last check time for each subscription to avoid duplicate notifications
const lastCheckTimes = new Map<string, Date>();

/**
 * Check for breaking news for a specific subscription
 * Searches for articles matching the subscription keywords published in the last 5 minutes
 */
async function checkBreakingNewsForSubscription(subscriptionId: string, userId: string, keywords: string[]) {
  try {
    const now = new Date();
    const lastCheck = lastCheckTimes.get(subscriptionId) || new Date(now.getTime() - 5 * 60 * 1000); // Default: 5 minutes ago
    
    // Search for articles with subscription keywords published since last check
    const articles: Article[] = [];
    for (const keyword of keywords) {
      try {
        const results = await searchNews({
          keyword,
          startDate: lastCheck.toISOString().split('T')[0], // YYYY-MM-DD format
        });
        articles.push(...results);
      } catch (error) {
        console.error(`[NotificationService] Error searching for keyword "${keyword}":`, error);
      }
    }

    // Filter articles published since last check
    const newArticles = articles.filter(article => 
      new Date(article.publishedAt) > lastCheck
    );

    // Update last check time
    lastCheckTimes.set(subscriptionId, now);

    // Send notifications for new articles
    if (newArticles.length > 0) {
      const sent = sendNotificationToUser(userId, {
        type: "breaking_news",
        title: "Breaking News Alert",
        message: `${newArticles.length} new article(s) found for: ${keywords.join(", ")}`,
        data: {
          articles: newArticles.slice(0, 3), // Send top 3 articles
          keywords: keywords,
        },
      });

      if (sent) {
        console.log(`[NotificationService] Sent breaking news notification to user ${userId} for keywords: ${keywords.join(", ")}`);
      }
    }

    return newArticles.length;
  } catch (error) {
    console.error(`[NotificationService] Error checking breaking news for subscription ${subscriptionId}:`, error);
    return 0;
  }
}

/**
 * Monitor for breaking news across all active subscriptions
 * This runs periodically to check for new articles matching user keywords
 */
export async function monitorBreakingNews() {
  try {
    console.log("[NotificationService] Checking for breaking news...");

    // Get all active subscriptions
    const activeSubscriptions: Subscription[] = await storage.getAllActiveSubscriptions();

    if (activeSubscriptions.length === 0) {
      console.log("[NotificationService] No active subscriptions to monitor");
      return;
    }

    // Check each subscription in parallel with limited concurrency
    const checkPromises = activeSubscriptions.map((subscription: Subscription) =>
      checkBreakingNewsForSubscription(subscription.id, subscription.userId, subscription.keywords)
    );

    const results = await Promise.all(checkPromises);
    const totalNewArticles = results.reduce((sum: number, count: number) => sum + count, 0);

    console.log(`[NotificationService] Breaking news check complete: ${totalNewArticles} new articles found across ${activeSubscriptions.length} subscription(s)`);
  } catch (error) {
    console.error("[NotificationService] Error in breaking news monitor:", error);
  }
}

/**
 * Start the breaking news monitoring service
 * Checks for new articles every 2 minutes
 */
export function startBreakingNewsMonitor() {
  console.log("[NotificationService] Starting breaking news monitor (interval: 2 minutes)");

  // Run initial check after 30 seconds
  setTimeout(() => {
    monitorBreakingNews();
  }, 30000);

  // Then check every 2 minutes
  setInterval(() => {
    monitorBreakingNews();
  }, 2 * 60 * 1000); // 2 minutes
}
