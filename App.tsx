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

import BleManager, {Peripheral} from 'react-native-ble-manager';

import {Buffer} from 'buffer';

const SERVICE_UUID = '0000ffff-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_ID = 'ff01';

const FUCKING_ONE_BILLION = 1000000000;

const initBLE = () => {
  BleManager.start({showAlert: false});
  BleManager.enableBluetooth();
};

const sendCommandLightsEnabled = async (
  peripheral: Peripheral,
  enabled: boolean,
): Promise<void> => {
  const buffer = Buffer.from([
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x0d,
    0x0e,
    0x0b,
    0x3b,
    enabled ? 0x23 : 0x24,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ]);
  console.log(
    `Sending command to ${peripheral.id} on ${SERVICE_UUID}/${CHARACTERISTIC_UUID}`,
  );
  const hexBuffer = buffer
    .toJSON()
    .data.map((byte: number) => byte.toString(16).padStart(2, '0'))
    .join(' ');
  console.log('Buffer: ', hexBuffer);
  await BleManager.write(
    peripheral.id,
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    buffer.toJSON().data,
    FUCKING_ONE_BILLION,
  );
};

const sendCommandSetColour = async (
  peripheral: Peripheral,
  hue: number, // 1 to 200?
  saturation: number, // 0 to 100
  value: number, // 0 to 100
): Promise<void> => {
  const buffer = Buffer.from([
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x57,
    0x58,
    0x0b,
    0xe1,
    0x03,
    0x00,
    0x14,
    0x00,
    0x00,
    0x14,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
    0x69,
    hue,
    saturation,
    value,
  ]);
  console.log('Buffer: ', buffer.toJSON().data);
  await BleManager.write(
    peripheral.id,
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    buffer.toJSON().data,
    FUCKING_ONE_BILLION,
  );
};

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

const checkForServicesOnDevice = async (
  device: Peripheral,
  setDevice: (device: Peripheral) => void,
  setLastError: (str: string) => void,
) => {
  try {
    await BleManager.connect(device.id);
    const services = await BleManager.retrieveServices(device.id);
    console.log('Services found: ', services);
    for (let characteristic of services.characteristics || []) {
      if (characteristic.characteristic.toLowerCase() === CHARACTERISTIC_ID) {
        setDevice(device);
        return;
      }
    }
  } catch (e) {
    setLastError(`Error: ${e}`);
    console.error(e);
  }
};

const findDevice = async (
  setDevice: (device: Peripheral) => void,
  setLastError: (str: string) => void,
) => {
  try {
    const devices = await BleManager.getDiscoveredPeripherals();
    console.log('Devices found: ', devices);
    for (let dev of devices) {
      console.log('Device found: ', dev);
      if (dev.name === 'IOTBT769') {
        checkForServicesOnDevice(dev, setDevice, setLastError);
      }
    }
  } catch (e) {
    setLastError(`Error: ${e}`);
    console.error(e);
  }
};

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
