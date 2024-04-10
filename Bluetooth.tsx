import BleManager, {Peripheral} from 'react-native-ble-manager';

const SERVICE_UUID = '0000ffff-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';
export const CHARACTERISTIC_ID = 'ff01';

const FUCKING_ONE_BILLION = 1000000000;

export const initBLE = () => {
  BleManager.start({showAlert: false});
  BleManager.enableBluetooth();
};

export const sendCommandLightsEnabled = async (
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

export const sendCommandSetColour = async (
  peripheral: Peripheral,
  hue: number, // 1 to 200?
  saturation: number, // 0 to 100
  value: number, // 0 to 100
): Promise<void> => {
  const dataArr = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x57, 0x58, 0x0b, 0xe1, 0x03, 0x00, 0x14,
    0x00, 0x00, 0x14,
  ].concat(Array(20).fill([0x69, hue, saturation, value]).flat(Infinity));
  const buffer = Buffer.from(dataArr);
  console.log('Buffer: ', buffer.toJSON().data);
  await BleManager.write(
    peripheral.id,
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    buffer.toJSON().data,
    FUCKING_ONE_BILLION,
  );
};

export const checkForServicesOnDevice = async (
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

export const findDevice = async (
  setDevice: (device: Peripheral) => void,
  setLastError: (str: string) => void,
) => {
  try {
    const devices = await BleManager.getDiscoveredPeripherals();
    console.log('Devices found: ', devices);
    for (let dev of devices) {
      console.log('Device found: ', dev);
      if (dev.name === 'IOTBT769') {
        await checkForServicesOnDevice(dev, setDevice, setLastError);
      }
    }
  } catch (e) {
    setLastError(`Error: ${e}`);
    console.error(e);
  }
};
