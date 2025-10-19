import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to connect to WebSocket server for real-time notifications
 * Automatically connects when user is authenticated
 */
export function useNotifications(userId: string | null) {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) {
      // Disconnect if user logs out
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Get WebSocket URL (ws:// for local, wss:// for production)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    // Connect to WebSocket
    const connect = () => {
      console.log("[Notifications] Connecting to WebSocket...");
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Notifications] Connected to WebSocket");
        
        // Authenticate with userId
        ws.send(JSON.stringify({
          type: "auth",
          userId: userId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "auth_success") {
            console.log("[Notifications] Authenticated successfully");
            toast({
              title: "Real-time notifications enabled",
              description: "You'll receive breaking news alerts",
              duration: 3000,
            });
          } else if (data.type === "breaking_news") {
            // Show breaking news notification
            console.log("[Notifications] Breaking news received:", data);
            
            toast({
              title: data.title,
              description: data.message,
              duration: 10000, // 10 seconds for breaking news
            });

            // Request browser notification permission if not already granted
            if (Notification.permission === "granted") {
              new Notification(data.title, {
                body: data.message,
                icon: "/favicon.ico",
                tag: "breaking-news",
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification(data.title, {
                    body: data.message,
                    icon: "/favicon.ico",
                    tag: "breaking-news",
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error("[Notifications] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[Notifications] WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("[Notifications] Disconnected from WebSocket");
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[Notifications] Attempting to reconnect...");
          connect();
        }, 5000);
      };
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId, toast]);
}
