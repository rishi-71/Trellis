import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Switch,
  Modal
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface PlacementsProps {
  token: string;
  backendUrl: string;
}

export default function PlacementsModule({ token, backendUrl }: PlacementsProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'drives' | 'profile' | 'roster'>('drives');
  const [placementReg, setPlacementReg] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);

  // User Profile
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin' | 'placement_head'>('student');
  const [userEmail, setUserEmail] = useState('');
  const [studentSemester, setStudentSemester] = useState<number>(6);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [driveFilter, setDriveFilter] = useState<'all' | 'eligible' | 'applied' | 'full-time' | 'internship'>('all');

  // Post Drive Modal State (Officer / Admin)
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [postCompany, setPostCompany] = useState('');
  const [postRole, setPostRole] = useState('');
  const [postType, setPostType] = useState<'full-time' | 'internship'>('full-time');
  const [postMinCgpa, setPostMinCgpa] = useState('7.0');
  const [postMaxBacklogs, setPostMaxBacklogs] = useState('0');
  const [postDaysDeadline, setPostDaysDeadline] = useState('14');
  const [postDescription, setPostDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Form Fields (Pre-filled & Streamlined)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2002-05-15');
  const [gender, setGender] = useState('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [curAddressLine, setCurAddressLine] = useState('Campus Hostel Block A');
  const [curCity, setCurCity] = useState('Indore');
  const [curState, setCurState] = useState('Madhya Pradesh');
  const [curPincode, setCurPincode] = useState('452012');

  const [permAddressLine, setPermAddressLine] = useState('Permanent Residence');
  const [permCity, setPermCity] = useState('Indore');
  const [permState, setPermState] = useState('Madhya Pradesh');
  const [permPincode, setPermPincode] = useState('452012');

  // Family
  const [fatherName, setFatherName] = useState('Parent Guardian');
  const [fatherOccupation, setFatherOccupation] = useState('Professional');
  const [fatherContact, setFatherContact] = useState('9876543210');
  const [motherName, setMotherName] = useState('Mother Guardian');
  const [motherOccupation, setMotherOccupation] = useState('Homemaker');
  const [motherContact, setMotherContact] = useState('9876543211');

  // Identity & Academics
  const [apaarId, setApaarId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://cloudinary.com/default-avatar');
  const [tenthPercentage, setTenthPercentage] = useState('85');
  const [tenthBoard, setTenthBoard] = useState('CBSE');
  const [tenthSchoolName, setTenthSchoolName] = useState('DPS Public School');
  const [tenthYear, setTenthYear] = useState('2018');

  const [twelfthPercentage, setTwelfthPercentage] = useState('82');
  const [twelfthBoard, setTwelfthBoard] = useState('CBSE');
  const [twelfthSchoolName, setTwelfthSchoolName] = useState('DPS Senior Secondary');
  const [twelfthYear, setTwelfthYear] = useState('2020');

  const [diplomaPercentage, setDiplomaPercentage] = useState('');
  const [diplomaBoard, setDiplomaBoard] = useState('');
  const [diplomaYear, setDiplomaYear] = useState('');

  const [gradDegree, setGradDegree] = useState('B.Tech');
  const [gradUniversity, setGradUniversity] = useState('RGPV Bhopal');
  const [gradCollege, setGradCollege] = useState('IPS Academy');
  const [gradBranch, setGradBranch] = useState('Computer Science & Engineering');
  const [gradStartYear, setGradStartYear] = useState('2021');
  const [gradExpectedGradYear, setGradExpectedGradYear] = useState('2025');
  const [gradRollNumber, setGradRollNumber] = useState('');
  const [gradEnrollmentNumber, setGradEnrollmentNumber] = useState('');

  // SGPAs
  const [sgpa1, setSgpa1] = useState('8.2');
  const [sgpa2, setSgpa2] = useState('8.4');
  const [sgpa3, setSgpa3] = useState('8.1');
  const [sgpa4, setSgpa4] = useState('8.6');
  const [sgpa5, setSgpa5] = useState('8.5');
  const [backlogCount, setBacklogCount] = useState('0');

  // Documents
  const [resumeUrl, setResumeUrl] = useState('https://cloudinary.com/placement-resumes/verified_resume.pdf');
  const [tenthMarksheetUrl] = useState('https://cloudinary.com/marksheets/10th.png');
  const [twelfthMarksheetUrl] = useState('https://cloudinary.com/marksheets/12th.png');

  // Profile setup section accordions
  const [formSection, setFormSection] = useState<'academics' | 'school' | 'personal'>('academics');

  // 1. Fetch Auth Profile & Identity
  useEffect(() => {
    if (!token) return;
    fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.user?.role) setUserRole(data.user.role);
          if (data.user?.email) {
            setUserEmail(data.user.email);
            setEmail(data.user.email);
          }
          if (data.profile) {
            const p = data.profile;
            if (p.name) setFullName(p.name);
            if (p.rollNumber) {
              setGradRollNumber(p.rollNumber);
              setGradEnrollmentNumber(p.rollNumber);
            }
            if (p.branch) setGradBranch(p.branch);
            if (p.contact) setPhone(p.contact);
            if (p.semester) setStudentSemester(p.semester);
            if (p.cgpa) {
              const baseCgpa = p.cgpa.toString();
              setSgpa1(baseCgpa);
              setSgpa2(baseCgpa);
              setSgpa3(baseCgpa);
              setSgpa4(baseCgpa);
              setSgpa5(baseCgpa);
            }
          }
        }
      })
      .catch((err) => console.log('Auth profile sync error:', err.message));
  }, [token, backendUrl]);

  // 2. Fetch Placement Data (Drives + Registration)
  const fetchPlacementData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const emailToUse = userEmail || 'student@ips.edu';

      // Fetch student registration status
      const regRes = await fetch(`${backendUrl}/api/placement/registration/${encodeURIComponent(emailToUse)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const regData = await regRes.json();
      if (regData.success && regData.registration) {
        const reg = regData.registration;
        setPlacementReg(reg);

        setFullName(reg.personal?.fullName || fullName);
        setDob(reg.personal?.dob || dob);
        setGender(reg.personal?.gender || gender);
        setPhone(reg.personal?.phone || phone);
        setEmail(reg.personal?.email || emailToUse);
        setApaarId(reg.identity?.apaarId || '');

        if (reg.academic?.tenth) {
          setTenthPercentage(reg.academic.tenth.percentage?.toString() || tenthPercentage);
          setTenthBoard(reg.academic.tenth.board || tenthBoard);
          setTenthSchoolName(reg.academic.tenth.schoolName || tenthSchoolName);
          setTenthYear(reg.academic.tenth.year?.toString() || tenthYear);
        }

        if (reg.academic?.twelfth) {
          setTwelfthPercentage(reg.academic.twelfth.percentage?.toString() || twelfthPercentage);
          setTwelfthBoard(reg.academic.twelfth.board || twelfthBoard);
          setTwelfthSchoolName(reg.academic.twelfth.schoolName || twelfthSchoolName);
          setTwelfthYear(reg.academic.twelfth.year?.toString() || twelfthYear);
        }

        if (reg.academic?.graduation) {
          setGradDegree(reg.academic.graduation.degree || gradDegree);
          setGradBranch(reg.academic.graduation.branch || gradBranch);
          setGradCollege(reg.academic.graduation.college || gradCollege);
          setGradRollNumber(reg.academic.rollNumber || gradRollNumber);
          setGradEnrollmentNumber(reg.academic.enrollmentNumber || gradEnrollmentNumber);
        }

        if (Array.isArray(reg.academic?.semesterSgpa)) {
          reg.academic.semesterSgpa.forEach((s: any) => {
            if (s.semester === 1) setSgpa1(s.sgpa?.toString() || '');
            if (s.semester === 2) setSgpa2(s.sgpa?.toString() || '');
            if (s.semester === 3) setSgpa3(s.sgpa?.toString() || '');
            if (s.semester === 4) setSgpa4(s.sgpa?.toString() || '');
            if (s.semester === 5) setSgpa5(s.sgpa?.toString() || '');
          });
        }
        setBacklogCount(reg.academic?.backlogCount?.toString() || '0');
        if (reg.documents?.resumeUrl) setResumeUrl(reg.documents.resumeUrl);
      }

      // Fetch Drives
      let jobsUrl = `${backendUrl}/api/placement/jobs`;
      if (userRole === 'student') {
        jobsUrl += `?studentEmail=${encodeURIComponent(emailToUse)}`;
      }
      const jobsRes = await fetch(jobsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      if (jobsData.success && Array.isArray(jobsData.jobs)) {
        setJobs(jobsData.jobs);
      }

      // If officer/admin, fetch student registrations roster
      if (userRole === 'admin' || userRole === 'placement_head') {
        const rRes = await fetch(`${backendUrl}/api/placement/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rData = await rRes.json();
        if (rData.success && Array.isArray(rData.registrations)) {
          setAllRegistrations(rData.registrations);
        }
      }
    } catch (err: any) {
      console.log('Error fetching placement data:', err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, userEmail, userRole]);

  useEffect(() => {
    fetchPlacementData();
  }, [fetchPlacementData]);

  // Derived Frontend CGPA
  const calculateFrontendCgpa = () => {
    const s1 = parseFloat(sgpa1) || 0;
    const s2 = parseFloat(sgpa2) || 0;
    const s3 = parseFloat(sgpa3) || 0;
    const s4 = parseFloat(sgpa4) || 0;
    const s5 = parseFloat(sgpa5) || 0;
    const list = [s1, s2, s3, s4];
    if (!isRetryAttempt) list.push(s5);
    const valid = list.filter(v => v > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((a, b) => a + b, 0);
    return Math.round((sum / valid.length) * 100) / 100;
  };

  // Submit / Lock Placement Profile
  const handleSavePlacementProfile = async (isDraft: boolean) => {
    if (!isDraft) {
      Alert.alert(
        'Confirm Submission',
        'Once submitted, your placement profile will be permanently locked for company matching. Proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit & Lock', onPress: () => submitData(false) }
        ]
      );
    } else {
      submitData(true);
    }
  };

  const submitData = async (isDraft: boolean) => {
    setLoading(true);
    try {
      const semesterSgpa = [
        { semester: 1, sgpa: parseFloat(sgpa1) || 0 },
        { semester: 2, sgpa: parseFloat(sgpa2) || 0 },
        { semester: 3, sgpa: parseFloat(sgpa3) || 0 },
        { semester: 4, sgpa: parseFloat(sgpa4) || 0 }
      ];
      if (!isRetryAttempt) {
        semesterSgpa.push({ semester: 5, sgpa: parseFloat(sgpa5) || 0 });
      }

      const body = {
        isRetryAttempt,
        isDraft,
        personal: {
          fullName,
          dob,
          gender,
          phone,
          email: userEmail || email,
          currentAddress: {
            addressLine: curAddressLine,
            city: curCity,
            state: curState,
            pincode: curPincode
          },
          permanentAddress: {
            addressLine: permAddressLine,
            city: permCity,
            state: permState,
            pincode: permPincode
          }
        },
        family: {
          fatherName,
          fatherOccupation,
          fatherContact,
          motherName,
          motherOccupation,
          motherContact
        },
        identity: {
          apaarId: apaarId || 'APAAR-2026-IN',
          photoUrl
        },
        academic: {
          tenth: {
            percentage: parseFloat(tenthPercentage) || 0,
            board: tenthBoard,
            schoolName: tenthSchoolName,
            year: parseInt(tenthYear) || 2018
          },
          twelfth: {
            percentage: parseFloat(twelfthPercentage) || 0,
            board: twelfthBoard,
            schoolName: twelfthSchoolName,
            year: parseInt(twelfthYear) || 2020
          },
          diploma: {
            percentage: diplomaPercentage ? parseFloat(diplomaPercentage) : undefined,
            board: diplomaBoard || undefined,
            year: diplomaYear ? parseInt(diplomaYear) : undefined
          },
          graduation: {
            degree: gradDegree,
            university: gradUniversity,
            college: gradCollege,
            branch: gradBranch,
            startYear: parseInt(gradStartYear) || 2021,
            expectedGraduationYear: parseInt(gradExpectedGradYear) || 2025,
            currentSemester: studentSemester
          },
          branch: gradBranch,
          rollNumber: gradRollNumber,
          enrollmentNumber: gradEnrollmentNumber,
          semesterSgpa,
          backlogCount: parseInt(backlogCount) || 0,
          backlogHistory: []
        },
        documents: {
          resumeUrl,
          tenthMarksheetUrl,
          twelfthMarksheetUrl,
          semesterMarksheets: semesterSgpa.map(s => ({ semester: s.semester, url: resumeUrl }))
        }
      };

      const emailToUse = userEmail || 'student@ips.edu';
      const res = await fetch(`${backendUrl}/api/placement/registration/${encodeURIComponent(emailToUse)}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', isDraft ? 'Draft profile saved.' : 'Placement profile locked & verified!');
        fetchPlacementData();
        setActiveTab('drives');
      } else {
        Alert.alert('Notice', data.message || 'Validation error.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  // Student Decision (Apply / Opt Out)
  const handleStudentDecision = async (jobId: string, decision: 'applied' | 'no-apply') => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/placement/jobs/${jobId}/decision`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ decision, applicationResume: resumeUrl })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert(
          decision === 'applied' ? 'Application Submitted 🎉' : 'Decision Saved',
          decision === 'applied' 
            ? 'Your application & verified resume were submitted to the company.' 
            : 'You have opted out of this campus drive.'
        );
        fetchPlacementData();
      } else {
        Alert.alert('Notice', data.message || 'Could not record decision.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Publish New Placement Drive (Officer / Admin)
  const handlePublishDrive = async () => {
    if (!postCompany.trim() || !postRole.trim()) {
      Alert.alert('Required Fields', 'Please enter Company Name and Job Role.');
      return;
    }

    setPublishing(true);
    try {
      const days = parseInt(postDaysDeadline) || 14;
      const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const eligibilityRules: any[] = [];
      const minCgpaNum = parseFloat(postMinCgpa);
      if (!isNaN(minCgpaNum) && minCgpaNum > 0) {
        eligibilityRules.push({
          field: 'academic.cgpa',
          operator: '>=',
          value: minCgpaNum
        });
      }

      const backlogsNum = parseInt(postMaxBacklogs);
      if (!isNaN(backlogsNum)) {
        eligibilityRules.push({
          field: 'academic.backlogCount',
          operator: '<=',
          value: backlogsNum
        });
      }

      const res = await fetch(`${backendUrl}/api/placement/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: postCompany.trim(),
          role: postRole.trim(),
          type: postType,
          description: postDescription.trim() || `${postRole} opening at ${postCompany}.`,
          eligibilityRules,
          applicationDeadline: deadlineDate
        })
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert(
          'Drive Published! 🚀',
          `New campus drive for ${postCompany} has been posted. The eligibility matching engine has executed and eligible students have been notified.`
        );
        setIsPostModalVisible(false);
        setPostCompany('');
        setPostRole('');
        setPostDescription('');
        fetchPlacementData();
      } else {
        Alert.alert('Error', data.message || 'Failed to publish placement drive.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Connection error while publishing drive.');
    } finally {
      setPublishing(false);
    }
  };

  // Delete Placement Drive (Officer / Admin)
  const handleDeleteJob = async (jobId: string, companyName: string) => {
    Alert.alert(
      'Delete Drive',
      `Are you sure you want to delete the drive for ${companyName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/placement/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Deleted', 'Placement drive removed.');
                fetchPlacementData();
              }
            } catch (_) {}
          }
        }
      ]
    );
  };

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return jobs.filter((item) => {
      const job = item.jobPostingId || item;
      const comp = (job.companyName || '').toLowerCase();
      const role = (job.role || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      if (q && !comp.includes(q) && !role.includes(q)) return false;

      const isEligible = item.isEligible !== false;
      const applied = item.studentDecision === 'applied';

      if (driveFilter === 'eligible') return isEligible;
      if (driveFilter === 'applied') return applied;
      if (driveFilter === 'full-time') return job.type === 'full-time';
      if (driveFilter === 'internship') return job.type === 'internship';

      return true;
    });
  }, [jobs, searchQuery, driveFilter]);

  const isOfficerOrAdmin = userRole === 'admin' || userRole === 'placement_head';

  return (
    <View style={styles.card}>
      {/* Title Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>💼 Campus Placements Hub</Text>
          <Text style={styles.cardSubtitle}>Training & Placement Cell • Year 3+ Board</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {isOfficerOrAdmin && (
            <TouchableOpacity 
              style={styles.postDriveHeaderBtn} 
              onPress={() => setIsPostModalVisible(true)}
            >
              <Text style={styles.postDriveHeaderBtnText}>+ Post Drive</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.refreshIconBtn} onPress={fetchPlacementData}>
            <Text style={{ fontSize: 13 }}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role-Aware Navigation Tabs (Clean 2-Tab Layout) */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'drives' && styles.tabActive]} 
          onPress={() => setActiveTab('drives')}
        >
          <Text style={[styles.tabText, activeTab === 'drives' && styles.tabTextActive]}>
            💼 {isOfficerOrAdmin ? 'Drives' : 'Matched Drives'} ({filteredDrives.length})
          </Text>
        </TouchableOpacity>

        {isOfficerOrAdmin ? (
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'roster' && styles.tabActive]} 
            onPress={() => setActiveTab('roster')}
          >
            <Text style={[styles.tabText, activeTab === 'roster' && styles.tabTextActive]}>
              👥 Student Roster ({allRegistrations.length})
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'profile' && styles.tabActive]} 
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
              📋 Clearance Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && jobs.length === 0 && (
        <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 14 }} />
      )}

      {/* ==================== TAB 1: DRIVES & MATCHES ==================== */}
      {activeTab === 'drives' && (
        <View style={{ marginTop: 4 }}>
          {/* Compact Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.searchInput}
              placeholder="🔍 Search Google, TCS, Software Engineer..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[
              { id: 'all', label: 'All Drives' },
              { id: 'eligible', label: '🟢 Eligible' },
              { id: 'applied', label: '✓ Applied' },
              { id: 'full-time', label: 'Full-Time' },
              { id: 'internship', label: 'Internship' }
            ].map((pill) => (
              <TouchableOpacity
                key={pill.id}
                style={[styles.filterPill, driveFilter === pill.id && styles.filterPillActive]}
                onPress={() => setDriveFilter(pill.id as any)}
              >
                <Text style={[styles.filterPillText, driveFilter === pill.id && styles.filterPillTextActive]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Job Postings Cards */}
          {filteredDrives.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Matching Drives Found</Text>
              <Text style={styles.emptyText}>
                No current openings match your filter.
              </Text>
            </View>
          ) : (
            filteredDrives.map((item) => {
              const job = item.jobPostingId || item;
              const isEligible = item.isEligible !== false;
              const applied = item.studentDecision === 'applied';
              const optedOut = item.studentDecision === 'no-apply';
              const isPassed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

              let badgeBg = '#D1FAE5';
              let badgeColor = '#065F46';
              let badgeText = 'Eligible';

              if (applied) {
                badgeBg = '#ECFDF5';
                badgeColor = '#059669';
                badgeText = 'Applied';
              } else if (optedOut) {
                badgeBg = '#F3F4F6';
                badgeColor = '#6B7280';
                badgeText = 'Opted Out';
              } else if (!isEligible) {
                badgeBg = '#FEE2E2';
                badgeColor = '#991B1B';
                badgeText = 'Ineligible';
              } else if (isPassed) {
                badgeBg = '#FEF3C7';
                badgeColor = '#92400E';
                badgeText = 'Passed';
              }

              return (
                <View key={item._id || job._id} style={styles.jobCard}>
                  {/* Top Row: Company & Role (left) + Compact Status Chip (right) */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.companyTitleWrap}>
                      <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
                        {job.companyName}
                      </Text>
                      <Text style={styles.jobRole} numberOfLines={1} ellipsizeMode="tail">
                        {job.role}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.badgeTxt, { color: badgeColor }]}>{badgeText}</Text>
                    </View>
                  </View>

                  {/* Row 2: Type, Deadline & Package details */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaBadge}>
                      {job.type === 'internship' ? '💼 Internship' : '🚀 Full-Time'}
                    </Text>
                    <Text style={styles.metaText}>
                      📅 Due: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Rolling'}
                    </Text>
                  </View>

                  {/* Clean Ineligible Note */}
                  {!isEligible && Array.isArray(item.failedConditions) && item.failedConditions.length > 0 && (
                    <Text style={styles.ineligibleNote} numberOfLines={1}>
                      ⚠️ Requirement: {item.failedConditions[0]?.message}
                    </Text>
                  )}

                  {/* Action Controls */}
                  {userRole === 'student' && isEligible && (
                    <View style={styles.actionRow}>
                      {applied ? (
                        <View style={styles.appliedPill}>
                          <Text style={styles.appliedPillText}>✓ Application Submitted</Text>
                        </View>
                      ) : isPassed ? (
                        <Text style={styles.passedText}>Deadline has passed</Text>
                      ) : (
                        <View style={styles.buttonGroup}>
                          <TouchableOpacity 
                            style={styles.optOutBtn} 
                            onPress={() => handleStudentDecision(job._id, 'no-apply')}
                          >
                            <Text style={styles.optOutBtnTxt}>Opt Out</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.applyBtn} 
                            onPress={() => handleStudentDecision(job._id, 'applied')}
                          >
                            <Text style={styles.applyBtnTxt}>⚡ Apply Now</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Admin Actions (Delete Job Drive) */}
                  {isOfficerOrAdmin && (
                    <View style={styles.adminActionRow}>
                      <TouchableOpacity 
                        style={styles.deleteJobBtn}
                        onPress={() => handleDeleteJob(job._id, job.companyName)}
                      >
                        <Text style={styles.deleteJobBtnText}>🗑️ Delete Drive</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ==================== TAB 2: PROFILE & CLEARANCE (STUDENT) ==================== */}
      {activeTab === 'profile' && !isOfficerOrAdmin && (
        <View style={{ marginTop: 4 }}>
          {placementReg?.status === 'locked' ? (
            /* Locked "Placement Clearance Card" */
            <View style={styles.clearanceCard}>
              <View style={styles.clearanceHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clearanceName}>{placementReg.personal?.fullName}</Text>
                  <Text style={styles.clearanceSub}>
                    {placementReg.academic?.branch} • Roll: {placementReg.academic?.rollNumber}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeTxt}>🔒 Clearance Locked</Text>
                </View>
              </View>

              {/* KPI Stats Grid */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.cgpa?.toFixed(2) || '0.00'}</Text>
                  <Text style={styles.statLbl}>Verified CGPA</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.backlogCount || '0'}</Text>
                  <Text style={styles.statLbl}>Backlogs</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.overallEducationGap || 0} Yrs</Text>
                  <Text style={styles.statLbl}>Edu Gap</Text>
                </View>
              </View>

              {/* Academic Snapshot */}
              <View style={styles.academicSnapshot}>
                <Text style={styles.snapRow}>🎓 10th: {placementReg.academic?.tenth?.percentage}% ({placementReg.academic?.tenth?.board})</Text>
                <Text style={styles.snapRow}>🎓 12th: {placementReg.academic?.twelfth?.percentage}% ({placementReg.academic?.twelfth?.board})</Text>
                <Text style={styles.snapRow}>📄 APAAR: {placementReg.identity?.apaarId || 'Verified'}</Text>
              </View>

              <Text style={styles.lockedNote}>
                ✓ Your institutional record is locked and verified for matching drives. To request an update, contact the T&P Cell.
              </Text>
            </View>
          ) : (
            /* Streamlined Progressive Registration Form */
            <View style={styles.formContainer}>
              <Text style={styles.formIntro}>
                Set up your academic scores & resume to unlock campus placement drives.
              </Text>

              {/* Section Accordion Tabs */}
              <View style={styles.sectionTabRow}>
                <TouchableOpacity 
                  style={[styles.secTab, formSection === 'academics' && styles.secTabActive]}
                  onPress={() => setFormSection('academics')}
                >
                  <Text style={[styles.secTabTxt, formSection === 'academics' && styles.secTabTxtActive]}>
                    1. Academics
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secTab, formSection === 'school' && styles.secTabActive]}
                  onPress={() => setFormSection('school')}
                >
                  <Text style={[styles.secTabTxt, formSection === 'school' && styles.secTabTxtActive]}>
                    2. School
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secTab, formSection === 'personal' && styles.secTabActive]}
                  onPress={() => setFormSection('personal')}
                >
                  <Text style={[styles.secTabTxt, formSection === 'personal' && styles.secTabTxtActive]}>
                    3. Resume & ID
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SECTION 1: ACADEMICS & CGPA */}
              {formSection === 'academics' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.fieldLabel}>Semester SGPAs (Sem 1 to 5)</Text>
                  <View style={styles.sgpaGrid}>
                    <View style={styles.sgpaItem}>
                      <Text style={styles.sgpaMiniLabel}>Sem 1</Text>
                      <TextInput style={styles.sgpaInput} value={sgpa1} onChangeText={setSgpa1} keyboardType="numeric" />
                    </View>
                    <View style={styles.sgpaItem}>
                      <Text style={styles.sgpaMiniLabel}>Sem 2</Text>
                      <TextInput style={styles.sgpaInput} value={sgpa2} onChangeText={setSgpa2} keyboardType="numeric" />
                    </View>
                    <View style={styles.sgpaItem}>
                      <Text style={styles.sgpaMiniLabel}>Sem 3</Text>
                      <TextInput style={styles.sgpaInput} value={sgpa3} onChangeText={setSgpa3} keyboardType="numeric" />
                    </View>
                    <View style={styles.sgpaItem}>
                      <Text style={styles.sgpaMiniLabel}>Sem 4</Text>
                      <TextInput style={styles.sgpaInput} value={sgpa4} onChangeText={setSgpa4} keyboardType="numeric" />
                    </View>
                    {!isRetryAttempt && (
                      <View style={styles.sgpaItem}>
                        <Text style={styles.sgpaMiniLabel}>Sem 5</Text>
                        <TextInput style={styles.sgpaInput} value={sgpa5} onChangeText={setSgpa5} keyboardType="numeric" />
                      </View>
                    )}
                  </View>

                  {/* Calculated CGPA Preview Badge */}
                  <View style={styles.cgpaPreviewBadge}>
                    <Text style={styles.cgpaPreviewText}>
                      Calculated CGPA: <Text style={{ fontWeight: 'bold' }}>{calculateFrontendCgpa().toFixed(2)}</Text>
                    </Text>
                  </View>

                  <Text style={styles.fieldLabel}>Active Backlogs Count</Text>
                  <TextInput 
                    style={styles.input} 
                    value={backlogCount} 
                    onChangeText={setBacklogCount} 
                    keyboardType="numeric" 
                    placeholder="0" 
                  />

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Lateral / Retry Attempt (Uses Sem 1-4 only)</Text>
                    <Switch value={isRetryAttempt} onValueChange={setIsRetryAttempt} thumbColor="#059669" trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }} />
                  </View>
                </View>
              )}

              {/* SECTION 2: 10TH & 12TH */}
              {formSection === 'school' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.fieldLabel}>10th Percentage & Board</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Percentage" value={tenthPercentage} onChangeText={setTenthPercentage} keyboardType="numeric" />
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Board (e.g. CBSE)" value={tenthBoard} onChangeText={setTenthBoard} />
                  </View>

                  <Text style={styles.fieldLabel}>12th / Diploma Percentage & Board</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Percentage" value={twelfthPercentage} onChangeText={setTwelfthPercentage} keyboardType="numeric" />
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Board (e.g. CBSE)" value={twelfthBoard} onChangeText={setTwelfthBoard} />
                  </View>
                </View>
              )}

              {/* SECTION 3: PERSONAL & RESUME */}
              {formSection === 'personal' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

                  <Text style={styles.fieldLabel}>Roll Number / College ID</Text>
                  <TextInput style={styles.input} value={gradRollNumber} onChangeText={setGradRollNumber} />

                  <Text style={styles.fieldLabel}>APAAR ID / Academic Bank of Credits</Text>
                  <TextInput style={styles.input} placeholder="e.g. APAAR-100234" value={apaarId} onChangeText={setApaarId} />

                  <Text style={styles.fieldLabel}>Verified Resume Link</Text>
                  <TextInput style={styles.input} value={resumeUrl} onChangeText={setResumeUrl} placeholder="https://..." />
                </View>
              )}

              {/* Save & Submit Actions */}
              <View style={styles.formActionRow}>
                <TouchableOpacity style={styles.draftBtn} onPress={() => handleSavePlacementProfile(true)}>
                  <Text style={styles.draftBtnTxt}>💾 Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitLockBtn} onPress={() => handleSavePlacementProfile(false)}>
                  <Text style={styles.submitLockBtnTxt}>🔒 Submit & Lock</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ==================== TAB 3: STUDENT ROSTER (OFFICER / ADMIN) ==================== */}
      {activeTab === 'roster' && isOfficerOrAdmin && (
        <View style={{ marginTop: 4 }}>
          {allRegistrations.length === 0 ? (
            <Text style={styles.emptyText}>No registered candidate profiles found.</Text>
          ) : (
            allRegistrations.map((st) => (
              <View key={st._id} style={styles.rosterCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName} numberOfLines={1}>{st.personal?.fullName}</Text>
                    <Text style={styles.jobRole}>{st.academic?.branch} • Roll: {st.academic?.rollNumber}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.status === 'locked' ? '#D1FAE5' : '#FEF3C7' }]}>
                    <Text style={[styles.badgeTxt, { color: st.status === 'locked' ? '#065F46' : '#92400E' }]}>
                      {st.status === 'locked' ? 'Locked' : 'Draft'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.metaText}>
                  CGPA: <Text style={{ fontWeight: 'bold' }}>{st.academic?.cgpa?.toFixed(2) || '0.00'}</Text> • Backlogs: {st.academic?.backlogCount || 0}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* ==================== MODAL: POST NEW PLACEMENT DRIVE (ADMIN / OFFICER) ==================== */}
      <Modal visible={isPostModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>🚀 Post New Placement Drive</Text>
                <Text style={styles.modalSub}>Publish opening & trigger student auto-matching.</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPostModalVisible(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, marginVertical: 6 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Company Name *</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="e.g. Google, Microsoft, Infosys"
                value={postCompany} 
                onChangeText={setPostCompany} 
              />

              <Text style={styles.modalLabel}>Job Role / Designation *</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="e.g. Software Engineer, Data Analyst"
                value={postRole} 
                onChangeText={setPostRole} 
              />

              <Text style={styles.modalLabel}>Drive Type *</Text>
              <View style={styles.durationRow}>
                {(['full-time', 'internship'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.durationChip, postType === t && styles.durationChipActive]}
                    onPress={() => setPostType(t)}
                  >
                    <Text style={[styles.durationChipText, postType === t && styles.durationChipTextActive]}>
                      {t === 'full-time' ? 'Full-Time' : 'Internship'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Min CGPA Required</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="e.g. 7.5"
                    keyboardType="numeric"
                    value={postMinCgpa} 
                    onChangeText={setPostMinCgpa} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Max Backlogs</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="0"
                    keyboardType="numeric"
                    value={postMaxBacklogs} 
                    onChangeText={setPostMaxBacklogs} 
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>Application Deadline</Text>
              <View style={styles.durationRow}>
                {['7 Days', '14 Days', '30 Days'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[styles.durationChip, postDaysDeadline === days.split(' ')[0] && styles.durationChipActive]}
                    onPress={() => setPostDaysDeadline(days.split(' ')[0])}
                  >
                    <Text style={[styles.durationChipText, postDaysDeadline === days.split(' ')[0] && styles.durationChipTextActive]}>
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Package & Description</Text>
              <TextInput 
                style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]} 
                placeholder="e.g. CTC: ₹14 LPA • Location: Bengaluru..."
                multiline
                value={postDescription} 
                onChangeText={setPostDescription} 
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]} 
                onPress={() => setIsPostModalVisible(false)}
              >
                <Text style={{ fontWeight: 'bold', color: '#374151', fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#10B981' }]} 
                disabled={publishing}
                onPress={handlePublishDrive}
              >
                {publishing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 12 }}>Publish Drive 🚀</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  postDriveHeaderBtn: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postDriveHeaderBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  refreshIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#065F46',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 11,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 5,
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
  jobCard: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  companyTitleWrap: {
    flex: 1,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  jobRole: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 1,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTxt: {
    fontSize: 9,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaBadge: {
    fontSize: 9,
    color: '#047857',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
  },
  ineligibleNote: {
    fontSize: 10,
    color: '#991B1B',
    marginTop: 4,
  },
  actionRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  adminActionRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteJobBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  deleteJobBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  applyBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  optOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    alignItems: 'center',
  },
  optOutBtnTxt: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
  appliedPill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  appliedPillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  passedText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  clearanceCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearanceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  clearanceSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeTxt: {
    fontSize: 9,
    color: '#065F46',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#064E3B',
  },
  statLbl: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  academicSnapshot: {
    gap: 3,
    paddingVertical: 6,
  },
  snapRow: {
    fontSize: 11,
    color: '#4B5563',
  },
  lockedNote: {
    fontSize: 9,
    color: '#059669',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formContainer: {
    padding: 4,
  },
  formIntro: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 8,
  },
  sectionTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  secTab: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  secTabActive: {
    backgroundColor: '#064E3B',
  },
  secTabTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
  },
  secTabTxtActive: {
    color: '#FFF',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    marginTop: 6,
    marginBottom: 3,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
  },
  sgpaGrid: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  sgpaItem: {
    flex: 1,
    alignItems: 'center',
  },
  sgpaMiniLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  sgpaInput: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  cgpaPreviewBadge: {
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  cgpaPreviewText: {
    fontSize: 11,
    color: '#065F46',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 10,
    color: '#4B5563',
    flex: 1,
    paddingRight: 8,
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  draftBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  draftBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  submitLockBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitLockBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  rosterCard: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    marginTop: 6,
    marginBottom: 2,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  durationChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  durationChipText: {
    fontSize: 9,
    color: '#4B5563',
    fontWeight: '600',
  },
  durationChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
});
