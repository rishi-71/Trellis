import React, { useState, useEffect, useCallback } from 'react';
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

type Role = 'student' | 'faculty' | 'management';

export default function ProfileScreen() {
  // Sync state with globalState
  const [token, setToken] = useState<string | null>(globalState.token);
  const [ipAddress, setIpAddress] = useState(globalState.ipAddress);
  const [userRole, setUserRole] = useState<string | null>(globalState.userRole);

  // Screen State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [regYear, setRegYear] = useState('1');
  const [regSemester, setRegSemester] = useState('1');
  const [collegeId, setCollegeId] = useState('');
  const [post, setPost] = useState('');
  const [regFacultyDept, setRegFacultyDept] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [mgmtDept, setMgmtDept] = useState('Campus Facilities & Operations');
  const [mgmtPhone, setMgmtPhone] = useState('');
  const [officeLocation, setOfficeLocation] = useState('Central Admin Office');

  // Edit Profile Inputs
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editCgpa, setEditCgpa] = useState('');

  // Subscribe to globalState
  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setToken(globalState.token);
      setIpAddress(globalState.ipAddress);
      setUserRole(globalState.userRole);
    });
    return unsubscribe;
  }, []);

  const backendUrl = globalState.backendUrl;

  // Fetch Current User & Profile
  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setHasProfile(true);
        if (data.user?.role) {
          globalState.setUserRole(data.user.role);
        }
        if (data.profile.branch) globalState.setStudentBranch(data.profile.branch);
        if (data.profile.year) globalState.setStudentYear(data.profile.year);
        if (data.profile.semester) globalState.setStudentSemester(data.profile.semester);

        setEditBio(data.profile.bio || '');
        setEditSkills((data.profile.skills || []).join(', '));
        setEditCgpa(data.profile.cgpa ? String(data.profile.cgpa) : '');
      } else {
        setHasProfile(false);
      }
    } catch (err: any) {
      console.warn('Profile fetch note:', err.message);
    }
  }, [backendUrl]);

  // Initial load
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchProfile(token).finally(() => setLoading(false));
    } else {
      setProfile(null);
      setHasProfile(false);
    }
  }, [token, fetchProfile]);

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchProfile(token);
    setRefreshing(false);
  };

  // Login handler
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        globalState.setToken(data.token);
        if (data.user?.role) globalState.setUserRole(data.user.role);
        await fetchProfile(data.token);
        Alert.alert('Welcome!', 'Logged in successfully.');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', `Could not reach ${backendUrl}. Ensure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Required', 'Please fill in Name, Email, and Password.');
      return;
    }

    const payload: any = {
      email: email.trim(),
      password,
      name: name.trim(),
      role: registerRole
    };

    if (registerRole === 'student') {
      if (!rollNumber.trim() || !branch.trim()) {
        Alert.alert('Required', 'Please provide your Enrollment Number and Branch.');
        return;
      }
      payload.enrollmentNumber = rollNumber.trim();
      payload.branch = branch.trim();
      payload.year = parseInt(regYear) || 1;
      payload.semester = parseInt(regSemester) || 1;
    } else if (registerRole === 'faculty') {
      if (!collegeId.trim() || !post.trim() || !regFacultyDept.trim()) {
        Alert.alert('Required', 'Please fill in College ID, Post, and Department.');
        return;
      }
      payload.collegeId = collegeId.trim();
      payload.post = post.trim();
      payload.department = regFacultyDept.trim();
    } else if (registerRole === 'management') {
      if (!employeeId.trim()) {
        Alert.alert('Required', 'Please provide your Employee/Staff ID.');
        return;
      }
      payload.employeeId = employeeId.trim();
      payload.department = mgmtDept.trim();
      payload.phone = mgmtPhone.trim();
      payload.officeLocation = officeLocation.trim();
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.token) {
        globalState.setToken(data.token);
        if (data.user?.role) globalState.setUserRole(data.user.role);
        await fetchProfile(data.token);
        Alert.alert('Success', 'Account registered successfully!');
      } else {
        Alert.alert('Registration Failed', data.message || 'Unable to register.');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', `Could not reach ${backendUrl}.`);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile (Bio, Skills, CGPA)
  const handleUpdateProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const skillArray = editSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${backendUrl}/api/students/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile?.name || name,
          rollNumber: profile?.rollNumber || rollNumber,
          branch: profile?.branch || branch,
          graduationYear: profile?.graduationYear || 2026,
          bio: editBio,
          skills: skillArray,
          cgpa: parseFloat(editCgpa) || profile?.cgpa || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setIsEditModalOpen(false);
        Alert.alert('Updated', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', data.message || 'Could not update profile.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of Trellis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            globalState.setToken(null);
            globalState.setUserRole(null);
            globalState.setStudentBranch('');
            globalState.setStudentYear(1);
            globalState.setStudentSemester(1);
            setProfile(null);
            setHasProfile(false);
            setEmail('');
            setPassword('');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
          }
        >
          {/* Header Title Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brandTitle}>🌱 Trellis</Text>
              <Text style={styles.screenSubtitle}>Campus Identity & Credentials</Text>
            </View>
            <TouchableOpacity
              style={styles.serverSettingsBtn}
              onPress={() => setShowServerConfig(!showServerConfig)}
            >
              <Text style={styles.serverSettingsBtnText}>⚙️ Server</Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible Server IP Config */}
          {showServerConfig && (
            <View style={styles.serverCard}>
              <Text style={styles.serverLabel}>Backend Server Address</Text>
              <TextInput
                style={styles.serverInput}
                value={ipAddress}
                onChangeText={(val) => globalState.setIpAddress(val.trim())}
                placeholder="127.0.0.1"
                autoCapitalize="none"
              />
              <Text style={styles.serverHint}>Using: {backendUrl}</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Syncing with Campus Cloud...</Text>
            </View>
          )}

          {/* 1. AUTHENTICATED PROFILE VIEW */}
          {token && profile && !loading && (
            <View style={styles.cardContainer}>
              {/* Profile Card Header */}
              <View style={styles.avatarCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {profile.name ? profile.name[0].toUpperCase() : 'T'}
                  </Text>
                </View>
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userEmail}>{profile.user?.email || email || 'Campus Member'}</Text>
                
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {userRole ? userRole.toUpperCase() : 'STUDENT'}
                  </Text>
                </View>
              </View>

              {/* Role-Specific Information */}
              {userRole === 'student' ? (
                <>
                  {/* Academic Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statTile}>
                      <Text style={styles.statNumber}>{profile.cgpa?.toFixed(2) || '0.00'}</Text>
                      <Text style={styles.statLabel}>CGPA</Text>
                    </View>
                    <View style={styles.statTile}>
                      <Text style={styles.statNumber}>Yr {profile.year || 1}</Text>
                      <Text style={styles.statLabel}>Academic Year</Text>
                    </View>
                    <View style={styles.statTile}>
                      <Text style={styles.statNumber}>Sem {profile.semester || 1}</Text>
                      <Text style={styles.statLabel}>Semester</Text>
                    </View>
                  </View>

                  {/* Program & Enrollment */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionHeading}>Academic Details</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Enrollment No.</Text>
                      <Text style={styles.infoVal}>{profile.rollNumber || '—'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Branch</Text>
                      <Text style={styles.infoVal}>{profile.branch || '—'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>Class of</Text>
                      <Text style={styles.infoVal}>{profile.graduationYear || '2026'}</Text>
                    </View>
                  </View>

                  {/* Bio */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionHeading}>About Me</Text>
                    <Text style={styles.bioContent}>
                      {profile.bio || 'No bio provided. Tap "Edit Profile" below to add your summary.'}
                    </Text>
                  </View>

                  {/* Skills Tags */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionHeading}>Skills & Competencies</Text>
                    <View style={styles.skillChipsWrap}>
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: string, idx: number) => (
                          <View key={idx} style={styles.skillChip}>
                            <Text style={styles.skillChipText}>{skill}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.mutedText}>No skills listed yet.</Text>
                      )}
                    </View>
                  </View>
                </>
              ) : userRole === 'faculty' ? (
                /* Faculty Info */
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>Faculty Profile</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>College ID</Text>
                    <Text style={styles.infoVal}>{profile.collegeId || '—'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Designation</Text>
                    <Text style={styles.infoVal}>{profile.post || 'Professor'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Department</Text>
                    <Text style={styles.infoVal}>{profile.department || '—'}</Text>
                  </View>
                </View>
              ) : (
                /* Management Info */
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>Management Desk</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Staff ID</Text>
                    <Text style={styles.infoVal}>{profile.employeeId || '—'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Department</Text>
                    <Text style={styles.infoVal}>{profile.department || 'Facilities'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Office</Text>
                    <Text style={styles.infoVal}>{profile.officeLocation || 'Central Office'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Direct Phone</Text>
                    <Text style={styles.infoVal}>{profile.phone || 'Campus Line'}</Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {userRole === 'student' && (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setIsEditModalOpen(true)}
                  >
                    <Text style={styles.primaryBtnText}>✏️ Edit Profile</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2. AUTHENTICATION VIEW (When logged out) */}
          {!token && !loading && (
            <View style={styles.authContainer}>
              <View style={styles.authCard}>
                <Text style={styles.authTitle}>
                  {isLoginView ? 'Sign In to Campus OS' : 'Create Trellis Account'}
                </Text>
                <Text style={styles.authSub}>
                  {isLoginView
                    ? 'Enter your institutional credentials to continue'
                    : 'Select your role and setup your campus account'}
                </Text>

                {/* Role Selector Tabs (Only on Register) */}
                {!isLoginView && (
                  <View style={styles.roleTabsWrap}>
                    {(['student', 'faculty', 'management'] as Role[]).map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.roleTabBtn,
                          registerRole === r && styles.roleTabBtnActive
                        ]}
                        onPress={() => setRegisterRole(r)}
                      >
                        <Text
                          style={[
                            styles.roleTabTxt,
                            registerRole === r && styles.roleTabTxtActive
                          ]}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Shared Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Institutional Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="student@ips.edu"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {/* Extra Fields for Registration */}
                {!isLoginView && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>

                    {registerRole === 'student' && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Enrollment / Roll Number</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="CS202601"
                            value={rollNumber}
                            onChangeText={setRollNumber}
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Branch / Department</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Computer Science"
                            value={branch}
                            onChangeText={setBranch}
                          />
                        </View>
                        <View style={styles.inputSplitRow}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.inputLabel}>Year (1-4)</Text>
                            <TextInput
                              style={styles.textInput}
                              placeholder="1"
                              value={regYear}
                              onChangeText={setRegYear}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Semester (1-8)</Text>
                            <TextInput
                              style={styles.textInput}
                              placeholder="1"
                              value={regSemester}
                              onChangeText={setRegSemester}
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </>
                    )}

                    {registerRole === 'faculty' && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>College ID</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="FAC-2024"
                            value={collegeId}
                            onChangeText={setCollegeId}
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Post / Title</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Associate Professor"
                            value={post}
                            onChangeText={setPost}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Department</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Internet of Things (IoT)"
                            value={regFacultyDept}
                            onChangeText={setRegFacultyDept}
                          />
                        </View>
                      </>
                    )}

                    {registerRole === 'management' && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Employee / Staff ID</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="MGMT-01"
                            value={employeeId}
                            onChangeText={setEmployeeId}
                            autoCapitalize="characters"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Office Location</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="Central Admin Room 102"
                            value={officeLocation}
                            onChangeText={setOfficeLocation}
                          />
                        </View>
                      </>
                    )}
                  </>
                )}

                {/* Primary Submit */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={isLoginView ? handleLogin : handleRegister}
                >
                  <Text style={styles.submitBtnText}>
                    {isLoginView ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                {/* Toggle Login / Register */}
                <TouchableOpacity
                  style={styles.toggleWrap}
                  onPress={() => setIsLoginView(!isLoginView)}
                >
                  <Text style={styles.toggleTxt}>
                    {isLoginView
                      ? "Don't have an account? Register here"
                      : 'Already registered? Sign in'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 3. EDIT PROFILE MODAL */}
          <Modal
            visible={isEditModalOpen}
            animationType="slide"
            transparent
            onRequestClose={() => setIsEditModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Edit Campus Profile</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CGPA</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="8.50"
                    value={editCgpa}
                    onChangeText={setEditCgpa}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Skills (comma separated)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="React Native, Node.js, Python, Figma"
                    value={editSkills}
                    onChangeText={setEditSkills}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>About / Bio</Text>
                  <TextInput
                    style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Write a brief professional overview..."
                    value={editBio}
                    onChangeText={setEditBio}
                    multiline
                  />
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsEditModalOpen(false)}
                  >
                    <Text style={styles.modalCancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={handleUpdateProfile}
                  >
                    <Text style={styles.modalSaveTxt}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  serverSettingsBtn: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  serverSettingsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  serverCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  serverLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 6,
  },
  serverInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  serverHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
  },
  cardContainer: {
    gap: 16,
  },
  avatarCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoKey: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  bioContent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  skillChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#E6F4EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  mutedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  authContainer: {
    marginTop: 10,
  },
  authCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#064E3B',
    textAlign: 'center',
  },
  authSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  roleTabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  roleTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleTabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleTabTxtActive: {
    color: '#059669',
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputSplitRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  toggleWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 12,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  modalSaveTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
