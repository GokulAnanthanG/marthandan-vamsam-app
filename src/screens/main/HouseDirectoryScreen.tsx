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
  Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { houseApi, accessRequestApi } from '../../services/api';
import {
  Home,
  Search,
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  MapPin,
  Phone,
  Users,
  Send,
  X
} from 'lucide-react-native';

const HouseDirectoryScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAdmin = ['ADMIN', 'SUB_ADMIN'].includes(String(user?.role || '').toUpperCase());

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Pagination & Search state (Requirement 3: 10 per page, alphabetical, search)
  const [houses, setHouses] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHouses, setTotalHouses] = useState(0);
  const [search, setSearch] = useState('');

  // Request Access Modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchHouses = async (pageNumber = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await houseApi.getHouses({
        page: pageNumber,
        limit: 10, // Requirement 3: Display 10 house addresses per page
        search: searchQuery
      });

      const data = res.data?.data;
      if (data) {
        setHasAccess(data.hasAccess);
        setPendingRequest(data.pendingRequest);
        setHouses(data.houses || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalHouses(data.total || 0);
      }
    } catch (err) {
      console.log('Error fetching houses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses(1, '');
  }, []);

  const handleSearch = () => {
    fetchHouses(1, search);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchHouses(newPage, search);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setSubmittingRequest(true);
      await accessRequestApi.createRequest({
        requestType: 'HOUSE',
        reason: requestReason.trim()
      });
      Alert.alert(
        'Request Submitted',
        'Your request to access the Illangal House Directory has been submitted for approval.'
      );
      setRequestModalVisible(false);
      setRequestReason('');
      fetchHouses(1, '');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#063A2F" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {language === 'ta' ? 'இல்லங்கள் (வீட்டு முகவரிகள்)' : 'Illangal (House Directory)'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin
              ? (language === 'ta' ? 'நிர்வாகி முழு அணுகல் உரிமை' : 'Administrator Full Access Active')
              : (language === 'ta' ? 'அகரவரிசை மற்றும் அனுமதி மேலாண்மை' : 'Alphabetical Directory & Access Control')}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004831" />
          <Text style={styles.loadingText}>Loading Illangal Directory...</Text>
        </View>
      ) : (!hasAccess && !isAdmin) ? (
        /* Requirement 3: Gated Access View */
        <ScrollView contentContainerStyle={styles.gatedScroll}>
          <View style={styles.gatedCard}>
            <View style={styles.lockCircle}>
              <Lock size={36} color="#C5A059" />
            </View>
            <Text style={styles.gatedTitle}>
              {language === 'ta' ? 'இல்லங்கள் அனுமதி தேவை' : 'Access Permission Required'}
            </Text>
            <Text style={styles.gatedDesc}>
              {language === 'ta'
                ? 'குடும்ப இல்ல முகவரிகள் மற்றும் தனிப்பட்ட தொடர்பு விவரங்களை அணுக அனுமதி பெற வேண்டும்.'
                : 'In accordance with community privacy guidelines, house addresses and resident contact information require approved access.'}
            </Text>

            {pendingRequest ? (
              <View style={styles.pendingBadge}>
                <Clock size={18} color="#D97706" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.pendingBadgeTitle}>Request Under Review</Text>
                  <Text style={styles.pendingBadgeSub}>An administrator will review your access request shortly.</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.requestAccessBtn}
                onPress={() => setRequestModalVisible(true)}
                activeOpacity={0.8}
              >
                <ShieldCheck size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.requestAccessBtnText}>Request Directory Access</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Requirement 3: Once access is granted - Alphabetical, 10 per page, search */
        <View style={styles.contentWrap}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputWrap}>
              <Search size={18} color="#718078" style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={language === 'ta' ? 'இல்லம் அல்லது குடும்ப தலைவர் தேடுக...' : 'Search by house, head name or address...'}
                placeholderTextColor="#8A9993"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => { setSearch(''); fetchHouses(1, ''); }} style={{ padding: 8 }}>
                  <X size={16} color="#718078" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Results Summary Bar */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Showing {houses.length} of {totalHouses} houses (A to Z)
            </Text>
            <View style={styles.accessBadgeApproved}>
              <ShieldCheck size={12} color="#004831" style={{ marginRight: 4 }} />
              <Text style={styles.accessBadgeText}>Access Approved</Text>
            </View>
          </View>

          {/* House List */}
          <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
            {houses.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Home size={40} color="#C0B8A8" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>No Houses Found</Text>
                <Text style={styles.emptySub}>Try searching with a different name or keyword.</Text>
              </View>
            ) : (
              houses.map((house: any) => (
                <View key={house._id} style={styles.houseCard}>
                  <View style={styles.houseHeaderRow}>
                    <View style={styles.houseIconBadge}>
                      <Home size={18} color="#004831" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.houseName}>{house.houseName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <User size={13} color="#C5A059" style={{ marginRight: 4 }} />
                        <Text style={styles.headName}>{house.headName}</Text>
                      </View>
                    </View>
                    {house.generation && (
                      <View style={styles.generationBadge}>
                        <Text style={styles.generationText}>{house.generation}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.houseDivider} />

                  <View style={styles.detailRow}>
                    <MapPin size={15} color="#C5A059" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.addressText}>
                      {house.residentialAddress}, {house.city} - {house.pincode}
                    </Text>
                  </View>

                  <View style={styles.footerRow}>
                    {house.contactNumber ? (
                      <View style={styles.footerItem}>
                        <Phone size={13} color="#004831" style={{ marginRight: 4 }} />
                        <Text style={styles.footerItemText}>{house.contactNumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.footerItem}>
                      <Users size={13} color="#004831" style={{ marginRight: 4 }} />
                      <Text style={styles.footerItemText}>{house.familyMembersCount || 4} Family Members</Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* Pagination Controls (Requirement 3: 10 house addresses per page) */}
            {totalPages > 1 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={16} color={page <= 1 ? '#A3AEA8' : '#004831'} />
                  <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>Prev</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                  Page <Text style={{ fontWeight: '700', color: '#004831' }}>{page}</Text> of {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <Text style={[styles.pageBtnText, page >= totalPages && styles.pageBtnTextDisabled]}>Next</Text>
                  <ChevronRight size={16} color={page >= totalPages ? '#A3AEA8' : '#004831'} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Request Access Reason Modal */}
      <Modal visible={requestModalVisible} transparent animationType="fade" onRequestClose={() => setRequestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request House Directory Access</Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Please state your relation or reason for requesting access to the house directory:
            </Text>

            <TextInput
              style={styles.modalInput}
              value={requestReason}
              onChangeText={setRequestReason}
              placeholder="e.g. Community member looking for ancestral house location"
              multiline
            />

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleRequestAccess}
              disabled={submittingRequest}
            >
              {submittingRequest ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitModalBtnText}>Submit Access Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F2' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0'
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#19352D', fontFamily: 'Montserrat_700Bold' },
  headerSubtitle: { fontSize: 11, color: '#718078', fontFamily: 'Montserrat_500Medium' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#718078', fontSize: 13, fontFamily: 'Montserrat_500Medium' },
  gatedScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  gatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  lockCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#E7DEC9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  gatedTitle: { fontSize: 18, fontWeight: '700', color: '#19352D', marginBottom: 8, textAlign: 'center', fontFamily: 'Montserrat_700Bold' },
  gatedDesc: { fontSize: 13, color: '#718078', textAlign: 'center', lineHeight: 20, marginBottom: 20, fontFamily: 'Montserrat_500Medium' },
  requestAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004831',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    elevation: 2
  },
  requestAccessBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', fontFamily: 'Montserrat_600SemiBold' },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    width: '100%'
  },
  pendingBadgeTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  pendingBadgeSub: { fontSize: 11, color: '#B45309', marginTop: 2 },
  contentWrap: { flex: 1 },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0',
    gap: 8
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10
  },
  searchInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, fontSize: 13, color: '#19352D' },
  searchBtn: { backgroundColor: '#004831', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3EFE6'
  },
  summaryText: { fontSize: 11, color: '#6A7870', fontFamily: 'Montserrat_500Medium' },
  accessBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  accessBadgeText: { fontSize: 10, color: '#004831', fontWeight: '700' },
  listScroll: { padding: 16, paddingBottom: 60 },
  houseCard: {
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
  houseHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  houseIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EBF4EE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  houseName: { fontSize: 15, fontWeight: '700', color: '#19352D', fontFamily: 'Montserrat_700Bold' },
  headName: { fontSize: 12, color: '#52635B', fontFamily: 'Montserrat_600SemiBold' },
  generationBadge: { backgroundColor: '#FDF6E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#F5E5B8' },
  generationText: { fontSize: 9, color: '#8F6F1D', fontWeight: '700' },
  houseDivider: { height: 1, backgroundColor: '#F2EDE2', marginVertical: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  addressText: { flex: 1, fontSize: 12, color: '#4A5B53', lineHeight: 18 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F7F4EC', paddingTop: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerItemText: { fontSize: 11, color: '#004831', fontWeight: '600' },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEAE0',
    marginTop: 8
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  pageBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F2EB' },
  pageBtnText: { fontSize: 12, fontWeight: '700', color: '#004831' },
  pageBtnTextDisabled: { color: '#A3AEA8' },
  pageIndicator: { fontSize: 12, color: '#718078' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#19352D', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#718078' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 6 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EFEAE0' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#19352D' },
  modalDesc: { fontSize: 12, color: '#718078', lineHeight: 18, marginBottom: 12 },
  modalInput: { backgroundColor: '#F9F7F2', borderWidth: 1, borderColor: '#E5DDCF', borderRadius: 10, padding: 10, fontSize: 13, height: 70, textAlignVertical: 'top', marginBottom: 16 },
  submitModalBtn: { flexDirection: 'row', backgroundColor: '#004831', paddingVertical: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  submitModalBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }
});

export default HouseDirectoryScreen;
