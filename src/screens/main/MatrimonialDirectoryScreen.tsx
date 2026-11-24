import React, { useState, useEffect } from 'react';
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
  Image,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { matrimonialApi, accessRequestApi } from '../../services/api';
import {
  Heart,
  Search,
  Lock,
  Clock,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  FileText,
  Edit3,
  X,
  Send
} from 'lucide-react-native';

interface MatrimonialDirectoryProps {
  navigation?: any;
}

const MatrimonialDirectoryScreen: React.FC<MatrimonialDirectoryProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAdmin = ['ADMIN', 'SUB_ADMIN'].includes(String(user?.role || '').toUpperCase());

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [search, setSearch] = useState('');

  // Request Access Modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Asset Management Modal
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [activeManageProfile, setActiveManageProfile] = useState<any>(null);
  const [bridePhotoUrl, setBridePhotoUrl] = useState('');
  const [groomPhotoUrl, setGroomPhotoUrl] = useState('');
  const [jathagamUrl, setJathagamUrl] = useState('');
  const [biodataUrl, setBiodataUrl] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [savingAssets, setSavingAssets] = useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await matrimonialApi.getProfiles({
        gender: selectedGender !== 'ALL' ? selectedGender : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.data) {
        setProfiles(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching matrimonial profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedGender]);

  const handleSearchSubmit = () => {
    fetchProfiles();
  };

  const openRequestAccess = (profile: any) => {
    setSelectedProfile(profile);
    setRequestReason('');
    setRequestModalVisible(true);
  };

  const handleConfirmRequest = async () => {
    if (!requestReason.trim()) {
      Alert.alert(
        language === 'ta' ? 'காரணம் தேவை' : 'Reason Required',
        language === 'ta'
          ? 'திருமண வரன் விவரங்களை அணுகக் கோரிக்கைக் காரணத்தைக் கண்டிப்பாக குறிப்பிட வேண்டும்.'
          : 'Please provide the reason/intent for requesting matrimonial profile access.'
      );
      return;
    }

    if (!selectedProfile) return;

    try {
      setSubmittingRequest(true);
      await accessRequestApi.createRequest({
        requestType: 'VARAN',
        targetVaranId: selectedProfile.id,
        reason: requestReason.trim()
      });

      Alert.alert(
        language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது' : 'Request Submitted',
        language === 'ta'
          ? 'உங்கள் அணுகல் கோரிக்கை காரணத்துடன் குடும்பத்தினருக்கு அனுப்பப்பட்டுள்ளது.'
          : 'Your matrimonial access request with reason has been forwarded for approval.'
      );
      setRequestModalVisible(false);
      fetchProfiles();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const openManageAssets = (profile: any) => {
    setActiveManageProfile(profile);
    setBridePhotoUrl(profile.bridePhotoUrl || '');
    setGroomPhotoUrl(profile.groomPhotoUrl || '');
    setJathagamUrl(profile.jathagamUrl || '');
    setBiodataUrl(profile.biodataUrl || '');
    setAboutText(profile.about || '');
    setManageModalVisible(true);
  };

  const handleSaveAssets = async () => {
    if (!activeManageProfile) return;

    try {
      setSavingAssets(true);
      await matrimonialApi.updateAssets(activeManageProfile.id, {
        bridePhotoUrl: bridePhotoUrl.trim() || undefined,
        groomPhotoUrl: groomPhotoUrl.trim() || undefined,
        jathagamUrl: jathagamUrl.trim() || undefined,
        biodataUrl: biodataUrl.trim() || undefined,
        about: aboutText.trim() || undefined
      });

      Alert.alert(
        language === 'ta' ? 'வெற்றிகரமாக புதுப்பிக்கப்பட்டது' : 'Assets Updated',
        language === 'ta'
          ? 'புகைப்படம், ஜாதகம் மற்றும் சுயவிவரக் கோப்புகள் புதுப்பிக்கப்பட்டன.'
          : 'Photographs, Jathagam and Biodata records updated successfully.'
      );
      setManageModalVisible(false);
      fetchProfiles();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update matrimonial assets');
    } finally {
      setSavingAssets(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && !phoneNumber.includes('•')) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Top Header */}
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
            {language === 'ta' ? 'திருமண வரன் பட்டியல் (வரன்)' : 'Varan Matrimonial Directory'}
          </Text>
          <Text style={styles.screenSubtitle} numberOfLines={1}>
            {isAdmin
              ? (language === 'ta' ? 'நிர்வாகி முழு அணுகல் உரிமை' : 'Administrator Full Access Active')
              : (language === 'ta' ? 'பாதுகாக்கப்பட்ட குடும்ப வரன் விவரங்கள்' : 'Privacy-Guarded Community Profiles')}
          </Text>
        </View>
      </View>

      {/* Gender Filter Buttons */}
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[styles.genderBtn, selectedGender === 'ALL' && styles.genderBtnActive]}
          onPress={() => setSelectedGender('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.genderBtnText, selectedGender === 'ALL' && styles.genderBtnTextActive]} numberOfLines={1}>
            {language === 'ta' ? 'அனைத்தும்' : 'All Candidates'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.genderBtn, selectedGender === 'FEMALE' && styles.genderBtnActive]}
          onPress={() => setSelectedGender('FEMALE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.genderBtnText, selectedGender === 'FEMALE' && styles.genderBtnTextActive]} numberOfLines={1}>
            {language === 'ta' ? 'மணப்பெண்' : 'Brides'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.genderBtn, selectedGender === 'MALE' && styles.genderBtnActive]}
          onPress={() => setSelectedGender('MALE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.genderBtnText, selectedGender === 'MALE' && styles.genderBtnTextActive]} numberOfLines={1}>
            {language === 'ta' ? 'மணமகன்' : 'Grooms'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#718078" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            language === 'ta'
              ? 'பெயர், கல்வி, பணி மூலம் வரன் தேடுக...'
              : 'Search candidate name, education, occupation...'
          }
          placeholderTextColor="#9EA8A2"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit} activeOpacity={0.8}>
          <Text style={styles.searchSubmitText}>
            {language === 'ta' ? 'தேடு' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Listing */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#004831" />
          <Text style={styles.loadingText}>
            {language === 'ta' ? 'வரன் விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading matrimonial profiles...'}
          </Text>
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Heart size={48} color="#C5A059" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>
            {language === 'ta' ? 'வரன்கள் கிடைக்கவில்லை' : 'No Profiles Found'}
          </Text>
          <Text style={styles.emptySub}>
            {language === 'ta'
              ? 'வேறு தேடல் அளவுகோலை முயற்சிக்கவும்'
              : 'Try selecting another gender or clearing search terms'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {profiles.map((item) => {
            const hasFullAccess = isAdmin || item.hasAccess || item.accessStatus === 'APPROVED' || item.accessStatus === 'OWNER';

            return (
              <View key={item.id} style={styles.profileCard}>
                {/* Photo & Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.photoContainer}>
                    {hasFullAccess && (item.bridePhotoUrl || item.groomPhotoUrl) ? (
                      <Image
                        source={{ uri: item.bridePhotoUrl || item.groomPhotoUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.photoLockedPlaceholder}>
                        <Lock size={20} color="#8A9991" />
                        <Text style={styles.photoLockedText}>Photo Guarded</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.personName} numberOfLines={1}>{item.personName}</Text>
                      <View style={styles.genderBadge}>
                        <Text style={styles.genderBadgeText}>
                          {item.gender === 'FEMALE' ? 'Bride' : 'Groom'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ageHeightText}>
                      {item.age} Yrs • Height: {item.height || "N/A"}
                    </Text>

                    <View style={styles.eduJobRow}>
                      <GraduationCap size={13} color="#004831" style={{ marginRight: 4, marginTop: 1 }} />
                      <Text style={styles.eduJobText} numberOfLines={1}>
                        {item.education}
                      </Text>
                    </View>

                    <View style={styles.eduJobRow}>
                      <Briefcase size={13} color="#004831" style={{ marginRight: 4, marginTop: 1 }} />
                      <Text style={styles.eduJobText} numberOfLines={1}>
                        {item.occupation} ({item.fieldOfWork})
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Details Section */}
                <View style={styles.protectedSection}>
                  <View style={styles.detailGridRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>
                        {language === 'ta' ? 'பெற்றோர் பெயர்' : 'Parents'}
                      </Text>
                      <Text style={[styles.detailValue, !hasFullAccess && styles.detailValueMasked]}>
                        {hasFullAccess ? `${item.fatherName} & ${item.motherName}` : '••••••••••••••••'}
                      </Text>
                    </View>
                    <View style={{ width: 110 }}>
                      <Text style={styles.detailLabel}>
                        {language === 'ta' ? 'வருமானம்' : 'Annual Income'}
                      </Text>
                      <Text style={[styles.detailValue, !hasFullAccess && styles.detailValueMasked]}>
                        {hasFullAccess ? item.income : '••••••••'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailGridRow, { marginTop: 6 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>
                        {language === 'ta' ? 'இருப்பிடம்' : 'Residential Address'}
                      </Text>
                      <Text style={[styles.detailValue, !hasFullAccess && styles.detailValueMasked]}>
                        {hasFullAccess ? item.residentialAddress : '••••••••••••••••••••'}
                      </Text>
                    </View>
                    <View style={{ width: 110 }}>
                      <Text style={styles.detailLabel}>
                        {language === 'ta' ? 'தொடர்பு எண்' : 'Contact'}
                      </Text>
                      <Text style={[styles.detailValue, !hasFullAccess && styles.detailValueMasked]}>
                        {hasFullAccess ? item.contactNumber : '••••••••••'}
                      </Text>
                    </View>
                  </View>

                  {/* Unlocked Matrimonial Documents */}
                  {hasFullAccess && (
                    <View style={styles.unlockedAssetsBox}>
                      <Text style={styles.assetsTitle}>
                        {language === 'ta' ? 'இணைக்கப்பட்ட ஆவணங்கள்:' : 'Protected Documents Unlocked:'}
                      </Text>
                      <View style={styles.assetPillsRow}>
                        {item.jathagamUrl ? (
                          <View style={styles.assetPill}>
                            <FileText size={13} color="#004831" style={{ marginRight: 4 }} />
                            <Text style={styles.assetPillText}>Jathagam Verified</Text>
                          </View>
                        ) : null}
                        {item.biodataUrl ? (
                          <View style={styles.assetPill}>
                            <FileText size={13} color="#0284C7" style={{ marginRight: 4 }} />
                            <Text style={[styles.assetPillText, { color: '#0369A1' }]}>Biodata Attached</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  )}
                </View>

                {/* Action / Request Flow */}
                <View style={styles.cardFooter}>
                  {hasFullAccess ? (
                    <View style={styles.approvedRow}>
                      <View style={styles.approvedBadge}>
                        <ShieldCheck size={14} color="#004831" style={{ marginRight: 4 }} />
                        <Text style={styles.approvedBadgeText}>
                          {isAdmin
                            ? 'ADMIN ACCESS'
                            : item.accessStatus === 'OWNER'
                            ? 'YOUR PROFILE'
                            : 'ACCESS APPROVED'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
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

                        {(isAdmin || item.accessStatus === 'OWNER') && (
                          <TouchableOpacity
                            style={styles.manageBtn}
                            onPress={() => openManageAssets(item)}
                            activeOpacity={0.8}
                          >
                            <Edit3 size={13} color="#004831" style={{ marginRight: 4 }} />
                            <Text style={styles.manageBtnText}>
                              {language === 'ta' ? 'மேலாண்மை' : 'Manage'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ) : item.accessStatus === 'PENDING' ? (
                    <View style={styles.pendingBadge}>
                      <Clock size={14} color="#B45309" style={{ marginRight: 6 }} />
                      <Text style={styles.pendingBadgeText}>
                        {language === 'ta' ? 'வரன் அனுமதி கோரப்பட்டுள்ளது' : 'Access Request Sent • Pending Family Approval'}
                      </Text>
                    </View>
                  ) : item.accessStatus === 'REJECTED' ? (
                    <View style={styles.rejectedWrap}>
                      <View style={styles.rejectedBadge}>
                        <ShieldAlert size={14} color="#B91C1C" style={{ marginRight: 4 }} />
                        <Text style={styles.rejectedBadgeText}>Access Declined</Text>
                      </View>
                      {item.rejectionReason && (
                        <Text style={styles.rejectionReasonText}>
                          Reason: {item.rejectionReason}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.requestAccessBtn}
                      onPress={() => openRequestAccess(item)}
                      activeOpacity={0.8}
                    >
                      <Lock size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.requestAccessBtnText}>
                        {language === 'ta'
                          ? 'புகைப்படம் & ஜாதகம் காண காரணம் கூறி அணுகல் கோருக'
                          : 'Request Full Profile & Horoscope (Provide Reason)'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Request Access with Mandatory Reason Modal */}
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
                {language === 'ta' ? 'வரன் அணுகல் கோரிக்கை' : 'Matrimonial Access Request'}
              </Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {language === 'ta'
                ? 'திருமண வரன் தனியுரிமை விதிகளின்படி, புகைப்படம், ஜாதகம் மற்றும் தொடர்பு விவரங்களை அணுக விண்ணப்பக் காரணத்தை கட்டாயம் உள்ளிட வேண்டும்:'
                : 'To safeguard family privacy, please state your matrimonial interest and family background reason for this candidate:'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={
                language === 'ta'
                  ? 'எ.கா: என் மகன்/மகளுக்காக வரன் பரிசீலனை செய்ய விரும்புகிறேன்...'
                  : 'e.g., Looking for prospective alliance for my son/daughter. Native of...'
              }
              placeholderTextColor="#A3AEA8"
              multiline
              numberOfLines={4}
              value={requestReason}
              onChangeText={setRequestReason}
            />

            <TouchableOpacity
              style={[
                styles.submitModalBtn,
                submittingRequest && { opacity: 0.7 }
              ]}
              onPress={handleConfirmRequest}
              disabled={submittingRequest}
            >
              {submittingRequest ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitModalBtnText}>
                    {language === 'ta' ? 'காரணத்துடன் கோருக' : 'Submit Request with Reason'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Manage Bride/Groom Photo, Jathagam, Biodata Modal */}
      <Modal
        visible={manageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setManageModalVisible(false)}
        >
          <View style={[styles.modalCard, { maxWidth: 390 }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ta' ? 'வரன் ஆவணங்கள் மேலாண்மை' : 'Manage Matrimonial Assets'}
              </Text>
              <TouchableOpacity onPress={() => setManageModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputSectionLabel}>Bride's Photograph URL</Text>
              <TextInput
                style={styles.singleInput}
                placeholder="https://example.com/bride.jpg"
                value={bridePhotoUrl}
                onChangeText={setBridePhotoUrl}
              />

              <Text style={styles.inputSectionLabel}>Groom's Photograph URL</Text>
              <TextInput
                style={styles.singleInput}
                placeholder="https://example.com/groom.jpg"
                value={groomPhotoUrl}
                onChangeText={setGroomPhotoUrl}
              />

              <Text style={styles.inputSectionLabel}>Jathagam (Horoscope Reference / Details)</Text>
              <TextInput
                style={styles.singleInput}
                placeholder="e.g. Rishaba Rasi, Rohini Natchathiram, Heritage Jathagam"
                value={jathagamUrl}
                onChangeText={setJathagamUrl}
              />

              <Text style={styles.inputSectionLabel}>Biodata Document / Summary</Text>
              <TextInput
                style={styles.singleInput}
                placeholder="e.g. Marthandan_Candidate_Biodata.pdf"
                value={biodataUrl}
                onChangeText={setBiodataUrl}
              />

              <Text style={styles.inputSectionLabel}>About & Expectations</Text>
              <TextInput
                style={[styles.singleInput, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Family background and alliance expectations..."
                multiline
                value={aboutText}
                onChangeText={setAboutText}
              />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitModalBtn,
                { marginTop: 12 },
                savingAssets && { opacity: 0.7 }
              ]}
              onPress={handleSaveAssets}
              disabled={savingAssets}
            >
              {savingAssets ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitModalBtnText}>
                  {language === 'ta' ? 'ஆவணங்களைச் சேமி' : 'Save Matrimonial Assets'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
    color: '#19352D',
    fontFamily: 'Montserrat_700Bold'
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#718078',
    fontFamily: 'Montserrat_500Medium',
    marginTop: 1
  },

  // Fixed Height Gender Row
  genderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    height: 42,
    alignItems: 'center',
    gap: 8
  },
  genderBtn: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DAD0'
  },
  genderBtnActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52635B'
  },
  genderBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    paddingHorizontal: 8,
    height: 44
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
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19352D',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: '#718078',
    textAlign: 'center'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  profileCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3EFE6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DDCF'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  photoLockedPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  photoLockedText: {
    fontSize: 8,
    color: '#8A9991',
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center'
  },
  headerInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#19352D',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    marginRight: 6
  },
  genderBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  genderBadgeText: {
    fontSize: 10,
    color: '#BE185D',
    fontWeight: '700'
  },
  ageHeightText: {
    fontSize: 11,
    color: '#718078',
    fontWeight: '600',
    marginTop: 1,
    marginBottom: 4
  },
  eduJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  eduJobText: {
    fontSize: 11,
    color: '#3B4842',
    fontWeight: '500',
    flex: 1
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F2EDE2',
    marginVertical: 10
  },
  protectedSection: {
    marginBottom: 8
  },
  detailGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  detailLabel: {
    fontSize: 10,
    color: '#8A9991',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: 12,
    color: '#19352D',
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 1
  },
  detailValueMasked: {
    letterSpacing: 2,
    color: '#A3AEA8'
  },
  unlockedAssetsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8
  },
  assetsTitle: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '700',
    marginBottom: 4
  },
  assetPillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  assetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  assetPillText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600'
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F7F4EC',
    paddingTop: 10
  },
  approvedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: '#E2DAD0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  manageBtnText: {
    fontSize: 11,
    color: '#004831',
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
    color: '#92400E',
    fontWeight: '600'
  },
  rejectedWrap: {
    gap: 4
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
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
    color: '#DC2626',
    fontStyle: 'italic',
    paddingLeft: 4
  },
  requestAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BE185D',
    paddingVertical: 9,
    borderRadius: 8
  },
  requestAccessBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#19352D'
  },
  modalDesc: {
    fontSize: 12,
    color: '#718078',
    lineHeight: 18,
    marginBottom: 12
  },
  modalInput: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  submitModalBtn: {
    flexDirection: 'row',
    backgroundColor: '#004831',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  inputSectionLabel: {
    fontSize: 11,
    color: '#52635B',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4
  },
  singleInput: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#19352D'
  }
});

export default MatrimonialDirectoryScreen;
