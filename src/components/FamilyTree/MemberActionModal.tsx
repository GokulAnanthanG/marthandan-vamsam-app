import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import {
  Briefcase,
  Store,
  MapPin,
  ChevronDown,
  ExternalLink,
  Check,
  X,
  Compass,
  Building,
  GraduationCap,
  Home
} from 'lucide-react-native';

export type ActionMode = 'CHILD' | 'SPOUSE' | 'ROOT' | 'EDIT' | 'INSERT_BETWEEN' | null;

interface MemberActionModalProps {
  visible: boolean;
  mode: ActionMode;
  initialData?: any;
  targetMember?: any;
  onClose: () => void;
  onSave: (data: any, originalData: any) => Promise<void>;
}

const PROFILE_TYPES = [
  { key: 'GENERAL', label: 'General / குடும்பம்', icon: Home },
  { key: 'WORK', label: 'Job & Work / வேலை', icon: Briefcase },
  { key: 'BUSINESS', label: 'Business / வணிகம்', icon: Store },
  { key: 'BOTH', label: 'Work & Business / இரண்டும்', icon: Building },
  { key: 'STUDENT', label: 'Student / மாணவர்', icon: GraduationCap },
  { key: 'HOMEMAKER', label: 'Homemaker / இல்லத்தரசி', icon: Home }
];

const FIELD_OF_WORK_OPTIONS = [
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
  'Agriculture & Allied',
  'Other Professional'
];

const BUSINESS_TYPE_OPTIONS = [
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Agriculture & Farming',
  'IT & Tech Services',
  'Healthcare & Clinics',
  'Education & Coaching',
  'Hospitality & Food',
  'Construction & Real Estate',
  'Transport & Logistics',
  'Textiles & Garments',
  'Jewellery & Gold',
  'Professional Services',
  'Other Enterprise'
];

