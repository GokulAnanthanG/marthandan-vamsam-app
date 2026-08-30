import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Leaf } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const DelicateDivider = ({ width = '60%' }) => (
  <View style={[styles.dividerWrapper, { width }]}>
    <View style={styles.delicateLine} />
    <Leaf size={12} color="#C9A85A" style={{ marginHorizontal: 8 }} />
    <View style={styles.delicateLine} />
  </View>
);

const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(15)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideUpAnim, textFadeAnim]);

  return (
    <View style={styles.container}>
      
      <View style={styles.darkVignette} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        
        {/* Main Logo Image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <Animated.View style={[styles.sloganContainer, { opacity: textFadeAnim }]}>
          
          <DelicateDivider width="60%" />
          
          <Text style={styles.sloganLine1}>
            OUR ROOTS  •  OUR GENERATIONS  •
          </Text>
          <Text style={styles.sloganLine2}>
            OUR LEGACY
          </Text>
          
          <DelicateDivider width="25%" />

          <Text style={styles.subtext}>
            Uniting our past, celebrating our present,{'\n'}inspiring our future.
          </Text>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View style={[styles.bottomSection, { opacity: textFadeAnim }]}>
          
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => {
              if (navigation && navigation.replace) {
                navigation.replace('Login');
              } else if (navigation && navigation.navigate) {
                navigation.navigate('Login');
              }
            }}
          >
            <Leaf size={22} color="#022917" style={styles.buttonIcon} />
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <DelicateDivider width="35%" />
          
          <Text style={styles.poweredByText}>
            Powered by Brothers of Kuttam
          </Text>

        </Animated.View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011A0E', // Ultra deep green background
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Rich shadow overlay
  },
  content: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    paddingTop: height * 0.08,
    paddingBottom: height * 0.04, 
  },
  logoContainer: {
    flex: 0.55, // Adjusted so the bottom typography has enough room
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.95, // Made logo slightly wider to match image dominance
    height: '100%',
  },
  sloganContainer: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    alignSelf: 'center',
  },
  delicateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C9A85A',
    opacity: 0.4,
  },
  sloganLine1: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 10,
    color: '#E5DDCF', // Soft ivory
    letterSpacing: 3.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  sloganLine2: {
    fontFamily: 'CormorantGaramond_600SemiBold', // Serif font exactly like image
    fontSize: 24,
    color: '#C9A85A', // Gold
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtext: {
    fontFamily: 'CormorantGaramond_600SemiBold', // Serif subtext
    fontSize: 14,
    color: '#A8C2B3', // Soft green-grey
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  bottomSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.75,
    height: 54,
    backgroundColor: '#C9A85A', // Solid gold to mimic button
    borderRadius: 27, 
    borderWidth: 1.5,
    borderColor: '#F0C766', // Brighter gold outline
    shadowColor: '#C9A85A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  getStartedText: {
    fontFamily: 'CormorantGaramond_600SemiBold', // Match the serif button font in the image
    fontSize: 22,
    color: '#022917', // Dark green text inside the gold button
  },
  poweredByText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: '#C9A85A',
    opacity: 0.7,
    marginTop: -4, // pull closer to the delicate divider
  }
});

export default SplashScreen;
