const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;
const legacy = require('zigbee-herdsman-converters/lib/legacy');

const definition = {
  fingerprint: [{
    modelID: 'TS0601',
    manufacturerName: '_TZE200_vvmbj46n'
  }],
  model: 'TH05Z',
  vendor: 'TuYa',
  description: 'Temperature & humidity sensor with clock',
  ota: ota.zigbeeOTA,
  fromZigbee: [legacy.fromZigbee.nous_lcd_temperature_humidity_sensor, fz.ignore_tuya_set_time],
  toZigbee: [legacy.toZigbee.nous_lcd_temperature_humidity_sensor],
  onEvent: tuya.onEventSetLocalTime,
  configure: async (device, coordinatorEndpoint, logger) => {
    const endpoint = device.getEndpoint(1);
    await reporting.bind(endpoint, coordinatorEndpoint, ['genBasic']);
  },
  exposes: [
    e.temperature(), e.humidity(), e.battery(),
    e.numeric('temperature_report_interval', ea.STATE_SET).withUnit('min').withValueMin(1).withValueMax(60)
    .withValueStep(1)
    .withDescription('Temperature Report interval'),
    e.numeric('humidity_report_interval', ea.STATE_SET).withUnit('min').withValueMin(1).withValueMax(60)
    .withValueStep(1)
    .withDescription('Humidity Report interval'),
    e.enum('temperature_unit_convert', ea.STATE_SET, ['celsius', 'fahrenheit']).withDescription(
      'Current display unit'),
    e.enum('temperature_alarm', ea.STATE, ['canceled', 'lower_alarm', 'upper_alarm'])
    .withDescription('Temperature alarm status'),
    e.numeric('max_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60)
    .withDescription('Alarm temperature max'),
    e.numeric('min_temperature', ea.STATE_SET).withUnit('°C').withValueMin(-20).withValueMax(60)
    .withDescription('Alarm temperature min'),
    e.enum('humidity_alarm', ea.STATE, ['canceled', 'lower_alarm', 'upper_alarm'])
    .withDescription('Humidity alarm status'),
    e.numeric('max_humidity', ea.STATE_SET).withUnit('%').withValueMin(0).withValueMax(100)
    .withDescription('Alarm humidity max'),
    e.numeric('min_humidity', ea.STATE_SET).withUnit('%').withValueMin(0).withValueMax(100)
    .withDescription('Alarm humidity min'),
  ],
};

module.exports = definition;
