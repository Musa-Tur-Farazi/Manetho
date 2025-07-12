import { getChatChannel } from '@/lib/chat'

describe('chat utilities', () => {
  describe('getChatChannel', () => {
    it('should generate consistent channel name for same users', () => {
      const channel1 = getChatChannel('user1', 'user2')
      const channel2 = getChatChannel('user2', 'user1')
      
      expect(channel1).toBe(channel2)
    })

    it('should generate different channel names for different user pairs', () => {
      const channel1 = getChatChannel('user1', 'user2')
      const channel2 = getChatChannel('user1', 'user3')
      
      expect(channel1).not.toBe(channel2)
    })

    it('should handle empty user IDs', () => {
      const channel = getChatChannel('', 'user2')
      expect(channel).toBe('dm--user2')
    })

    it('should handle special characters in user IDs', () => {
      const channel = getChatChannel('user@123', 'user#456')
      expect(channel).toContain('user@123')
      expect(channel).toContain('user#456')
    })

    it('should generate deterministic channel names', () => {
      const channel1 = getChatChannel('user1', 'user2')
      const channel2 = getChatChannel('user1', 'user2')
      
      expect(channel1).toBe(channel2)
    })

    it('should generate proper channel format', () => {
      const channel = getChatChannel('user1', 'user2')
      expect(channel).toMatch(/^dm-.*-.*$/)
    })
  })
}) 