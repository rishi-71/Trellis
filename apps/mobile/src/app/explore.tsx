import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalState } from '@/constants/globalState';

type ExploreTab = 'events' | 'notices' | 'activities';
type NoticeCategory = 'all' | 'exam' | 'placement' | 'event' | 'holiday' | 'academic' | 'general';
type ActivityType = 'hackathon' | 'sports' | 'certification' | 'research' | 'nss_ncc' | 'other';

export default function ExploreScreen() {
  const [token, setToken] = useState<string | null>(globalState.token);
  const [userRole, setUserRole] = useState<string | null>(globalState.userRole);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Active Screen Tab
  const [activeTab, setActiveTab] = useState<ExploreTab>('events');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Events Data & States
  const [events, setEvents] = useState<any[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isRegisteringId, setIsRegisteringId] = useState<string | null>(null);

  // Create Event Modal (Faculty/Admin)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDeadline, setNewEventDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newEventCapacity, setNewEventCapacity] = useState('100');

  // 2. Notices Data & States
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  // Create Notice Modal (Faculty/Admin)
  const [showCreateNoticeModal, setShowCreateNoticeModal] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<string>('general');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // 3. Activities Data & States
  const [activities, setActivities] = useState<any[]>([]);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actType, setActType] = useState<ActivityType>('hackathon');
  const [actDesc, setActDesc] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actProofUrl, setActProofUrl] = useState('');

  // Subscribe to Global Auth State
  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setToken(globalState.token);
      setUserRole(globalState.userRole);
    });
    return unsubscribe;
  }, []);

  const backendUrl = globalState.backendUrl;

  // Sync Current User Identity
  useEffect(() => {
    if (!token) return;
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUserId(data.user._id || data.user.id);
        }
      })
      .catch(() => {});
  }, [token, backendUrl]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err: any) {
      console.warn('Events fetch failed:', err.message);
    }
  }, [token, backendUrl]);

  // Fetch Notices
  const fetchNotices = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (err: any) {
      console.warn('Notices fetch failed:', err.message);
    }
  }, [token, backendUrl]);

  // Fetch Activities
  const fetchActivities = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/activities/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
    } catch (err: any) {
      console.warn('Activities fetch failed:', err.message);
    }
  }, [token, backendUrl]);

  // Load All Data
  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([fetchEvents(), fetchNotices(), fetchActivities()]);
    setLoading(false);
  }, [token, fetchEvents, fetchNotices, fetchActivities]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), fetchNotices(), fetchActivities()]);
    setRefreshing(false);
  };

  // --- ACTIONS ---

  // Register for Event
  const handleRegisterEvent = async (event: any) => {
    if (!token) return;
    setIsRegisteringId(event._id);
    try {
      const res = await fetch(`${backendUrl}/api/events/${event._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          branch: globalState.studentBranch,
          semester: globalState.studentSemester
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Registered! 🎉', `You have successfully registered for "${event.title}".`);
        fetchEvents();
      } else {
        Alert.alert('Registration Notice', data.message || 'Could not register for this event.');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err.message);
    } finally {
      setIsRegisteringId(null);
    }
  };

  // Create Event (Faculty / Admin)
  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !newEventDesc.trim() || !newEventVenue.trim()) {
      Alert.alert('Required', 'Please fill in Title, Description, and Venue.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          description: newEventDesc.trim(),
          venue: newEventVenue.trim(),
          date: new Date(newEventDate),
          registrationDeadline: new Date(newEventDeadline),
          maxParticipants: parseInt(newEventCapacity) || 100
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Event published to campus!');
        setShowCreateEventModal(false);
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventVenue('');
        fetchEvents();
      } else {
        Alert.alert('Error', data.message || 'Could not create event.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Event (Faculty / Admin)
  const handleDeleteEvent = (eventId: string, title: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Deleted', 'Event removed.');
                fetchEvents();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // Create Notice (Faculty / Admin)
  const handleCreateNotice = async () => {
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
      Alert.alert('Required', 'Please provide a title and notice content.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newNoticeTitle.trim(),
          content: newNoticeContent.trim(),
          category: newNoticeCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Published', 'Notice posted successfully!');
        setShowCreateNoticeModal(false);
        setNewNoticeTitle('');
        setNewNoticeContent('');
        fetchNotices();
      } else {
        Alert.alert('Error', data.message || 'Could not post notice.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Notice (Faculty / Admin)
  const handleDeleteNotice = (noticeId: string) => {
    Alert.alert(
      'Delete Notice',
      'Remove this announcement from the campus bulletin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/notices/${noticeId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                fetchNotices();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // Log Activity
  const handleLogActivity = async () => {
    if (!actTitle.trim()) {
      Alert.alert('Required', 'Please enter the activity title.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: actTitle.trim(),
          type: actType,
          description: actDesc.trim(),
          date: new Date(actDate),
          certificateUrl: actProofUrl.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Submitted! 🏆', 'Activity submitted for faculty verification.');
        setShowLogActivityModal(false);
        setActTitle('');
        setActDesc('');
        setActProofUrl('');
        fetchActivities();
      } else {
        Alert.alert('Error', data.message || 'Could not log activity.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERED DATA ---
  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events;
    const q = eventSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
    );
  }, [events, eventSearch]);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchesCat = noticeCategory === 'all' || n.category === noticeCategory;
      const matchesQuery =
        !noticeSearch.trim() ||
        n.title?.toLowerCase().includes(noticeSearch.toLowerCase()) ||
        n.content?.toLowerCase().includes(noticeSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [notices, noticeCategory, noticeSearch]);

  const totalPoints = useMemo(() => {
    return activities
      .filter((a) => a.verificationStatus === 'verified')
      .reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
  }, [activities]);

  const isStaff = userRole === 'faculty' || userRole === 'admin';

  if (!token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.warnIcon}>🔒</Text>
        <Text style={styles.warnTitle}>Authentication Required</Text>
        <Text style={styles.warnText}>
          Please switch to the Profile tab to sign in with your institutional credentials.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.brandTitle}>🌱 Trellis</Text>
            <Text style={styles.brandSub}>Campus Pulse & Co-Curriculars</Text>
          </View>

          {isStaff && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => {
                if (activeTab === 'events') setShowCreateEventModal(true);
                else if (activeTab === 'notices') setShowCreateNoticeModal(true);
              }}
            >
              <Text style={styles.headerActionBtnText}>
                {activeTab === 'events' ? '+ Event' : activeTab === 'notices' ? '+ Notice' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Segmented Tab Switcher */}
        <View style={styles.segmentWrap}>
          {(['events', 'notices', 'activities'] as ExploreTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segmentBtn, activeTab === t && styles.segmentBtnActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.segmentTxt, activeTab === t && styles.segmentTxtActive]}>
                {t === 'events' ? '📢 Events' : t === 'notices' ? '📋 Notices' : '🏆 Activities'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
          }
        >
          {loading && !refreshing && (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loaderTxt}>Refreshing campus feed...</Text>
            </View>
          )}

          {/* ================= TAB 1: CAMPUS EVENTS ================= */}
          {activeTab === 'events' && (
            <View style={styles.tabSection}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events, workshops, venues..."
                  value={eventSearch}
                  onChangeText={setEventSearch}
                />
              </View>

              {filteredEvents.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🎪</Text>
                  <Text style={styles.emptyTitle}>No Events Found</Text>
                  <Text style={styles.emptySub}>
                    Check back soon or pull down to refresh campus announcements.
                  </Text>
                </View>
              ) : (
                filteredEvents.map((item) => {
                  const eventDate = new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const isRegistered =
                    currentUserId &&
                    (item.registeredParticipants || []).some(
                      (p: any) => (p._id || p.toString()) === currentUserId.toString()
                    );
                  const isDeadlinePassed = new Date() > new Date(item.registrationDeadline);
                  const isFull =
                    item.maxParticipants &&
                    (item.registeredParticipants?.length || 0) >= item.maxParticipants;

                  return (
                    <View key={item._id} style={styles.eventCard}>
                      <View style={styles.eventCardHeader}>
                        <View style={styles.eventDateBadge}>
                          <Text style={styles.eventDateTxt}>{eventDate}</Text>
                        </View>
                        {item.resultsAnnounced && (
                          <View style={styles.resultsBadge}>
                            <Text style={styles.resultsBadgeTxt}>🏆 Results Out</Text>
                          </View>
                        )}
                        {isStaff && (
                          <TouchableOpacity
                            onPress={() => handleDeleteEvent(item._id, item.title)}
                            style={styles.deleteMiniBtn}
                          >
                            <Text style={styles.deleteMiniTxt}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text style={styles.eventTitle}>{item.title}</Text>
                      <Text style={styles.eventDesc} numberOfLines={3}>
                        {item.description}
                      </Text>

                      <View style={styles.eventMetaRow}>
                        <Text style={styles.eventMetaTxt}>📍 {item.venue}</Text>
                        <Text style={styles.eventMetaTxt}>
                          👥 {item.registeredParticipants?.length || 0}
                          {item.maxParticipants ? ` / ${item.maxParticipants}` : ''} registered
                        </Text>
                      </View>

                      {/* Action Button Row */}
                      <View style={styles.eventActionRow}>
                        {isRegistered ? (
                          <View style={styles.registeredPill}>
                            <Text style={styles.registeredPillTxt}>✅ Registered</Text>
                          </View>
                        ) : isFull ? (
                          <View style={styles.closedPill}>
                            <Text style={styles.closedPillTxt}>⛔ Housefull</Text>
                          </View>
                        ) : isDeadlinePassed ? (
                          <View style={styles.closedPill}>
                            <Text style={styles.closedPillTxt}>⏳ Closed</Text>
                          </View>
                        ) : userRole === 'student' ? (
                          <TouchableOpacity
                            style={styles.registerBtn}
                            disabled={isRegisteringId === item._id}
                            onPress={() => handleRegisterEvent(item)}
                          >
                            {isRegisteringId === item._id ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <Text style={styles.registerBtnTxt}>Register Now</Text>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.organizerPill}>
                            <Text style={styles.organizerPillTxt}>Faculty View</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => setSelectedEvent(item)}
                        >
                          <Text style={styles.detailsBtnTxt}>Details ➔</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ================= TAB 2: CAMPUS NOTICES ================= */}
          {activeTab === 'notices' && (
            <View style={styles.tabSection}>
              {/* Category Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {(
                  ['all', 'academic', 'exam', 'placement', 'event', 'holiday', 'general'] as NoticeCategory[]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      noticeCategory === cat && styles.categoryChipActive
                    ]}
                    onPress={() => setNoticeCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipTxt,
                        noticeCategory === cat && styles.categoryChipTxtActive
                      ]}
                    >
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notices and circulars..."
                  value={noticeSearch}
                  onChangeText={setNoticeSearch}
                />
              </View>

              {filteredNotices.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📜</Text>
                  <Text style={styles.emptyTitle}>No Notices in Category</Text>
                  <Text style={styles.emptySub}>Official announcements will appear here.</Text>
                </View>
              ) : (
                filteredNotices.map((notice) => {
                  const isExpanded = expandedNoticeId === notice._id;
                  const dateStr = new Date(notice.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <TouchableOpacity
                      key={notice._id}
                      style={styles.noticeCard}
                      activeOpacity={0.85}
                      onPress={() => setExpandedNoticeId(isExpanded ? null : notice._id)}
                    >
                      <View style={styles.noticeHeader}>
                        <View style={styles.noticeCategoryBadge}>
                          <Text style={styles.noticeCategoryTxt}>
                            {notice.category?.toUpperCase() || 'GENERAL'}
                          </Text>
                        </View>
                        <Text style={styles.noticeDate}>{dateStr}</Text>

                        {isStaff && (
                          <TouchableOpacity
                            onPress={() => handleDeleteNotice(notice._id)}
                            style={styles.deleteMiniBtn}
                          >
                            <Text style={styles.deleteMiniTxt}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text style={styles.noticeTitle}>{notice.title}</Text>
                      <Text
                        style={styles.noticeContent}
                        numberOfLines={isExpanded ? undefined : 3}
                      >
                        {notice.content}
                      </Text>

                      <Text style={styles.tapToReadHint}>
                        {isExpanded ? 'Tap to collapse ▴' : 'Tap to read full circular ▾'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* ================= TAB 3: ACTIVITIES & POINTS ================= */}
          {activeTab === 'activities' && (
            <View style={styles.tabSection}>
              {/* Leaderboard Points Banner */}
              <View style={styles.pointsBanner}>
                <View>
                  <Text style={styles.pointsHeader}>🏆 Student Points</Text>
                  <Text style={styles.pointsSub}>Verified co-curricular score</Text>
                </View>
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsNumber}>{totalPoints}</Text>
                  <Text style={styles.pointsUnit}>PTS</Text>
                </View>
              </View>

              {/* Log Activity Action */}
              <TouchableOpacity
                style={styles.logActivityBtn}
                onPress={() => setShowLogActivityModal(true)}
              >
                <Text style={styles.logActivityBtnTxt}>+ Log New Co-Curricular Activity</Text>
              </TouchableOpacity>

              {/* Activities List */}
              {activities.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🎖️</Text>
                  <Text style={styles.emptyTitle}>No Activities Logged</Text>
                  <Text style={styles.emptySub}>
                    Log hackathon wins, certifications, or sports participation to earn points!
                  </Text>
                </View>
              ) : (
                activities.map((act) => {
                  const statusColor =
                    act.verificationStatus === 'verified'
                      ? '#059669'
                      : act.verificationStatus === 'rejected'
                      ? '#DC2626'
                      : '#D97706';
                  const statusBg =
                    act.verificationStatus === 'verified'
                      ? '#DCFCE7'
                      : act.verificationStatus === 'rejected'
                      ? '#FEE2E2'
                      : '#FEF3C7';

                  return (
                    <View key={act._id} style={styles.activityCard}>
                      <View style={styles.actTopRow}>
                        <View style={styles.actTypeBadge}>
                          <Text style={styles.actTypeTxt}>{act.type?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                          <Text style={[styles.statusBadgeTxt, { color: statusColor }]}>
                            {act.verificationStatus?.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.actTitle}>{act.title}</Text>
                      {act.description ? (
                        <Text style={styles.actDesc}>{act.description}</Text>
                      ) : null}

                      <View style={styles.actFooter}>
                        <Text style={styles.actDate}>
                          📅 {new Date(act.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.actPoints}>
                          ⭐ {act.pointsAwarded || 0} pts
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================= MODAL 1: EVENT DETAILS ================= */}
      <Modal
        visible={Boolean(selectedEvent)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>

            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={styles.modalDetailLabel}>Description</Text>
              <Text style={styles.modalDetailVal}>{selectedEvent?.description}</Text>

              <Text style={styles.modalDetailLabel}>Venue & Schedule</Text>
              <Text style={styles.modalDetailVal}>
                📍 {selectedEvent?.venue} {'\n'}📅 Event Date:{' '}
                {selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString()} {'\n'}⏰
                Registration Deadline:{' '}
                {selectedEvent?.registrationDeadline &&
                  new Date(selectedEvent.registrationDeadline).toLocaleDateString()}
              </Text>

              {selectedEvent?.winners && selectedEvent.winners.length > 0 && (
                <>
                  <Text style={[styles.modalDetailLabel, { color: '#059669', marginTop: 12 }]}>
                    🏆 Winners & Recognitions
                  </Text>
                  {selectedEvent.winners.map((w: any, idx: number) => (
                    <View key={idx} style={styles.winnerItem}>
                      <Text style={styles.winnerPosition}>{w.position}</Text>
                      <Text style={styles.winnerName}>{w.studentName} ({w.rollNumber})</Text>
                      {w.prize && <Text style={styles.winnerPrize}>🎁 {w.prize}</Text>}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 2: CREATE EVENT ================= */}
      <Modal
        visible={showCreateEventModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateEventModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publish Campus Event</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Smart India Hackathon 2026"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                placeholder="Details, eligibility, schedule..."
                value={newEventDesc}
                onChangeText={setNewEventDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Venue</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Main Auditorium, Block B"
                value={newEventVenue}
                onChangeText={setNewEventVenue}
              />

              <Text style={styles.inputLabel}>Event Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                value={newEventDate}
                onChangeText={setNewEventDate}
              />

              <Text style={styles.inputLabel}>Deadline (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                value={newEventDeadline}
                onChangeText={setNewEventDeadline}
              />

              <Text style={styles.inputLabel}>Max Capacity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="100"
                value={newEventCapacity}
                onChangeText={setNewEventCapacity}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCreateEventModal(false)}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateEvent}>
                <Text style={styles.modalSubmitTxt}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 3: CREATE NOTICE ================= */}
      <Modal
        visible={showCreateNoticeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateNoticeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Post Campus Notice</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={styles.inputLabel}>Notice Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Important Announcement..."
                value={newNoticeTitle}
                onChangeText={setNewNoticeTitle}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.modalCatRow}>
                {['academic', 'exam', 'placement', 'event', 'holiday', 'general'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.modalCatChip,
                      newNoticeCategory === c && styles.modalCatChipActive
                    ]}
                    onPress={() => setNewNoticeCategory(c)}
                  >
                    <Text
                      style={[
                        styles.modalCatChipTxt,
                        newNoticeCategory === c && styles.modalCatChipTxtActive
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notice Content</Text>
              <TextInput
                style={[styles.formInput, { height: 90 }]}
                placeholder="Write the full circular announcement here..."
                value={newNoticeContent}
                onChangeText={setNewNoticeContent}
                multiline
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCreateNoticeModal(false)}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateNotice}>
                <Text style={styles.modalSubmitTxt}>Broadcast</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 4: LOG ACTIVITY ================= */}
      <Modal
        visible={showLogActivityModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLogActivityModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Co-Curricular Activity</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Activity / Achievement Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. AWS Certified Cloud Practitioner"
                value={actTitle}
                onChangeText={setActTitle}
              />

              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.modalCatRow}>
                {(['hackathon', 'certification', 'sports', 'research', 'nss_ncc', 'other'] as ActivityType[]).map(
                  (t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.modalCatChip, actType === t && styles.modalCatChipActive]}
                      onPress={() => setActType(t)}
                    >
                      <Text
                        style={[styles.modalCatChipTxt, actType === t && styles.modalCatChipTxtActive]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 60 }]}
                placeholder="Rank, organizer, or details..."
                value={actDesc}
                onChangeText={setActDesc}
                multiline
              />

              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                value={actDate}
                onChangeText={setActDate}
              />

              <Text style={styles.inputLabel}>Proof / Certificate URL (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://..."
                value={actProofUrl}
                onChangeText={setActProofUrl}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogActivityModal(false)}
              >
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleLogActivity}>
                <Text style={styles.modalSubmitTxt}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F4FBF7',
  },
  warnIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  warnTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 8,
  },
  warnText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  headerActionBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#E6F4EA',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  segmentTxtActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loaderTxt: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  tabSection: {
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 4,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventDateBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventDateTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  resultsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultsBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  deleteMiniBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  deleteMiniTxt: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  eventMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  eventMetaTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  eventActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registerBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  registerBtnTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  registeredPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  registeredPillTxt: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  closedPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closedPillTxt: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '800',
  },
  organizerPill: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  organizerPillTxt: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailsBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  categoryChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  categoryChipTxtActive: {
    color: '#FFF',
  },
  noticeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noticeCategoryBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noticeCategoryTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  noticeDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  noticeContent: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  tapToReadHint: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 8,
  },
  pointsBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointsHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  pointsSub: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
  },
  pointsNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  pointsUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1FAE5',
  },
  logActivityBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 4,
  },
  logActivityBtnTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  actTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actTypeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  actTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  actDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  actFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginVertical: 12,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 14,
  },
  modalDetailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  modalDetailVal: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  winnerItem: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  winnerPosition: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  winnerName: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  winnerPrize: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
  },
  modalCatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  modalCatChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  modalCatChipActive: {
    backgroundColor: '#059669',
  },
  modalCatChipTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalCatChipTxtActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
});
