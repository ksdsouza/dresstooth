/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
  findDevice,
  initBLE,
  sendCommandLightsEnabled,
  sendCommandSetColour,
} from './Bluetooth.tsx';
import BleManager, {Peripheral} from 'react-native-ble-manager';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const COLOURS = [
  [20, 100, 100],
  [40, 100, 100],
  [60, 100, 100],
  [80, 100, 100],
  [100, 100, 100],
  [120, 100, 100],
  [140, 100, 100],
  [160, 100, 100],
  [180, 100, 100],
  [200, 100, 100],
];

function App(): React.JSX.Element {
  const [initialized, setInitialized] = React.useState(false);
  const [device, setDevice] = React.useState<Peripheral | null>(null);
  const [lightsEnabled, setLightsEnabled] = React.useState(false);
  const [colourIndex, setColourIndex] = React.useState(0);
  const [lastError, setLastError] = React.useState<string | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  React.useEffect(() => {
    if (!initialized) {
      initBLE();
      setInitialized(true);
      BleManager.scan([], 5, true);
      setTimeout(() => findDevice(setDevice, setLastError), 5000);
    }
  }, [initialized, setInitialized]);

  const toggleLights = async () => {
    try {
      if (device) {
        await sendCommandLightsEnabled(device, !lightsEnabled);
        setLightsEnabled(!lightsEnabled);
      }
    } catch (e) {
      setLastError(`Error: ${e}`);
      console.error(e);
    }
  };

  const cycleColour = async () => {
    try {
      if (device) {
        const [red, green, blue] = COLOURS[colourIndex];
        await sendCommandSetColour(device, red, green, blue);
        setColourIndex((colourIndex + 1) % COLOURS.length);
      }
    } catch (e) {
      setLastError(`Error: ${e}`);
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            <Text>Initialized: {initialized}</Text>
            <Text>Device: {device?.name}</Text>
            <Text>Lights Enabled: {lightsEnabled ? 'Yes' : 'No'}</Text>
            <Text>Colour: {COLOURS[colourIndex].join(', ')}</Text>
            <Text>Last error: {lastError}</Text>
            <Button onPress={toggleLights} title="Toggle Lights" />
            <Button onPress={cycleColour} title="Cycle Colour" />
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
