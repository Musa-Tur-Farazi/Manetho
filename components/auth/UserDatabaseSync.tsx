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
        console.log("Starting user sync to database:", user.id);

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

        console.log("User data to sync:", userData);

        // Send the user data to an API endpoint that will create or update the user in the database
        const response = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("User successfully synced to database:", data);
          setSynced(true);
        } else {
          const errorData = await response.json().catch(e => ({ error: "Could not parse error response" }));
          console.error("Failed to sync user to database. Status:", response.status, "Error:", errorData);
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