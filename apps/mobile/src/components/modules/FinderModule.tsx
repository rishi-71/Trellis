import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal
} from 'react-native';

interface LocationItem {
  _id: string;
  name: string;
  category: string;
  building: string;
  floor: number;
  roomNumber?: string;
  wing?: string;
  description?: string;
  distFromGate: number; // Exact meters along campus avenue from Gate 2
}

interface StartLocation {
  id: string;
  name: string;
  sub: string;
  distFromGate: number;
}

// Campus Landmarks & B.Tech Block B Destination Registry
const CAMPUS_LOCATIONS: LocationItem[] = [
  // Avenue Outdoor Landmarks
  {
    _id: 'loc-arch',
    name: 'Architecture Building',
    category: 'classroom',
    building: 'Campus Avenue',
    floor: 0,
    distFromGate: 130,
    description: 'Architecture department building situated 130m from Gate No. 2 on the left.'
  },
  {
    _id: 'loc-parking',
    name: 'Vehicle Parking Area',
    category: 'parking',
    building: 'Campus Avenue',
    floor: 0,
    distFromGate: 220,
    description: 'Designated two-wheeler and four-wheeler parking zone (220m from Gate No. 2).'
  },
  {
    _id: 'loc-block-b-main',
    name: 'B.Tech Building (Block B Entrance)',
    category: 'other',
    building: 'B.Tech Block B',
    floor: 0,
    distFromGate: 300,
    description: 'Main ground floor foyer and entrance to B.Tech Building Block B.'
  },

  // B.Tech Block B Ground Floor
  {
    _id: 'b-g-auditorium',
    name: 'Main Auditorium & Seminar Hall',
    category: 'classroom',
    building: 'B.Tech Block B',
    floor: 0,
    roomNumber: 'G-01',
    wing: 'Central Wing',
    distFromGate: 315,
    description: 'Ground floor main auditorium for academic conclaves, orientations, and technical summits.'
  },
  {
    _id: 'b-g-printer',
    name: 'Central Printer & Reprographics Center',
    category: 'printer',
    building: 'B.Tech Block B',
    floor: 0,
    roomNumber: 'G-04',
    wing: 'East Wing',
    distFromGate: 315,
    description: 'Photocopying, spiral binding, and document printing facility on the ground floor.'
  },
  {
    _id: 'b-g-admin',
    name: 'Administrative & Accounts Desk',
    category: 'other',
    building: 'B.Tech Block B',
    floor: 0,
    roomNumber: 'G-08',
    wing: 'West Wing',
    distFromGate: 315,
    description: 'Fee collection, document submissions, and administrative support counters.'
  },

  // 1st Floor
  {
    _id: 'b-1-n101',
    name: 'Room N-101 (Basic Sciences Lecture)',
    category: 'classroom',
    building: 'B.Tech Block B',
    floor: 1,
    roomNumber: 'N-101',
    wing: 'North Wing',
    distFromGate: 330,
    description: '1st Floor lecture hall for engineering physics, mathematics, and foundation subjects.'
  },
  {
    _id: 'b-1-lab1',
    name: 'Computer Lab 1 (High Performance Lab)',
    category: 'lab',
    building: 'B.Tech Block B',
    floor: 1,
    roomNumber: 'N-104',
    wing: 'North Wing',
    distFromGate: 330,
    description: 'State-of-the-art coding workstation lab for algorithms, databases, and OS practicals.'
  },
  {
    _id: 'b-1-chem',
    name: 'Applied Chemistry Lab',
    category: 'lab',
    building: 'B.Tech Block B',
    floor: 1,
    roomNumber: 'N-108',
    wing: 'South Wing',
    distFromGate: 330,
    description: 'Practical lab for engineering chemistry and material sciences.'
  },

  // 2nd Floor
  {
    _id: 'b-2-n204',
    name: 'Room N-204 (CSE Core Lecture Hall)',
    category: 'classroom',
    building: 'B.Tech Block B',
    floor: 2,
    roomNumber: 'N-204',
    wing: 'North Wing',
    distFromGate: 345,
    description: '2nd Floor primary lecture hall for Computer Science & Engineering degree batches.'
  },
  {
    _id: 'b-2-placement',
    name: 'Training & Placement Cell (T&P Desk)',
    category: 'other',
    building: 'B.Tech Block B',
    floor: 2,
    roomNumber: 'N-205',
    wing: 'East Wing',
    distFromGate: 345,
    description: 'Campus placement coordination, interview cabins, and recruitment drive office.'
  },
  {
    _id: 'b-2-hod',
    name: 'Cabin B-201 (HOD CSE - Dr. Sanjay Kumar)',
    category: 'faculty-cabin',
    building: 'B.Tech Block B',
    floor: 2,
    roomNumber: 'B-201',
    wing: 'West Wing',
    distFromGate: 345,
    description: 'Office cabin of Head of Computer Science & Engineering Department.'
  },
  {
    _id: 'b-2-sharma',
    name: 'Cabin B-202 (Senior Faculty - Prof. Ritesh Sharma)',
    category: 'faculty-cabin',
    building: 'B.Tech Block B',
    floor: 2,
    roomNumber: 'B-202',
    wing: 'West Wing',
    distFromGate: 345,
    description: 'Senior Professor & Project Coordinator cabin, Block B 2nd floor.'
  },

  // 3rd Floor
  {
    _id: 'b-3-n301',
    name: 'AI & Machine Learning Innovation Lab',
    category: 'lab',
    building: 'B.Tech Block B',
    floor: 3,
    roomNumber: 'N-301',
    wing: 'North Wing',
    distFromGate: 360,
    description: 'Advanced GPU computing and artificial intelligence project development facility.'
  },
  {
    _id: 'b-3-n304',
    name: 'Room N-304 (Information Tech Lecture)',
    category: 'classroom',
    building: 'B.Tech Block B',
    floor: 3,
    roomNumber: 'N-304',
    wing: 'South Wing',
    distFromGate: 360,
    description: '3rd Floor lecture hall for IT and Software Engineering subjects.'
  },

  // 4th Floor
  {
    _id: 'b-4-library',
    name: 'Central Library & Silent Reading Room',
    category: 'library',
    building: 'B.Tech Block B',
    floor: 4,
    roomNumber: 'N-401',
    wing: 'Central Wing',
    distFromGate: 375,
    description: 'Silent reading hall, research periodicals, and textbook issue counters.'
  },
  {
    _id: 'b-4-studentsec',
    name: 'Student Section & Academic Affairs Desk',
    category: 'other',
    building: 'B.Tech Block B',
    floor: 4,
    roomNumber: 'N-408',
    wing: 'East Wing',
    distFromGate: 375,
    description: 'Enrollment verification, semester marksheets, certificates, and scholar support.'
  }
];

