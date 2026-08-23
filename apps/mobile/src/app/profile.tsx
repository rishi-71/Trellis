import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { globalState } from '@/constants/globalState';

export default function ProfileScreen() {
  // Sync state with globalState
  const [ipAddress, setIpAddress] = useState(globalState.ipAddress);
  const [token, setToken] = useState<string | null>(globalState.token);

  // Auth State
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Profile State
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Profile Form State (for creating profile)
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.0');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  // Subscribe to globalState
  useEffect(() => {
    const unsubscribe = globalState.subscribe(() => {
      setIpAddress(globalState.ipAddress);
      setToken(globalState.token);
    });
    return unsubscribe;
  }, []);

  // Fetch Student Profile
  const fetchProfile = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/students/profile`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${authToken}`
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err: any) {
      console.log('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when token changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (token) {
        fetchProfile(token);
      } else {
        setProfile(null);
        setHasProfile(false);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [token, ipAddress]);

  const updateIp = (ip: string) => {
    globalState.setIpAddress(ip);
  };

  const backendUrl = globalState.backendUrl;

  // Login handler
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        globalState.setToken(data.token);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', `Could not connect to backend at ${backendUrl}. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'student' }),
      });
      const data = await response.json();
      if (data.success) {
        globalState.setToken(data.token);
        Alert.alert('Success', 'Registered successfully!');
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', `Could not connect to backend at ${backendUrl}. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  // Create Profile handler
  const handleCreateProfile = async () => {
    if (!name || !rollNumber || !branch || !graduationYear) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const skillArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const response = await fetch(`${backendUrl}/api/students/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          rollNumber,
          branch,
          graduationYear: parseInt(graduationYear),
          cgpa: parseFloat(cgpa) || 0,
          bio,
          skills: skillArray
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Profile created successfully!');
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        Alert.alert('Error', data.message || 'Could not create profile');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', `Could not connect to backend. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    globalState.setToken(null);
    setProfile(null);
    setHasProfile(false);
    setEmail('');
    setPassword('');
    Alert.alert('Logged Out', 'You have been logged out.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Connection Setup */}
        {!token && (
          <View style={styles.ipContainer}>
            <Text style={styles.ipLabel}>Backend Server IP Address:</Text>
            <TextInput 
              style={styles.ipInput}
              value={ipAddress}
              onChangeText={updateIp}
              placeholder="e.g. 192.168.1.100"
            />
            <Text style={styles.ipSub}>Currently using: {backendUrl}</Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator size="large" color="#4B5563" style={styles.loader} />
        )}

        {/* 1. Auth View (Login / Register) */}
        {!token && !loading && (
          <View style={styles.card}>
            <Text style={styles.title}>{isLoginView ? 'Trellis Student Login' : 'Trellis Student Register'}</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput 
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={isLoginView ? handleLogin : handleRegister}>
              <Text style={styles.buttonText}>{isLoginView ? 'Login' : 'Register'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)} style={styles.toggleTextContainer}>
              <Text style={styles.toggleText}>
                {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Create Profile Form */}
        {token && !hasProfile && !loading && (
          <View style={styles.card}>
            <Text style={styles.title}>Create Student Profile</Text>
            <Text style={styles.subtitle}>Setup your mini-LinkedIn profile</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Full Name *"
              value={name}
              onChangeText={setName}
            />

            <TextInput 
              style={styles.input}
              placeholder="Roll Number (e.g. CS202601) *"
              value={rollNumber}
              onChangeText={setRollNumber}
              autoCapitalize="characters"
            />

            <TextInput 
              style={styles.input}
              placeholder="Branch (e.g. Computer Science) *"
              value={branch}
              onChangeText={setBranch}
            />

            <TextInput 
              style={styles.input}
              placeholder="Graduation Year (e.g. 2026) *"
              value={graduationYear}
              onChangeText={setGraduationYear}
              keyboardType="numeric"
            />

            <TextInput 
              style={styles.input}
              placeholder="CGPA (e.g. 8.5)"
              value={cgpa}
              onChangeText={setCgpa}
              keyboardType="numeric"
            />

            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Short Bio / Summary"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
            />

            <TextInput 
              style={styles.input}
              placeholder="Skills (comma separated, e.g. React, Node.js)"
              value={skills}
              onChangeText={setSkills}
            />

            <TouchableOpacity style={styles.button} onPress={handleCreateProfile}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
              <Text style={styles.secondaryButtonText}>Cancel / Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. View Profile Card */}
        {token && hasProfile && profile && !loading && (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{profile.name ? profile.name[0].toUpperCase() : 'S'}</Text>
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRoll}>{profile.rollNumber} | {profile.branch}</Text>
              <Text style={styles.profileGrad}>Class of {profile.graduationYear}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio || "No bio added yet."}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Status</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile.cgpa?.toFixed(2) || '0.00'}</Text>
                  <Text style={styles.statLbl}>CGPA</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile.backlogs ?? 0}</Text>
                  <Text style={styles.statLbl}>Backlogs</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: string, index: number) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No skills listed yet.</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  scrollContainer: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  ipContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ipLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#064E3B',
    marginBottom: 4,
  },
  ipInput: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    color: '#000',
  },
  ipSub: {
    fontSize: 11,
    color: '#059669',
    marginTop: 4,
  },
  loader: {
    marginVertical: Spacing.four,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#059669',
    marginBottom: Spacing.four,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: Spacing.three,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 14,
  },
  toggleTextContainer: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4B5563',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  profileRoll: {
    fontSize: 16,
    color: '#059669',
    marginTop: 4,
  },
  profileGrad: {
    fontSize: 14,
    color: '#059669',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6F4EA',
    marginVertical: Spacing.four,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: Spacing.two,
  },
  bioText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.one,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: Spacing.three,
    borderRadius: 8,
    width: '40%',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  statLbl: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.one,
  },
  skillBadge: {
    backgroundColor: '#E6F4EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillBadgeText: {
    fontSize: 13,
    color: '#064E3B',
    fontWeight: '500',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
