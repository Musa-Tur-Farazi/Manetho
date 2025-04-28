"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function UserDatabaseSync() {
  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Function to sync user data with the database
    const syncUserToDatabase = async () => {
      if (!user || synced) return;

      try {
        // Create a user object with data from Clerk
        const userData = {
          clerkId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
          username: user.username,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        };

        // Send the user data to an API endpoint that will create or update the user in the database
        const response = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          console.log("User successfully synced to database");
          setSynced(true);
        } else {
          console.error("Failed to sync user to database");
        }
      } catch (error) {
        console.error("Error syncing user to database:", error);
      }
    };

    // Only try to sync when the user is loaded and authenticated
    if (isLoaded && user) {
      syncUserToDatabase();
    }
  }, [isLoaded, user, synced]);

  // This is a utility component that doesn't render anything
  return null;
} 