import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Linking,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';

interface CareerProps {
  token: string;
  backendUrl: string;
}

export default function CareerModule({ token, backendUrl }: CareerProps) {
  const [loading, setLoading] = useState(false);

  // Authenticated User Identity
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin' | 'management'>('student');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Active Navigation Tab
  // Student: 'profile' | 'resume' | 'achievements' | 'discovery'
  // Faculty/Admin: 'verifications' | 'lookup' | 'discovery'
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'achievements' | 'discovery' | 'verifications' | 'lookup'>('profile');

  // Student Profile details
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Profile Form fields
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2027");
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
  const [gradCurrentCgpa, setGradCurrentCgpa] = useState("8.0");
  const [gradCurrentSemester, setGradCurrentSemester] = useState<number>(1);

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [skills, setSkills] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [isAddAchModalOpen, setIsAddAchModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Resume builder states
  const [activeResumeTemplate, setActiveResumeTemplate] = useState<string>("minimal");
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [newResumeName, setNewResumeName] = useState("My Campus Resume");

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
  const [discoveredProfiles, setDiscoveredProfiles] = useState<any[]>([]);
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<any>(null);

  // Faculty / Verifications Queue states
  const [facultyDashboard, setFacultyDashboard] = useState<any>({
    pendingAchievements: [],
    verifiedAchievements: [],
    rejectedAchievements: [],
    students: []
  });
  const [verificationFilter, setVerificationFilter] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [studentLookupQuery, setStudentLookupQuery] = useState('');
  const [lookedUpStudent, setLookedUpStudent] = useState<any>(null);
  const [lookedUpStats, setLookedUpStats] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');

  // Socket & Realtime Chat
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  // 1. Populate Profile State Helper
  const populateProfileFields = useCallback((p: any) => {
    if (!p) return;
    setName(p.name || "");
    setRollNumber(p.rollNumber || "");
    setBranch(p.branch || "");
    setGraduationYear(p.graduationYear ? String(p.graduationYear) : "2027");
    setSemester(p.semester || 1);
    setContact(p.contact || "");
    setBio(p.bio || "");

    const edu = p.education || {};
    setTenthPercentageOrCgpa(edu.tenth?.percentageOrCgpa || "88%");
    setTenthBoard(edu.tenth?.board || "CBSE");
    setTenthSchoolName(edu.tenth?.schoolName || "Secondary School");
    setTenthYearOfPassing(edu.tenth?.yearOfPassing ? String(edu.tenth.yearOfPassing) : "2021");

    setTwelfthPercentageOrCgpa(edu.twelfth?.percentageOrCgpa || "85%");
    setTwelfthBoard(edu.twelfth?.board || "CBSE");
    setTwelfthSchoolName(edu.twelfth?.schoolName || "Senior Secondary School");
    setTwelfthYearOfPassing(edu.twelfth?.yearOfPassing ? String(edu.twelfth.yearOfPassing) : "2023");

    setGradCourseBranch(edu.graduation?.courseBranch || p.branch || "Computer Science");
    setGradUniversityName(edu.graduation?.universityName || "IPS Academy");
    setGradCurrentCgpa(
      edu.graduation?.currentCgpa !== undefined && edu.graduation?.currentCgpa > 0
        ? String(edu.graduation.currentCgpa)
        : (p.cgpa ? String(p.cgpa) : "8.0")
    );
    setGradCurrentSemester(edu.graduation?.currentSemester || p.semester || 1);

    setGithub(p.github || "");
    setLinkedin(p.linkedin || "");
    setPortfolio(p.portfolio || "");
    setSkills(Array.isArray(p.skills) ? p.skills.join(", ") : "");
    setPhotoUrl(p.photoUrl || "");
    setBannerImage(p.bannerImage || "");
  }, []);

  // 2. Fetch Profile for Active Token
  const fetchStudentProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Direct call to /api/students/profile for currently logged-in student
      const res = await fetch(`${backendUrl}/api/students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setHasProfile(true);
        setNeedsOnboarding(false);
        populateProfileFields(data.profile);
      } else {
        // Fallback to /api/auth/me
        const authRes = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const authData = await authRes.json();
        if (authData.success && authData.profile) {
          setProfile(authData.profile);
          setHasProfile(true);
          setNeedsOnboarding(false);
          populateProfileFields(authData.profile);
        } else {
          setNeedsOnboarding(true);
        }
      }
    } catch (err: any) {
      console.warn("Profile fetch warning:", err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, populateProfileFields]);

  // 3. Fetch Faculty Dashboard
  const fetchFacultyDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/faculty/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFacultyDashboard({
          pendingAchievements: data.pendingAchievements || [],
          verifiedAchievements: data.verifiedAchievements || [],
          rejectedAchievements: data.rejectedAchievements || [],
          students: data.students || []
        });
      }
    } catch (err: any) {
      console.warn("Faculty dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  // 4. Initial Sync with Auth Context
  useEffect(() => {
    if (!token) return;
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const role = data.user.role || 'student';
          setUserRole(role);
          if (data.user.email) setUserEmail(data.user.email);
          if (data.user._id || data.user.id) setUserId(data.user._id || data.user.id);

          if (role === 'student') {
            setActiveTab('profile');
            if (data.profile) {
              setProfile(data.profile);
              setHasProfile(true);
              setNeedsOnboarding(false);
              populateProfileFields(data.profile);
            } else {
              fetchStudentProfile();
            }
          } else {
            setActiveTab('verifications');
            fetchFacultyDashboard();
          }
        }
      })
      .catch((err) => console.warn("Auth sync error:", err.message));
  }, [token, backendUrl, fetchStudentProfile, fetchFacultyDashboard, populateProfileFields]);

  // 5. Fetch Achievements & Resumes
  const fetchAchievements = useCallback(async () => {
    if (!token || !profile?._id) return;
    try {
      const res = await fetch(`${backendUrl}/api/achievements/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.achievements)) {
        setMyAchievements(data.achievements);
      }
    } catch (_) {}
  }, [backendUrl, token, profile?._id]);

  const fetchResumes = useCallback(async () => {
    if (!token || !profile?._id) return;
    try {
      const res = await fetch(`${backendUrl}/api/resume/${profile._id}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.resumes)) {
        setSavedResumes(data.resumes);
      }
    } catch (_) {}
  }, [backendUrl, token, profile?._id]);

  useEffect(() => {
    if (profile?._id) {
      fetchAchievements();
      fetchResumes();
    }
  }, [profile?._id, fetchAchievements, fetchResumes]);

  // 6. Discovery Search
  const handleSearchDirectory = useCallback(async (query: string, br = "") => {
    if (!token) return;
    try {
      const res = await fetch(
        `${backendUrl}/api/discover/search?skill=${encodeURIComponent(query)}&branch=${encodeURIComponent(br)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        setDiscoveredProfiles(data.profiles);
      }
    } catch (_) {}
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) {
      handleSearchDirectory("", "");
    }
  }, [token, handleSearchDirectory]);

  // 7. Socket Chat Initialization
  useEffect(() => {
    if (!token || !userId) return;
    const socket = io(backendUrl, { query: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:user", userId);
    });

    socket.on("message:new", (msg: any) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userId, backendUrl, activeConv]);

  // 8. Update Profile (Full Name, CGPA, Class of 2027, Education, Bio, Skills)
  const handleUpdateProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const skillArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const cgpaNum = parseFloat(gradCurrentCgpa) || (profile?.cgpa || 8.0);
      const gradYearNum = parseInt(graduationYear) || 2027;

      const payload = {
        name: name.trim() || profile?.name || "Student",
        rollNumber: rollNumber.trim() || profile?.rollNumber,
        branch: branch.trim() || profile?.branch,
        graduationYear: gradYearNum,
        semester,
        contact: contact.trim(),
        bio: bio.trim(),
        skills: skillArray,
        cgpa: cgpaNum,
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
            courseBranch: gradCourseBranch || branch,
            universityName: gradUniversityName || "IPS Academy",
            currentCgpa: cgpaNum,
            currentSemester: gradCurrentSemester || semester
          }
        },
        github: github.trim(),
        linkedin: linkedin.trim(),
        portfolio: portfolio.trim()
      };

      // 1. Update /api/students/profile (PUT)
      const res = await fetch(`${backendUrl}/api/students/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // 2. Also sync to campus profile
      const userRef = userEmail || profile?.user?.email || profile?.user?._id || "me";
      await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userRef)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }).catch(() => {});

      if (data.success) {
        setProfile(data.profile);
        populateProfileFields(data.profile);
        setIsEditModalOpen(false);
        setIsEduModalOpen(false);
        Alert.alert("Success", "Profile details updated successfully! 🎉");
      } else {
        Alert.alert("Notice", data.message || "Could not update profile.");
      }
    } catch (err: any) {
      Alert.alert("Error", "Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  // 9. Onboarding Submit
  const handleOnboardSubmit = async () => {
    if (!name.trim() || !rollNumber.trim() || !branch.trim()) {
      Alert.alert("Required", "Please provide Name, Roll Number, and Branch.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        branch: branch.trim(),
        graduationYear: parseInt(graduationYear) || 2027,
        semester,
        cgpa: parseFloat(gradCurrentCgpa) || 8.0,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${backendUrl}/api/students/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setNeedsOnboarding(false);
        setHasProfile(true);
        fetchStudentProfile();
        Alert.alert("Welcome!", "Portfolio created successfully.");
      } else {
        Alert.alert("Notice", data.message || "Could not complete setup.");
      }
    } catch (_) {
      Alert.alert("Error", "Connection error during setup.");
    } finally {
      setLoading(false);
    }
  };

  // 10. Photo / Banner Image Upload
  const pickAndUploadImage = async (type: 'avatar' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is needed to update profile imagery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
        const userRef = userEmail || profile?.user?.email || "me";
        const response = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userRef)}`, {
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
          Alert.alert('Updated', `${type === 'avatar' ? 'Profile picture' : 'Cover banner'} updated!`);
        }
      } catch (_) {
        Alert.alert('Error', 'Image upload failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 11. Submit Achievement
  const handleAddAchievement = async () => {
    if (!achTitle.trim() || !achDescription.trim()) {
      Alert.alert("Required", "Please provide Title and Description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/achievements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: achTitle.trim(),
          category: achCategory,
          level: achLevel,
          description: achDescription.trim(),
          proofUrl: achProofUrl.trim(),
          semester: achSemester
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "Achievement submitted for faculty verification! 🏆");
        setAchTitle("");
        setAchDescription("");
        setAchProofUrl("");
        setIsAddAchModalOpen(false);
        fetchAchievements();
      } else {
        Alert.alert("Notice", data.message || "Could not submit achievement.");
      }
    } catch (_) {
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  // 12. Export & Save Resume
  const handleDownloadResume = async () => {
    if (!profile?._id) return;
    const url = `${backendUrl}/api/resume/${profile._id}/generate?template=${activeResumeTemplate}&token=${token}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Notice", "Could not open resume download link.");
    }
  };

  const handleSaveResumeVersion = async () => {
    if (!profile?._id) return;
    try {
      const res = await fetch(`${backendUrl}/api/resume/${profile._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: activeResumeTemplate,
          name: newResumeName.trim() || "Snapshot Resume",
          generatedContent: {
            name, branch, graduationYear, contact, bio, skills: skills.split(",").map(s => s.trim())
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Saved", "Resume snapshot stored successfully!");
        fetchResumes();
      }
    } catch (_) {
      Alert.alert("Error", "Failed to save resume snapshot.");
    }
  };

  // 13. Faculty Verification Actions
  const handleVerifyAchievement = async (id: string, status: 'verified' | 'rejected') => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/achievements/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? 'Declined by Faculty / HOD' : ''
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Updated", `Achievement marked as ${status.toUpperCase()}!`);
        fetchFacultyDashboard();
      }
    } catch (_) {
      Alert.alert("Error", "Failed to process achievement verification.");
    } finally {
      setLoading(false);
    }
  };

  // 14. Faculty Student Lookup
  const handleLookupStudent = async () => {
    if (!studentLookupQuery.trim()) return;
    setLookupLoading(true);
    setLookedUpStudent(null);
    setLookedUpStats(null);
    try {
      const trimmed = studentLookupQuery.trim();
      const res = await fetch(`${backendUrl}/api/students/profile/${encodeURIComponent(trimmed)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setLookedUpStudent(data.profile);
        setLookedUpStats(data.stats || {});
      } else {
        Alert.alert("Not Found", "No student profile found for this Roll Number or Email.");
      }
    } catch (_) {
      Alert.alert("Error", "Failed to lookup student record.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendRecommendation = async (studentId: string) => {
    if (!recommendationText.trim()) {
      Alert.alert("Required", "Please write recommendation remarks.");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/faculty/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, text: recommendationText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "Faculty recommendation letter attached to student profile!");
        setRecommendationText("");
      }
    } catch (_) {
      Alert.alert("Error", "Failed to attach recommendation.");
    }
  };

  // 15. Social Actions
  const handleEndorseSkill = async (targetUserId: string, skillName: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/endorse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId: targetUserId, skill: skillName })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Endorsed", `Endorsed ${skillName}! ⭐`);
        if (selectedPublicProfile) {
          fetchPublicProfile(selectedPublicProfile.profile._id);
        }
      } else {
        Alert.alert("Notice", data.message || "Already endorsed.");
      }
    } catch (_) {}
  };

  const handleToggleFollow = async (targetId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/follow/${targetId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", data.followed ? "Following student!" : "Unfollowed student.");
        if (selectedPublicProfile) fetchPublicProfile(targetId);
      }
    } catch (_) {}
  };

  const fetchPublicProfile = async (targetId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/profile/${targetId}/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSelectedPublicProfile(data);
    } catch (_) {}
  };

  const startChatWithStudent = async (targetUser: any) => {
    const targetUserId = targetUser?._id || targetUser;
    setOtherUser(targetUser);
    setIsChatModalOpen(true);
    try {
      const res = await fetch(`${backendUrl}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: targetUserId })
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setActiveConv(data.conversation);
        const mRes = await fetch(`${backendUrl}/api/chat/conversations/${data.conversation._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mData = await mRes.json();
        if (mData.success) setMessages(mData.messages || []);
      }
    } catch (_) {}
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConv) return;
    const txt = inputText.trim();
    setInputText("");
    try {
      const res = await fetch(`${backendUrl}/api/chat/conversations/${activeConv._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: txt })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (_) {}
  };

  // Compile growth timeline
  const timelineData = useMemo(() => {
    const sems: { [key: number]: any[] } = {};
    for (let s = 1; s <= 8; s++) sems[s] = [];
    if (profile) {
      (profile.projects || []).forEach((p: any) => {
        if (p.semester && sems[p.semester]) sems[p.semester].push({ type: 'Project', title: p.title });
      });
      (profile.certifications || []).forEach((c: any) => {
        if (c.semester && sems[c.semester]) sems[c.semester].push({ type: 'Certificate', title: c.name });
      });
      (profile.experience || []).forEach((e: any) => {
        if (e.semester && sems[e.semester]) sems[e.semester].push({ type: 'Experience', title: e.title });
      });
    }
    myAchievements.forEach((a: any) => {
      if (a.status === 'verified' && a.semester && sems[a.semester]) {
        sems[a.semester].push({ type: 'Achievement', title: a.title });
      }
    });
    return sems;
  }, [profile, myAchievements]);

  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin' || userRole === 'management';

  // ---------------- Render Onboarding ----------------
  if (needsOnboarding || (!hasProfile && userRole === 'student')) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>🎓 Setup Career Portfolio</Text>
          <Text style={styles.cardSubtitle}>Complete student portfolio profile to access resumes & verified achievements.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput style={styles.textInput} placeholder="Your Full Name" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enrollment / Roll Number *</Text>
            <TextInput style={styles.textInput} placeholder="e.g. CS202601" value={rollNumber} onChangeText={setRollNumber} autoCapitalize="characters" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Branch *</Text>
            <TextInput style={styles.textInput} placeholder="Computer Science & Engineering" value={branch} onChangeText={setBranch} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class of (Graduation Year) *</Text>
            <TextInput style={styles.textInput} placeholder="2027" value={graduationYear} onChangeText={setGraduationYear} keyboardType="numeric" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cumulative CGPA</Text>
            <TextInput style={styles.textInput} placeholder="8.0" value={gradCurrentCgpa} onChangeText={setGradCurrentCgpa} keyboardType="decimal-pad" />
          </View>

          <TouchableOpacity style={styles.primaryActionBtn} onPress={handleOnboardSubmit}>
            <Text style={styles.primaryActionBtnText}>Create Portfolio Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Module Title Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>🎓 Career & Portfolio Studio</Text>
          <Text style={styles.moduleSubtitle}>
            {isFacultyOrAdmin ? 'Faculty Credential & Achievement Desk' : 'Verified Academic Growth, Resumes & Peer Network'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshIconBtn} 
          onPress={() => isFacultyOrAdmin ? fetchFacultyDashboard() : fetchStudentProfile()}
        >
          <Text style={{ fontSize: 13 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Role-Aware Navigation Tabs */}
      <View style={styles.tabBar}>
        {isFacultyOrAdmin ? (
          <>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'verifications' && styles.tabActive]} 
              onPress={() => setActiveTab('verifications')}
            >
              <Text style={[styles.tabText, activeTab === 'verifications' && styles.tabTextActive]}>
                📋 Verifications ({facultyDashboard.pendingAchievements?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'lookup' && styles.tabActive]} 
              onPress={() => setActiveTab('lookup')}
            >
              <Text style={[styles.tabText, activeTab === 'lookup' && styles.tabTextActive]}>
                🔍 Lookup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'discovery' && styles.tabActive]} 
              onPress={() => setActiveTab('discovery')}
            >
              <Text style={[styles.tabText, activeTab === 'discovery' && styles.tabTextActive]}>
                🌐 Directory
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'profile' && styles.tabActive]} 
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                💼 Portfolio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'resume' && styles.tabActive]} 
              onPress={() => setActiveTab('resume')}
            >
              <Text style={[styles.tabText, activeTab === 'resume' && styles.tabTextActive]}>
                📄 Resume
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'achievements' && styles.tabActive]} 
              onPress={() => setActiveTab('achievements')}
            >
              <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
                🏆 Awards ({myAchievements.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'discovery' && styles.tabActive]} 
              onPress={() => setActiveTab('discovery')}
            >
              <Text style={[styles.tabText, activeTab === 'discovery' && styles.tabTextActive]}>
                🔍 Discovery
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading && (
        <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 8 }} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= TAB 1: STUDENT PORTFOLIO ================= */}
        {activeTab === 'profile' && !isFacultyOrAdmin && profile && (
          <View style={styles.portfolioWrap}>
            {/* Cover & Avatar Hero Card */}
            <View style={styles.coverCard}>
              {bannerImage ? (
                <Image source={{ uri: bannerImage }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}
              <TouchableOpacity style={styles.coverUploadBtn} onPress={() => pickAndUploadImage('banner')}>
                <Text style={styles.coverUploadBtnText}>📷 Cover</Text>
              </TouchableOpacity>

              <View style={styles.avatarOverWrap}>
                <TouchableOpacity onPress={() => pickAndUploadImage('avatar')}>
                  <View style={styles.avatarCircle}>
                    {photoUrl ? (
                      <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarInitial}>{name ? name[0].toUpperCase() : 'S'}</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.studentHeaderInfo}>
                  <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.studentSub}>{rollNumber} • {branch}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.cgpaPill}>
                      <Text style={styles.cgpaPillText}>⭐ {parseFloat(gradCurrentCgpa || profile?.cgpa || 8.0).toFixed(2)} CGPA</Text>
                    </View>
                    <View style={styles.gradYearPill}>
                      <Text style={styles.gradYearPillText}>🎓 Class of {graduationYear || '2027'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditModalOpen(true)}>
                <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEduModalOpen(true)}>
                <Text style={styles.editBtnText}>🎓 Edit Education</Text>
              </TouchableOpacity>
            </View>

            {/* Bio Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>About Me</Text>
              <Text style={styles.bioText}>
                {bio || 'No professional bio provided yet. Tap "Edit Profile" above to add your summary.'}
              </Text>
              {contact ? <Text style={styles.contactText}>📞 {contact}</Text> : null}

              {/* Social Links */}
              <View style={styles.linksWrap}>
                {github ? (
                  <TouchableOpacity style={styles.socialLinkBadge} onPress={() => Linking.openURL(`https://github.com/${github.replace('@', '')}`)}>
                    <Text style={styles.socialLinkTxt}>🐙 GitHub: {github}</Text>
                  </TouchableOpacity>
                ) : null}
                {linkedin ? (
                  <TouchableOpacity style={styles.socialLinkBadge} onPress={() => Linking.openURL(`https://linkedin.com/in/${linkedin}`)}>
                    <Text style={styles.socialLinkTxt}>💼 LinkedIn</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Skills Chips */}
              <Text style={[styles.cardSectionTitle, { marginTop: 12 }]}>Skills & Competencies</Text>
              <View style={styles.chipsWrap}>
                {skills ? (
                  skills.split(",").map((s, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{s.trim()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.mutedText}>No skills listed.</Text>
                )}
              </View>
            </View>

            {/* Education Summary Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Academic Qualifications 🎓</Text>
              <View style={styles.eduItemBox}>
                <Text style={styles.eduTypeLabel}>Graduation (B.Tech / Degree)</Text>
                <Text style={styles.eduInstitute}>{gradUniversityName || 'IPS Academy'}</Text>
                <Text style={styles.eduMeta}>{gradCourseBranch || branch} • Sem {semester} • CGPA: {gradCurrentCgpa || '8.0'}</Text>
              </View>

              <View style={[styles.eduItemBox, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }]}>
                <Text style={styles.eduTypeLabel}>Class 12th / Senior Secondary</Text>
                <Text style={styles.eduInstitute}>{twelfthSchoolName || 'Senior Secondary School'}</Text>
                <Text style={styles.eduMeta}>{twelfthBoard || 'CBSE'} • Year {twelfthYearOfPassing || '2023'} • {twelfthPercentageOrCgpa || '85%'}</Text>
              </View>

              <View style={[styles.eduItemBox, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }]}>
                <Text style={styles.eduTypeLabel}>Class 10th / Secondary</Text>
                <Text style={styles.eduInstitute}>{tenthSchoolName || 'Secondary School'}</Text>
                <Text style={styles.eduMeta}>{tenthBoard || 'CBSE'} • Year {tenthYearOfPassing || '2021'} • {tenthPercentageOrCgpa || '88%'}</Text>
              </View>
            </View>

            {/* Growth Timeline */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Growth Milestones by Semester 📈</Text>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const items = timelineData[sem] || [];
                if (items.length === 0) return null;
                return (
                  <View key={sem} style={styles.timelineRow}>
                    <Text style={styles.semLabel}>Semester {sem}</Text>
                    {items.map((it, idx) => (
                      <View key={idx} style={styles.timelineChip}>
                        <Text style={styles.timelineChipType}>{it.type.toUpperCase()}</Text>
                        <Text style={styles.timelineChipTitle}>{it.title}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ================= TAB 2: RESUME BUILDER ================= */}
        {activeTab === 'resume' && !isFacultyOrAdmin && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>📄 Mobile Resume Studio</Text>
            <Text style={styles.cardSubtitle}>Select a curated template and generate an official PDF resume.</Text>

            {/* Template Selector Chips */}
            <Text style={styles.inputLabel}>Choose Template</Text>
            <View style={styles.templateRow}>
              {[
                { id: 'minimal', label: 'Minimalist' },
                { id: 'technical', label: 'Technical' },
                { id: 'data-analyst', label: 'Executive' }
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.templateChip, activeResumeTemplate === t.id && styles.templateChipActive]}
                  onPress={() => setActiveResumeTemplate(t.id)}
                >
                  <Text style={[styles.templateChipText, activeResumeTemplate === t.id && styles.templateChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Resume Preview Box */}
            <View style={styles.resumePreviewBox}>
              <Text style={styles.previewName}>{name || 'Student Name'}</Text>
              <Text style={styles.previewMeta}>{branch} • Class of {graduationYear} • CGPA: {gradCurrentCgpa}</Text>
              <Text style={styles.previewBio} numberOfLines={2}>{bio || 'Active undergraduate candidate.'}</Text>
              <Text style={styles.previewSkills}>Skills: {skills || 'React Native, Node.js, Python'}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.resumeActionsRow}>
              <TouchableOpacity style={styles.downloadPdfBtn} onPress={handleDownloadResume}>
                <Text style={styles.downloadPdfBtnText}>📥 Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveSnapshotBtn} onPress={handleSaveResumeVersion}>
                <Text style={styles.saveSnapshotBtnText}>💾 Save Snapshot</Text>
              </TouchableOpacity>
            </View>

            {/* Saved Versions */}
            {savedResumes.length > 0 && (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.cardSectionTitle}>Saved Resume Versions ({savedResumes.length})</Text>
                {savedResumes.map((res) => (
                  <View key={res._id} style={styles.savedResumeItem}>
                    <Text style={styles.savedResumeName}>{res.name}</Text>
                    <Text style={styles.savedResumeDate}>{new Date(res.createdAt).toLocaleDateString()} • {res.templateId.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 3: ACHIEVEMENTS ================= */}
        {activeTab === 'achievements' && !isFacultyOrAdmin && (
          <View style={styles.card}>
            <View style={styles.headerBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.cardSectionTitle}>🏆 Student Achievements</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1} ellipsizeMode="tail">
                  Log verified accomplishments & hackathons.
                </Text>
              </View>
              <TouchableOpacity style={styles.addAchBtn} onPress={() => setIsAddAchModalOpen(true)}>
                <Text style={styles.addAchBtnText}>+ Log New</Text>
              </TouchableOpacity>
            </View>

            {/* Status Counters */}
            <View style={styles.statsCountRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countNum}>{myAchievements.filter(a => a.status === 'verified').length}</Text>
                <Text style={styles.countLabel}>Verified</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countNum}>{myAchievements.filter(a => a.status === 'pending').length}</Text>
                <Text style={styles.countLabel}>Pending</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countNum}>{myAchievements.length}</Text>
                <Text style={styles.countLabel}>Total</Text>
              </View>
            </View>

            {/* List */}
            {myAchievements.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Achievements Logged</Text>
                <Text style={styles.emptySub}>Tap "+ Log New" above to submit hackathons, papers, or sports awards.</Text>
              </View>
            ) : (
              myAchievements.map((ach) => {
                const isVerified = ach.status === 'verified';
                const isRejected = ach.status === 'rejected';
                return (
                  <View key={ach._id} style={styles.achCard}>
                    <View style={styles.achHeaderRow}>
                      <Text style={styles.achCardTitle} numberOfLines={1}>{ach.title}</Text>
                      <View style={[
                        styles.achStatusChip,
                        isVerified ? styles.statusVerified : isRejected ? styles.statusRejected : styles.statusPending
                      ]}>
                        <Text style={[
                          styles.achStatusChipText,
                          isVerified ? styles.txtVerified : isRejected ? styles.txtRejected : styles.txtPending
                        ]}>
                          {isVerified ? '✓ Verified' : isRejected ? '✕ Declined' : '⏳ Pending Review'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.achMeta}>
                      {ach.category?.toUpperCase()} • {ach.level?.toUpperCase()} Level • Sem {ach.semester || 1}
                    </Text>
                    {ach.description ? <Text style={styles.achDesc}>{ach.description}</Text> : null}
                    {ach.proofUrl ? (
                      <TouchableOpacity onPress={() => Linking.openURL(ach.proofUrl)}>
                        <Text style={styles.proofLink}>🔗 View Proof Document</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ================= TAB 4: DISCOVERY DIRECTORY ================= */}
        {activeTab === 'discovery' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>🔍 Student Discovery Directory</Text>
            <Text style={styles.cardSubtitle}>Search peer profiles, endorse technical skills, or collaborate.</Text>

            <TextInput
              style={styles.searchBar}
              placeholder="Search by skill (e.g. React, Python)..."
              value={searchVal}
              onChangeText={(t) => {
                setSearchVal(t);
                handleSearchDirectory(t, filterBranch);
              }}
            />

            {/* Filter Pills */}
            <View style={styles.branchPillsRow}>
              {['', 'Computer Science', 'Information Technology', 'Electronics'].map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.filterPill, filterBranch === b && styles.filterPillActive]}
                  onPress={() => {
                    setFilterBranch(b);
                    handleSearchDirectory(searchVal, b);
                  }}
                >
                  <Text style={[styles.filterPillText, filterBranch === b && styles.filterPillTextActive]}>
                    {b === '' ? 'All Branches' : b.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {discoveredProfiles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Matching Students Found</Text>
              </View>
            ) : (
              discoveredProfiles.map((p) => {
                if (p._id === profile?._id) return null;
                return (
                  <View key={p._id} style={styles.studentCard}>
                    <View style={styles.studentCardHeader}>
                      <View style={styles.miniAvatar}>
                        <Text style={styles.miniAvatarText}>{p.name ? p.name[0].toUpperCase() : 'S'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentCardName}>{p.name}</Text>
                        <Text style={styles.studentCardMeta}>{p.branch} • Class of {p.graduationYear || '2027'}</Text>
                      </View>
                    </View>

                    {/* Skill chips */}
                    <View style={styles.miniChipsWrap}>
                      {(p.skills || []).slice(0, 4).map((sk: string, i: number) => (
                        <View key={i} style={styles.miniSkillChip}>
                          <Text style={styles.miniSkillChipText}>{sk}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.studentCardActionRow}>
                      <TouchableOpacity style={styles.viewCardBtn} onPress={() => fetchPublicProfile(p._id)}>
                        <Text style={styles.viewCardBtnText}>👁️ View Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.messageBtn} 
                        onPress={() => startChatWithStudent(p.user || p)}
                      >
                        <Text style={styles.messageBtnText}>💬 Message</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ================= TAB 5: FACULTY VERIFICATIONS QUEUE ================= */}
        {activeTab === 'verifications' && isFacultyOrAdmin && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>📋 Achievement Verification Queue</Text>
            <Text style={styles.cardSubtitle}>Review student achievements and endorse for official transcripts.</Text>

            {/* Filter Toggle */}
            <View style={styles.verifToggleRow}>
              {(['pending', 'verified', 'rejected'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.verifTabBtn, verificationFilter === mode && styles.verifTabBtnActive]}
                  onPress={() => setVerificationFilter(mode)}
                >
                  <Text style={[styles.verifTabBtnText, verificationFilter === mode && styles.verifTabBtnTextActive]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} ({facultyDashboard[`${mode}Achievements`]?.length || 0})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* List */}
            {(() => {
              const list = facultyDashboard[`${verificationFilter}Achievements`] || [];
              if (list.length === 0) {
                return (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No {verificationFilter} items</Text>
                    <Text style={styles.emptySub}>All student submissions in this category are up to date.</Text>
                  </View>
                );
              }
              return list.map((item: any) => (
                <View key={item._id} style={styles.verifItemCard}>
                  <View style={styles.verifHeaderRow}>
                    <Text style={styles.verifTitle}>{item.title}</Text>
                    <Text style={styles.verifCategory}>{item.category} • {item.level}</Text>
                  </View>
                  <Text style={styles.verifDesc}>{item.description}</Text>
                  {item.proofUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(item.proofUrl)}>
                      <Text style={styles.proofLink}>🔗 Proof Document</Text>
                    </TouchableOpacity>
                  ) : null}

                  {verificationFilter === 'pending' && (
                    <View style={styles.verifActionRow}>
                      <TouchableOpacity 
                        style={styles.verifyBtn} 
                        onPress={() => handleVerifyAchievement(item._id, 'verified')}
                      >
                        <Text style={styles.verifyBtnText}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.rejectBtn} 
                        onPress={() => handleVerifyAchievement(item._id, 'rejected')}
                      >
                        <Text style={styles.rejectBtnText}>✕ Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ));
            })()}
          </View>
        )}

        {/* ================= TAB 6: FACULTY STUDENT LOOKUP ================= */}
        {activeTab === 'lookup' && isFacultyOrAdmin && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>🔍 Student Credential Verification</Text>
            <Text style={styles.cardSubtitle}>Look up official student academic record and issue recommendations.</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Roll No (e.g. CS202601) or Email..."
                value={studentLookupQuery}
                onChangeText={setStudentLookupQuery}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.lookupBtn} onPress={handleLookupStudent}>
                <Text style={styles.lookupBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            {lookupLoading && <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 10 }} />}

            {lookedUpStudent && (
              <View style={styles.lookedUpReportBox}>
                <Text style={styles.reportTitle}>{lookedUpStudent.name}</Text>
                <Text style={styles.reportMeta}>Roll No: {lookedUpStudent.rollNumber} • {lookedUpStudent.branch}</Text>
                <Text style={styles.reportMeta}>CGPA: {lookedUpStudent.cgpa || '8.0'} • Class of {lookedUpStudent.graduationYear || '2027'}</Text>
                <Text style={styles.reportMeta}>Verified Achievements: {lookedUpStats?.verifiedAchievementsCount || 0} / {lookedUpStats?.totalAchievementsCount || 0}</Text>

                {/* Faculty Recommendation */}
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Add Official Faculty Recommendation</Text>
                <TextInput
                  style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Write a formal letter or recommendation remarks..."
                  value={recommendationText}
                  onChangeText={setRecommendationText}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.submitRecBtn} 
                  onPress={() => handleSendRecommendation(lookedUpStudent._id)}
                >
                  <Text style={styles.submitRecBtnText}>Submit Recommendation</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: EDIT PROFILE (Full Name, Contact, Socials, Bio, Skills) ================= */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit Profile Summary</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput style={styles.textInput} placeholder="Your Full Name" value={name} onChangeText={setName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class of (Graduation Year)</Text>
                <TextInput style={styles.textInput} placeholder="2027" value={graduationYear} onChangeText={setGraduationYear} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <TextInput style={styles.textInput} placeholder="+91..." value={contact} onChangeText={setContact} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GitHub Profile Handle</Text>
                <TextInput style={styles.textInput} placeholder="github-username" value={github} onChangeText={setGithub} autoCapitalize="none" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LinkedIn Profile ID</Text>
                <TextInput style={styles.textInput} placeholder="linkedin-username" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills (comma separated)</Text>
                <TextInput style={styles.textInput} placeholder="React Native, Node.js, Python, Figma" value={skills} onChangeText={setSkills} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About / Bio</Text>
                <TextInput style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]} placeholder="Write a summary about your skills..." value={bio} onChangeText={setBio} multiline />
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEditModalOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleUpdateProfile}>
                <Text style={styles.modalSaveTxt}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: EDIT EDUCATION ================= */}
      <Modal visible={isEduModalOpen} animationType="slide" transparent onRequestClose={() => setIsEduModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Edit Academic Education</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.formSectionSub}>Graduation</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>University / College Name</Text>
                <TextInput style={styles.textInput} value={gradUniversityName} onChangeText={setGradUniversityName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course & Branch</Text>
                <TextInput style={styles.textInput} value={gradCourseBranch} onChangeText={setGradCourseBranch} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cumulative CGPA (Latest)</Text>
                <TextInput style={styles.textInput} value={gradCurrentCgpa} onChangeText={setGradCurrentCgpa} keyboardType="decimal-pad" />
              </View>

              <Text style={[styles.formSectionSub, { marginTop: 10 }]}>12th Standard / Diploma</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>School Name & Board</Text>
                <TextInput style={styles.textInput} value={twelfthSchoolName} onChangeText={setTwelfthSchoolName} placeholder="School name" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Percentage / CGPA</Text>
                <TextInput style={styles.textInput} value={twelfthPercentageOrCgpa} onChangeText={setTwelfthPercentageOrCgpa} placeholder="e.g. 85%" />
              </View>

              <Text style={[styles.formSectionSub, { marginTop: 10 }]}>10th Standard</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>School Name</Text>
                <TextInput style={styles.textInput} value={tenthSchoolName} onChangeText={setTenthSchoolName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Percentage / CGPA</Text>
                <TextInput style={styles.textInput} value={tenthPercentageOrCgpa} onChangeText={setTenthPercentageOrCgpa} />
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEduModalOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleUpdateProfile}>
                <Text style={styles.modalSaveTxt}>Save Education</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD ACHIEVEMENT ================= */}
      <Modal visible={isAddAchModalOpen} animationType="slide" transparent onRequestClose={() => setIsAddAchModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Log Achievement 🏆</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Achievement Title *</Text>
                <TextInput style={styles.textInput} placeholder="e.g. 1st Place Smart India Hackathon" value={achTitle} onChangeText={setAchTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput style={styles.textInput} placeholder="technical, sports, cultural, research" value={achCategory} onChangeText={setAchCategory} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Level</Text>
                <TextInput style={styles.textInput} placeholder="college, state, national, international" value={achLevel} onChangeText={setAchLevel} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Semester (1-8)</Text>
                <TextInput style={styles.textInput} value={String(achSemester)} onChangeText={(v) => setAchSemester(parseInt(v) || 1)} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Proof / Certificate URL</Text>
                <TextInput style={styles.textInput} placeholder="https://..." value={achProofUrl} onChangeText={setAchProofUrl} autoCapitalize="none" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description Details *</Text>
                <TextInput style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]} placeholder="Summary of the win, project built, or certificate awarded..." value={achDescription} onChangeText={setAchDescription} multiline />
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsAddAchModalOpen(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddAchievement}>
                <Text style={styles.modalSaveTxt}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: PUBLIC PROFILE PREVIEW ================= */}
      {selectedPublicProfile && (
        <Modal visible={!!selectedPublicProfile} animationType="slide" transparent onRequestClose={() => setSelectedPublicProfile(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{selectedPublicProfile.profile.name}</Text>
              <Text style={styles.modalSub}>{selectedPublicProfile.profile.branch} • Class of {selectedPublicProfile.profile.graduationYear}</Text>
              <Text style={styles.modalDesc}>{selectedPublicProfile.profile.bio || 'Campus peer.'}</Text>

              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
                <TouchableOpacity 
                  style={[styles.primaryActionBtn, { flex: 1, paddingVertical: 8 }]} 
                  onPress={() => handleToggleFollow(selectedPublicProfile.profile._id)}
                >
                  <Text style={styles.primaryActionBtnText}>
                    {selectedPublicProfile.isFollowing ? '✓ Following' : '➕ Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.messageBtn, { flex: 1, paddingVertical: 8 }]} 
                  onPress={() => {
                    const usr = selectedPublicProfile.profile.user || selectedPublicProfile.profile;
                    setSelectedPublicProfile(null);
                    startChatWithStudent(usr);
                  }}
                >
                  <Text style={styles.messageBtnText}>💬 Chat</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 6 }]}>Skills & Endorsements</Text>
              <ScrollView style={{ maxHeight: 160 }}>
                {(selectedPublicProfile.profile.skills || []).map((sk: string, idx: number) => {
                  const count = selectedPublicProfile.endorsements?.filter((e: any) => e.skill === sk).length || 0;
                  return (
                    <View key={idx} style={styles.endorseItemRow}>
                      <Text style={styles.endorseItemName}>{sk}</Text>
                      <TouchableOpacity 
                        style={styles.endorseActionBtn} 
                        onPress={() => handleEndorseSkill(selectedPublicProfile.profile.user?._id || selectedPublicProfile.profile.user, sk)}
                      >
                        <Text style={styles.endorseActionBtnTxt}>⭐ Endorse ({count})</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity style={[styles.modalCancelBtn, { marginTop: 12, alignItems: 'center' }]} onPress={() => setSelectedPublicProfile(null)}>
                <Text style={styles.modalCancelTxt}>Close Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= MODAL: DIRECT CHAT ================= */}
      <Modal visible={isChatModalOpen} animationType="slide" onRequestClose={() => setIsChatModalOpen(false)}>
        <View style={styles.chatModalContainer}>
          <View style={styles.chatModalHeader}>
            <TouchableOpacity onPress={() => setIsChatModalOpen(false)}>
              <Text style={styles.chatCloseTxt}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.chatHeaderTitle} numberOfLines={1}>
              💬 {otherUser?.name || otherUser?.email || 'Student Chat'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.chatMessagesArea}>
            {messages.length === 0 ? (
              <Text style={styles.chatEmptyTxt}>Start the conversation...</Text>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === userId;
                return (
                  <View key={m._id} style={[styles.chatBubbleWrap, isMine ? styles.chatRight : styles.chatLeft]}>
                    <View style={[styles.chatBubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                      <Text style={[styles.bubbleTxt, isMine ? styles.bubbleTxtMine : styles.bubbleTxtOther]}>{m.message}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.chatInputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type message..."
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
              <Text style={styles.chatSendBtnTxt}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4FBF7',
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  moduleSubtitle: {
    fontSize: 11,
    color: '#059669',
    marginTop: 1,
  },
  refreshIconBtn: {
    padding: 6,
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginVertical: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#064E3B',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  scrollContainer: {
    padding: 14,
  },
  portfolioWrap: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 6,
  },
  coverCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 90,
  },
  coverPlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#A7F3D0',
  },
  coverUploadBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverUploadBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarOverWrap: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 12,
    marginTop: -20,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#064E3B',
    borderWidth: 3,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  studentHeaderInfo: {
    flex: 1,
    paddingTop: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  studentSub: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  cgpaPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cgpaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  gradYearPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradYearPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  bioText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
  },
  contactText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  linksWrap: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  socialLinkBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  socialLinkTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: '#E6F4EA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  mutedText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  eduItemBox: {
    paddingVertical: 6,
  },
  eduTypeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  eduInstitute: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  eduMeta: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 1,
  },
  timelineRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  semLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
  },
  timelineChip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  timelineChipType: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669',
  },
  timelineChipTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  templateChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  templateChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  templateChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  templateChipTextActive: {
    color: '#FFF',
  },
  resumePreviewBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  previewMeta: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
  previewBio: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 14,
  },
  previewSkills: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  resumeActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadPdfBtn: {
    flex: 1,
    backgroundColor: '#047857',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadPdfBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  saveSnapshotBtn: {
    flex: 1,
    backgroundColor: '#064E3B',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveSnapshotBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  savedResumeItem: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  savedResumeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  savedResumeDate: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  headerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addAchBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  addAchBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsCountRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  countBadge: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  countNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B',
  },
  countLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1,
  },
  achCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  achHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  achStatusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusVerified: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  achStatusChipText: {
    fontSize: 9,
    fontWeight: '700',
  },
  txtVerified: {
    color: '#065F46',
  },
  txtPending: {
    color: '#92400E',
  },
  txtRejected: {
    color: '#991B1B',
  },
  achMeta: {
    fontSize: 9,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  achDesc: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    lineHeight: 14,
  },
  proofLink: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: '#111827',
    marginBottom: 8,
  },
  branchPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#064E3B',
  },
  filterPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  studentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  studentCardName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  studentCardMeta: {
    fontSize: 10,
    color: '#6B7280',
  },
  miniChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  miniSkillChip: {
    backgroundColor: '#E6F4EA',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  miniSkillChipText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#065F46',
  },
  studentCardActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  viewCardBtn: {
    flex: 1,
    paddingVertical: 5,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
  },
  viewCardBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  messageBtn: {
    flex: 1,
    paddingVertical: 5,
    backgroundColor: '#047857',
    borderRadius: 6,
    alignItems: 'center',
  },
  messageBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  verifToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  verifTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  verifTabBtnActive: {
    backgroundColor: '#064E3B',
  },
  verifTabBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
  },
  verifTabBtnTextActive: {
    color: '#FFF',
  },
  verifItemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  verifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  verifCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  verifDesc: {
    fontSize: 10,
    color: '#374151',
    marginVertical: 4,
  },
  verifActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  verifyBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#059669',
    borderRadius: 6,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#DC2626',
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  lookupBtn: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
  },
  lookupBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  lookedUpReportBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  reportMeta: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
  submitRecBtn: {
    backgroundColor: '#047857',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  submitRecBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 15,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    color: '#111827',
  },
  formSectionSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: 4,
    marginBottom: 4,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelTxt: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#047857',
    alignItems: 'center',
  },
  modalSaveTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryActionBtn: {
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  endorseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  endorseItemName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  endorseActionBtn: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  endorseActionBtnTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#065F46',
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatCloseTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  chatHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  chatMessagesArea: {
    flex: 1,
    padding: 12,
  },
  chatEmptyTxt: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  chatBubbleWrap: {
    marginVertical: 3,
  },
  chatRight: {
    alignItems: 'flex-end',
  },
  chatLeft: {
    alignItems: 'flex-start',
  },
  chatBubble: {
    maxWidth: '78%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bubbleMine: {
    backgroundColor: '#047857',
  },
  bubbleOther: {
    backgroundColor: '#E5E7EB',
  },
  bubbleTxt: {
    fontSize: 11,
  },
  bubbleTxtMine: {
    color: '#FFF',
  },
  bubbleTxtOther: {
    color: '#111827',
  },
  chatInputBar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
  },
  chatSendBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  chatSendBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 14,
  },
});
