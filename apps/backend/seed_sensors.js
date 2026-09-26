require('dotenv').config();
const mongoose = require('mongoose');
const Sensor = require('./src/models/Sensor');

const sensorsData = [
  {
    name: "ESP32 NodeMCU Wi-Fi & Bluetooth IoT Development Board",
    type: "Microcontroller / IoT Dev Board",
    department: "Internet of Things (IoT)",
    totalQuantity: 25,
    availableQuantity: 22,
    conditionSummary: "working",
    unitConditionLog: [
      {
        condition: "working",
        notes: "Dual-core 240MHz with integrated Wi-Fi & BLE 4.2. Tested and verified for semester lab assignments.",
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "DHT22 / AM2302 High-Precision Digital Temperature & Humidity Sensor",
    type: "Environmental Sensor",
    department: "Electronics & Communication (ECE)",
    totalQuantity: 30,
    availableQuantity: 28,
    conditionSummary: "working",
    unitConditionLog: [
      {
        condition: "working",
        notes: "Calibrated digital output, operating range -40°C to 80°C with ±0.5°C accuracy.",
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "MQ-135 Hazardous Gas & Air Quality Detection Sensor Module",
    type: "Gas & Chemical Sensor",
    department: "Internet of Things (IoT)",
    totalQuantity: 20,
    availableQuantity: 17,
    conditionSummary: "working",
    unitConditionLog: [
      {
        condition: "working",
        notes: "Wide detecting scope for NH3, NOx, alcohol, benzene, smoke, and CO2.",
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "HC-SR04 Ultrasonic Distance Measuring Transducer Sensor",
    type: "Proximity & Distance Sensor",
    department: "Electrical Engineering",
    totalQuantity: 35,
    availableQuantity: 32,
    conditionSummary: "working",
    unitConditionLog: [
      {
        condition: "working",
        notes: "Non-contact measurement range 2cm to 400cm, compatible with 5V microcontrollers.",
        updatedAt: new Date()
      }
    ]
  },
  {
    name: "Raspberry Pi 4 Model B (4GB RAM) Embedded IoT Laboratory Kit",
    type: "Single Board Computer / Lab Kit",
    department: "Electronics & Communication (ECE)",
    totalQuantity: 15,
    availableQuantity: 12,
    conditionSummary: "working",
    unitConditionLog: [
      {
        condition: "working",
        notes: "Quad-core 64-bit ARM Cortex-A72 @ 1.5GHz with power adapter, case, and 32GB MicroSD.",
        updatedAt: new Date()
      }
    ]
  }
];

async function seedSensors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Remove existing test sensors if any or insert if empty
    const existing = await Sensor.find({});
    if (existing.length === 0) {
      await Sensor.insertMany(sensorsData);
      console.log("Successfully seeded 5 sensor catalog items!");
    } else {
      console.log(`Found ${existing.length} sensors already in database. Adding any missing items...`);
      for (const item of sensorsData) {
        const found = await Sensor.findOne({ name: item.name });
        if (!found) {
          await Sensor.create(item);
          console.log(`Created: ${item.name}`);
        }
      }
    }

    const finalCount = await Sensor.countDocuments();
    console.log(`Total sensor catalog items now in database: ${finalCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding sensors:", err);
    process.exit(1);
  }
}

seedSensors();
