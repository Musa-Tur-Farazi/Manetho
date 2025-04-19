import { authMiddleware } from "@clerk/nextjs";

// Define public routes - any routes not in this list will require authentication
const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api*"];

// Define Clerk auth middleware configuration
export const authConfig = {
  publicRoutes: publicPaths,
  ignoredRoutes: [
    "/(api|trpc)/(.*)",
    "/_next/static/(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
    "/assets/images/(.*)",
  ],
  debug: process.env.NODE_ENV !== "production",
};

export default authMiddleware(authConfig); 