const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
  fingerprint: [{modelID: 'TS0202', manufacturerName: '_TZ3000_6ygjfyll'}],
  model: 'TS0202',
  vendor: 'TuYa',
  description: 'Motion sensor (Xavi)',
  ota: ota.zigbeeOTA,
  configure: async (device, coordinatorEndpoint, logger) => {
        const endpoint = device.getEndpoint(1);
        await reporting.bind(endpoint, coordinatorEndpoint, ['ssIasZone']);
    },
  fromZigbee: [fz.ias_occupancy_alarm_1, fz.ias_occupancy_alarm_1_report, fz.ignore_basic_report,
    {
        cluster: 'ssIasZone',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty('currentZoneSensitivityLevel')) {
                const sensitivityLookup = {'low': 0, 'medium': 1, 'high': 2};
                result.sensitivity = sensitivityLookup[msg.data['currentZoneSensitivityLevel']];
            }
            if (msg.data.hasOwnProperty('61441')) {
                const keepTimeLookup = {'30': 0, '60': 1, '120': 2};
                result.keep_time = keepTimeLookup[msg.data['61441']];
            }
            return result;
        },
    }],
  toZigbee: [{
      key: ['sensitivity', 'keep_time'],
      convertSet: async (entity, key, value, meta) => {
            switch (key) {
            case 'sensitivity':
                const sensitivityLookup = {'low': 0, 'medium': 1, 'high': 2};
                await entity.write('ssIasZone', {currentZoneSensitivityLevel: sensitivityLookup[value]}, {disableResponse: true});
                return {readAfterWriteTime: 1000, state: {sensitivity: value}};
            case 'keep_time':
                const keepTimeLookup = {'30': 0, '60': 1, '120': 2};
                await entity.write('ssIasZone', {61441: {value: keepTimeLookup[value], type: 0x20}}, {disableResponse: true});
                return {readAfterWriteTime: 1000, state: {keep_time: value}};
            default: // Unknown key
                throw new Error(`Unhandled key ${key}`);
            }
        },
  }],
  exposes: [e.occupancy(), e.battery_low(), e.tamper(),
    exposes
      .enum('sensitivity', ea.STATE_SET, ['low', 'medium', 'high'])
      .withDescription('PIR sensor sensitivity'),
    exposes
      .enum("keep_time", ea.STATE_SET, ["30", "60", "120"])
      .withDescription("PIR keep time in seconds"),
  ],
};

module.exports = definition;
