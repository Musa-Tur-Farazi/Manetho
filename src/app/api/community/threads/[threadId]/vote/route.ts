import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    console.log("Vote endpoint called");

    const authResult = await auth();
    if (!authResult.userId) {
      console.log("Unauthorized - no user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { threadId } = params;
    const { optionIndex } = await request.json();

    console.log("Vote request:", { threadId, optionIndex, userId: authResult.userId });

    // Get the user from the database
    const userResult: any = await db.execute(
      sql`SELECT user_id FROM users WHERE clerk_id = ${authResult.userId}`
    );

    if (userResult.rows.length === 0) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].user_id;
    console.log("Found user ID:", userId);

    // Get the current thread with poll data
    const threadResult: any = await db.execute(
      sql`SELECT poll_votes, poll_options, post_type FROM threads WHERE thread_id = ${threadId}`
    );

    if (threadResult.rows.length === 0) {
      console.log("Thread not found:", threadId);
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const thread = threadResult.rows[0];
    console.log("Thread data:", {
      postType: thread.post_type,
      pollOptions: thread.poll_options,
      pollVotes: thread.poll_votes
    });

    if (thread.post_type !== 'poll' || !thread.poll_options) {
      console.log("Not a poll or no poll options");
      return NextResponse.json({ error: "This is not a poll" }, { status: 400 });
    }

    // Parse poll options and votes if they are JSON strings
    const pollOptions = typeof thread.poll_options === 'string' ? JSON.parse(thread.poll_options) : thread.poll_options;
    const pollVotesFromDb = thread.poll_votes ? (typeof thread.poll_votes === 'string' ? JSON.parse(thread.poll_votes) : thread.poll_votes) : {};

    if (optionIndex < 0 || optionIndex >= pollOptions.length) {
      console.log("Invalid option index:", optionIndex, "max:", pollOptions.length);
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    // Parse current votes
    let pollVotes = pollVotesFromDb;
    console.log("Current poll votes:", pollVotes);

    // Check if user has already voted
    if (pollVotes.userVotes && pollVotes.userVotes[userId] !== undefined) {
      console.log("User has already voted");
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }

    // Initialize vote counts if not present
    if (!pollVotes.userVotes) pollVotes.userVotes = {};
    for (let i = 0; i < pollOptions.length; i++) {
      if (pollVotes[i] === undefined) pollVotes[i] = 0;
    }

    // Record the vote
    pollVotes[optionIndex] = (pollVotes[optionIndex] || 0) + 1;
    pollVotes.userVotes[userId] = optionIndex;
    pollVotes.userVote = optionIndex; // For frontend compatibility

    console.log("Updated poll votes:", pollVotes);

    // Update the poll votes in the database
    await db.execute(
      sql`UPDATE threads SET poll_votes = ${JSON.stringify(pollVotes)} WHERE thread_id = ${threadId}`
    );

    console.log("Vote recorded successfully");

    return NextResponse.json({
      message: "Vote recorded successfully",
      pollVotes
    });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
} 