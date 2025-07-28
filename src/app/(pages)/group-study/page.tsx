'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Users,
  Plus,
  Clock,
  MapPin,
  Video,
  Calendar,
  Search,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

interface StudyGroup {
  groupId: string;
  name: string;
  description: string;
  meetingType: 'online' | 'in-person' | 'hybrid';
  nextMeeting: string | null;
  meetingTime: string | null;
  currentParticipants: number;
  maxParticipants: number;
  subjectName: string | null;
  subjectColor: string | null;
  creatorName: string;
  creatorAvatar: string | null;
  memberRole?: 'member' | 'organizer';
  joinedAt?: string;
  tags?: string[];
}

export default function GroupStudyPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [activeGroups, setActiveGroups] = useState<StudyGroup[]>([]);
  const [friends, setFriends] = useState<Array<{ userId: string; fullName: string; avatarUrl: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'explore'>('my-groups');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'leave' | 'delete';
    groupId: string;
    groupName: string;
  }>({
    isOpen: false,
    type: 'leave',
    groupId: '',
    groupName: ''
  });

  // Create group form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    subjectName: '',
    meetingType: 'online' as 'online' | 'in-person' | 'hybrid',
    maxParticipants: 10
  });

  // Invite friend form state
  const [inviteForm, setInviteForm] = useState({
    friendId: '',
    groupId: '',
    message: ''
  });

  useEffect(() => {
    if (userId) {
      fetchMyGroups();
      fetchActiveGroups();
      fetchFriends();
    }
  }, [userId]);

  // Check for create parameter in URL
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      setShowCreateForm(true);
      // Remove the create parameter from URL
      router.replace('/group-study');
    }
  }, [searchParams, router]);

  const fetchMyGroups = async () => {
    try {
      const response = await fetch('/api/community/study-groups?type=my-groups');
      const data = await response.json();

      if (response.ok) {
        setMyGroups(data.groups || []);
      } else {
        console.error('Error fetching my groups:', data.error);
      }
    } catch (error) {
      console.error('Error fetching my groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveGroups = async () => {
    try {
      const response = await fetch('/api/community/study-groups?type=active-groups');
      const data = await response.json();

      if (response.ok) {
        setActiveGroups(data.groups || []);
      } else {
        console.error('Error fetching active groups:', data.error);
      }
    } catch (error) {
      console.error('Error fetching active groups:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/community/users?type=following');
      const data = await response.json();

      if (response.ok) {
        setFriends(data.users || []);
      } else {
        console.error('Error fetching friends:', data.error);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim() || !createForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...createForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateForm(false);
        setCreateForm({
          name: '',
          description: '',
          subjectName: '',
          meetingType: 'online',
          maxParticipants: 10
        });
        fetchMyGroups();

        // Navigate to the newly created group
        router.push(`/group-study/chat/${data.group.groupId}`);
      } else {
        alert(data.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          groupId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchMyGroups();
        fetchActiveGroups();
        router.push(`/group-study/chat/${groupId}`);
      } else {
        alert(data.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'leave',
          groupId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchMyGroups();
        fetchActiveGroups();
        setConfirmModal({ isOpen: false, type: 'leave', groupId: '', groupName: '' });
      } else {
        alert(data.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchMyGroups();
        fetchActiveGroups();
        setConfirmModal({ isOpen: false, type: 'delete', groupId: '', groupName: '' });
      } else {
        alert(data.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleInviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteForm.friendId.trim() || !inviteForm.groupId.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/community/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendId: inviteForm.friendId,
          groupId: inviteForm.groupId,
          message: inviteForm.message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowInviteModal(false);
        setInviteForm({
          friendId: '',
          groupId: '',
          message: ''
        });
        alert('Invitation sent successfully!');
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const openConfirmModal = (type: 'leave' | 'delete', groupId: string, groupName: string) => {
    setConfirmModal({
      isOpen: true,
      type,
      groupId,
      groupName
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: 'leave', groupId: '', groupName: '' });
  };

  const confirmAction = () => {
    if (confirmModal.type === 'leave') {
      handleLeaveGroup(confirmModal.groupId);
    } else {
      handleDeleteGroup(confirmModal.groupId);
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      case 'hybrid':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const formatMeetingTime = (meetingTime: string | null) => {
    if (!meetingTime) return 'No scheduled meetings';
    return meetingTime;
  };

  const filteredActiveGroups = activeGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!confirmModal.isOpen) return null;

    const isDelete = confirmModal.type === 'delete';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${isDelete ? 'bg-red-100 dark:bg-red-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDelete ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isDelete ? 'Delete Group' : 'Leave Group'}
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isDelete
              ? `Are you sure you want to delete "${confirmModal.groupName}"? This action cannot be undone and will remove all members from the group.`
              : `Are you sure you want to leave "${confirmModal.groupName}"? You'll need to be re-invited to join again.`
            }
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={closeConfirmModal}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={`flex items-center gap-2 ${isDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
            >
              {isDelete ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {isDelete ? 'Delete Group' : 'Leave Group'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Invite Friend Modal Component
  const InviteModal = () => {
    if (!showInviteModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Invite Friend to Study Group
            </h3>
          </div>

          <form onSubmit={handleInviteFriend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Select Friend *</label>
              <select
                value={inviteForm.friendId}
                onChange={(e) => setInviteForm({ ...inviteForm, friendId: e.target.value })}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              >
                <option value="">Choose a friend</option>
                {friends.map((friend) => (
                  <option key={friend.userId} value={friend.userId}>
                    {friend.fullName}
                  </option>
                ))}
              </select>
              {friends.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  No friends found. Add friends to your following list to invite them.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Select Study Group *</label>
              <select
                value={inviteForm.groupId}
                onChange={(e) => setInviteForm({ ...inviteForm, groupId: e.target.value })}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              >
                <option value="">Choose a study group</option>
                {myGroups.filter(group => group.memberRole === 'organizer').map((group) => (
                  <option key={group.groupId} value={group.groupId}>
                    {group.name}
                  </option>
                ))}
              </select>
              {myGroups.filter(group => group.memberRole === 'organizer').length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You can only invite friends to groups you created.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Personal Message (optional)</label>
              <textarea
                value={inviteForm.message}
                onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Add a personal message to your invitation..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteModal(false)}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={friends.length === 0 || myGroups.filter(group => group.memberRole === 'organizer').length === 0}
              >
                <Users className="w-4 h-4" />
                Send Invitation
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Study Groups"
        subtitle="Collaborate with peers and join study sessions"
      />

      {/* Confirmation Modal */}
      <ConfirmationModal />

      {/* Invite Friend Modal */}
      <InviteModal />

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
        <Button
          variant={activeTab === 'my-groups' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my-groups')}
        >
          My Groups ({myGroups.length})
        </Button>
        <Button
          variant={activeTab === 'explore' ? 'default' : 'outline'}
          onClick={() => setActiveTab('explore')}
        >
          Explore Groups
        </Button>
                 <Button
           variant="outline"
           onClick={() => setShowInviteModal(true)}
           className="flex items-center gap-2"
         >
           <Users className="w-4 h-4" />
           Invite Friend
         </Button>
      </div>

      {/* My Groups Tab */}
      {activeTab === 'my-groups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Study Groups</h2>
          </div>

          {/* Create Group Form */}
          {showCreateForm && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-gray-900 dark:text-white">Create New Study Group</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Group Name *</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Description *</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Describe your study group"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Subject (optional)</label>
                    <input
                      type="text"
                      value={createForm.subjectName}
                      onChange={(e) => setCreateForm({ ...createForm, subjectName: e.target.value })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="e.g., Mathematics, Physics, Chemistry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Meeting Type</label>
                    <select
                      value={createForm.meetingType}
                      onChange={(e) => setCreateForm({ ...createForm, meetingType: e.target.value as 'online' | 'in-person' | 'hybrid' })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Max Participants</label>
                    <input
                      type="number"
                      value={createForm.maxParticipants}
                      onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      min="2"
                      max="100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Create Group</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* My Groups List */}
          {myGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <Card key={group.groupId} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{group.name}</CardTitle>
                        {group.subjectName && (
                          <Badge
                            variant="secondary"
                            className="mt-1"
                            style={{ backgroundColor: group.subjectColor + '20', color: group.subjectColor }}
                          >
                            {group.subjectName}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={group.memberRole === 'organizer' ? 'default' : 'secondary'}>
                        {group.memberRole}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        {getMeetingTypeIcon(group.meetingType)}
                        <span className="capitalize">{group.meetingType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{group.currentParticipants}/{group.maxParticipants} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatMeetingTime(group.meetingTime)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => router.push(`/group-study/chat/${group.groupId}`)}
                        className="flex-1"
                      >
                        Open Chat
                      </Button>
                      {group.memberRole === 'organizer' ? (
                        <Button
                          variant="outline"
                          onClick={() => openConfirmModal('delete', group.groupId, group.name)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => openConfirmModal('leave', group.groupId, group.name)}
                          className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                        >
                          Leave
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Study Groups Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first study group or join existing ones to get started!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Explore Tab */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Study Groups</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {filteredActiveGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActiveGroups.map((group) => (
                <Card key={group.groupId} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{group.name}</CardTitle>
                      {group.subjectName && (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: group.subjectColor + '20', color: group.subjectColor }}
                        >
                          {group.subjectName}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        {getMeetingTypeIcon(group.meetingType)}
                        <span className="capitalize">{group.meetingType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{group.currentParticipants}/{group.maxParticipants} members</span>
                      </div>
                    </div>

                    {group.tags && group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {group.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={() => handleJoinGroup(group.groupId)}
                        className="w-full"
                        disabled={group.currentParticipants >= group.maxParticipants}
                      >
                        {group.currentParticipants >= group.maxParticipants ? 'Full' : 'Join Group'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Groups Found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or create a new group!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 