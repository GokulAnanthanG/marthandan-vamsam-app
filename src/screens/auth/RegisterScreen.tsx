import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LanguageToggle from '../../components/common/LanguageToggle';
import { colors } from '../../theme/colors';
import api from '../../services/api';
import Svg, { Path, Circle } from 'react-native-svg';

const LeafOrnament = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24">
    <Path d="M11 22V15C11 13 9 12 7 11V9C10 10 11 12 12 13C13 12 14 10 17 9V11C15 12 13 13 13 15V22H11Z" fill="#C9A85A" />
    <Circle cx="12" cy="5" r="3.5" fill="#C9A85A" />
    <Circle cx="7" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="17" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="4.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="19.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="9" cy="3" r="2" fill="#C9A85A" />
    <Circle cx="15" cy="3" r="2" fill="#C9A85A" />
  </Svg>
);

const HeritageDivider = () => (
  <Svg width="180" height="20" viewBox="0 0 180 20">
    <Path d="M20 10 L80 10" stroke="#C9A85A" strokeWidth="1" />
    <Path d="M100 10 L160 10" stroke="#C9A85A" strokeWidth="1" />
    <Circle cx="20" cy="10" r="2" fill="#C9A85A" />
    <Circle cx="160" cy="10" r="2" fill="#C9A85A" />
    <Path d="M90 6 L94 10 L90 14 L86 10 Z" fill="#C9A85A" />
  </Svg>
);

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  
  // Mandatory
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // Simple string for now
  const [gender, setGender] = useState('MALE');
  
  // Optional
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!fullName || !mobileNumber || !password || !confirmPassword || !dateOfBirth) {
      Alert.alert(t('error'), 'Please fill all mandatory fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('confirmPassword'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { mobileNumber });
      setOtpSent(true);
    } catch (error: any) {
      Alert.alert(t('error'), error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert(t('error'), 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName,
        mobileNumber,
        password,
        confirmPassword,
        dateOfBirth: new Date(dateOfBirth).toISOString(), // Assuming YYYY-MM-DD input for now
        gender,
        otp,
        whatsappNumber,
        residentialAddress,
        businessAddress,
        occupation,
        businessName
      };

      const response = await api.post('/auth/register', payload);
      const { user, accessToken, refreshToken } = response.data.data;
      
      await login(user, accessToken, refreshToken);
    } catch (error: any) {
      Alert.alert(t('error'), error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <LanguageToggle />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            <View style={styles.cardHeader}>
              <LeafOrnament />
              <Text style={styles.cardTitle}>{t('register')}</Text>
              <View style={styles.cardDividerContainer}>
                <HeritageDivider />
              </View>
            </View>

            <Input label={t('fullName')} value={fullName} onChangeText={setFullName} editable={!otpSent} />
            <Input label={t('mobileNumber')} value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" editable={!otpSent} />
            <Input label={t('password')} value={password} onChangeText={setPassword} secureTextEntry editable={!otpSent} />
            <Input label={t('confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!otpSent} />
            <Input label={t('dob')} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" editable={!otpSent} />
            
            <Text style={styles.label}>{t('gender')}</Text>
            <View style={styles.genderContainer}>
              {['MALE', 'FEMALE'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, gender === g && styles.genderActive]}
                  onPress={() => setGender(g)}
                  disabled={otpSent}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {t(g.toLowerCase() as any) || g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />
            <Text style={styles.optionalTitle}>{t('optionalDetails')}</Text>
            
            <Input label={t('whatsapp')} value={whatsappNumber} onChangeText={setWhatsappNumber} keyboardType="phone-pad" editable={!otpSent} />
            <Input label={t('residentialAddress')} value={residentialAddress} onChangeText={setResidentialAddress} editable={!otpSent} />
            <Input label={t('businessAddress')} value={businessAddress} onChangeText={setBusinessAddress} editable={!otpSent} />
            <Input label={t('occupation')} value={occupation} onChangeText={setOccupation} editable={!otpSent} />
            <Input label={t('businessName')} value={businessName} onChangeText={setBusinessName} editable={!otpSent} />

            {otpSent && (
              <View style={styles.otpSection}>
                <View style={styles.divider} />
                <Input
                  label={t('otp')}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </View>
            )}

            {!otpSent ? (
              <Button title={t('sendOtp')} onPress={handleSendOtp} isLoading={loading} style={styles.button} />
            ) : (
              <Button title={t('register')} onPress={handleRegister} isLoading={loading} style={styles.button} />
            )}
            
            <View style={styles.loginContainer}>
               <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="outline" style={styles.button} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  topBar: { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20, paddingLeft: 10, paddingTop: Platform.OS === 'ios' ? 60 : 40, position: 'relative', zIndex: 10 },
  backText: { color: '#004831', fontFamily: 'Montserrat_600SemiBold', fontSize: 14 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  cardHeader: { alignItems: 'center', marginTop: 0, marginBottom: -5 },
  cardTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: '#19352D', textAlign: 'center' },
  cardDividerContainer: { alignItems: 'center', height: 16, marginBottom: 16 },
  label: { fontSize: 14, color: '#19352D', marginBottom: 6, fontFamily: 'Montserrat_600SemiBold' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  genderButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#E5DDCF', alignItems: 'center', marginHorizontal: 4, borderRadius: 8 },
  genderActive: { backgroundColor: '#004831', borderColor: '#004831' },
  genderText: { color: '#718078', fontFamily: 'Montserrat_500Medium' },
  genderTextActive: { color: '#FFFFFF', fontFamily: 'Montserrat_600SemiBold' },
  divider: { height: 1, backgroundColor: '#E5DDCF', marginVertical: 16 },
  optionalTitle: { fontSize: 16, fontFamily: 'Montserrat_600SemiBold', color: '#19352D', marginBottom: 16 },
  otpSection: { marginTop: 10 },
  button: { marginTop: 16 },
  loginContainer: { marginTop: 16 }
});

export default RegisterScreen;
