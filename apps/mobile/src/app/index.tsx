import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { globalState } from '@/constants/globalState';

// Modular Component Imports
import FinderModule from '@/components/modules/FinderModule';
import CareerModule from '@/components/modules/CareerModule';
import PlacementsModule from '@/components/modules/PlacementsModule';
import SensorsModule from '@/components/modules/SensorsModule';
import NoticesModule from '@/components/modules/NoticesModule';
import ComplaintsModule from '@/components/modules/ComplaintsModule';
import LostFoundModule from '@/components/modules/LostFoundModule';
import SOSModule from '@/components/modules/SOSModule';

const { width } = Dimensions.get('window');

type ActiveApp = 'none' | 'finder' | 'career' | 'placements' | 'sensors' | 'notices' | 'complaints' | 'lostfound' | 'sos';

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(globalState.token);
  const [ipAddress, setIpAddress] = useState(globalState.ipAddress);
  const [userRole, setUserRole] = useState<string | null>(globalState.userRole);
  const [studentBranch, setStudentBranch] = useState(globalState.studentBranch);
  const [studentYear, setStudentYear] = useState(globalState.studentYear);
  const [studentSemester, setStudentSemester] = useState(globalState.studentSemester);
  const [activeApp, setActiveApp] = useState<ActiveApp>('none');

  // Sync token and IP
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

  const desktopApps = [
    { id: 'finder' as ActiveApp, name: '📍 Campus Finder', desc: 'Indoor navigation map & route paths', bg: '#10B981' },
    { id: 'placements' as ActiveApp, name: '💼 Careers Board', desc: 'Placement openings & eligibility checklists', bg: '#047857' },
    { id: 'career' as ActiveApp, name: '👥 Career Hub Feed', desc: 'Classmate updates & points leaderboard', bg: '#059669' },
    { id: 'sensors' as ActiveApp, name: '🔬 Sensor Renting', desc: 'Lease IoT hardware sensors for lab work', bg: '#065F46' },
    { id: 'notices' as ActiveApp, name: '📢 College Notices', desc: 'Official administrative announcements', bg: '#34D399' },
    { id: 'complaints' as ActiveApp, name: '🔧 Support Services', desc: 'Log classroom maintenance tickets', bg: '#059669' },
    { id: 'lostfound' as ActiveApp, name: '📦 Claims Bulletin', desc: 'Lost and found item reports catalog', bg: '#10B981' },
    { id: 'sos' as ActiveApp, name: '🚨 Security SOS Panic', desc: 'Trigger guards instant dispatch alarm', bg: '#EF4444' }
  ];

  if (!token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.warnTitle}>Trellis Campus OS</Text>
        <Text style={styles.warnText}>
          Please switch to the Profile tab to register your credentials and configure your college server IP address.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {activeApp === 'none' ? (
        /* Welcome Greeting Dashboard (Default home page style) */
        <ScrollView contentContainerStyle={styles.desktop}>
          {/* Greeting Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>Hello, student@ips.edu! 👋</Text>
            <Text style={styles.greetingText}>
              Welcome to Campus OS. Select an application shortcut below to open the module workspace.
            </Text>
            <Text style={styles.ipText}>Connected Server: {ipAddress}</Text>
          </View>

          {/* Student Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Text style={styles.statsEmoji}>🏆</Text>
              <Text style={styles.statsVal}>150</Text>
              <Text style={styles.statsLbl}>Points</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsEmoji}>🎓</Text>
              <Text style={styles.statsVal}>8.54</Text>
              <Text style={styles.statsLbl}>CGPA</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsEmoji}>🔬</Text>
              <Text style={styles.statsVal}>1</Text>
              <Text style={styles.statsLbl}>Leases</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsEmoji}>🔧</Text>
              <Text style={styles.statsVal}>0</Text>
              <Text style={styles.statsLbl}>Cases</Text>
            </View>
          </View>

          {/* Vertical Launcher List */}
          <Text style={styles.sectionHeading}>Campus Applications</Text>
          <View style={styles.list}>
            {desktopApps
              .filter((app) => {
                if (userRole === "student") {
                  if (app.id === "placements") {
                    const isAllowed = studentYear >= 4 || studentSemester >= 7;
                    if (!isAllowed) return false;
                  }
                } else if (userRole === "faculty") {
                  if (app.id === "placements" || app.id === "complaints") {
                    return false;
                  }
                  if (app.id === "sensors") {
                    const deptName = (studentBranch || "").toLowerCase();
                    const isAllowed =
                      deptName.includes("iot") ||
                      deptName.includes("electronics") ||
                      deptName.includes("electrical") ||
                      deptName.includes("ece") ||
                      deptName.includes("eee");
                    if (!isAllowed) return false;
                  }
                }
                return true;
              })
              .map((app) => (
              <TouchableOpacity 
                key={app.id} 
                style={styles.listRow} 
                onPress={() => setActiveApp(app.id)}
              >
                <View style={[styles.rowIconBg, { backgroundColor: app.bg }]}>
                  <Text style={styles.rowIconTxt}>{app.name.split(' ')[0]}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>{app.name.split(' ').slice(1).join(' ')}</Text>
                  <Text style={styles.rowDesc}>{app.desc}</Text>
                </View>
                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Workspace Wrapper for Module screen overlay */
        <View style={styles.workspace}>
          {/* Header Back Bar */}
          <View style={styles.workspaceHeader}>
            <Text style={styles.workspaceTitle}>
              {activeApp.toUpperCase()} WORKSPACE
            </Text>
            <TouchableOpacity style={styles.homeBtn} onPress={() => setActiveApp('none')}>
              <Text style={styles.homeBtnText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>

          {/* Active Modular Screen Content */}
          <ScrollView contentContainerStyle={styles.workspaceContent}>
            {activeApp === 'finder' && <FinderModule token={token} backendUrl={backendUrl} />}
            {activeApp === 'career' && <CareerModule token={token} backendUrl={backendUrl} />}
            {activeApp === 'placements' && (() => {
              const isAllowed = (userRole === 'student' && (studentYear >= 4 || studentSemester >= 7)) || userRole === 'admin';
              if (!isAllowed) {
                return (
                  <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, margin: 16 }}>
                    <Text style={{ fontSize: 32, marginBottom: 12 }}>💼</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginBottom: 8 }}>Access Restricted</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                      {userRole === 'faculty'
                        ? 'The Placement Board is not accessible to faculty members.'
                        : 'The Placement Board is restricted to students in their 4th Year or 7th Semester (and above).'}
                    </Text>
                  </View>
                );
              }
              return <PlacementsModule token={token} backendUrl={backendUrl} />;
            })()}
            {activeApp === 'sensors' && (() => {
              let isAllowed = false;
              if (userRole === 'student' || userRole === 'admin') {
                isAllowed = true;
              } else if (userRole === 'faculty') {
                const deptName = (studentBranch || "").toLowerCase();
                isAllowed = deptName.includes("iot") || deptName.includes("electronics") || deptName.includes("electrical") || deptName.includes("ece") || deptName.includes("eee");
              }

              if (!isAllowed) {
                return (
                  <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, margin: 16 }}>
                    <Text style={{ fontSize: 32, marginBottom: 12 }}>🔬</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginBottom: 8 }}>Access Restricted</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                      The IoT Sensor Renting feature is restricted to faculty members from IoT, ECE, and Electrical departments.
                    </Text>
                  </View>
                );
              }
              return <SensorsModule token={token} backendUrl={backendUrl} />;
            })()}
            {activeApp === 'notices' && <NoticesModule token={token} backendUrl={backendUrl} />}
            {activeApp === 'complaints' && (() => {
              if (userRole === 'faculty') {
                return (
                  <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, margin: 16 }}>
                    <Text style={{ fontSize: 32, marginBottom: 12 }}>🔧</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginBottom: 8 }}>Access Restricted</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                      The Support Complaints board is not accessible to faculty members.
                    </Text>
                  </View>
                );
              }
              return <ComplaintsModule token={token} backendUrl={backendUrl} />;
            })()}
            {activeApp === 'lostfound' && <LostFoundModule token={token} backendUrl={backendUrl} />}
            {activeApp === 'sos' && <SOSModule token={token} backendUrl={backendUrl} />}
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
    padding: Spacing.six,
    backgroundColor: '#F4FBF7',
  },
  warnTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 8,
  },
  warnText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Greeting Dashboard Styles
  desktop: {
    padding: Spacing.four,
  },
  greetingCard: {
    backgroundColor: '#059669',
    borderRadius: 24,
    padding: Spacing.five,
    marginBottom: Spacing.four,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  greetingText: {
    fontSize: 12,
    color: '#E6F4EA',
    marginTop: 6,
    lineHeight: 18,
  },
  ipText: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  statsCard: {
    width: (width - Spacing.four * 2 - Spacing.three * 3) / 4,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  statsEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  statsVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B',
  },
  statsLbl: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: Spacing.three,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    padding: Spacing.two,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconTxt: {
    fontSize: 20,
  },
  rowMeta: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  rowDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  arrow: {
    fontSize: 14,
    color: '#A7F3D0',
    paddingHorizontal: 8,
  },
  // Workspace styles
  workspace: {
    flex: 1,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#E6F4EA',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  workspaceTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: 1.2,
  },
  homeBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  workspaceContent: {
    padding: Spacing.four,
  },
});
