export function getChatChannel(userId1: string, userId2: string) {
  // Deterministic channel id regardless of sender order
  const sorted = [userId1, userId2].sort();
  return `dm-${sorted[0]}-${sorted[1]}`;
}

export function getGroupChatChannel(groupId: string) {
  // Generate channel name for group chat
  return `study-group-${groupId}`;
} 