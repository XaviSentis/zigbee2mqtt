const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;
const ea = exposes.access;
const legacy = require('zigbee-herdsman-converters/lib/legacy');
const tuya = require('zigbee-herdsman-converters/lib/tuya');

module.exports = [{
	fingerprint: [{
		modelID: 'TS0601',
		manufacturerName: '_TZE204_7gclukjs',
	}],
	model: 'ZM-M100-24G',
	vendor: 'Wenzhi',
	description: 'Sensor de presencia humana 24G v2',
	fromZigbee: [tuya.fz.datapoints],
	toZigbee: [tuya.tz.datapoints],
	onEvent: legacy.onEventSetLocalTime,
	exposes: [
		exposes.enum('state', ea.STATE, ['none', 'presence', 'move']).withDescription('Estado'),
		e.presence().withDescription('Presencia'),
		exposes.numeric('distance', ea.STATE).withDescription('Distancia'),
		e.illuminance_lux().withDescription('Iluminación').withUnit('lux'),
		exposes.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(10).withValueStep(1).withDescription('Sensibilidad del radar'),
		exposes.numeric('presence_sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(10).withValueStep(1).withDescription('Sensibilidad de presencia'),
		exposes.numeric('detection_distance_min', ea.STATE_SET).withValueMin(0).withValueMax(8.25).withValueStep(0.75).withUnit('m').withDescription('Distancia mínima'),
		exposes.numeric('detection_distance_max', ea.STATE_SET).withValueMin(0.75).withValueMax(9).withValueStep(0.75).withUnit('m').withDescription('Distancia máxima'),
		exposes.numeric('keep_time', ea.STATE_SET).withValueMin(5).withValueMax(15000).withValueStep(1).withUnit('s').withDescription('Demora'),
	],
	meta: {
		multiEndpoint: true,
		tuyaDatapoints: [
			[104, 'presence', tuya.valueConverter.trueFalse1],
			[2, 'radar_sensitivity', tuya.valueConverter.raw],
			[102, 'presence_sensitivity', tuya.valueConverter.raw],
			[3, 'detection_distance_min', tuya.valueConverter.divideBy100],
			[4, 'detection_distance_max', tuya.valueConverter.divideBy100],
			[9, 'distance', tuya.valueConverter.divideBy100],
			[105, 'keep_time', tuya.valueConverter.raw],
			[103, 'illuminance_lux', tuya.valueConverter.raw],
			[1, 'state', tuya.valueConverterBasic.lookup({
				'none': 0,
				'presence': 1,
				'move': 2
			})],
		],
	},
}, ];
