import cron from "node-cron";
import { storage } from "./storage";
import { searchNews } from "./newsService";
import { sendNewsSummaryEmail } from "./emailService";

// Schedule email delivery jobs
// Runs every hour to check if any subscriptions need processing
export function setupScheduler() {
  console.log("Setting up email scheduler...");

  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    const currentHour = new Date().getHours();
    console.log(`[Scheduler] Running at hour ${currentHour}`);

    try {
      // Get all active subscriptions
      const subscriptions = await storage.getAllActiveSubscriptions();

      for (const subscription of subscriptions) {
        // Check if this subscription should be processed at this hour
        // Process 1 hour before the delivery time (for PDF generation)
        const processingHour = (subscription.deliveryHour - 1 + 24) % 24;

        if (currentHour === processingHour) {
          console.log(`[Scheduler] Processing subscription ${subscription.id} for delivery at ${subscription.deliveryHour}:00`);

          try {
            // Get user email
            const user = await storage.getUser(subscription.userId);
            if (!user || !user.email) {
              console.error(`[Scheduler] User ${subscription.userId} not found or has no email`);
              continue;
            }

            // Search for news articles using subscription keywords
            let allArticles: any[] = [];
            for (const keyword of subscription.keywords) {
              const articles = await searchNews({
                keyword,
                source: "all",
              });
              allArticles.push(...articles);
            }

            // Deduplicate articles
            const uniqueArticles = Array.from(
              new Map(allArticles.map(a => [a.url, a])).values()
            );

            if (uniqueArticles.length === 0) {
              console.log(`[Scheduler] No articles found for subscription ${subscription.id}`);
              continue;
            }

            // Send email with PDF summary
            await sendNewsSummaryEmail(subscription, user.email, uniqueArticles);
            console.log(`[Scheduler] Successfully sent email for subscription ${subscription.id}`);
          } catch (error) {
            console.error(`[Scheduler] Error processing subscription ${subscription.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error in scheduled job:", error);
    }
  });

  console.log("Email scheduler initialized successfully");
}