export default function MemberActionModal({
  visible,
  mode,
  initialData,
  targetMember,
  onClose,
  onSave
}: MemberActionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: new Date(),
    photoUrl: '',
    whatsapp: '',
    residentialAddress: '',
    homeGoogleMapUrl: '',
    profileType: 'GENERAL',
    fieldOfWork: '',
    companyName: '',
    jobTitle: '',
    businessType: '',
    businessName: '',
    businessAddress: '',
    businessGoogleMapUrl: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown Picker Modals
  const [pickerModalType, setPickerModalType] = useState<'FIELD_OF_WORK' | 'BUSINESS_TYPE' | null>(null);

  useEffect(() => {
    if (visible) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          name: initialData.name || '',
          phone: initialData.phone || '',
          gender: initialData.gender || 'MALE',
          dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
          photoUrl: initialData.photoUrl || '',
          whatsapp: initialData.whatsapp || '',
          residentialAddress: initialData.residentialAddress || '',
          homeGoogleMapUrl: initialData.homeGoogleMapUrl || '',
          profileType:
            initialData.profileType ||
            (initialData.businessName ? 'BUSINESS' : initialData.jobTitle || initialData.companyName ? 'WORK' : 'GENERAL'),
          fieldOfWork: initialData.fieldOfWork || '',
          companyName: initialData.companyName || '',
          jobTitle: initialData.jobTitle || initialData.occupationType || '',
          businessType: initialData.businessType || '',
          businessName: initialData.businessName || '',
          businessAddress: initialData.businessAddress || '',
          businessGoogleMapUrl: initialData.businessGoogleMapUrl || ''
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          gender: 'MALE',
          dateOfBirth: new Date(),
          photoUrl: '',
          whatsapp: '',
          residentialAddress: '',
          homeGoogleMapUrl: '',
          profileType: 'GENERAL',
          fieldOfWork: '',
          companyName: '',
          jobTitle: '',
          businessType: '',
          businessName: '',
          businessAddress: '',
          businessGoogleMapUrl: ''
        });
      }
    }
  }, [visible, mode, initialData]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Mobile Number is required');
      return;
    }

    if (mode === 'CHILD' && targetMember?.maritalStatus === 'SINGLE') {
      Alert.alert(
        'Changing Marital Status',
        'You are adding an heir to this member.\nTheir marital status will be updated to Married.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => performSave() }
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        occupationType: formData.jobTitle || (formData.profileType === 'BUSINESS' ? 'BUSINESS' : 'JOB')
      };
      await onSave(payload, initialData);
      onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to save member details');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, dateOfBirth: currentDate });
  };

  // Google Maps Helper: Auto-generate search link from address
  const handleGenerateHomeMapUrl = () => {
    if (!formData.residentialAddress.trim()) {
      Alert.alert('Enter Address First', 'Please type the residential address above to generate its Google Maps link.');
      return;
    }
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.residentialAddress.trim())}`;
    setFormData({ ...formData, homeGoogleMapUrl: mapUrl });
    Alert.alert('Google Maps Link Generated', 'A Google Maps search link has been created from the address.');
  };

  const handleGenerateBusinessMapUrl = () => {
    if (!formData.businessAddress.trim() && !formData.businessName.trim()) {
      Alert.alert('Enter Business Details', 'Please type the business name or address above to generate its Google Maps link.');
      return;
    }
    const query = [formData.businessName, formData.businessAddress].filter(Boolean).join(', ');
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    setFormData({ ...formData, businessGoogleMapUrl: mapUrl });
    Alert.alert('Business Map Link Generated', 'A Google Maps search link has been created from your business address.');
  };

  const handleOpenMap = (url: string, fallbackQuery?: string) => {
    const targetUrl = url || (fallbackQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}` : 'https://www.google.com/maps');
    Linking.openURL(targetUrl).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps on this device.');
    });
  };

  const isWorkVisible = formData.profileType === 'WORK' || formData.profileType === 'BOTH';
  const isBusinessVisible = formData.profileType === 'BUSINESS' || formData.profileType === 'BOTH';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {mode === 'CHILD'
                  ? 'Add Child / வாரிசு சேர்க்க'
                  : mode === 'SPOUSE'
                  ? 'Add Spouse / துணைவர்'
                  : mode === 'ROOT'
                  ? 'Add Root Member / மூல உறுப்பினர்'
                  : mode === 'INSERT_BETWEEN'
                  ? 'Insert Node Between'
                  : 'Edit Member / உறுப்பினர் திருத்து'}
              </Text>
              {targetMember?.name && mode === 'CHILD' && (
                <Text style={styles.modalSubtitle}>Parent: {targetMember.name}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#718078" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <Text style={styles.sectionHeading}>Basic Information / அடிப்படை விவரங்கள்</Text>

            <Text style={styles.label}>Full Name * / முழு பெயர் *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name (e.g., Sudalaiyandi Marthandan)"
              placeholderTextColor="#9EA8A2"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />

            <Text style={styles.label}>Mobile Number * / தொடர்பு எண் *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor="#9EA8A2"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
            />

            <Text style={styles.label}>Date of Birth * / பிறந்த தேதி *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: formData.dateOfBirth ? colors.textPrimary : '#9EA8A2', fontSize: 13 }}>
                {formData.dateOfBirth ? formData.dateOfBirth.toDateString() : 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.dateOfBirth}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Gender * / பாலினம் *</Text>
            <View style={styles.row}>
              {['MALE', 'FEMALE'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]}
                  onPress={() => setFormData({ ...formData, gender: g })}
                >
                  <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>
                    {g === 'MALE' ? 'Male / ஆண்' : 'Female / பெண்'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Profile Classification Type */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Work & Business Details / தொழில் விவரங்கள்</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Profile & Occupation Category / தொழில் வகை</Text>
            <View style={styles.profileTypeGrid}>
              {PROFILE_TYPES.map((pt) => {
                const isSelected = formData.profileType === pt.key;
                const Icon = pt.icon;
                return (
                  <TouchableOpacity
                    key={pt.key}
                    style={[styles.profileTypeCard, isSelected && styles.profileTypeCardActive]}
                    onPress={() => setFormData({ ...formData, profileType: pt.key })}
                  >
                    <Icon size={14} color={isSelected ? '#FFFFFF' : '#004831'} style={{ marginRight: 6 }} />
                    <Text
                      style={[styles.profileTypeText, isSelected && styles.profileTypeTextActive]}
                      numberOfLines={1}
                    >
                      {pt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* WORK PROFILE SECTION */}
            {isWorkVisible && (
              <View style={styles.classificationBox}>
                <View style={styles.classificationHeader}>
                  <Briefcase size={16} color="#0284C7" style={{ marginRight: 6 }} />
                  <Text style={styles.classificationTitle}>Work & Professional Details</Text>
                </View>

                {/* Proper Field of Work Dropdown Selector */}
                <Text style={styles.label}>Field of Work / பணித்துறை (Dropdown)</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setPickerModalType('FIELD_OF_WORK')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownBtnText, !formData.fieldOfWork && { color: '#9EA8A2' }]}>
                    {formData.fieldOfWork || 'Select Field of Work...'}
                  </Text>
                  <ChevronDown size={18} color="#004831" />
                </TouchableOpacity>

                <Text style={styles.label}>Company / Organization Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tata Consultancy Services, Government Hospital"
                  placeholderTextColor="#9EA8A2"
                  value={formData.companyName}
                  onChangeText={(t) => setFormData({ ...formData, companyName: t })}
                />

                <Text style={styles.label}>Job Title / Designation</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Senior Systems Engineer, Assistant Professor"
                  placeholderTextColor="#9EA8A2"
                  value={formData.jobTitle}
                  onChangeText={(t) => setFormData({ ...formData, jobTitle: t })}
                />
              </View>
            )}

            {/* BUSINESS PROFILE SECTION */}
            {isBusinessVisible && (
              <View style={[styles.classificationBox, { borderColor: '#FDE68A', backgroundColor: '#FEFDF8' }]}>
                <View style={styles.classificationHeader}>
                  <Store size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={[styles.classificationTitle, { color: '#B45309' }]}>Business Details / வணிகம்</Text>
                </View>

                {/* Proper Business Type Dropdown Selector */}
                <Text style={styles.label}>Business Type / வணிக வகை (Dropdown)</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setPickerModalType('BUSINESS_TYPE')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownBtnText, !formData.businessType && { color: '#9EA8A2' }]}>
                    {formData.businessType || 'Select Business Type...'}
                  </Text>
                  <ChevronDown size={18} color="#D97706" />
                </TouchableOpacity>

                <Text style={styles.label}>Business Name / Enterprise Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Marthandan Textiles & Silks"
                  placeholderTextColor="#9EA8A2"
                  value={formData.businessName}
                  onChangeText={(t) => setFormData({ ...formData, businessName: t })}
                />

                <Text style={styles.label}>Business Address</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Shop or office address..."
                  placeholderTextColor="#9EA8A2"
                  multiline
                  value={formData.businessAddress}
                  onChangeText={(t) => setFormData({ ...formData, businessAddress: t })}
                />

                {/* Google Map Option for Business */}
                <View style={styles.mapSectionBox}>
                  <View style={styles.mapHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Compass size={15} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={styles.mapSectionTitle}>Business Location on Google Maps</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.mapActionPill}
                      onPress={handleGenerateBusinessMapUrl}
                    >
                      <Text style={styles.mapActionPillText}>Auto Link</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.mapInput}
                    placeholder="Paste Google Maps URL or Location Link"
                    placeholderTextColor="#9EA8A2"
                    value={formData.businessGoogleMapUrl}
                    onChangeText={(t) => setFormData({ ...formData, businessGoogleMapUrl: t })}
                  />

                  <View style={styles.mapToolsRow}>
                    <TouchableOpacity
                      style={styles.openMapBtn}
                      onPress={() => handleOpenMap(formData.businessGoogleMapUrl, formData.businessAddress)}
                    >
                      <MapPin size={13} color="#004831" style={{ marginRight: 4 }} />
                      <Text style={styles.openMapBtnText}>Pick / View on Google Maps</Text>
                      <ExternalLink size={12} color="#004831" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* RESIDENTIAL ADDRESS & GOOGLE MAPS SECTION */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Home Address & Location / வீட்டு முகவரி</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Residential Address / வீட்டு முகவரி</Text>
            <TextInput
              style={[styles.input, { height: 65 }]}
              placeholder="House door number, street, town, pin..."
              placeholderTextColor="#9EA8A2"
              multiline
              value={formData.residentialAddress}
              onChangeText={(t) => setFormData({ ...formData, residentialAddress: t })}
            />

            {/* Google Map Option for Home Address */}
            <View style={styles.mapSectionBox}>
              <View style={styles.mapHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={15} color="#004831" style={{ marginRight: 6 }} />
                  <Text style={styles.mapSectionTitle}>Share Home Location via Google Maps</Text>
                </View>
                <TouchableOpacity
                  style={styles.mapActionPill}
                  onPress={handleGenerateHomeMapUrl}
                >
                  <Text style={styles.mapActionPillText}>Auto Link</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.mapInput}
                placeholder="Google Maps Location Link (e.g., https://maps.app.goo.gl/...)"
                placeholderTextColor="#9EA8A2"
                value={formData.homeGoogleMapUrl}
                onChangeText={(t) => setFormData({ ...formData, homeGoogleMapUrl: t })}
              />

              <View style={styles.mapToolsRow}>
                <TouchableOpacity
                  style={styles.openMapBtn}
                  onPress={() => handleOpenMap(formData.homeGoogleMapUrl, formData.residentialAddress)}
                >
                  <Compass size={13} color="#004831" style={{ marginRight: 4 }} />
                  <Text style={styles.openMapBtnText}>Pick / View Home Location on Maps</Text>
                  <ExternalLink size={12} color="#004831" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Other Optional Details */}
            <Text style={[styles.label, { marginTop: 12 }]}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              placeholder="WhatsApp Number (if different)"
              placeholderTextColor="#9EA8A2"
              keyboardType="phone-pad"
              value={formData.whatsapp}
              onChangeText={(t) => setFormData({ ...formData, whatsapp: t })}
            />

            <Text style={styles.label}>Profile Photo URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              placeholderTextColor="#9EA8A2"
              value={formData.photoUrl}
              onChangeText={(t) => setFormData({ ...formData, photoUrl: t })}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnOutline} onPress={onClose} disabled={loading}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save Member'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Dropdown Selector Modal for Field of Work & Business Type */}
      <Modal
        visible={pickerModalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModalType(null)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalType(null)}
        >
          <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickerModalType === 'FIELD_OF_WORK'
                  ? 'Select Field of Work / பணித்துறை'
                  : 'Select Business Type / வணிக வகை'}
              </Text>
              <TouchableOpacity onPress={() => setPickerModalType(null)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {(pickerModalType === 'FIELD_OF_WORK' ? FIELD_OF_WORK_OPTIONS : BUSINESS_TYPE_OPTIONS).map(
                (item) => {
                  const isSelected =
                    pickerModalType === 'FIELD_OF_WORK'
                      ? formData.fieldOfWork === item
                      : formData.businessType === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                      onPress={() => {
                        if (pickerModalType === 'FIELD_OF_WORK') {
                          setFormData({ ...formData, fieldOfWork: item });
                        } else {
                          setFormData({ ...formData, businessType: item });
                        }
                        setPickerModalType(null);
                      }}
                    >
                      <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                        {item}
                      </Text>
                      {isSelected && <Check size={16} color="#004831" strokeWidth={2.5} />}
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDE2'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004831',
    fontFamily: 'Montserrat_700Bold'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#718078',
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium'
  },
  closeBtn: {
    padding: 4
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004831',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  formScroll: {
    marginBottom: 16
  },
  label: {
    fontSize: 12.5,
    color: '#3B4842',
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: '#FAF8F5',
    color: '#19352D',
    fontSize: 13
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  radioBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2DAD0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  radioBtnActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  radioText: {
    color: '#52635B',
    fontSize: 12,
    fontWeight: '600'
  },
  radioTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DDCF'
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#8F6F1D',
    fontSize: 12,
    fontWeight: '700'
  },
  profileTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  profileTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E2DAD0'
  },
  profileTypeCardActive: {
    backgroundColor: '#004831',
    borderColor: '#004831'
  },
  profileTypeText: {
    fontSize: 11.5,
    color: '#52635B',
    fontWeight: '600'
  },
  profileTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  classificationBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  classificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  classificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1'
  },

  // Dropdown Button
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4CBBF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 14
  },
  dropdownBtnText: {
    fontSize: 13,
    color: '#19352D',
    fontWeight: '500'
  },

  // Google Maps Section
  mapSectionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 14
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  mapSectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#19352D'
  },
  mapActionPill: {
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: '#E2DAD0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  mapActionPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8F6F1D'
  },
  mapInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#19352D',
    marginBottom: 8
  },
  mapToolsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  openMapBtnText: {
    fontSize: 11,
    color: '#004831',
    fontWeight: '700'
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2EDE2'
  },
  btn: {
    backgroundColor: '#004831',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center'
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnOutlineText: {
    color: '#8F6F1D',
    fontWeight: 'bold',
    fontSize: 13
  },

  // Dropdown Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EDE2'
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004831'
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F5'
  },
  pickerItemActive: {
    backgroundColor: '#EBF4EE',
    borderRadius: 8
  },
  pickerItemText: {
    fontSize: 13,
    color: '#3B4842',
    fontWeight: '500'
  },
  pickerItemTextActive: {
    color: '#004831',
    fontWeight: '700'
  }
});