// Available Start Positions along Avenue
const START_POSITIONS: StartLocation[] = [
  { id: 'gate-2', name: 'IPS Academy Gate No. 2', sub: 'Main Campus Entrance (0m)', distFromGate: 0 },
  { id: 'arch', name: 'Architecture Building', sub: '130m along central avenue', distFromGate: 130 },
  { id: 'parking', name: 'Vehicle Parking Area', sub: '220m along central avenue', distFromGate: 220 },
  { id: 'block-b', name: 'B.Tech Building (Block B Entrance)', sub: '300m mark at main entrance', distFromGate: 300 }
];

interface Waypoint {
  name: string;
  distOnRoute: number; // 0 to totalDistance
  isEnd?: boolean;
}

interface FinderProps {
  token: string;
  backendUrl: string;
}

export default function FinderModule({ token, backendUrl }: FinderProps) {
  // Navigation View Mode: 'navigator' | 'directory'
  const [activeView, setActiveView] = useState<'navigator' | 'directory'>('navigator');

  // Start Location (Default Gate No. 2)
  const [startLoc, setStartLoc] = useState<StartLocation>(START_POSITIONS[0]);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Destination (Null initially - completely clean until user chooses!)
  const [destLoc, setDestLoc] = useState<LocationItem | null>(null);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);

  // Route State (Calculated strictly when destLoc is selected)
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDirections, setRouteDirections] = useState<string[]>([]);
  const [showStepsList, setShowStepsList] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Live Navigation State (Google Maps Experience)
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0); // 0% to 100%
  const [isNavPlaying, setIsNavPlaying] = useState(true);
  const [navSpeed, setNavSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Floor Directory state (Only visible when user chooses to view it)
  const [selectedFloor, setSelectedFloor] = useState<number>(2);

  // Dynamic Route Calculation
  const calculateRoute = (start: StartLocation, dest: LocationItem) => {
    setLoadingRoute(true);
    setIsLiveNavigating(false);
    setNavProgress(0);

    const sDist = start.distFromGate;
    const dDist = dest.distFromGate;

    // Total distance along route
    const totalDist = Math.abs(dDist - sDist);
    setRouteDistance(totalDist === 0 ? 15 : totalDist);

    // Build step-by-step directions based strictly on start and dest
    const steps: string[] = [];

    if (sDist === 0) {
      steps.push(`Start at ${start.name}. Head south along the central campus avenue.`);
      if (dDist >= 130) {
        steps.push('Walk 130m straight passing Architecture Building on your left.');
      }
      if (dDist >= 220) {
        steps.push('Continue straight for 90m past Vehicle Parking Area on your right.');
      }
      if (dDist >= 300) {
        steps.push('Walk 80m forward to reach B.Tech Building Block B Main Entrance (300m mark).');
      }
    } else {
      steps.push(`Start at ${start.name}. Proceed towards ${dest.name}.`);
      if (sDist < 220 && dDist >= 220) {
        steps.push(`Walk forward ${220 - sDist}m past Vehicle Parking Area.`);
      }
      if (sDist < 300 && dDist >= 300) {
        steps.push(`Continue forward to B.Tech Building Block B Entrance.`);
      }
    }

    // Indoor building navigation
    if (dest.building === 'B.Tech Block B') {
      steps.push('Enter through Block B ground floor lobby and proceed to the Central Staircase.');
      if (dest.floor === 0) {
        steps.push(`Stay on Ground Floor. Proceed down ${dest.wing || 'main corridor'}.`);
      } else {
        steps.push(`Take stairs or elevator up to Floor ${dest.floor}.`);
        steps.push(`Exit into the ${dest.wing || 'hallway'}.`);
      }
      steps.push(`Arrive at ${dest.roomNumber ? `[${dest.roomNumber}] ` : ''}${dest.name}.`);
    } else {
      steps.push(`Arrive at ${dest.name} (${totalDist}m walk).`);
    }

    setRouteDirections(steps);
    setLoadingRoute(false);
  };

  // Dynamic Waypoints along ONLY the selected route
  const dynamicWaypoints: Waypoint[] = useMemo(() => {
    if (!destLoc) return [];

    const sDist = startLoc.distFromGate;
    const dDist = destLoc.distFromGate;
    const totalD = Math.max(15, Math.abs(dDist - sDist));

    // Avenue intermediate landmarks
    const avenueLandmarks = [
      { name: 'Gate 2', dist: 0 },
      { name: 'Arch Bldg', dist: 130 },
      { name: 'Parking', dist: 220 },
      { name: 'Block B', dist: 300 }
    ];

    const minD = Math.min(sDist, dDist);
    const maxD = Math.max(sDist, dDist);

    const waypoints: Waypoint[] = [];

    // 1. Start point (0m on route)
    waypoints.push({
      name: startLoc.name.split('(')[0].replace('IPS Academy ', '').trim(),
      distOnRoute: 0
    });

    // 2. Intermediates strictly between start and dest
    avenueLandmarks.forEach((lm) => {
      if (lm.dist > minD && lm.dist < maxD) {
        waypoints.push({
          name: lm.name,
          distOnRoute: lm.dist - minD
        });
      }
    });

    // 3. Destination point (totalD on route)
    waypoints.push({
      name: destLoc.roomNumber ? destLoc.roomNumber : destLoc.name.split('(')[0].trim(),
      distOnRoute: totalD,
      isEnd: true
    });

    return waypoints;
  }, [startLoc, destLoc]);

  // Live Simulation Timer
  useEffect(() => {
    if (!isLiveNavigating || !isNavPlaying) return;

    const interval = setInterval(() => {
      setNavProgress((prev) => {
        const step = 0.5 * navSpeed;
        if (prev + step >= 100) {
          setIsNavPlaying(false);
          return 100;
        }
        return prev + step;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLiveNavigating, isNavPlaying, navSpeed]);

  // Update current step index based on progress
  useEffect(() => {
    if (routeDirections.length === 0) return;
    const count = routeDirections.length;
    const idx = Math.min(count - 1, Math.floor((navProgress / 100) * count));
    setCurrentStepIndex(idx);
  }, [navProgress, routeDirections]);

  // Real-time meters
  const walkedMeters = Math.round((navProgress / 100) * routeDistance);
  const remainingMeters = Math.max(0, routeDistance - walkedMeters);
  const etaMins = Math.max(1, Math.round(remainingMeters / 75));

  // Destination Search Filter
  const filteredDestinations = useMemo(() => {
    if (!destSearchQuery.trim()) return CAMPUS_LOCATIONS;
    const q = destSearchQuery.toLowerCase();
    return CAMPUS_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.roomNumber && l.roomNumber.toLowerCase().includes(q)) ||
        l.category.toLowerCase().includes(q) ||
        (l.wing && l.wing.toLowerCase().includes(q))
    );
  }, [destSearchQuery]);

  // Rooms on active floor for the Directory tab
  const floorRooms = useMemo(() => {
    return CAMPUS_LOCATIONS.filter(
      (l) => l.building === 'B.Tech Block B' && l.floor === selectedFloor
    );
  }, [selectedFloor]);

  const selectDestination = (item: LocationItem) => {
    setDestLoc(item);
    setIsDestModalOpen(false);
    calculateRoute(startLoc, item);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'classroom':
        return '#2563EB';
      case 'lab':
        return '#9333EA';
      case 'library':
        return '#D97706';
      case 'faculty-cabin':
        return '#4F46E5';
      case 'parking':
        return '#059669';
      default:
        return '#4B5563';
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= CLEAN MINIMAL HEADER ================= */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>📍 Campus Finder</Text>
          <Text style={styles.headerSubtitle}>IPS Academy Indore • Campus Navigation</Text>
        </View>

        {/* View Switcher Pill */}
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, activeView === 'navigator' && styles.viewToggleBtnActive]}
            onPress={() => setActiveView('navigator')}
          >
            <Text style={[styles.viewToggleText, activeView === 'navigator' && styles.viewToggleTextActive]}>
              🧭 Navigate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, activeView === 'directory' && styles.viewToggleBtnActive]}
            onPress={() => setActiveView('directory')}
          >
            <Text style={[styles.viewToggleText, activeView === 'directory' && styles.viewToggleTextActive]}>
              🏢 Floor Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= MODE 1: CLEAN ROUTE NAVIGATOR ================= */}
      {activeView === 'navigator' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Google Maps Style Clean Search Box */}
          <View style={styles.searchCard}>
            {/* Start Location Input */}
            <TouchableOpacity
              style={styles.searchRow}
              onPress={() => setIsStartModalOpen(true)}
            >
              <View style={styles.startDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.searchLabel}>Your Location</Text>
                <Text style={styles.searchValue} numberOfLines={1}>
                  {startLoc.name}
                </Text>
              </View>
              <Text style={styles.searchArrow}>▼</Text>
            </TouchableOpacity>

            <View style={styles.searchDivider} />

            {/* Destination Input (Where to?) */}
            <TouchableOpacity
              style={styles.searchRow}
              onPress={() => setIsDestModalOpen(true)}
            >
              <View style={styles.destDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.searchLabel}>Destination</Text>
                <Text
                  style={[
                    styles.searchValue,
                    !destLoc && { color: '#94A3B8', fontWeight: '500' }
                  ]}
                  numberOfLines={1}
                >
                  {destLoc ? `${destLoc.roomNumber ? `[${destLoc.roomNumber}] ` : ''}${destLoc.name}` : 'Where to? Search rooms, labs, parking...'}
                </Text>
              </View>
              {destLoc ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setDestLoc(null);
                    setIsLiveNavigating(false);
                    setRouteDistance(0);
                  }}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.searchIcon}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Categories Bar (Clean Icons) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickBar}>
            {[
              { label: 'Room N-204', room: CAMPUS_LOCATIONS[9] },
              { label: 'Vehicle Parking', room: CAMPUS_LOCATIONS[1] },
              { label: 'Central Library', room: CAMPUS_LOCATIONS[14] },
              { label: 'Computer Lab 1', room: CAMPUS_LOCATIONS[7] },
              { label: 'Placement Cell', room: CAMPUS_LOCATIONS[10] },
              { label: 'HOD CSE Cabin', room: CAMPUS_LOCATIONS[11] }
            ].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.categoryPill,
                  destLoc?._id === chip.room._id && styles.categoryPillActive
                ]}
                onPress={() => selectDestination(chip.room)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    destLoc?._id === chip.room._id && styles.categoryPillTextActive
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt when nothing is selected yet */}
          {!destLoc && (
            <View style={styles.emptyPromptBox}>
              <Text style={styles.emptyPromptIcon}>🚶</Text>
              <Text style={styles.emptyPromptTitle}>Ready to navigate</Text>
              <Text style={styles.emptyPromptSub}>
                Choose your destination above or tap a popular spot to calculate your route.
              </Text>
            </View>
          )}

          {/* ================= ROUTE SUMMARY (Appears ONLY when Destination Selected) ================= */}
          {destLoc && !isLiveNavigating && (
            <View style={styles.routeCard}>
              <View style={styles.routeTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeDestName} numberOfLines={1}>
                    {destLoc.roomNumber ? `[${destLoc.roomNumber}] ` : ''}{destLoc.name}
                  </Text>
                  <Text style={styles.routeSub}>
                    {destLoc.building} • {destLoc.floor === 0 ? 'Ground Floor' : `Floor ${destLoc.floor}`}
                  </Text>
                </View>

                {/* Distance & ETA */}
                <View style={styles.etaBadge}>
                  <Text style={styles.etaTime}>{Math.max(1, Math.round(routeDistance / 75))} min</Text>
                  <Text style={styles.etaDist}>{routeDistance} m walk</Text>
                </View>
              </View>

              {/* Action Buttons: Start Navigation & Toggle Steps */}
              <View style={styles.routeActionRow}>
                <TouchableOpacity
                  style={styles.startNavBtn}
                  onPress={() => {
                    setIsLiveNavigating(true);
                    setNavProgress(0);
                    setIsNavPlaying(true);
                  }}
                >
                  <Text style={styles.startNavBtnText}>▶️ Start Navigation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stepsToggleBtn}
                  onPress={() => setShowStepsList(!showStepsList)}
                >
                  <Text style={styles.stepsToggleText}>
                    {showStepsList ? 'Hide Steps' : 'View Steps'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Turn-by-Turn Steps (Only visible when user toggles "View Steps") */}
              {showStepsList && (
                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsHeading}>Directions ({routeDirections.length} steps):</Text>
                  {routeDirections.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepItemText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ================= GOOGLE MAPS STYLE LIVE NAVIGATION ================= */}
          {destLoc && isLiveNavigating && (
            <View style={styles.liveNavBox}>
              {/* Top Green Maneuver Banner */}
              <View style={styles.maneuverBanner}>
                <View style={styles.maneuverIconBox}>
                  <Text style={styles.maneuverIconText}>
                    {navProgress >= 100
                      ? '🎯'
                      : currentStepIndex >= routeDirections.length - 2
                      ? '🪜'
                      : '⬆️'}
                  </Text>
                </View>

                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={styles.maneuverStepCounter}>
                    {navProgress >= 100
                      ? 'ARRIVED'
                      : `STEP ${currentStepIndex + 1} OF ${routeDirections.length}`}
                  </Text>
                  <Text style={styles.maneuverInstruction} numberOfLines={2}>
                    {routeDirections[currentStepIndex] || 'Proceed along route'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.exitBtn}
                  onPress={() => setIsLiveNavigating(false)}
                >
                  <Text style={styles.exitBtnText}>✕ Exit</Text>
                </TouchableOpacity>
              </View>

              {/* Visual Avenue Track (100% Dynamic - Ends strictly at selected destination!) */}
              <View style={styles.trackSection}>
                <View style={styles.trackHeader}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.trackHeaderText}>ACTIVE WALK TRACK</Text>
                  <Text style={styles.trackProgressMeters}>
                    {walkedMeters}m / {routeDistance}m
                  </Text>
                </View>

                {/* Road Track with Moving Puck */}
                <View style={styles.roadTrack}>
                  <View
                    style={[
                      styles.roadFill,
                      { width: `${Math.min(100, Math.max(0, navProgress))}%` }
                    ]}
                  />

                  {/* Puck */}
                  <View
                    style={[
                      styles.puck,
                      { left: `${Math.min(94, Math.max(3, navProgress))}%` }
                    ]}
                  >
                    <View style={styles.puckRing} />
                    <View style={styles.puckDot}>
                      <Text style={styles.puckArrow}>▲</Text>
                    </View>
                  </View>
                </View>

                {/* Dynamic Waypoints along ONLY this route */}
                <View style={styles.waypointsRow}>
                  {dynamicWaypoints.map((wp, idx) => {
                    const isPassed =
                      (navProgress / 100) * routeDistance >= wp.distOnRoute - 10;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.wpItem,
                          idx === 0 && { alignItems: 'flex-start' },
                          idx === dynamicWaypoints.length - 1 && { alignItems: 'flex-end' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.wpName,
                            isPassed && styles.wpNamePassed,
                            wp.isEnd && styles.wpNameEnd
                          ]}
                          numberOfLines={1}
                        >
                          {wp.isEnd ? `🎯 ${wp.name}` : wp.name}
                        </Text>
                        <Text style={styles.wpDist}>{wp.distOnRoute}m</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Milestone Announcement */}
                <View style={styles.announcementCard}>
                  <Text style={styles.announcementText}>
                    {navProgress >= 100
                      ? `🎉 Arrived at destination: ${destLoc.name}!`
                      : `🚶 Heading towards ${destLoc.name} (${remainingMeters}m remaining)`}
                  </Text>
                </View>
              </View>

              {/* Bottom HUD Bar */}
              <View style={styles.hudFooter}>
                <View>
                  <Text style={styles.hudTime}>{etaMins} min</Text>
                  <Text style={styles.hudSub}>
                    {remainingMeters}m remaining • {Math.round(navProgress)}%
                  </Text>
                </View>

                <View style={styles.hudControls}>
                  <TouchableOpacity
                    style={styles.hudPlayBtn}
                    onPress={() => setIsNavPlaying(!isNavPlaying)}
                  >
                    <Text style={styles.hudPlayText}>
                      {isNavPlaying ? '⏸️ Pause' : '▶️ Resume'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hudRestartBtn}
                    onPress={() => {
                      setNavProgress(0);
                      setIsNavPlaying(true);
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>🔄</Text>
                  </TouchableOpacity>

                  <View style={styles.speedGroup}>
                    {[1, 2, 5].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.speedBtn, navSpeed === s && styles.speedBtnActive]}
                        onPress={() => setNavSpeed(s)}
                      >
                        <Text style={[styles.speedText, navSpeed === s && styles.speedTextActive]}>
                          {s}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ================= MODE 2: B.TECH BLOCK B FLOOR PLANS (On-Demand) ================= */}
      {activeView === 'directory' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.directoryCard}>
            <Text style={styles.dirTitle}>B.Tech Building (Block B) Floor Plans</Text>
            <Text style={styles.dirSub}>
              Select a floor below to browse classrooms and labs. Tap any room to navigate directly.
            </Text>

            {/* Floor Switcher Tabs */}
            <View style={styles.floorTabsRow}>
              {[
                { floor: 0, label: 'Ground' },
                { floor: 1, label: 'Floor 1' },
                { floor: 2, label: 'Floor 2' },
                { floor: 3, label: 'Floor 3' },
                { floor: 4, label: 'Floor 4' }
              ].map((fl) => (
                <TouchableOpacity
                  key={fl.floor}
                  style={[
                    styles.floorTab,
                    selectedFloor === fl.floor && styles.floorTabActive
                  ]}
                  onPress={() => setSelectedFloor(fl.floor)}
                >
                  <Text
                    style={[
                      styles.floorTabText,
                      selectedFloor === fl.floor && styles.floorTabTextActive
                    ]}
                  >
                    {fl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rooms on this Floor */}
            <Text style={styles.roomsListHeader}>
              Rooms on Floor {selectedFloor === 0 ? 'Ground' : selectedFloor} ({floorRooms.length})
            </Text>

            {floorRooms.map((room) => (
              <View key={room._id} style={styles.roomItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {room.roomNumber && (
                      <View style={styles.roomNumberPill}>
                        <Text style={styles.roomNumberPillText}>{room.roomNumber}</Text>
                      </View>
                    )}
                    <Text style={styles.roomItemTitle} numberOfLines={1}>
                      {room.name}
                    </Text>
                  </View>
                  <Text style={styles.roomItemSub}>
                    {room.wing || 'Block B'} • {room.category.toUpperCase()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.roomNavBtn}
                  onPress={() => {
                    setActiveView('navigator');
                    selectDestination(room);
                  }}
                >
                  <Text style={styles.roomNavBtnText}>🧭 Route</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ================= MODAL: START POINT SELECTOR ================= */}
      <Modal visible={isStartModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Starting Location</Text>
              <TouchableOpacity onPress={() => setIsStartModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {START_POSITIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionRow,
                  startLoc.id === opt.id && styles.optionRowActive
                ]}
                onPress={() => {
                  setStartLoc(opt);
                  setIsStartModalOpen(false);
                  if (destLoc) calculateRoute(opt, destLoc);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{opt.name}</Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </View>
                {startLoc.id === opt.id && <Text style={{ color: '#059669' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: DESTINATION SEARCH & SELECT ================= */}
      <Modal visible={isDestModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Destination</Text>
              <TouchableOpacity onPress={() => setIsDestModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search Room N-204, Parking, Library..."
              placeholderTextColor="#94A3B8"
              value={destSearchQuery}
              onChangeText={setDestSearchQuery}
              autoFocus
            />

            <ScrollView style={{ maxHeight: 380 }}>
              {filteredDestinations.map((loc) => {
                const isSelected = destLoc?._id === loc._id;
                const catColor = getCategoryColor(loc.category);

                return (
                  <TouchableOpacity
                    key={loc._id}
                    style={[
                      styles.destOptionRow,
                      isSelected && styles.destOptionRowActive
                    ]}
                    onPress={() => selectDestination(loc)}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {loc.roomNumber && (
                          <View style={styles.roomTag}>
                            <Text style={styles.roomTagText}>{loc.roomNumber}</Text>
                          </View>
                        )}
                        <Text style={styles.destOptionTitle} numberOfLines={1}>
                          {loc.name}
                        </Text>
                      </View>
                      <Text style={styles.destOptionSub}>
                        {loc.building} • {loc.distFromGate}m from Gate 2
                      </Text>
                    </View>

                    <View style={[styles.catTag, { backgroundColor: `${catColor}15` }]}>
                      <Text style={[styles.catTagText, { color: catColor }]}>
                        {loc.category.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2
  },
  viewToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  viewToggleBtnActive: {
    backgroundColor: '#059669'
  },
  viewToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  viewToggleTextActive: {
    color: '#FFF',
    fontWeight: '800'
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },

  // Google Maps Style Search Card
  searchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginRight: 10
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    marginRight: 10
  },
  searchLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase'
  },
  searchValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1
  },
  searchArrow: {
    fontSize: 11,
    color: '#94A3B8'
  },
  searchIcon: {
    fontSize: 14
  },
  clearBtn: {
    padding: 4
  },
  clearBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700'
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginLeft: 20
  },

  // Quick Chips
  quickBar: {
    flexDirection: 'row',
    marginBottom: 16
  },
  categoryPill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981'
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  categoryPillTextActive: {
    color: '#065F46',
    fontWeight: '800'
  },

  // Empty Prompt
  emptyPromptBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyPromptIcon: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155'
  },
  emptyPromptSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16
  },

  // Route Summary Card
  routeCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  routeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14
  },
  routeDestName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A'
  },
  routeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  etaBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  etaTime: {
    fontSize: 14,
    fontWeight: '900',
    color: '#065F46'
  },
  etaDist: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857'
  },
  routeActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  startNavBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  startNavBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800'
  },
  stepsToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  stepsToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },

  // Steps List
  stepsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  stepsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  stepNumberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155'
  },
  stepItemText: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 16
  },

  // ================= GOOGLE MAPS STYLE LIVE NAV =================
  liveNavBox: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  maneuverBanner: {
    backgroundColor: '#065F46',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  maneuverIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981'
  },
  maneuverIconText: {
    fontSize: 22,
    color: '#FFF'
  },
  maneuverStepCounter: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.5
  },
  maneuverInstruction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 17,
    marginTop: 1
  },
  exitBtn: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  exitBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },

  trackSection: {
    padding: 14
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  trackHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8'
  },
  trackProgressMeters: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981'
  },
  roadTrack: {
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    position: 'relative',
    marginVertical: 10
  },
  roadFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5
  },
  puck: {
    position: 'absolute',
    top: -6,
    marginLeft: -11,
    alignItems: 'center'
  },
  puckRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    top: 0
  },
  puckDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  puckArrow: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900'
  },
  waypointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  wpItem: {
    alignItems: 'center'
  },
  wpName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B'
  },
  wpNamePassed: {
    color: '#10B981'
  },
  wpNameEnd: {
    color: '#F59E0B',
    fontWeight: '900'
  },
  wpDist: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1
  },
  announcementCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    marginTop: 12
  },
  announcementText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center'
  },

  // HUD Footer
  hudFooter: {
    backgroundColor: '#090D16',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  hudTime: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981'
  },
  hudSub: {
    fontSize: 10,
    color: '#94A3B8'
  },
  hudControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  hudPlayBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  hudPlayText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },
  hudRestartBtn: {
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 8
  },
  speedGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 2
  },
  speedBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4
  },
  speedBtnActive: {
    backgroundColor: '#059669'
  },
  speedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8'
  },
  speedTextActive: {
    color: '#FFF'
  },

  // ================= FLOOR DIRECTORY =================
  directoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  dirTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A'
  },
  dirSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 15
  },
  floorTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14
  },
  floorTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  floorTabActive: {
    backgroundColor: '#059669'
  },
  floorTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  floorTabTextActive: {
    color: '#FFF',
    fontWeight: '800'
  },
  roomsListHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  roomNumberPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  roomNumberPillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900'
  },
  roomItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A'
  },
  roomItemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1
  },
  roomNavBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  roomNavBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: '60%'
  },
  modalContentLarge: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A'
  },
  modalCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '800'
  },
  modalSearchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 10
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  optionRowActive: {
    backgroundColor: '#ECFDF5'
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  destOptionRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  destOptionRowActive: {
    backgroundColor: '#ECFDF5'
  },
  destOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  destOptionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1
  },
  roomTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  roomTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900'
  },
  catTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  catTagText: {
    fontSize: 8,
    fontWeight: '900'
  }
});
