import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalState } from '@/constants/globalState';

// Modular Component Imports (Preserved 100% untouched)
import FinderModule from '@/components/modules/FinderModule';
import CareerModule from '@/components/modules/CareerModule';
import PlacementsModule from '@/components/modules/PlacementsModule';
import SensorsModule from '@/components/modules/SensorsModule';
import NoticesModule from '@/components/modules/NoticesModule';
import ComplaintsModule from '@/components/modules/ComplaintsModule';
import LostFoundModule from '@/components/modules/LostFoundModule';
import SOSModule from '@/components/modules/SOSModule';

type ActiveApp =
  | 'none'
  | 'finder'
  | 'career'
  | 'placements'
  | 'sensors'
  | 'notices'
  | 'complaints'
  | 'lostfound'
  | 'sos';

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(globalState.token);
  const [ipAddress, setIpAddress] = useState(globalState.ipAddress);
  const [userRole, setUserRole] = useState<string | null>(globalState.userRole);
  const [studentBranch, setStudentBranch] = useState(globalState.studentBranch);
  const [studentYear, setStudentYear] = useState(globalState.studentYear);
  const [studentSemester, setStudentSemester] = useState(globalState.studentSemester);

  const [activeApp, setActiveApp] = useState<ActiveApp>('none');
  const [refreshing, setRefreshing] = useState(false);
  const [facultyDept, setFacultyDept] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Notification Center States
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifModalVisible, setNotifModalVisible] = useState<boolean>(false);

  // Sync with globalState
  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setToken(globalState.token);
      setIpAddress(globalState.ipAddress);
      setUserRole(globalState.userRole);
      setStudentBranch(globalState.studentBranch);
      setStudentYear(globalState.studentYear);
      setStudentSemester(globalState.studentSemester);
    });
    return unsubscribe;
  }, []);

  const backendUrl = globalState.backendUrl;

  // Sync user role and department for access control
  const syncPermissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (data.user?.role) {
          setUserRole(data.user.role);
          globalState.setUserRole(data.user.role);
        }
        if (data.profile) {
          setUserProfile(data.profile);
          if (data.user?.role === 'student') {
            if (data.profile.branch) globalState.setStudentBranch(data.profile.branch);
            if (data.profile.year) globalState.setStudentYear(data.profile.year);
            if (data.profile.semester) globalState.setStudentSemester(data.profile.semester);
          } else if (data.user?.role === 'faculty') {
            setFacultyDept(data.profile.department || '');
          }
        }
      }
    } catch (e: any) {
      console.warn('Sync note:', e.message);
    }
  }, [token, backendUrl]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const countRes = await fetch(`${backendUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const countData = await countRes.json();
      if (countData.success) {
        setUnreadCount(countData.unreadCount || 0);
      }

      const notifRes = await fetch(`${backendUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      if (notifData.success && Array.isArray(notifData.notifications)) {
        setNotifications(notifData.notifications);
      }
    } catch (_) {}
  }, [backendUrl, token]);

  const markAllRead = async () => {
    try {
      await fetch(`${backendUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  useEffect(() => {
    syncPermissions();
    fetchNotifications();
  }, [syncPermissions, fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([syncPermissions(), fetchNotifications()]);
    setRefreshing(false);
  };

  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin';
  const isStudent = userRole === 'student';
  const isManagement = userRole === 'management';

  // Role-specific app titles & descriptions matching web
  const careerTitle = isFacultyOrAdmin
    ? 'Student Records & Verifications'
    : 'Career Hub Feed';
  const careerDesc = isFacultyOrAdmin
    ? 'Verify student achievements, search student profiles by roll number or email, and discover campus talent.'
    : 'Classmate updates, peer skill endorsements & points leaderboard';

  const eventsTitle = isStudent
    ? 'Notices and Events'
    : 'Notices and Event Management';
  const eventsDesc = isStudent
    ? 'Explore upcoming events, publish notices, register for workshops, and track campus activities.'
    : 'Broadcast announcements, organize events, mark attendance and publish results.';

  const allApps = [
    {
      id: 'finder' as ActiveApp,
      name: '📍 Campus Finder',
      desc: 'Interactive maps, building floor plans & Dijkstra shortest path routing',
      bg: '#10B981',
      badge: 'NAVIGATOR'
    },
    {
      id: 'notices' as ActiveApp,
      name: `📢 ${eventsTitle}`,
      desc: eventsDesc,
      bg: '#0D9488',
      badge: 'FEED'
    },
    {
      id: 'placements' as ActiveApp,
      name: '💼 Careers & Placements',
      desc: 'Placement drive openings, company postings & auto-eligibility checklists',
      bg: '#047857',
      badge: 'CAREERS'
    },
    {
      id: 'career' as ActiveApp,
      name: isFacultyOrAdmin ? `🎓 ${careerTitle}` : `👥 ${careerTitle}`,
      desc: careerDesc,
      bg: '#059669',
      badge: isFacultyOrAdmin ? 'FACULTY DESK' : 'SOCIAL'
    },
    {
      id: 'sensors' as ActiveApp,
      name: '🔬 IoT Sensor Renting',
      desc: 'Lease microcontrollers & IoT lab hardware with automated due-date return tracking',
      bg: '#065F46',
      badge: 'HARDWARE'
    },
    {
      id: 'complaints' as ActiveApp,
      name: '🔧 Service Complaints',
      desc: 'Log campus facilities & maintenance tickets (WiFi, classroom, washrooms)',
      bg: '#0F766E',
      badge: 'FACILITIES'
    },
    {
      id: 'lostfound' as ActiveApp,
      name: '📦 Lost & Found Claims',
      desc: 'Campus claims bulletin, report lost valuables & track found handover status',
      bg: '#10B981',
      badge: 'BULLETIN'
    },
    {
      id: 'sos' as ActiveApp,
      name: '🚨 Security SOS Panic',
      desc: 'Instant guard dispatch alarm transmitting emergency campus coordinates',
      bg: '#EF4444',
      badge: 'EMERGENCY'
    }
  ];

  // Role-Based Filtering (Exact Web Parity)
  const accessibleApps = allApps.filter((app) => {
    // Management Persona
    if (isManagement) {
      return app.id === 'lostfound' || app.id === 'complaints' || app.id === 'finder';
    }

    // Faculty Persona
    if (userRole === 'faculty') {
      // 1. Placements: Faculty cannot access
      if (app.id === 'placements') return false;
      // 2. Complaints: Faculty cannot access
      if (app.id === 'complaints') return false;
      // 3. Sensors: All faculty allowed to access IoT Lab Desk & rentals
      if (app.id === 'sensors') return true;
      return true;
    }

    // Student Persona
    if (isStudent) {
      // Placements: Restricted to 3rd Year (Yr 3+) or 6th Semester (Sem 6+)
      if (app.id === 'placements') {
        const isAllowed = studentYear >= 3 || studentSemester >= 6;
        if (!isAllowed) return false;
      }
      return true;
    }

    return true;
  });

  const handleLaunchApp = (appId: ActiveApp) => {
    if (appId === 'placements' && isStudent) {
      const isAllowed = studentYear >= 3 || studentSemester >= 6;
      if (!isAllowed) {
        Alert.alert(
          'Eligibility Notice',
          'The Placement Board is restricted to students in their 3rd Year or 6th Semester (and above).'
        );
        return;
      }
    }

    setActiveApp(appId);
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🌱</Text>
        <Text style={styles.warnTitle}>Trellis Campus OS</Text>
        <Text style={styles.warnText}>
          Please switch to the **Profile** tab to sign in or register your institutional credentials.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {activeApp === 'none' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
          }
        >
          {/* Clean App Header Bar */}
          <View style={styles.topHeader}>
            <Text style={styles.brandTitle}>🌱 Trellis</Text>
            <View style={styles.topRightActions}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>
                  {userRole ? userRole.toUpperCase() : 'STUDENT'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => {
                  fetchNotifications();
                  setNotifModalVisible(true);
                }}
              >
                <Text style={styles.notifBtnIcon}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeTxt}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutTopBtn}
                onPress={() => {
                  globalState.setToken(null);
                  globalState.setUserRole(null);
                }}
              >
                <Text style={styles.logoutTopBtnText}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome & Campus Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextCol}>
                <Text style={styles.heroGreeting}>Welcome back 👋</Text>
                <Text style={styles.heroName} numberOfLines={1}>
                  {userProfile?.name || (userRole ? `${userRole.toUpperCase()} PORTAL` : 'CAMPUS MEMBER')}
                </Text>
              </View>
              <View style={styles.heroStatusPill}>
                <View style={styles.heroStatusDot} />
                <Text style={styles.heroStatusTxt}>Online</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroBottomRow}>
              <Text style={styles.heroMetaTxt}>
                {userProfile?.rollNumber ? `ID: ${userProfile.rollNumber}` : 'IPS Academy'}
                {userProfile?.branch ? ` • ${userProfile.branch}` : ''}
              </Text>
              <TouchableOpacity
                style={styles.heroSosBtn}
                activeOpacity={0.8}
                onPress={() => handleLaunchApp('sos')}
              >
                <Text style={styles.heroSosTxt}>🚨 Quick SOS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Heading */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Campus Applications</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountTxt}>{accessibleApps.length} active</Text>
            </View>
          </View>

          {/* Features / Applications List */}
          <View style={styles.appsList}>
            {accessibleApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.appCard}
                activeOpacity={0.85}
                onPress={() => handleLaunchApp(app.id)}
              >
                <View style={[styles.appIconBg, { backgroundColor: app.bg }]}>
                  <Text style={styles.appIconTxt}>{app.name.split(' ')[0]}</Text>
                </View>

                <View style={styles.appMeta}>
                  <View style={styles.appTitleRow}>
                    <Text style={styles.appName}>
                      {app.name.split(' ').slice(1).join(' ')}
                    </Text>
                    {app.badge && (
                      <View style={styles.appBadge}>
                        <Text style={styles.appBadgeTxt}>{app.badge}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.chevronBox}>
                  <Text style={styles.chevronTxt}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Workspace Overlay for Active Module */
        <View style={styles.workspaceContainer}>
          {/* Header Back Bar */}
          <View style={styles.workspaceHeader}>
            <TouchableOpacity
              style={styles.backWorkspaceBtn}
              onPress={() => setActiveApp('none')}
              activeOpacity={0.7}
            >
              <Text style={styles.backWorkspaceArrow}>‹</Text>
              <Text style={styles.backWorkspaceTxt}>Back</Text>
            </TouchableOpacity>

            <View style={styles.workspaceTitleBox}>
              <Text style={styles.workspaceTitle} numberOfLines={1}>
                {allApps.find((a) => a.id === activeApp)?.name || 'Campus Workspace'}
              </Text>
            </View>

            <View style={styles.workspaceHeaderBadge}>
              <Text style={styles.workspaceHeaderBadgeTxt}>
                {allApps.find((a) => a.id === activeApp)?.badge || 'MODULE'}
              </Text>
            </View>
          </View>

          {/* Module Content */}
          {activeApp === 'complaints' || activeApp === 'lostfound' ? (
            <View style={{ flex: 1, padding: 12 }}>
              {activeApp === 'complaints' && (
                <ComplaintsModule
                  token={token}
                  backendUrl={backendUrl}
                  userRole={userRole}
                />
              )}
              {activeApp === 'lostfound' && (
                <LostFoundModule
                  token={token}
                  backendUrl={backendUrl}
                  userRole={userRole}
                />
              )}
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.workspaceBody}>
              {activeApp === 'finder' && (
                <FinderModule token={token} backendUrl={backendUrl} />
              )}
              {activeApp === 'career' && (
                <CareerModule token={token} backendUrl={backendUrl} />
              )}
              {activeApp === 'placements' && (
                <PlacementsModule token={token} backendUrl={backendUrl} />
              )}
              {activeApp === 'sensors' && (
                <SensorsModule token={token} backendUrl={backendUrl} />
              )}
              {activeApp === 'notices' && (
                <NoticesModule token={token} backendUrl={backendUrl} />
              )}
              {activeApp === 'sos' && (
                <SOSModule token={token} backendUrl={backendUrl} userRole={userRole} />
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Notification Center Modal */}
      <Modal visible={notifModalVisible} transparent animationType="slide">
        <View style={styles.notifBackdrop}>
          <View style={styles.notifModalCard}>
            <View style={styles.notifModalHeader}>
              <View>
                <Text style={styles.notifModalTitle}>🔔 Notification Center</Text>
                <Text style={styles.notifModalSub}>
                  {unreadCount > 0
                    ? `${unreadCount} unread institutional alert${unreadCount > 1 ? 's' : ''}`
                    : 'You are all caught up!'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notifCloseBtn}
                onPress={() => setNotifModalVisible(false)}
              >
                <Text style={styles.notifCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                <Text style={styles.markAllBtnTxt}>✓ Mark All as Read</Text>
              </TouchableOpacity>
            )}

            <ScrollView contentContainerStyle={styles.notifList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifBox}>
                  <Text style={styles.emptyNotifEmoji}>✨</Text>
                  <Text style={styles.emptyNotifTitle}>No Notifications</Text>
                  <Text style={styles.emptyNotifSub}>You have no alerts at this time.</Text>
                </View>
              ) : (
                notifications.map((n) => {
                  const isLostFound = n.type === 'lost_found';
                  const badgeIcon = isLostFound
                    ? '📦'
                    : n.type === 'placement_drive'
                    ? '💼'
                    : '📢';
                  const dateStr = n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Recent';

                  return (
                    <View
                      key={n._id}
                      style={[styles.notifItem, !n.isRead && styles.notifItemUnread]}
                    >
                      <View style={styles.notifItemHeader}>
                        <View style={styles.notifBadgeRow}>
                          <Text style={styles.notifItemType}>
                            {badgeIcon} {isLostFound ? 'LOST & FOUND' : n.type?.toUpperCase()}
                          </Text>
                          {!n.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notifItemDate}>{dateStr}</Text>
                      </View>
                      <Text style={styles.notifItemTitle}>{n.title || 'Institutional Notice'}</Text>
                      <Text style={styles.notifItemMsg}>{n.message}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
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
  lockIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  warnTitle: {
    fontSize: 22,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    backgroundColor: '#FFF',
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notifBtnIcon: {
    fontSize: 16,
  },
  logoutTopBtn: {
    backgroundColor: '#FEE2E2',
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutTopBtnText: {
    fontSize: 16,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notifBadgeTxt: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  roleTag: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    marginTop: 2,
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  heroStatusTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMetaTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  heroSosBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  heroSosTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCountBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionCountTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  appsList: {
    gap: 12,
  },
  appCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  appIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconTxt: {
    fontSize: 22,
  },
  appMeta: {
    flex: 1,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  appBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.3,
  },
  appDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  chevronBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: -2,
    marginLeft: 1,
  },
  workspaceContainer: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  backWorkspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 2,
  },
  backWorkspaceArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: -2,
  },
  backWorkspaceTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  workspaceTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  workspaceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  workspaceHeaderBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  workspaceHeaderBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
  },
  workspaceBody: {
    padding: 12,
  },
  notifBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notifModalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  notifModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notifModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#064E3B',
  },
  notifModalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  notifCloseBtn: {
    backgroundColor: '#F3F4F6',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCloseTxt: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  markAllBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  markAllBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  notifList: {
    paddingBottom: 24,
    gap: 10,
  },
  emptyNotifBox: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 6,
  },
  emptyNotifEmoji: {
    fontSize: 36,
  },
  emptyNotifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  emptyNotifSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  notifItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  notifItemUnread: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  notifItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifItemType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  notifItemDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  notifItemMsg: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
});
