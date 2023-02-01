import { createTRPCRouter } from "./trpc";
import { checkinRouter } from "./routers/checkin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  checkin: checkinRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
