import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TextInput,
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Switch
} from 'react-native';
import { Spacing } from '@/constants/theme';

interface PlacementsProps {
  token: string;
  backendUrl: string;
}

export default function PlacementsModule({ token, backendUrl }: PlacementsProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'drives'>('profile');
  const [placementReg, setPlacementReg] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  // Timing timing check
  const [studentSemester, setStudentSemester] = useState<number>(6);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);

  // Form Fields
  // Personal
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Address components
  const [curAddressLine, setCurAddressLine] = useState("");
  const [curCity, setCurCity] = useState("");
  const [curState, setCurState] = useState("");
  const [curPincode, setCurPincode] = useState("");

  const [permAddressLine, setPermAddressLine] = useState("");
  const [permCity, setPermCity] = useState("");
  const [permState, setPermState] = useState("");
  const [permPincode, setPermPincode] = useState("");

  // Family
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherContact, setFatherContact] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherContact, setMotherContact] = useState("");

  // Identity & Academics
  const [apaarId, setApaarId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://cloudinary.com/default-avatar"); // placeholder or filled
  const [tenthPercentage, setTenthPercentage] = useState("");
  const [tenthBoard, setTenthBoard] = useState("");
  const [tenthSchoolName, setTenthSchoolName] = useState("");
  const [tenthYear, setTenthYear] = useState("");
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [twelfthBoard, setTwelfthBoard] = useState("");
  const [twelfthSchoolName, setTwelfthSchoolName] = useState("");
  const [twelfthYear, setTwelfthYear] = useState("");
  const [diplomaPercentage, setDiplomaPercentage] = useState("");
  const [diplomaBoard, setDiplomaBoard] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("");

  const [gradDegree, setGradDegree] = useState("");
  const [gradUniversity, setGradUniversity] = useState("");
  const [gradCollege, setGradCollege] = useState("");
  const [gradBranch, setGradBranch] = useState("");
  const [gradStartYear, setGradStartYear] = useState("");
  const [gradExpectedGradYear, setGradExpectedGradYear] = useState("");
  
  const [gradRollNumber, setGradRollNumber] = useState("");
  const [gradEnrollmentNumber, setGradEnrollmentNumber] = useState("");

  // SGPAs
  const [sgpa1, setSgpa1] = useState("");
  const [sgpa2, setSgpa2] = useState("");
  const [sgpa3, setSgpa3] = useState("");
  const [sgpa4, setSgpa4] = useState("");
  const [sgpa5, setSgpa5] = useState("");
  
  const [backlogCount, setBacklogCount] = useState("0");
  const [backlogHistory, setBacklogHistory] = useState<string[]>([]);
  const [newBacklog, setNewBacklog] = useState("");

  // Documents (URLs)
  const [resumeUrl, setResumeUrl] = useState("https://cloudinary.com/placement-resumes/test_resume.pdf");
  const [tenthMarksheetUrl, setTenthMarksheetUrl] = useState("https://cloudinary.com/marksheets/10th.png");
  const [twelfthMarksheetUrl, setTwelfthMarksheetUrl] = useState("https://cloudinary.com/marksheets/12th.png");

  useEffect(() => {
    fetchStudentSemester();
    fetchPlacementData();
  }, [token]);

  const fetchStudentSemester = async () => {
    try {
      const savedEmail = "student@ips.edu"; // fallback / extracted email
      const res = await fetch(`${backendUrl}/api/profile/${savedEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setStudentSemester(data.profile.semester || 6);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPlacementData = useCallback(async () => {
    setLoading(true);
    try {
      const savedEmail = "student@ips.edu";
      // Fetch registration status
      const regRes = await fetch(`${backendUrl}/api/placement/registration/${savedEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const regData = await regRes.json();
      if (regData.success && regData.registration) {
        const reg = regData.registration;
        setPlacementReg(reg);

        // Pre-fill form values
        setFullName(reg.personal?.fullName || "");
        setDob(reg.personal?.dob || "");
        setGender(reg.personal?.gender || "male");
        setPhone(reg.personal?.phone || "");
        setEmail(reg.personal?.email || "");

        // Address components
        setCurAddressLine(reg.personal?.currentAddress?.addressLine || "");
        setCurCity(reg.personal?.currentAddress?.city || "");
        setCurState(reg.personal?.currentAddress?.state || "");
        setCurPincode(reg.personal?.currentAddress?.pincode || "");

        setPermAddressLine(reg.personal?.permanentAddress?.addressLine || "");
        setPermCity(reg.personal?.permanentAddress?.city || "");
        setPermState(reg.personal?.permanentAddress?.state || "");
        setPermPincode(reg.personal?.permanentAddress?.pincode || "");
        
        setFatherName(reg.family?.fatherName || "");
        setFatherOccupation(reg.family?.fatherOccupation || "");
        setFatherContact(reg.family?.fatherContact || "");
        setMotherName(reg.family?.motherName || "");
        setMotherOccupation(reg.family?.motherOccupation || "");
        setMotherContact(reg.family?.motherContact || "");
        
        setApaarId(reg.identity?.apaarId || "");
        setPhotoUrl(reg.identity?.photoUrl || "");
        
        setTenthPercentage(reg.academic?.tenth?.percentage?.toString() || "");
        setTenthBoard(reg.academic?.tenth?.board || "");
        setTenthSchoolName(reg.academic?.tenth?.schoolName || "");
        setTenthYear(reg.academic?.tenth?.year?.toString() || "");
        setTwelfthPercentage(reg.academic?.twelfth?.percentage?.toString() || "");
        setTwelfthBoard(reg.academic?.twelfth?.board || "");
        setTwelfthSchoolName(reg.academic?.twelfth?.schoolName || "");
        setTwelfthYear(reg.academic?.twelfth?.year?.toString() || "");
        
        setGradDegree(reg.academic?.graduation?.degree || "");
        setGradUniversity(reg.academic?.graduation?.university || "");
        setGradCollege(reg.academic?.graduation?.college || "");
        setGradBranch(reg.academic?.graduation?.branch || "");
        setGradStartYear(reg.academic?.graduation?.startYear?.toString() || "");
        setGradExpectedGradYear(reg.academic?.graduation?.expectedGraduationYear?.toString() || "");
        
        setGradRollNumber(reg.academic?.rollNumber || "");
        setGradEnrollmentNumber(reg.academic?.enrollmentNumber || "");
        setIsRetryAttempt(!!reg.isRetryAttempt);

        const sgpas = reg.academic?.semesterSgpa || [];
        setSgpa1(sgpas.find((e: any) => e.semester === 1)?.sgpa?.toString() || "");
        setSgpa2(sgpas.find((e: any) => e.semester === 2)?.sgpa?.toString() || "");
        setSgpa3(sgpas.find((e: any) => e.semester === 3)?.sgpa?.toString() || "");
        setSgpa4(sgpas.find((e: any) => e.semester === 4)?.sgpa?.toString() || "");
        setSgpa5(sgpas.find((e: any) => e.semester === 5)?.sgpa?.toString() || "");
        
        setBacklogCount(reg.academic?.backlogCount?.toString() || "0");
        setBacklogHistory(reg.academic?.backlogHistory || []);

        setResumeUrl(reg.documents?.resumeUrl || "");
        setTenthMarksheetUrl(reg.documents?.tenthMarksheetUrl || "");
        setTwelfthMarksheetUrl(reg.documents?.twelfthMarksheetUrl || "");
      }

      // Fetch matched jobs
      const jobsRes = await fetch(`${backendUrl}/api/placement/jobs?studentEmail=${savedEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setJobs(jobsData.jobs);
      }
    } catch (err: any) {
      console.log('Error fetching placement data:', err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  const handleSavePlacementProfile = async (isDraft: boolean) => {
    if (!isDraft) {
      Alert.alert(
        'Confirm Submission',
        'Warning: After final submission, you will not be able to edit this registration. Do you want to submit and lock your profile?',
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
          email,
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
          apaarId,
          photoUrl
        },
        academic: {
          tenth: {
            percentage: parseFloat(tenthPercentage) || 0,
            board: tenthBoard,
            schoolName: tenthSchoolName,
            year: parseInt(tenthYear) || 0
          },
          twelfth: {
            percentage: parseFloat(twelfthPercentage) || 0,
            board: twelfthBoard,
            schoolName: twelfthSchoolName,
            year: parseInt(twelfthYear) || 0
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
            startYear: parseInt(gradStartYear) || 0,
            expectedGraduationYear: parseInt(gradExpectedGradYear) || 0,
            currentSemester: studentSemester
          },
          branch: gradBranch,
          rollNumber: gradRollNumber,
          enrollmentNumber: gradEnrollmentNumber,
          semesterSgpa,
          backlogCount: parseInt(backlogCount) || 0,
          backlogHistory
        },
        documents: {
          resumeUrl,
          tenthMarksheetUrl,
          twelfthMarksheetUrl,
          semesterMarksheets: semesterSgpa.map(s => ({ semester: s.semester, url: resumeUrl })) // reuse file URLs as mock semester marksheets
        }
      };

      const savedEmail = "student@ips.edu";
      const res = await fetch(`${backendUrl}/api/placement/registration/${savedEmail}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', isDraft ? 'Draft saved successfully!' : 'Placement Profile locked successfully!');
        fetchPlacementData();
      } else {
        Alert.alert('Failed', data.message || 'Validation failed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

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
        Alert.alert('Success', `Decision saved: ${decision}`);
        fetchPlacementData();
      } else {
        Alert.alert('Failed', data.message || 'Could not submit decision.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeNotification = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/placement/jobs/${jobId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Notification acknowledged.');
        fetchPlacementData();
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <ScrollView style={styles.card} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.cardTitle}>💼 Campus Placements Hub</Text>
      
      {/* Tabs segment */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'profile' && styles.tabActive]} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'drives' && styles.tabActive]} onPress={() => setActiveTab('drives')}>
          <Text style={[styles.tabText, activeTab === 'drives' && styles.tabTextActive]}>Matched Jobs ({jobs.length})</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 12 }} />}

      {/* Profile Form Tab */}
      {activeTab === 'profile' && (
        <View style={styles.formContainer}>
          {placementReg?.status === 'locked' ? (
            // Locked Read Only details
            <View style={styles.lockedCard}>
              <View style={styles.lockedHeader}>
                <Text style={styles.lockedName}>{placementReg.personal?.fullName}</Text>
                <Text style={styles.lockedSubtitle}>Branch: {placementReg.academic?.branch} | Roll: {placementReg.academic?.rollNumber}</Text>
                <Text style={styles.lockedStatus}>Registration Locked</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.cgpa?.toFixed(2)}</Text>
                  <Text style={styles.statLbl}>Calculated CGPA</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.backlogCount}</Text>
                  <Text style={styles.statLbl}>Backlogs</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{placementReg.academic?.overallEducationGap} Yrs</Text>
                  <Text style={styles.statLbl}>Edu Gap</Text>
                </View>
              </View>
              
              <Text style={styles.detailTitle}>Student Details</Text>
              <Text style={styles.detailText}>DOB: {placementReg.personal?.dob} | Gender: {placementReg.personal?.gender}</Text>
              <Text style={styles.detailText}>Mobile: {placementReg.personal?.phone}</Text>
              <Text style={styles.detailText}>Email: {placementReg.personal?.email}</Text>

              <Text style={styles.detailTitle}>Address Details</Text>
              <Text style={styles.detailText}>Current: {placementReg.personal?.currentAddress?.addressLine}, {placementReg.personal?.currentAddress?.city}, {placementReg.personal?.currentAddress?.state} - {placementReg.personal?.currentAddress?.pincode}</Text>
              <Text style={styles.detailText}>Permanent: {placementReg.personal?.permanentAddress?.addressLine}, {placementReg.personal?.permanentAddress?.city}, {placementReg.personal?.permanentAddress?.state} - {placementReg.personal?.permanentAddress?.pincode}</Text>

              <Text style={styles.detailTitle}>Family Information</Text>
              <Text style={styles.detailText}>Father's Name: {placementReg.family?.fatherName} ({placementReg.family?.fatherOccupation})</Text>
              <Text style={styles.detailText}>Father Contact: {placementReg.family?.fatherContact}</Text>
              <Text style={styles.detailText}>Mother's Name: {placementReg.family?.motherName} ({placementReg.family?.motherOccupation})</Text>
              <Text style={styles.detailText}>Mother Contact: {placementReg.family?.motherContact}</Text>

              <Text style={styles.detailTitle}>Academic History</Text>
              <Text style={styles.detailText}>10th: {placementReg.academic?.tenth?.schoolName} ({placementReg.academic?.tenth?.percentage}%, {placementReg.academic?.tenth?.year})</Text>
              <Text style={styles.detailText}>12th: {placementReg.academic?.twelfth?.schoolName} ({placementReg.academic?.twelfth?.percentage}%, {placementReg.academic?.twelfth?.year})</Text>
              <Text style={styles.detailText}>Graduation: {placementReg.academic?.graduation?.degree} in {placementReg.academic?.graduation?.branch}</Text>
              <Text style={styles.detailText}>College: {placementReg.academic?.graduation?.college}</Text>
              <Text style={styles.detailText}>APAAR ID: {placementReg.identity?.apaarId}</Text>
            </View>
          ) : (
            // Draft Edit form
            <View style={styles.fieldsBlock}>
              <Text style={styles.warningNote}>⚠ Once submitted, this profile will be permanently locked for matching.</Text>
              
              <Text style={styles.sectionLabel}>Personal Information</Text>
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
              <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
              <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <Text style={styles.sectionSubLabel}>Current Address</Text>
              <TextInput style={styles.input} placeholder="Address Line" value={curAddressLine} onChangeText={setCurAddressLine} />
              <TextInput style={styles.input} placeholder="City" value={curCity} onChangeText={setCurCity} />
              <TextInput style={styles.input} placeholder="State" value={curState} onChangeText={setCurState} />
              <TextInput style={styles.input} placeholder="Pincode" value={curPincode} onChangeText={setCurPincode} keyboardType="numeric" />

              <Text style={styles.sectionSubLabel}>Permanent Address</Text>
              <TextInput style={styles.input} placeholder="Address Line" value={permAddressLine} onChangeText={setPermAddressLine} />
              <TextInput style={styles.input} placeholder="City" value={permCity} onChangeText={setPermCity} />
              <TextInput style={styles.input} placeholder="State" value={permState} onChangeText={setPermState} />
              <TextInput style={styles.input} placeholder="Pincode" value={permPincode} onChangeText={setPermPincode} keyboardType="numeric" />

              <Text style={styles.sectionLabel}>Family Details</Text>
              <TextInput style={styles.input} placeholder="Father's Name" value={fatherName} onChangeText={setFatherName} />
              <TextInput style={styles.input} placeholder="Father's Occupation" value={fatherOccupation} onChangeText={setFatherOccupation} />
              <TextInput style={styles.input} placeholder="Father's Contact Number" value={fatherContact} onChangeText={setFatherContact} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Mother's Name" value={motherName} onChangeText={setMotherName} />
              <TextInput style={styles.input} placeholder="Mother's Occupation" value={motherOccupation} onChangeText={setMotherOccupation} />
              <TextInput style={styles.input} placeholder="Mother's Contact Number" value={motherContact} onChangeText={setMotherContact} keyboardType="phone-pad" />

              <Text style={styles.sectionLabel}>Identity</Text>
              <TextInput style={styles.input} placeholder="APAAR ID" value={apaarId} onChangeText={setApaarId} />

              <Text style={styles.sectionLabel}>Academics</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Retry Attempt (Uses Sem 1-4 only)</Text>
                <Switch value={isRetryAttempt} onValueChange={setIsRetryAttempt} thumbColor="#059669" trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }} />
              </View>

              <TextInput style={styles.input} placeholder="10th Percentage" value={tenthPercentage} onChangeText={setTenthPercentage} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="10th Board" value={tenthBoard} onChangeText={setTenthBoard} />
              <TextInput style={styles.input} placeholder="10th School Name" value={tenthSchoolName} onChangeText={setTenthSchoolName} />
              <TextInput style={styles.input} placeholder="10th Passing Year" value={tenthYear} onChangeText={setTenthYear} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="12th Percentage" value={twelfthPercentage} onChangeText={setTwelfthPercentage} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="12th Board" value={twelfthBoard} onChangeText={setTwelfthBoard} />
              <TextInput style={styles.input} placeholder="12th School Name" value={twelfthSchoolName} onChangeText={setTwelfthSchoolName} />
              <TextInput style={styles.input} placeholder="12th Passing Year" value={twelfthYear} onChangeText={setTwelfthYear} keyboardType="numeric" />
              
              <TextInput style={styles.input} placeholder="Graduation Degree" value={gradDegree} onChangeText={setGradDegree} />
              <TextInput style={styles.input} placeholder="Branch" value={gradBranch} onChangeText={setGradBranch} />
              <TextInput style={styles.input} placeholder="Roll Number" value={gradRollNumber} onChangeText={setGradRollNumber} />
              <TextInput style={styles.input} placeholder="Enrollment Number" value={gradEnrollmentNumber} onChangeText={setGradEnrollmentNumber} />
              
              <Text style={styles.sgpaLabel}>Semester SGPAs</Text>
              <View style={styles.sgpaRow}>
                <TextInput style={styles.sgpaInput} placeholder="S1" value={sgpa1} onChangeText={setSgpa1} keyboardType="numeric" />
                <TextInput style={styles.sgpaInput} placeholder="S2" value={sgpa2} onChangeText={setSgpa2} keyboardType="numeric" />
                <TextInput style={styles.sgpaInput} placeholder="S3" value={sgpa3} onChangeText={setSgpa3} keyboardType="numeric" />
                <TextInput style={styles.sgpaInput} placeholder="S4" value={sgpa4} onChangeText={setSgpa4} keyboardType="numeric" />
                {!isRetryAttempt && <TextInput style={styles.sgpaInput} placeholder="S5" value={sgpa5} onChangeText={setSgpa5} keyboardType="numeric" />}
              </View>

              <View style={styles.cgpaBox}>
                <Text style={styles.cgpaTitle}>Derived CGPA (Read-only): {calculateFrontendCgpa().toFixed(2)}</Text>
              </View>

              <TextInput style={styles.input} placeholder="Current Backlogs Count" value={backlogCount} onChangeText={setBacklogCount} keyboardType="numeric" />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.draftBtn} onPress={() => handleSavePlacementProfile(true)}>
                  <Text style={styles.draftBtnText}>Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={() => handleSavePlacementProfile(false)}>
                  <Text style={styles.submitBtnText}>Submit & Lock</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Drives tab list view */}
      {activeTab === 'drives' && (
        <View style={styles.drivesContainer}>
          {jobs.length === 0 ? (
            <Text style={styles.emptyText}>No placement matched openings found. Complete registration first.</Text>
          ) : (
            jobs.map((match) => {
              const applied = match.studentDecision === 'applied';
              const deadlinePassed = new Date() > new Date(match.jobPostingId.applicationDeadline);
              return (
                <View key={match._id} style={[styles.jobCard, !match.isEligible && styles.jobCardIneligible]}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobCompany}>{match.jobPostingId.companyName}</Text>
                    <Text style={[styles.matchBadge, !match.isEligible && styles.matchBadgeIneligible]}>
                      {match.isEligible ? 'Eligible' : 'Ineligible'}
                    </Text>
                  </View>
                  <Text style={styles.jobTitle}>{match.jobPostingId.role}</Text>
                  <Text style={styles.jobDesc}>{match.jobPostingId.description}</Text>
                  <Text style={styles.deadlineTxt}>Deadline: {new Date(match.jobPostingId.applicationDeadline).toLocaleDateString()}</Text>

                  {/* ineligible failed conditions */}
                  {!match.isEligible && (
                    <View style={styles.failedContainer}>
                      <Text style={styles.failedTitle}>Failed Requirements:</Text>
                      {match.failedConditions.map((cond: any, idx: number) => (
                        <Text key={idx} style={styles.failedText}>• {cond.message}</Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.decisionPanel}>
                    {match.isEligible ? (
                      <>
                        {applied ? (
                          <Text style={styles.appliedLabel}>Applied successfully</Text>
                        ) : match.studentDecision === 'no-apply' ? (
                          <Text style={styles.optedOutLabel}>Opted Out</Text>
                        ) : deadlinePassed ? (
                          <Text style={styles.optedOutLabel}>Deadline Passed</Text>
                        ) : (
                          <View style={styles.btnGroup}>
                            <TouchableOpacity style={styles.noApplyBtn} onPress={() => handleStudentDecision(match.jobPostingId._id, 'no-apply')}>
                              <Text style={styles.noApplyText}>No Apply</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyActionBtn} onPress={() => handleStudentDecision(match.jobPostingId._id, 'applied')}>
                              <Text style={styles.applyActionText}>Apply</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        {match.studentDecision === 'not-applicable' ? (
                          <Text style={styles.acknowledgedLabel}>Acknowledged</Text>
                        ) : (
                          <TouchableOpacity style={styles.ackBtn} onPress={() => handleAcknowledgeNotification(match.jobPostingId._id)}>
                            <Text style={styles.ackBtnText}>Acknowledge / OK</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: Spacing.three,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: Spacing.four,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#047857',
  },
  formContainer: {
    spaceY: 12,
  },
  lockedCard: {
    backgroundColor: '#FAFDFB',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  lockedHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4EA',
    paddingBottom: Spacing.two,
    marginBottom: Spacing.three,
  },
  lockedName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064E3B',
  },
  lockedSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  lockedStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: Spacing.four,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#374151',
  },
  statLbl: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  detailText: {
    fontSize: 11,
    color: '#4B5563',
    marginVertical: 1,
  },
  fieldsBlock: {
    spaceY: 10,
  },
  warningNote: {
    fontSize: 11,
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '950',
    color: '#064E3B',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
  },
  sectionSubLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.two,
    backgroundColor: '#FAFDFB',
    borderColor: '#E6F4EA',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  sgpaLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  sgpaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.three,
  },
  sgpaInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    fontSize: 11,
    textAlign: 'center',
  },
  cgpaBox: {
    backgroundColor: '#E6F4EA',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  cgpaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.three,
  },
  draftBtn: {
    flex: 1,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  draftBtnText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#047857',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  drivesContainer: {
    spaceY: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  jobCard: {
    backgroundColor: '#F4FBF7',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  jobCardIneligible: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobCompany: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  matchBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  matchBadgeIneligible: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
    marginVertical: 2,
  },
  jobDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  deadlineTxt: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  failedContainer: {
    marginTop: 10,
    backgroundColor: '#FFF',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  failedTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  failedText: {
    fontSize: 11,
    color: '#4B5563',
    marginVertical: 1,
  },
  decisionPanel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 12,
    alignItems: 'flex-end',
  },
  appliedLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
  },
  optedOutLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  acknowledgedLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  noApplyBtn: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  noApplyText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: 'bold',
  },
  applyActionBtn: {
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  applyActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ackBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  ackBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
