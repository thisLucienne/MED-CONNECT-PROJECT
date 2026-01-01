import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const pulseAnim1 = new Animated.Value(1);
  const pulseAnim2 = new Animated.Value(1);
  const pulseAnim3 = new Animated.Value(1);

  useEffect(() => {
    // Animation des cercles
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.2,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createPulseAnimation(pulseAnim1, 0);
    const animation2 = createPulseAnimation(pulseAnim2, 150);
    const animation3 = createPulseAnimation(pulseAnim3, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={['#60a5fa', '#3b82f6', '#2563eb']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Cercles animés */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.circle,
              styles.circle1,
              { transform: [{ scale: pulseAnim1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle2,
              { transform: [{ scale: pulseAnim2 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle3,
              { transform: [{ scale: pulseAnim3 }] },
            ]}
          />

          {/* Logo principal */}
          <View style={styles.logo}>
            <View style={styles.plusVertical} />
            <View style={styles.plusHorizontal} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.title}>Med-Connect</Text>

        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>

        <Text style={styles.copyright}>© ECHOMEDI (Med-eHub SARL)</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  circle1: {
    width: 180,
    height: 180,
  },
  circle2: {
    width: 140,
    height: 140,
  },
  circle3: {
    width: 100,
    height: 100,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  plusVertical: {
    position: 'absolute',
    width: 10,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 50,
    height: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '600',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
});

export default SplashScreen;