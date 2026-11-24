import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  FlatList,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { businessWorkApi, accessRequestApi } from '../../services/api';
import {
  Briefcase,
  Store,
  Users,
  Search,
  Lock,
  Clock,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Building,
  User,
  Send,
  X,
  ExternalLink,
  HeartHandshake,
  Crown,
  Share2,
  CheckCircle2,
  Sparkles
} from 'lucide-react-native';

const BUSINESS_CATEGORIES = [
  'ALL',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'IT & Tech',
  'Healthcare',
  'Education',
  'Hospitality',
  'Construction',
  'Transport',
  'Services',
  'Other'
];

const WORK_CATEGORIES = [
  'ALL',
  'Information Technology',
  'Engineering',
  'Medicine & Healthcare',
  'Government & Public Sector',
  'Teaching & Academia',
  'Banking & Finance',
  'Legal & Law',
  'Skilled Trade',
  'Business & Sales',
  'Arts & Media',
  'Other'
];

type DirectoryTab = 'business' | 'work' | 'relatives' | 'employees';
type RelationFilter = 'ALL' | 'IMMEDIATE' | 'CLOSE_RELATIVES';

interface BusinessWorkDirectoryProps {
  navigation?: any;
  route?: any;
}

const BusinessWorkDirectoryScreen: React.FC<BusinessWorkDirectoryProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isTa = language === 'ta';
  const isAdmin = ['ADMIN', 'SUB_ADMIN'].includes(String(user?.role || '').toUpperCase());

  const initialTab: DirectoryTab = route?.params?.initialTab || 'business';

  // Active top tab
  const [activeTab, setActiveTab] = useState<DirectoryTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Category filter state
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState('ALL');
  const [selectedWorkCategory, setSelectedWorkCategory] = useState('ALL');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('ALL');

  // Data lists
  const [businessList, setBusinessList] = useState<any[]>([]);
  const [workList, setWorkList] = useState<any[]>([]);
  const [relativesList, setRelativesList] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Request Access Modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Fetch Businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessWorkApi.getBusinesses({
        businessType: selectedBusinessCategory !== 'ALL' ? selectedBusinessCategory : undefined,
        relationFilter: relationFilter !== 'ALL' ? relationFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.data) {
        setBusinessList(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching businesses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBusinessCategory, relationFilter, search]);

  // Fetch Work Profiles
  const fetchWorkProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessWorkApi.getWorkProfiles({
        fieldOfWork: selectedWorkCategory !== 'ALL' ? selectedWorkCategory : undefined,
        relationFilter: relationFilter !== 'ALL' ? relationFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.data) {
        setWorkList(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching work profiles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWorkCategory, relationFilter, search]);

  // Fetch Relatives Directory (Genealogical Tree-Based)
  const fetchRelatives = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessWorkApi.getRelatives({
        search: search.trim() || undefined
      });
      if (res.data?.data) {
        setRelativesList(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching relatives directory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  // Fetch Employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessWorkApi.getBusinesses({
        search: search.trim() || undefined
      });
      if (res.data?.data) {
        setEmployeesList(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching enterprises for employees:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  // Main loader switch
  const loadData = useCallback(() => {
    if (activeTab === 'business') {
      fetchBusinesses();
    } else if (activeTab === 'work') {
      fetchWorkProfiles();
    } else if (activeTab === 'relatives') {
      fetchRelatives();
    } else if (activeTab === 'employees') {
      fetchEmployees();
    }
  }, [activeTab, fetchBusinesses, fetchWorkProfiles, fetchRelatives, fetchEmployees]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSearchSubmit = () => {
    loadData();
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  const openRequestAccessModal = (item: any) => {
    setSelectedTarget(item);
    setRequestReason('');
    setRequestModalVisible(true);
  };

  const submitAccessRequest = async () => {
    if (!selectedTarget) return;

    try {
      setSubmittingRequest(true);
      const requestType =
        activeTab === 'business'
          ? 'BUSINESS'
          : activeTab === 'work'
          ? 'WORK_ADDRESS'
          : activeTab === 'employees'
          ? 'EMPLOYEES'
          : selectedTarget.entryType === 'WORK'
          ? 'WORK_ADDRESS'
          : 'BUSINESS';

      await accessRequestApi.createRequest({
        requestType,
        targetUserId: selectedTarget.id || selectedTarget.memberId || selectedTarget._id,
        targetMemberId: selectedTarget.memberId || selectedTarget.id,
        reason: requestReason.trim()
      });

      Alert.alert(
        isTa ? 'கோரிக்கை அனுப்பப்பட்டது' : 'Request Submitted',
        isTa
          ? 'விவரங்களை அணுக உங்கள் கோரிக்கை உரிமையாளரின் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளது.'
          : 'Your access request has been sent for approval. You will be notified once reviewed.'
      );

      setRequestModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && !phoneNumber.includes('•')) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleOpenMap = (url?: string, address?: string) => {
    if (url) {
      Linking.openURL(url);
    } else if (address && !address.includes('•')) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(mapUrl);
    }
  };

  // Render Relation Badge
  const renderRelationBadge = (item: any) => {
    const label = isTa ? (item.relationTa || item.relation) : (item.relation || item.relationTa);
    if (!label) return null;

    const isDirect = item.isImmediate || item.relationType === 'SELF' || item.relationType === 'PARENT' || item.relationType === 'CHILD' || item.relationType === 'SIBLING';

    return (
      <View style={[styles.relationBadge, isDirect ? styles.relationBadgeDirect : styles.relationBadgeLineage]}>
        <Sparkles size={11} color={isDirect ? '#004831' : '#854D0E'} style={{ marginRight: 3 }} />
        <Text style={[styles.relationBadgeText, isDirect ? styles.relationBadgeTextDirect : styles.relationBadgeTextLineage]}>
          {isTa ? `உறவு: ${label}` : `Relation: ${label}`}
        </Text>
      </View>
    );
  };

  // Render Business Card
  const renderBusinessCard = ({ item }: { item: any }) => {
    const hasFullAccess = isAdmin || item.hasAccess || item.accessStatus === 'APPROVED' || item.accessStatus === 'OWNER';

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.businessIconWrap}>
            <Store size={22} color="#004831" />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{item.businessName}</Text>
            <Text style={styles.cardSub}>
              {isTa ? 'உரிமையாளர்: ' : 'Owner: '}
              <Text style={styles.boldText}>{item.ownerName}</Text>
              {item.parentName ? ` (${item.parentName} மகன்/மகள்)` : ''}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.businessType}</Text>
          </View>
        </View>

        {/* Relation & Lineage Tag */}
        {renderRelationBadge(item)}

        <View style={styles.cardDivider} />

        {/* Address & Contact Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MapPin size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isTa ? 'வணிக முகவரி' : 'Business Address'}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess ? item.businessAddress : '••••••••••••••••••••'}
              </Text>
            </View>
            {hasFullAccess && (item.businessGoogleMapUrl || item.businessAddress) && (
              <TouchableOpacity
                style={styles.mapPillBtn}
                onPress={() => handleOpenMap(item.businessGoogleMapUrl, item.businessAddress)}
                activeOpacity={0.8}
              >
                <MapPin size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.mapPillBtnText}>Map</Text>
                <ExternalLink size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Phone size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isTa ? 'தொடர்பு எண்' : 'Contact Details'}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess ? item.contactNumber : '••••••••••'}
              </Text>
            </View>
          </View>
        </View>

        {/* Access Action / Status Row */}
        <View style={styles.actionRow}>
          {hasFullAccess ? (
            <View style={styles.approvedStatusRow}>
              <View style={styles.approvedBadge}>
                {isAdmin ? (
                  <Crown size={14} color="#004831" style={{ marginRight: 4 }} />
                ) : (
                  <ShieldCheck size={14} color="#004831" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.approvedBadgeText}>
                  {isAdmin
                    ? (isTa ? 'நிர்வாகி முழு அனுமதி' : 'ADMIN ACCESS')
                    : item.accessStatus === 'OWNER'
                    ? (isTa ? 'உங்கள் வணிகம்' : 'YOUR BUSINESS')
                    : (isTa ? 'அணுகல் அனுமதிக்கப்பட்டது' : 'ACCESS GRANTED')}
                </Text>
              </View>
              {item.contactNumber && !item.contactNumber.includes('•') && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(item.contactNumber)}
                  activeOpacity={0.8}
                >
                  <Phone size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : item.accessStatus === 'PENDING' ? (
            <View style={styles.pendingBadge}>
              <Clock size={14} color="#B45309" style={{ marginRight: 6 }} />
              <Text style={styles.pendingBadgeText}>
                {isTa ? 'கோரிக்கை நிலுவையில் உள்ளது' : 'Pending Owner Approval'}
              </Text>
            </View>
          ) : item.accessStatus === 'REJECTED' ? (
            <View style={styles.rejectedWrap}>
              <View style={styles.rejectedBadge}>
                <ShieldAlert size={14} color="#B91C1C" style={{ marginRight: 4 }} />
                <Text style={styles.rejectedBadgeText}>
                  {isTa ? 'கோரிக்கை நிராகரிக்கப்பட்டது' : 'Request Rejected'}
                </Text>
              </View>
              {item.rejectionReason ? (
                <Text style={styles.rejectionReasonText}>
                  {isTa ? 'காரணம்: ' : 'Reason: '} {item.rejectionReason}
                </Text>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.requestAccessBtn}
              onPress={() => openRequestAccessModal(item)}
              activeOpacity={0.8}
            >
              <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.requestAccessBtnText}>
                {isTa ? 'தொடர்பு & முகவரி அணுகல் கோருக' : 'Request Access to Details'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Work Profile Card
  const renderWorkCard = ({ item }: { item: any }) => {
    const hasFullAccess = isAdmin || item.hasAccess || item.accessStatus === 'APPROVED' || item.accessStatus === 'OWNER';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.businessIconWrap, { backgroundColor: '#F0FDF4' }]}>
            <Briefcase size={22} color="#004831" />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{item.fullName || item.ownerName}</Text>
            <Text style={styles.cardSub}>
              {item.jobTitle || item.occupation || 'Professional'} {item.companyName ? `• ${item.companyName}` : ''}
              {item.parentName ? ` (${item.parentName} மகன்/மகள்)` : ''}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <Text style={[styles.categoryBadgeText, { color: '#0369A1' }]}>
              {item.fieldOfWork || 'General'}
            </Text>
          </View>
        </View>

        {/* Relation Tag */}
        {renderRelationBadge(item)}

        <View style={styles.cardDivider} />

        {/* Work Address & Contact */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Building size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isTa ? 'பணி அலுவலக முகவரி' : 'Work Address'}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess ? (item.workAddress || 'Marthandan Technology Park') : '••••••••••••••••••••'}
              </Text>
            </View>
            {hasFullAccess && (item.workGoogleMapUrl || item.workAddress) && (
              <TouchableOpacity
                style={styles.mapPillBtn}
                onPress={() => handleOpenMap(item.workGoogleMapUrl, item.workAddress)}
                activeOpacity={0.8}
              >
                <MapPin size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.mapPillBtnText}>Map</Text>
                <ExternalLink size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Phone size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isTa ? 'தொடர்பு எண்' : 'Direct Contact'}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess ? item.contactNumber : '••••••••••'}
              </Text>
            </View>
          </View>
        </View>

        {/* Access Status & Action Row */}
        <View style={styles.actionRow}>
          {hasFullAccess ? (
            <View style={styles.approvedStatusRow}>
              <View style={styles.approvedBadge}>
                {isAdmin ? (
                  <Crown size={14} color="#004831" style={{ marginRight: 4 }} />
                ) : (
                  <ShieldCheck size={14} color="#004831" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.approvedBadgeText}>
                  {isAdmin
                    ? (isTa ? 'நிர்வாகி முழு அனுமதி' : 'ADMIN ACCESS')
                    : item.accessStatus === 'OWNER'
                    ? (isTa ? 'உங்கள் சுயவிவரம்' : 'YOUR PROFILE')
                    : (isTa ? 'அணுகல் அனுமதிக்கப்பட்டது' : 'ACCESS GRANTED')}
                </Text>
              </View>
              {item.contactNumber && !item.contactNumber.includes('•') && (
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: '#0284C7' }]}
                  onPress={() => handleCall(item.contactNumber)}
                  activeOpacity={0.8}
                >
                  <Phone size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.callBtnText}>Contact</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : item.accessStatus === 'PENDING' ? (
            <View style={styles.pendingBadge}>
              <Clock size={14} color="#B45309" style={{ marginRight: 6 }} />
              <Text style={styles.pendingBadgeText}>
                {isTa ? 'கோரிக்கை நிலுவையில் உள்ளது' : 'Pending Owner Approval'}
              </Text>
            </View>
          ) : item.accessStatus === 'REJECTED' ? (
            <View style={styles.rejectedWrap}>
              <View style={styles.rejectedBadge}>
                <ShieldAlert size={14} color="#B91C1C" style={{ marginRight: 4 }} />
                <Text style={styles.rejectedBadgeText}>
                  {isTa ? 'கோரிக்கை நிராகரிக்கப்பட்டது' : 'Request Rejected'}
                </Text>
              </View>
              {item.rejectionReason ? (
                <Text style={styles.rejectionReasonText}>
                  {isTa ? 'காரணம்: ' : 'Reason: '} {item.rejectionReason}
                </Text>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.requestAccessBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => openRequestAccessModal(item)}
              activeOpacity={0.8}
            >
              <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.requestAccessBtnText}>
                {isTa ? 'அலுவலக முகவரி & எண் அணுகல் கோருக' : 'Request Work Address Access'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Relatives Directory Card (Lineage & Kinship)
  const renderRelativeCard = ({ item }: { item: any }) => {
    const isBusiness = item.entryType === 'BUSINESS' || (!item.entryType && item.businessName);
    const hasFullAccess = isAdmin || item.hasAccess || item.accessStatus === 'APPROVED' || item.accessStatus === 'OWNER';

    return (
      <View style={[styles.card, styles.relativeCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.businessIconWrap, { backgroundColor: '#FDF4E7' }]}>
            {isBusiness ? (
              <Store size={22} color="#C5A059" />
            ) : (
              <Briefcase size={22} color="#C5A059" />
            )}
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{item.ownerName || item.fullName}</Text>
            <Text style={styles.cardSub}>
              {isBusiness
                ? (item.businessName || 'Business Owner')
                : `${item.jobTitle || 'Professional'} ${item.companyName ? `• ${item.companyName}` : ''}`}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={[styles.categoryBadgeText, { color: '#B45309' }]}>
              {isBusiness ? (item.businessType || 'Business') : (item.fieldOfWork || 'Profession')}
            </Text>
          </View>
        </View>

        {/* Prominent Relation Banner */}
        <View style={styles.relativeBanner}>
          <Sparkles size={13} color="#C5A059" style={{ marginRight: 5 }} />
          <Text style={styles.relativeBannerText}>
            {isTa ? (item.relationTa || item.relation || 'வம்ச உறவினர்') : (item.relation || 'Lineage Kin')}
          </Text>
          {item.parentName && (
            <Text style={styles.relativeBannerSub}>
              • {item.parentName} {isTa ? 'மகன்/மகள்' : 'Lineage'}
            </Text>
          )}
        </View>

        <View style={styles.cardDivider} />

        {/* Address & Google Maps */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MapPin size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isBusiness
                  ? (isTa ? 'வணிக முகவரி' : 'Business Address')
                  : (isTa ? 'அலுவலக முகவரி' : 'Work Address')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess
                  ? (item.businessAddress || item.workAddress || 'Marthandan Main')
                  : '••••••••••••••••••••'}
              </Text>
            </View>
            {hasFullAccess && (item.businessGoogleMapUrl || item.businessAddress) && (
              <TouchableOpacity
                style={styles.mapPillBtn}
                onPress={() => handleOpenMap(item.businessGoogleMapUrl, item.businessAddress)}
                activeOpacity={0.8}
              >
                <MapPin size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.mapPillBtnText}>Map</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Phone size={15} color="#004831" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>
                {isTa ? 'தொடர்பு எண்' : 'Contact Details'}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  !hasFullAccess && styles.infoValueMasked
                ]}
              >
                {hasFullAccess ? item.contactNumber : '••••••••••'}
              </Text>
            </View>
          </View>
        </View>

        {/* Access Action Row */}
        <View style={styles.actionRow}>
          {hasFullAccess ? (
            <View style={styles.approvedStatusRow}>
              <View style={styles.approvedBadge}>
                {isAdmin ? (
                  <Crown size={14} color="#004831" style={{ marginRight: 4 }} />
                ) : (
                  <ShieldCheck size={14} color="#004831" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.approvedBadgeText}>
                  {isAdmin ? 'ADMIN ACCESS' : (isTa ? 'முழு அணுகல்' : 'ACCESS GRANTED')}
                </Text>
              </View>
              {item.contactNumber && !item.contactNumber.includes('•') && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(item.contactNumber)}
                  activeOpacity={0.8}
                >
                  <Phone size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.callBtnText}>Call Kin</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.requestAccessBtn}
              onPress={() => openRequestAccessModal(item)}
              activeOpacity={0.8}
            >
              <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.requestAccessBtnText}>
                {isTa ? 'உறவினர் தொடர்பு விவரம் கோருக' : 'Request Kin Contact Details'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Employee Enterprise Card
  const renderEmployeeCard = ({ item }: { item: any }) => {
    const hasFullAccess = isAdmin || item.hasAccess || item.accessStatus === 'APPROVED' || item.accessStatus === 'OWNER';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.businessIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Users size={22} color="#D97706" />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{item.businessName}</Text>
            <Text style={styles.cardSub}>
              {isTa ? 'உரிமையாளர்: ' : 'Owner: '} {item.ownerName}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={[styles.categoryBadgeText, { color: '#B45309' }]}>
              {item.businessType}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.infoSection}>
          <Text style={{ fontSize: 12, color: '#52635B', lineHeight: 18 }}>
            {isTa
              ? 'இந்நிறுவனத்தின் பணியாளர் பட்டியல் மற்றும் தொடர்பு விவரங்கள் தனியுரிமை விதிகளின் கீழ் பாதுகாக்கப்பட்டுள்ளன.'
              : 'Staff roster and employee credentials for this enterprise are secured under community privacy controls.'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {hasFullAccess ? (
            <View style={styles.approvedBadge}>
              {isAdmin ? (
                <Crown size={14} color="#004831" style={{ marginRight: 4 }} />
              ) : (
                <ShieldCheck size={14} color="#004831" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.approvedBadgeText}>
                {isAdmin
                  ? (isTa ? 'நிர்வாகி முழு அணுகல்' : 'ADMIN FULL ACCESS')
                  : (isTa ? 'பணியாளர் அணுகல் அனுமதிக்கப்பட்டது' : 'EMPLOYEE ACCESS GRANTED')}
              </Text>
            </View>
          ) : item.accessStatus === 'PENDING' ? (
            <View style={styles.pendingBadge}>
              <Clock size={14} color="#B45309" style={{ marginRight: 6 }} />
              <Text style={styles.pendingBadgeText}>
                {isTa ? 'பணியாளர் கோரிக்கை நிலுவையில் உள்ளது' : 'Employee Access Request Pending'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.requestAccessBtn, { backgroundColor: '#D97706' }]}
              onPress={() => openRequestAccessModal(item)}
              activeOpacity={0.8}
            >
              <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.requestAccessBtnText}>
                {isTa ? 'பணியாளர் விவரங்களுக்கு கோருக' : 'Request Employee Directory Access'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'business':
        return businessList;
      case 'work':
        return workList;
      case 'relatives':
        return relativesList;
      case 'employees':
        return employeesList;
      default:
        return [];
    }
  }, [activeTab, businessList, workList, relativesList, employeesList]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Sub Header Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#004831" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {isTa ? 'தொழில் & வேலை கோப்பகம்' : 'Business & Work Directory'}
          </Text>
          <Text style={styles.screenSubtitle} numberOfLines={1}>
            {isAdmin
              ? (isTa ? '👑 நிர்வாகி முழு அணுகல் உரிமை' : '👑 Administrator Full Access Active')
              : (isTa ? 'பாதுகாக்கப்பட்ட சமூக சுயவிவரங்கள்' : 'Protected Community Directory')}
          </Text>
        </View>
      </View>

      {/* Segmented Top Tabs - Horizontal Scrollable with High-Contrast Pill Buttons */}
      <View style={styles.tabScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {/* Tab 1: Businesses */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'business' && styles.tabButtonActive]}
            onPress={() => setActiveTab('business')}
            activeOpacity={0.8}
          >
            <Store
              size={15}
              color={activeTab === 'business' ? '#FFFFFF' : '#004831'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'business' && styles.tabButtonTextActive]}>
              {isTa ? 'வணிகங்கள்' : 'Businesses'}
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Work Profiles */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'work' && styles.tabButtonActive]}
            onPress={() => setActiveTab('work')}
            activeOpacity={0.8}
          >
            <Briefcase
              size={15}
              color={activeTab === 'work' ? '#FFFFFF' : '#004831'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'work' && styles.tabButtonTextActive]}>
              {isTa ? 'வேலைகள்' : 'Work Profiles'}
            </Text>
          </TouchableOpacity>

          {/* Tab 3: My Relatives (Genealogical Tree-Based) */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'relatives' && styles.tabButtonActiveGold]}
            onPress={() => setActiveTab('relatives')}
            activeOpacity={0.8}
          >
            <HeartHandshake
              size={15}
              color={activeTab === 'relatives' ? '#FFFFFF' : '#C5A059'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'relatives' && styles.tabButtonTextActive]}>
              {isTa ? 'என் சொந்தங்கள்' : 'My Relatives'}
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Employees */}
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'employees' && styles.tabButtonActive]}
            onPress={() => setActiveTab('employees')}
            activeOpacity={0.8}
          >
            <Users
              size={15}
              color={activeTab === 'employees' ? '#FFFFFF' : '#004831'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'employees' && styles.tabButtonTextActive]}>
              {isTa ? 'பணியாளர்கள்' : 'Employees'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Input Bar with Fast Clear & Debounced Submissions */}
      <View style={styles.searchBar}>
        <Search size={18} color="#718078" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === 'business'
              ? (isTa ? 'வணிக பெயர், உரிமையாளர் தேடுக...' : 'Search business or owner...')
              : activeTab === 'work'
              ? (isTa ? 'பணித்துறை, பதவி தேடுக...' : 'Search profession, role, company...')
              : activeTab === 'relatives'
              ? (isTa ? 'உறவினர் பெயர் அல்லது வம்சம் தேடுக...' : 'Search relative name or lineage...')
              : (isTa ? 'நிறுவனம் அல்லது பணியாளர் தேடுக...' : 'Search enterprise employees...')
          }
          placeholderTextColor="#9EA8A2"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={{ padding: 6 }}>
            <X size={16} color="#718078" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit} activeOpacity={0.8}>
          <Text style={styles.searchSubmitText}>
            {isTa ? 'தேடு' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Relation Filter Quick Chips (for Business & Work tabs) */}
      {(activeTab === 'business' || activeTab === 'work') && (
        <View style={styles.relationFilterContainer}>
          <TouchableOpacity
            style={[styles.relChip, relationFilter === 'ALL' && styles.relChipActive]}
            onPress={() => setRelationFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.relChipText, relationFilter === 'ALL' && styles.relChipTextActive]}>
              {isTa ? 'அனைத்து சமூகம்' : 'All Community'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.relChip, relationFilter === 'IMMEDIATE' && styles.relChipActive]}
            onPress={() => setRelationFilter('IMMEDIATE')}
            activeOpacity={0.7}
          >
            <Text style={[styles.relChipText, relationFilter === 'IMMEDIATE' && styles.relChipTextActive]}>
              {isTa ? 'நேரடி குடும்பம்' : 'Immediate Family'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.relChip, relationFilter === 'CLOSE_RELATIVES' && styles.relChipActive]}
            onPress={() => setRelationFilter('CLOSE_RELATIVES')}
            activeOpacity={0.7}
          >
            <Text style={[styles.relChipText, relationFilter === 'CLOSE_RELATIVES' && styles.relChipTextActive]}>
              {isTa ? 'சொந்தங்கள் & பங்காளி' : 'Relatives & Lineage'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Horizontal Category Filter Chips (Strictly Height-Contained) */}
      {activeTab === 'business' && (
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {BUSINESS_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  selectedBusinessCategory === cat && styles.chipActive
                ]}
                onPress={() => setSelectedBusinessCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedBusinessCategory === cat && styles.chipTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {activeTab === 'work' && (
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {WORK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  selectedWorkCategory === cat && styles.chipActive
                ]}
                onPress={() => setSelectedWorkCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedWorkCategory === cat && styles.chipTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Listing View via Fast FlatList */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#004831" />
          <Text style={styles.loadingText}>
            {isTa ? 'சுயவிவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading directory listings...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item, index) => String(item.id || item.memberId || item._id || index)}
          renderItem={
            activeTab === 'business'
              ? renderBusinessCard
              : activeTab === 'work'
              ? renderWorkCard
              : activeTab === 'relatives'
              ? renderRelativeCard
              : renderEmployeeCard
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#004831', '#C5A059']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              {activeTab === 'business' ? (
                <Store size={48} color="#C5A059" style={{ marginBottom: 12 }} />
              ) : activeTab === 'work' ? (
                <Briefcase size={48} color="#C5A059" style={{ marginBottom: 12 }} />
              ) : activeTab === 'relatives' ? (
                <HeartHandshake size={48} color="#C5A059" style={{ marginBottom: 12 }} />
              ) : (
                <Users size={48} color="#C5A059" style={{ marginBottom: 12 }} />
              )}
              <Text style={styles.emptyTitle}>
                {isTa ? 'சுயவிவரங்கள் கிடைக்கவில்லை' : 'No Listings Found'}
              </Text>
              <Text style={styles.emptySub}>
                {isTa ? 'வேறு தேடல் அல்லது வகையை முயற்சிக்கவும்' : 'Try adjusting your search query or filters'}
              </Text>
            </View>
          }
        />
      )}

      {/* Request Access Modal */}
      <Modal
        visible={requestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRequestModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTa ? 'அணுகல் அனுமதி கோருக' : 'Request Access Permission'}
              </Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {isTa
                ? 'தனிப்பட்ட தொலைபேசி மற்றும் முகவரி விவரங்கள் பாதுகாக்கப்பட்டுள்ளன. உரிமையாளரின் பரிசீலனைக்காக கோரிக்கைக் காரணத்தைக் குறிப்பிடவும்:'
                : 'Direct address and contact numbers are protected for community privacy. Specify the purpose of your access request for the owner to review:'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={
                isTa
                  ? 'எ.கா: வணிக விசாரணைக்காக அல்லது தொடர்பு கொள்ள...'
                  : 'e.g., Business partnership, hiring enquiry, or mutual family reference...'
              }
              placeholderTextColor="#A3AEA8"
              multiline
              numberOfLines={3}
              value={requestReason}
              onChangeText={setRequestReason}
            />

            <TouchableOpacity
              style={[
                styles.submitModalBtn,
                submittingRequest && { opacity: 0.7 }
              ]}
              onPress={submitAccessRequest}
              disabled={submittingRequest}
            >
              {submittingRequest ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitModalBtnText}>
                    {isTa ? 'கோரிக்கையை அனுப்புக' : 'Submit Access Request'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F2'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2EDE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  titleWrap: {
    flex: 1
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19352D'
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#718078',
    marginTop: 1
  },

  // Scrollable Horizontal Tabs Container
  tabScrollWrap: {
    height: 48,
    marginVertical: 6,
    flexGrow: 0,
    flexShrink: 0
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#EAE4D5',
    borderWidth: 1,
    borderColor: '#DFD8C9'
  },
  tabButtonActive: {
    backgroundColor: '#004831',
    borderColor: '#004831',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  tabButtonActiveGold: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34453D'
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  // Relation Filter Chips Row
  relationFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 4,
    gap: 8
  },
  relChip: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: '#E5DED0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  relChipActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  relChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52635B'
  },
  relChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    paddingHorizontal: 8,
    height: 42
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#19352D',
    marginLeft: 6
  },
  searchSubmitBtn: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },

  // Height-contained Category Chips
  chipsContainer: {
    height: 40,
    marginVertical: 2,
    flexGrow: 0,
    flexShrink: 0
  },
  chipsScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 40
  },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DAD0'
  },
  chipActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  chipText: {
    fontSize: 12,
    color: '#52635B',
    fontWeight: '600'
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#718078'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE0',
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  relativeCard: {
    borderColor: '#E8D9BE',
    borderWidth: 1.2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  businessIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitleBlock: {
    flex: 1
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#19352D'
  },
  cardSub: {
    fontSize: 12,
    color: '#52635B',
    marginTop: 1
  },
  boldText: {
    fontWeight: '700',
    color: '#19352D'
  },
  categoryBadge: {
    backgroundColor: '#FDF6E2',
    borderWidth: 1,
    borderColor: '#F5E5B8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#8F6F1D',
    fontWeight: '700'
  },

  // Relation Badges
  relationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  relationBadgeDirect: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  relationBadgeLineage: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047'
  },
  relationBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  relationBadgeTextDirect: {
    color: '#004831'
  },
  relationBadgeTextLineage: {
    color: '#854D0E'
  },

  // Relative Banner for Tab 3
  relativeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F5E5B8'
  },
  relativeBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8F6F1D'
  },
  relativeBannerSub: {
    fontSize: 11,
    color: '#718078',
    marginLeft: 4
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F3EFE6',
    marginVertical: 10
  },

  infoSection: {
    marginBottom: 10
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoLabel: {
    fontSize: 11,
    color: '#8A9790',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 13,
    color: '#19352D',
    fontWeight: '600',
    marginTop: 1
  },
  infoValueMasked: {
    color: '#A3AEA8',
    letterSpacing: 2
  },

  // Google Map Pill Button
  mapPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004831',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6
  },
  mapPillBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700'
  },

  actionRow: {
    marginTop: 4
  },
  approvedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  approvedBadgeText: {
    fontSize: 11,
    color: '#004831',
    fontWeight: '700'
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004831',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  pendingBadgeText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600'
  },
  rejectedWrap: {
    gap: 4
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  rejectedBadgeText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700'
  },
  rejectionReasonText: {
    fontSize: 11,
    color: '#718078',
    fontStyle: 'italic'
  },
  requestAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004831',
    paddingVertical: 8,
    borderRadius: 8
  },
  requestAccessBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#19352D',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: '#718078'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19352D'
  },
  modalDesc: {
    fontSize: 12,
    color: '#52635B',
    lineHeight: 18,
    marginBottom: 14
  },
  modalInput: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E2DAD0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#19352D',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  submitModalBtn: {
    backgroundColor: '#004831',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8
  },
  submitModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

export default BusinessWorkDirectoryScreen;
