
import simplepyble
import time
from colorsys import rgb_to_hsv
adapters = simplepyble.Adapter.get_adapters()
adapter = adapters[0]
print("Using adapter: " + adapter.address())

COUNTER = "69"
STANDARD_HEADER = f"00 {COUNTER} 80 00 00"

ON_PACKET = bytes.fromhex(f"{STANDARD_HEADER} 0d 0e 0b 3b 23 00 00 00 00 00 00 00 32 00 00 90")  
OFF_PACKET = bytes.fromhex(f"{STANDARD_HEADER} 0d 0e 0b 3b 24 00 00 00 00 00 00 00 32 00 00 91")

SERVICE_UUID = "0000ffff-0000-1000-8000-00805f9b34fb"
WRITE_UUID   = "0000ff01-0000-1000-8000-00805f9b34fb"

SKIRT_ADDR = "08:65:f0:23:97:69"
DEVICE_NAME = "IOTBT769"

h, s, v = rgb_to_hsv(255, 0, 0)

# rgb_chunk_1 = "a1 76 e4 64"
rgb_chunk_1 = "a1 76 e4 64"

# rgb_chunk_3 = "a1 02 57 64"

mystery = "0c"

def get_colour_payload(h, s, v):
    coloured_chunk = f"a1 {h:02x} {s:02x} {v:02x}"
    return f"{STANDARD_HEADER} 57 58 0b e1 03 00 14 00 00 14 {coloured_chunk}"
    

# next two hex numbers represent the length of the rest of the payload (that's the 0x58), and 1 minus that (that's the 0x57)
# x = lambda: f"{STANDARD_HEADER} 57 58 0b e1 03 00 14 00 00 14 {20*rgb_chunk_1}"
# x = f"{STANDARD_HEADER} 57 58 0b e1 03 00 14 00 00 14 a1 02 57 64 a1 02 57 64 a1 02 57 64 a1 02 5764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764a1025764"
# x = f'00 {COUNTER} 80 00 00 0d 0e 0b 3b a1 00 64 64 00 00 00 00 00 00 00 00' # 10, 11, 12

# x = f"001680000057580be1030014000014 {rgb_chunk_1}"
# 0x64 is the brightness (Anything more than 0x64 seems to wrap around? (=> 0x64 == 0d100))
# a1 doesn't seem to do anything?
# 3a bit seems to be picking the hue?
# e2 is the saturation 
rgb_chunk_2 = "a1 3a e2 64"

y = f"00 16 80 00 00 57 58 0b e1 03 00 01 00 00 01 {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2} {rgb_chunk_2}"

def log_all_characteristics(peripheral):
    for service in peripheral.services():
        print(service.uuid())
        for characteristic in service.characteristics():
            print(f"\t{characteristic.uuid()}")

def power(peripheral, *, on=True):
    if on:
        print("Turning on LEDs")
        peripheral.write_command(SERVICE_UUID, WRITE_UUID, ON_PACKET)
    else:
        print("Turning off LEDs")
        peripheral.write_command(SERVICE_UUID, WRITE_UUID, OFF_PACKET)


def write_colour(peripheral, *, h, s=100, v=100):
    coloured_chunk = f"69 {h:02x} {s:02x} {v:02x}"
    print(coloured_chunk)
    payload = bytes.fromhex(f"{STANDARD_HEADER} 57 58 0b e1 03 00 14 00 00 14 {20*coloured_chunk}")
    peripheral.write_request(SERVICE_UUID, WRITE_UUID, payload)   


adapter.scan_for(2000)
peripherals = adapter.scan_get_results()
for peripheral in peripherals:
    print(peripheral.identifier())
    if peripheral.identifier().startswith(DEVICE_NAME):
        try:
            print("Connecting to skirt")
            peripheral.connect()
            print("Connected to skirt")

            log_all_characteristics(peripheral)

            power(peripheral, on=True)

            print("Setting x")

            # write_colour(peripheral, h=30)
            # time.sleep(1)

            for i in range(255):
                write_colour(peripheral, h=i)
                time.sleep(0.06)

            # write_colour(peripheral, h=40)
            # time.sleep(1)

            # write_colour(peripheral, h=10)
            # time.sleep(1)


            # for value in ["00", "10", "20","30","40","50","60", "70", "80", "90", "a0", "b0", "c0", "d0", "e0", 'f0']:
            # for value in range(255):
            #     # mystery = value
            #     rgb_chunk_1 = f"a1 {value:02x} 64 64"
            #     payload = x()
            #     print(f"trying {payload}")
            #     peripheral.write_request(SERVICE_UUID, WRITE_UUID, bytes.fromhex(payload))
            #     time.sleep(0.06)

            power(peripheral, on=False)
        finally:
            peripheral.disconnect()
            break
