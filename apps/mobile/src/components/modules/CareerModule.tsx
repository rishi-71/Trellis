import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Image,
  FlatList,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import { Spacing } from '@/constants/theme';

interface CareerProps {
  token: string;
  backendUrl: string;
}

export default function CareerModule({ token, backendUrl }: CareerProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'achievements' | 'discovery' | 'chat'>('profile');

  // Student Profile details
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [semester, setSemester] = useState<number>(1);
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  // Education sub-states
  const [tenthPercentageOrCgpa, setTenthPercentageOrCgpa] = useState("");
  const [tenthBoard, setTenthBoard] = useState("");
  const [tenthSchoolName, setTenthSchoolName] = useState("");
  const [tenthYearOfPassing, setTenthYearOfPassing] = useState("");

  const [twelfthPercentageOrCgpa, setTwelfthPercentageOrCgpa] = useState("");
  const [twelfthBoard, setTwelfthBoard] = useState("");
  const [twelfthSchoolName, setTwelfthSchoolName] = useState("");
  const [twelfthYearOfPassing, setTwelfthYearOfPassing] = useState("");

  const [gradCourseBranch, setGradCourseBranch] = useState("");
  const [gradUniversityName, setGradUniversityName] = useState("");
  const [gradCurrentCgpa, setGradCurrentCgpa] = useState("");
  const [gradCurrentSemester, setGradCurrentSemester] = useState<number>(1);

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [skills, setSkills] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  // Resume builder states
  const [activeResumeTemplate, setActiveResumeTemplate] = useState<string>("minimal");
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [newResumeName, setNewResumeName] = useState("My Mobile Resume");
  const [resumeEdits, setResumeEdits] = useState<any>({
    name: "", branch: "", graduationYear: "", education: {}, bio: "", contact: "",
    github: "", linkedin: "", portfolio: "", skills: [], projects: [], experience: [], certifications: []
  });

  // Achievements states
  const [achTitle, setAchTitle] = useState("");
  const [achCategory, setAchCategory] = useState("technical");
  const [achLevel, setAchLevel] = useState("college");
  const [achDescription, setAchDescription] = useState("");
  const [achProofUrl, setAchProofUrl] = useState("");
  const [achSemester, setAchSemester] = useState<number>(1);
  const [myAchievements, setMyAchievements] = useState<any[]>([]);

  // Discovery Directory states
  const [searchVal, setSearchVal] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [discoveredProfiles, setDiscoveredProfiles] = useState<any[]>([]);
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<any>(null);

  // Chat/Messaging States
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token) {
      fetchStudentProfile();
      fetchActivityFeed();
      handleSearchDirectory("");
    }
  }, [token]);

  useEffect(() => {
    if (profile?._id) {
      fetchAchievements();
      fetchResumes();
      setResumeEdits({
        name: profile.name || "",
        branch: profile.branch || "",
        graduationYear: profile.graduationYear || "",
        education: profile.education || {},
        bio: profile.bio || "",
        contact: profile.contact || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        portfolio: profile.portfolio || "",
        skills: profile.skills || [],
        projects: profile.projects || [],
        experience: profile.experience || [],
        certifications: profile.certifications || []
      });
    }
  }, [profile]);

  // Socket Connection for Realtime messaging
  useEffect(() => {
    if (!token || !profile?._id) return;

    const userId = profile.user?._id || profile.user;
    const socket = io(backendUrl, { query: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:user", userId);
    });

    socket.on("message:new", (msg: any) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
        markRead(activeConv._id);
      }
      fetchChatInbox();
    });

    socket.on("conversation:updated", () => {
      fetchChatInbox();
    });

    fetchChatInbox();

    return () => {
      socket.disconnect();
    };
  }, [token, profile?._id, activeConv?._id]);

  const fetchStudentProfile = async () => {
    try {
      const email = "student@ips.edu"; // hardcoded query email fallback
      const response = await fetch(`${backendUrl}/api/profile/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (data.needsOnboarding) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
          setProfile(data.profile);
          setHasProfile(true);
          if (data.profile) {
            setName(data.profile.name || "");
            setRollNumber(data.profile.rollNumber || "");
            setBranch(data.profile.branch || "");
            setGraduationYear(data.profile.graduationYear?.toString() || "2026");
            setSemester(data.profile.semester || 1);
            setContact(data.profile.contact || "");
            setBio(data.profile.bio || "");
            const edu = data.profile.education || {};
            setTenthPercentageOrCgpa(edu.tenth?.percentageOrCgpa || "");
            setTenthBoard(edu.tenth?.board || "");
            setTenthSchoolName(edu.tenth?.schoolName || "");
            setTenthYearOfPassing(edu.tenth?.yearOfPassing?.toString() || "");

            setTwelfthPercentageOrCgpa(edu.twelfth?.percentageOrCgpa || "");
            setTwelfthBoard(edu.twelfth?.board || "");
            setTwelfthSchoolName(edu.twelfth?.schoolName || "");
            setTwelfthYearOfPassing(edu.twelfth?.yearOfPassing?.toString() || "");

            setGradCourseBranch(edu.graduation?.courseBranch || "");
            setGradUniversityName(edu.graduation?.universityName || "");
            setGradCurrentCgpa(edu.graduation?.currentCgpa?.toString() || "");
            setGradCurrentSemester(edu.graduation?.currentSemester || 1);

            setGithub(data.profile.github || "");
            setLinkedin(data.profile.linkedin || "");
            setPortfolio(data.profile.portfolio || "");
            setSkills((data.profile.skills || []).join(", "));
            setPhotoUrl(data.profile.photoUrl || "");
            setBannerImage(data.profile.bannerImage || "");
          }
        }
      }
    } catch (err: any) {
      console.log("Error loading mobile profile:", err.message);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/achievements/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMyAchievements(data.achievements || []);
    } catch (err) {}
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/resume/${profile._id}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSavedResumes(data.resumes || []);
    } catch (err) {}
  };

  const fetchActivityFeed = async () => {
    // feed loaded
  };

  const handleSearchDirectory = async (val: string, br = "", yr = "", tg = "") => {
    try {
      const response = await fetch(`${backendUrl}/api/discover/search?skill=${val}&branch=${br}&year=${yr}&tag=${tg}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDiscoveredProfiles(data.profiles || []);
    } catch (err) {}
  };

  const fetchChatInbox = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setConversations(data.conversations || []);
    } catch (err) {}
  };

  // Image Upload helper using expo-image-picker
  const pickAndUploadImage = async (type: 'avatar' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photos permissions are required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoading(true);
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        const payload = type === 'avatar' ? { photoUrl: base64Data } : { bannerImage: base64Data };
        const response = await fetch(`${backendUrl}/api/profile/student@ips.edu`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          if (type === 'avatar') setPhotoUrl(data.profile.photoUrl);
          else setBannerImage(data.profile.bannerImage);
          Alert.alert('Success', 'Image updated!');
        }
      } catch (err) {
        Alert.alert('Error', 'Image upload failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOnboardSubmit = async () => {
    if (!name || !rollNumber || !branch) {
      Alert.alert('Error', 'Fill all required onboarding fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/profile/student@ips.edu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name, rollNumber, branch,
          graduationYear: parseInt(graduationYear), semester,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (data.success) {
        setNeedsOnboarding(false);
        fetchStudentProfile();
      }
    } catch (err) {
      Alert.alert('Error', 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/profile/student@ips.edu`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name, rollNumber, branch,
          graduationYear: parseInt(graduationYear), semester,
          contact, bio,
          education: {
            tenth: {
              percentageOrCgpa: tenthPercentageOrCgpa,
              board: tenthBoard,
              schoolName: tenthSchoolName,
              yearOfPassing: tenthYearOfPassing ? parseInt(tenthYearOfPassing) : undefined
            },
            twelfth: {
              percentageOrCgpa: twelfthPercentageOrCgpa,
              board: twelfthBoard,
              schoolName: twelfthSchoolName,
              yearOfPassing: twelfthYearOfPassing ? parseInt(twelfthYearOfPassing) : undefined
            },
            graduation: {
              courseBranch: gradCourseBranch,
              universityName: gradUniversityName,
              currentCgpa: gradCurrentCgpa ? parseFloat(gradCurrentCgpa) : undefined,
              currentSemester: gradCurrentSemester ? parseInt(gradCurrentSemester.toString()) : undefined
            }
          },
          github, linkedin, portfolio,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated!');
      }
    } catch (err) {
      Alert.alert('Error', 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEducation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/profile/student@ips.edu`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name, rollNumber, branch,
          graduationYear: parseInt(graduationYear), semester,
          contact, bio,
          education: {
            tenth: {
              percentageOrCgpa: tenthPercentageOrCgpa,
              board: tenthBoard,
              schoolName: tenthSchoolName,
              yearOfPassing: tenthYearOfPassing ? parseInt(tenthYearOfPassing) : undefined
            },
            twelfth: {
              percentageOrCgpa: twelfthPercentageOrCgpa,
              board: twelfthBoard,
              schoolName: twelfthSchoolName,
              yearOfPassing: twelfthYearOfPassing ? parseInt(twelfthYearOfPassing) : undefined
            },
            graduation: {
              courseBranch: gradCourseBranch,
              universityName: gradUniversityName,
              currentCgpa: gradCurrentCgpa ? parseFloat(gradCurrentCgpa) : undefined,
              currentSemester: gradCurrentSemester ? parseInt(gradCurrentSemester.toString()) : undefined
            }
          },
          github, linkedin, portfolio,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setIsEditingEducation(false);
        Alert.alert('Success', 'Education details updated!');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update education details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async () => {
    if (!achTitle || !achDescription) return;
    try {
      const response = await fetch(`${backendUrl}/api/achievements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: achTitle, category: achCategory, level: achLevel,
          description: achDescription, proofUrl: achProofUrl, semester: achSemester
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Achievement submitted!');
        setAchTitle("");
        setAchDescription("");
        setAchProofUrl("");
        fetchAchievements();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit achievement');
    }
  };

  const handleDownloadResume = async () => {
    // Pipe download link to device browser
    const url = `${backendUrl}/api/resume/${profile._id}/generate?template=${activeResumeTemplate}&token=${token}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Could not open export download link.');
    }
  };

  const handleSaveResumeVersion = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/resume/${profile._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: activeResumeTemplate,
          name: newResumeName,
          generatedContent: resumeEdits
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Snapshot version saved!');
        fetchResumes();
      }
    } catch (err) {
      Alert.alert('Error', 'Save version failed');
    }
  };

  // Skill endorsement trigger
  const handleEndorseSkill = async (targetUserId: string, skillName: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/endorse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId: targetUserId, skill: skillName })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', `Endorsed ${skillName}!`);
        if (selectedPublicProfile) {
          fetchPublicProfile(selectedPublicProfile.profile._id);
        }
      } else {
        Alert.alert('Endorsement Info', data.message || 'Could not endorse.');
      }
    } catch (err) {}
  };

  const handleToggleFollow = async (targetId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/follow/${targetId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', data.followed ? "Followed student!" : "Unfollowed student!");
        if (selectedPublicProfile) {
          fetchPublicProfile(targetId);
        }
        handleSearchDirectory(searchVal, filterBranch, filterYear, filterTag);
      }
    } catch (err) {}
  };

  const fetchPublicProfile = async (targetId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/profile/${targetId}/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSelectedPublicProfile(data);
    } catch (err) {}
  };

  // One-to-one socket messaging triggers
  const handleSelectConv = (conv: any) => {
    if (activeConv && socketRef.current) {
      socketRef.current.emit("leave:conversation", activeConv._id);
    }
    setActiveConv(conv);
    const other = conv.participants?.find((p: any) => p._id !== (profile.user?._id || profile.user));
    setOtherUser(other);
    if (socketRef.current) {
      socketRef.current.emit("join:conversation", conv._id);
    }
    loadMessages(conv._id);
    markRead(conv._id);
  };

  const loadMessages = async (convId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMessages(data.messages || []);
    } catch (err) {}
  };

  const markRead = async (convId: string) => {
    try {
      await fetch(`${backendUrl}/api/chat/conversations/${convId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConv) return;
    const text = inputText;
    setInputText("");

    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations/${activeConv._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      if (data.success && !socketRef.current?.connected) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {}
  };

  const startNewChatFromDiscovery = async (recId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: recId })
      });
      const data = await response.json();
      if (data.success && data.conversation) {
        setSelectedPublicProfile(null);
        setActiveTab('chat');
        handleSelectConv(data.conversation);
      }
    } catch (err) {}
  };

  // Compile timeline grouped by semester
  const compileGrowthTimeline = () => {
    const semesters: { [key: number]: any[] } = {};
    for (let s = 1; s <= 8; s++) semesters[s] = [];

    if (profile) {
      (profile.projects || []).forEach((p: any) => {
        if (p.semester) semesters[p.semester].push({ type: 'Project', title: p.title });
      });
      (profile.certifications || []).forEach((c: any) => {
        if (c.semester) semesters[c.semester].push({ type: 'Certificate', title: c.name });
      });
      (profile.experience || []).forEach((e: any) => {
        if (e.semester) semesters[e.semester].push({ type: 'Experience', title: e.title });
      });
    }

    myAchievements.forEach((a: any) => {
      if (a.status === 'verified' && a.semester) {
        semesters[a.semester].push({ type: 'Achievement', title: a.title });
      }
    });

    return semesters;
  };

  const timelineData = compileGrowthTimeline();

  if (needsOnboarding || !hasProfile) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.tabHeading}>Complete Onboarding Setup</Text>
          <TextInput placeholder="Full Name *" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#9CA3AF" />
          <TextInput placeholder="Roll Number *" value={rollNumber} onChangeText={setRollNumber} style={styles.input} placeholderTextColor="#9CA3AF" />
          <TextInput placeholder="Branch *" value={branch} onChangeText={setBranch} style={styles.input} placeholderTextColor="#9CA3AF" />
          <TextInput placeholder="Graduation Year *" value={graduationYear} onChangeText={setGraduationYear} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />
          <TextInput placeholder="Skills (comma separated)" value={skills} onChangeText={setSkills} style={styles.input} placeholderTextColor="#9CA3AF" />
          
          <TouchableOpacity style={styles.primaryBtn} onPress={handleOnboardSubmit}>
            <Text style={styles.btnText}>Onboard Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub Tabs Selector */}
      <View style={styles.tabToggleRow}>
        {(['profile', 'resume', 'achievements', 'discovery', 'chat'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.toggleBtn, activeTab === tab && styles.toggleBtnActive]} 
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'chat') fetchChatInbox();
            }}
          >
            <Text style={[styles.toggleBtnText, activeTab === tab && styles.toggleBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 8 }} />}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tab 1: Profile Timelines */}
        {activeTab === 'profile' && profile && (
          <View style={styles.sectionContainer}>
            {/* Banner DP overlapping box */}
            <View style={styles.bannerBox}>
              {bannerImage ? (
                <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
              ) : (
                <View style={styles.bannerPlaceholder} />
              )}
              <View style={styles.bannerActions}>
                <TouchableOpacity style={styles.coverBtn} onPress={() => pickAndUploadImage('banner')}>
                  <Text style={styles.coverBtnText}>Cover</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.avatarRow}>
              <TouchableOpacity onPress={() => pickAndUploadImage('avatar')}>
                <View style={styles.avatarBox}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarPlaceholderText}>{name ? name[0].toUpperCase() : 'S'}</Text>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.introBox}>
                <Text style={styles.nameHeader}>{name}</Text>
                <Text style={styles.subtext}>{branch} • Year {graduationYear}</Text>
                <View style={styles.tagsContainer}>
                  {(profile.careerTags || []).map((t: string, i: number) => (
                    <Text key={i} style={styles.careerTagBadge}>💼 {t}</Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Profile Bio Details */}
            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Bio Summary</Text>
              <Text style={styles.bioText}>{bio || 'Update bio details.'}</Text>
              {contact ? <Text style={styles.detailText}>📞 {contact}</Text> : null}
              

              <View style={styles.linksRow}>
                {github ? <Text style={styles.linkUrl}>GitHub: {github}</Text> : null}
                {linkedin ? <Text style={styles.linkUrl}>LinkedIn: {linkedin}</Text> : null}
              </View>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsEditing(!isEditing)}>
                <Text style={styles.secondaryBtnText}>{isEditing ? 'Close' : 'Edit Intro Info'}</Text>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <View style={styles.editCard}>
                <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#9CA3AF" />
                <TextInput placeholder="Contact" value={contact} onChangeText={setContact} style={styles.input} placeholderTextColor="#9CA3AF" />
                <TextInput placeholder="GitHub" value={github} onChangeText={setGithub} style={styles.input} placeholderTextColor="#9CA3AF" />
                <TextInput placeholder="LinkedIn" value={linkedin} onChangeText={setLinkedin} style={styles.input} placeholderTextColor="#9CA3AF" />
                <TextInput placeholder="Skills (comma split)" value={skills} onChangeText={setSkills} style={styles.input} placeholderTextColor="#9CA3AF" />
              

                <TextInput placeholder="Bio details" value={bio} onChangeText={setBio} style={[styles.input, styles.textArea]} multiline placeholderTextColor="#9CA3AF" />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile}>
                  <Text style={styles.btnText}>Save Details</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Growth Timeline sorted by semester */}
            <View style={styles.timelineCard}>
              <Text style={styles.timelineHeader}>Career Growth Timeline 📈</Text>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const items = timelineData[sem] || [];
                if (items.length === 0) return null;
                return (
                  <View key={sem} style={styles.timelineRow}>
                    <Text style={styles.timelineSemTitle}>Semester {sem}</Text>
                    {items.map((it, idx) => (
                      <View key={idx} style={styles.timelineItem}>
                        <Text style={styles.timelineItemType}>{it.type.toUpperCase()}</Text>
                        <Text style={styles.timelineItemTitle}>{it.title}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>

            {/* Standalone Education Background Section */}
            <View style={[styles.card, { marginTop: 15 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 6 }}>
                <Text style={styles.timelineHeader}>Education Background 🎓</Text>
                <TouchableOpacity 
                  style={[styles.secondaryBtn, { marginVertical: 0, paddingVertical: 4, paddingHorizontal: 12 }]} 
                  onPress={() => setIsEditingEducation(!isEditingEducation)}
                >
                  <Text style={styles.secondaryBtnText}>{isEditingEducation ? 'Cancel' : 'Edit Education'}</Text>
                </TouchableOpacity>
              </View>

              {isEditingEducation ? (
                <View style={styles.editCard}>
                  <Text style={styles.formSectionTitle}>Graduation Details</Text>
                  <TextInput placeholder="University Name" value={gradUniversityName} onChangeText={setGradUniversityName} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Course & Branch" value={gradCourseBranch} onChangeText={setGradCourseBranch} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Current Semester" value={gradCurrentSemester ? gradCurrentSemester.toString() : ""} onChangeText={(val) => setGradCurrentSemester(parseInt(val) || 1)} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Latest Cumulative CGPA" value={gradCurrentCgpa} onChangeText={setGradCurrentCgpa} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />

                  <Text style={styles.formSectionTitle}>12th Standard Details</Text>
                  <TextInput placeholder="School Name" value={twelfthSchoolName} onChangeText={setTwelfthSchoolName} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Board" value={twelfthBoard} onChangeText={setTwelfthBoard} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Passing Year" value={twelfthYearOfPassing} onChangeText={setTwelfthYearOfPassing} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Marks (Percentage/CGPA)" value={twelfthPercentageOrCgpa} onChangeText={setTwelfthPercentageOrCgpa} style={styles.input} placeholderTextColor="#9CA3AF" />

                  <Text style={styles.formSectionTitle}>10th Standard Details</Text>
                  <TextInput placeholder="School Name" value={tenthSchoolName} onChangeText={setTenthSchoolName} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Board" value={tenthBoard} onChangeText={setTenthBoard} style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Passing Year" value={tenthYearOfPassing} onChangeText={setTenthYearOfPassing} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />
                  <TextInput placeholder="Marks (Percentage/CGPA)" value={tenthPercentageOrCgpa} onChangeText={setTenthPercentageOrCgpa} style={styles.input} placeholderTextColor="#9CA3AF" />

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateEducation}>
                    <Text style={styles.btnText}>Save Education</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Display read-only structured blocks */
                <View style={styles.educationDisplayCard}>
                  {profile.education?.graduation && (profile.education.graduation.courseBranch || profile.education.graduation.universityName) ? (
                    <View style={styles.eduItem}>
                      <Text style={styles.eduType}>Graduation</Text>
                      <Text style={styles.eduName}>{profile.education.graduation.courseBranch || 'N/A'}</Text>
                      <Text style={styles.eduSub}>{profile.education.graduation.universityName || 'N/A'} (Sem: {profile.education.graduation.currentSemester || 'N/A'} | CGPA: {profile.education.graduation.currentCgpa || 'N/A'})</Text>
                    </View>
                  ) : (
                    <View style={styles.eduItem}>
                      <Text style={styles.eduType}>Graduation</Text>
                      <Text style={[styles.eduSub, { fontStyle: 'italic', color: '#9CA3AF' }]}>No graduation details filled yet.</Text>
                    </View>
                  )}

                  {profile.education?.twelfth && (profile.education.twelfth.schoolName || profile.education.twelfth.percentageOrCgpa) ? (
                    <View style={[styles.eduItem, styles.eduBorderTop]}>
                      <Text style={styles.eduType}>12th Standard / Diploma</Text>
                      <Text style={styles.eduName}>{profile.education.twelfth.schoolName || 'N/A'}</Text>
                      <Text style={styles.eduSub}>{profile.education.twelfth.board || 'N/A'} (Passing Year: {profile.education.twelfth.yearOfPassing || 'N/A'}) | Marks: {profile.education.twelfth.percentageOrCgpa || 'N/A'}</Text>
                    </View>
                  ) : (
                    <View style={[styles.eduItem, styles.eduBorderTop]}>
                      <Text style={styles.eduType}>12th Standard / Diploma</Text>
                      <Text style={[styles.eduSub, { fontStyle: 'italic', color: '#9CA3AF' }]}>No 12th details filled yet.</Text>
                    </View>
                  )}

                  {profile.education?.tenth && (profile.education.tenth.schoolName || profile.education.tenth.percentageOrCgpa) ? (
                    <View style={[styles.eduItem, styles.eduBorderTop]}>
                      <Text style={styles.eduType}>10th Standard</Text>
                      <Text style={styles.eduName}>{profile.education.tenth.schoolName || 'N/A'}</Text>
                      <Text style={styles.eduSub}>{profile.education.tenth.board || 'N/A'} (Passing Year: {profile.education.tenth.yearOfPassing || 'N/A'}) | Marks: {profile.education.tenth.percentageOrCgpa || 'N/A'}</Text>
                    </View>
                  ) : (
                    <View style={[styles.eduItem, styles.eduBorderTop]}>
                      <Text style={styles.eduType}>10th Standard</Text>
                      <Text style={[styles.eduSub, { fontStyle: 'italic', color: '#9CA3AF' }]}>No 10th details filled yet.</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tab 2: Resume builder */}
        {activeTab === 'resume' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.tabHeading}>1. Resume Template Picker</Text>
            <View style={styles.pickerRow}>
              {['minimal', 'technical', 'data-analyst'].map((t) => (
                <TouchableOpacity 
                  key={t}
                  style={[styles.pickerBtn, activeResumeTemplate === t && styles.pickerBtnActive]}
                  onPress={() => setActiveResumeTemplate(t)}
                >
                  <Text style={[styles.pickerBtnText, activeResumeTemplate === t && styles.pickerBtnTextActive]}>
                    {t.replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput placeholder="Resume Name snapshot" value={newResumeName} onChangeText={setNewResumeName} style={styles.input} placeholderTextColor="#9CA3AF" />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleDownloadResume}>
                <Text style={styles.btnText}>Export PDF 📥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#059669' }]} onPress={handleSaveResumeVersion}>
                <Text style={styles.btnText}>Save version 💾</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timelineHeader}>2. Saved Snapshot Versions</Text>
            {savedResumes.map((res) => (
              <View key={res._id} style={styles.resCard}>
                <Text style={styles.resTitle}>{res.name}</Text>
                <Text style={styles.resDate}>{new Date(res.createdAt).toLocaleDateString()} • {res.templateId.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Achievements */}
        {activeTab === 'achievements' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.tabHeading}>Log Achievement</Text>
            <TextInput placeholder="Title" value={achTitle} onChangeText={setAchTitle} style={styles.input} placeholderTextColor="#9CA3AF" />
            <TextInput placeholder="Description Details" value={achDescription} onChangeText={setAchDescription} style={[styles.input, styles.textArea]} multiline placeholderTextColor="#9CA3AF" />
            <TextInput placeholder="Proof link URL" value={achProofUrl} onChangeText={setAchProofUrl} style={styles.input} placeholderTextColor="#9CA3AF" />
            <TextInput placeholder="Semester (1-8)" value={achSemester.toString()} onChangeText={(v) => setAchSemester(parseInt(v) || 1)} keyboardType="numeric" style={styles.input} placeholderTextColor="#9CA3AF" />
            
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddAchievement}>
              <Text style={styles.btnText}>Submit Achievement</Text>
            </TouchableOpacity>

            <Text style={styles.timelineHeader}>Submission Status Log</Text>
            {myAchievements.map((ach) => (
              <View key={ach._id} style={styles.achStatusCard}>
                <View style={styles.achHeaderRow}>
                  <Text style={styles.achTitle}>{ach.title}</Text>
                  <Text style={styles.achStatusText}>{ach.status}</Text>
                </View>
                {ach.rejectionReason ? <Text style={styles.rejectionText}>Reason: {ach.rejectionReason}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* Tab 4: Student Discovery Directory */}
        {activeTab === 'discovery' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.tabHeading}>Discovery Directory</Text>
            <TextInput 
              placeholder="Search by Skill (e.g. React)" 
              value={searchVal} 
              onChangeText={(t) => { setSearchVal(t); handleSearchDirectory(t, filterBranch, filterYear, filterTag); }} 
              style={styles.input} 
              placeholderTextColor="#9CA3AF"
            />
            
            {discoveredProfiles.map((p) => {
              if (p._id === profile?._id) return null;
              return (
                <View key={p._id} style={styles.profileCard}>
                  <View style={styles.profileRow}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{p.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileName}>{p.name}</Text>
                      <Text style={styles.profileMeta}>{p.branch} | Class of {p.graduationYear}</Text>
                    </View>
                  </View>
                  <View style={styles.actionButtonRow}>
                    <TouchableOpacity style={styles.viewProfileBtn} onPress={() => fetchPublicProfile(p._id)}>
                      <Text style={styles.viewProfileBtnText}>View Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.viewProfileBtn} onPress={() => startNewChatFromDiscovery(p.user?._id || p.user)}>
                      <Text style={styles.viewProfileBtnText}>💬 Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Public profile Overlay card */}
            {selectedPublicProfile && (
              <View style={styles.overlayCard}>
                <Text style={styles.overlayTitle}>{selectedPublicProfile.profile.name}</Text>
                <Text style={styles.overlayMeta}>{selectedPublicProfile.profile.branch} | Year {selectedPublicProfile.profile.graduationYear}</Text>
                <Text style={styles.overlayBio}>{selectedPublicProfile.profile.bio}</Text>
                
                <TouchableOpacity 
                  style={[styles.primaryBtn, { marginVertical: 6 }]} 
                  onPress={() => handleToggleFollow(selectedPublicProfile.profile._id)}
                >
                  <Text style={styles.btnText}>
                    {selectedPublicProfile.isFollowing ? '✓ Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>

                {selectedPublicProfile.profile.education && typeof selectedPublicProfile.profile.education === 'object' && (
                  <View style={styles.educationDisplayCard}>
                    <Text style={styles.educationTitle}>Education</Text>
                    {selectedPublicProfile.profile.education.graduation && (selectedPublicProfile.profile.education.graduation.courseBranch || selectedPublicProfile.profile.education.graduation.universityName) && (
                      <View style={styles.eduItem}>
                        <Text style={styles.eduType}>Graduation</Text>
                        <Text style={styles.eduName}>{selectedPublicProfile.profile.education.graduation.courseBranch}</Text>
                        <Text style={styles.eduSub}>{selectedPublicProfile.profile.education.graduation.universityName} (Sem: {selectedPublicProfile.profile.education.graduation.currentSemester} | CGPA: {selectedPublicProfile.profile.education.graduation.currentCgpa})</Text>
                      </View>
                    )}
                    {selectedPublicProfile.profile.education.twelfth && (selectedPublicProfile.profile.education.twelfth.schoolName || selectedPublicProfile.profile.education.twelfth.percentageOrCgpa) && (
                      <View style={[styles.eduItem, styles.eduBorderTop]}>
                        <Text style={styles.eduType}>12th Standard</Text>
                        <Text style={styles.eduName}>{selectedPublicProfile.profile.education.twelfth.schoolName}</Text>
                        <Text style={styles.eduSub}>{selectedPublicProfile.profile.education.twelfth.board} (Passing Year: {selectedPublicProfile.profile.education.twelfth.yearOfPassing}) | Marks: {selectedPublicProfile.profile.education.twelfth.percentageOrCgpa}</Text>
                      </View>
                    )}
                    {selectedPublicProfile.profile.education.tenth && (selectedPublicProfile.profile.education.tenth.schoolName || selectedPublicProfile.profile.education.tenth.percentageOrCgpa) && (
                      <View style={[styles.eduItem, styles.eduBorderTop]}>
                        <Text style={styles.eduType}>10th Standard</Text>
                        <Text style={styles.eduName}>{selectedPublicProfile.profile.education.tenth.schoolName}</Text>
                        <Text style={styles.eduSub}>{selectedPublicProfile.profile.education.tenth.board} (Passing Year: {selectedPublicProfile.profile.education.tenth.yearOfPassing}) | Marks: {selectedPublicProfile.profile.education.tenth.percentageOrCgpa}</Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.sectionSub}>Skills</Text>
                {selectedPublicProfile.profile.skills?.map((sk: string, idx: number) => {
                  const count = selectedPublicProfile.endorsements?.filter((e: any) => e.skill === sk).length || 0;
                  return (
                    <View key={idx} style={styles.endorseRow}>
                      <Text style={styles.endorseText}>{sk}</Text>
                      <TouchableOpacity style={styles.endorseBtn} onPress={() => handleEndorseSkill(selectedPublicProfile.profile.user?._id, sk)}>
                        <Text style={styles.endorseBtnText}>Endorse ({count})</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity style={styles.closeOverlayBtn} onPress={() => setSelectedPublicProfile(null)}>
                  <Text style={styles.closeOverlayBtnText}>Close Card</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab 5: Messenger Chat Inbox */}
        {activeTab === 'chat' && (
          <View style={styles.sectionContainer}>
            {activeConv ? (
              /* Inside active conversation messaging thread screen */
              <View style={styles.chatThreadBox}>
                <View style={styles.chatHeader}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setActiveConv(null)}>
                    <Text style={styles.backBtnText}>← Inbox</Text>
                  </TouchableOpacity>
                  <Text style={styles.chatHeaderName}>{otherUser?.name || otherUser?.email}</Text>
                </View>
                
                <ScrollView contentContainerStyle={styles.messagesList} style={{ height: 260 }}>
                  {messages.map((m) => {
                    const isMine = m.senderId === (profile.user?._id || profile.user);
                    return (
                      <View key={m._id} style={[styles.bubbleWrapper, isMine ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
                        <View style={[styles.chatBubble, isMine ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                          <Text style={isMine ? styles.bubbleTextRight : styles.bubbleTextLeft}>{m.message}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={styles.chatInputRow}>
                  <TextInput 
                    placeholder="Write message..." 
                    value={inputText} 
                    onChangeText={setInputText} 
                    style={styles.chatInput} 
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
                    <Text style={styles.chatSendBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Conversation list in inbox */
              <View>
                <Text style={styles.tabHeading}>Inbox Messages</Text>
                {conversations.length === 0 ? (
                  <Text style={styles.emptyText}>No inbox conversations yet.</Text>
                ) : (
                  conversations.map((conv) => {
                    const other = conv.participants?.find((p: any) => p._id !== (profile.user?._id || profile.user));
                    return (
                      <TouchableOpacity key={conv._id} style={styles.convCard} onPress={() => handleSelectConv(conv)}>
                        <Text style={styles.convName}>{other?.name || other?.email}</Text>
                        <Text style={styles.convMsg}>{conv.lastMessage?.message || 'Chat opened'}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  scrollContainer: {
    padding: Spacing.four,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  toggleBtnTextActive: {
    color: '#10B981',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  tabHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 10,
  },
  sectionContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  bannerBox: {
    height: 100,
    backgroundColor: '#065F46',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#065F46',
  },
  bannerActions: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  coverBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -30,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
  },
  introBox: {
    marginLeft: 12,
    flex: 1,
    paddingBottom: 4,
  },
  nameHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  careerTagBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginTop: 2,
  },
  bioCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: 10,
  },
  bioTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bioText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  linkUrl: {
    fontSize: 11,
    color: '#059669',
    marginRight: 10,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF',
  },
  secondaryBtnText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  editCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    marginBottom: 8,
    color: '#000',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 50,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  timelineCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6F4EA',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: 15,
  },
  timelineHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 10,
  },
  timelineRow: {
    borderLeftWidth: 2,
    borderLeftColor: '#10B981',
    paddingLeft: 12,
    marginLeft: 6,
    marginBottom: 12,
  },
  timelineSemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  timelineItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  timelineItemType: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  timelineItemTitle: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pickerBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  pickerBtnActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  pickerBtnText: {
    fontSize: 10,
    color: '#374151',
  },
  pickerBtnTextActive: {
    color: '#065F46',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  resCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resDate: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  achStatusCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  achTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  achStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  rejectionText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileMeta: {
    fontSize: 10,
    color: '#6B7280',
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  viewProfileBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  viewProfileBtnText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  overlayCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: Spacing.four,
    marginTop: 15,
  },
  overlayTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#065F46',
  },
  overlayMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  overlayBio: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  closeOverlayBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 10,
  },
  closeOverlayBtnText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  endorseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  endorseText: {
    fontSize: 12,
    color: '#1F2937',
  },
  endorseBtn: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  endorseBtnText: {
    fontSize: 9,
    color: '#065F46',
    fontWeight: 'bold',
  },
  convCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  convName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  convMsg: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  chatThreadBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backBtnText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  chatHeaderName: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  messagesList: {
    padding: 10,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleWrapperRight: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperLeft: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 8,
    borderRadius: 12,
  },
  chatBubbleRight: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 0,
  },
  chatBubbleLeft: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bubbleTextRight: {
    color: '#FFF',
    fontSize: 12,
  },
  bubbleTextLeft: {
    color: '#374151',
    fontSize: 12,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#000',
    marginRight: 6,
  },
  chatSendBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  chatSendBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  educationDisplayCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginVertical: 8,
  },
  educationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  eduItem: {
    marginVertical: 4,
  },
  eduType: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  eduName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  eduSub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 1,
  },
  eduBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
    marginTop: 6,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  }
});
