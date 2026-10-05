import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl
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

  useEffect(() => {
    syncPermissions();
  }, [syncPermissions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncPermissions();
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
      // 3. Sensors: Only IoT, ECE, Electrical, Electronics faculty allowed
      if (app.id === 'sensors') {
        const deptLower = (facultyDept || userProfile?.department || '').toLowerCase();
        const isAllowed =
          deptLower.includes('iot') ||
          deptLower.includes('electronics') ||
          deptLower.includes('electrical') ||
          deptLower.includes('ece') ||
          deptLower.includes('eee');
        if (!isAllowed) return false;
      }
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
            <View>
              <Text style={styles.brandTitle}>🌱 Trellis</Text>
              <Text style={styles.brandSub}>Campus Applications & Services</Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>
                {userRole ? userRole.toUpperCase() : 'STUDENT'}
              </Text>
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
                  <Text style={styles.appDesc} numberOfLines={2}>
                    {app.desc}
                  </Text>
                </View>

                <Text style={styles.appChevron}>➔</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Workspace Overlay for Active Module */
        <View style={styles.workspaceContainer}>
          {/* Header Back Bar */}
          <View style={styles.workspaceHeader}>
            <Text style={styles.workspaceTitle}>
              {activeApp.toUpperCase()} WORKSPACE
            </Text>
            <TouchableOpacity
              style={styles.closeWorkspaceBtn}
              onPress={() => setActiveApp('none')}
            >
              <Text style={styles.closeWorkspaceTxt}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Module Content */}
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
            {activeApp === 'sos' && (
              <SOSModule token={token} backendUrl={backendUrl} />
            )}
          </ScrollView>
        </View>
      )}
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
  appsList: {
    gap: 12,
  },
  appCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
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
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconTxt: {
    fontSize: 24,
  },
  appMeta: {
    flex: 1,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  appBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4B5563',
  },
  appDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  appChevron: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    paddingLeft: 4,
  },
  workspaceContainer: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4EA',
  },
  workspaceTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: 0.5,
  },
  closeWorkspaceBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeWorkspaceTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  workspaceBody: {
    padding: 12,
  },
});
