const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require("zigbee-herdsman-converters/lib/tuya");
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');

const {
    precisionRound, mapNumberRange, isLegacyEnabled, toLocalISOString, numberWithinRange, hasAlreadyProcessedMessage,
    calibrateAndPrecisionRoundOptions, addActionGroup, postfixWithEndpointName, getKey,
    batteryVoltageToPercentage, getMetaValue,
} = require('zigbee-herdsman-converters/lib/utils');

const fzLocal = {
    brightness: {
        cluster: 'genLevelCtrl',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data.hasOwnProperty('61440')) {
                const property = postfixWithEndpointName('brightness', msg, model);
                return {[property]: msg.data['61440']};
            }
        },
    },
}

const definition = {
    // Since a lot of Tuya devices use the same modelID, but use different data points
    // it's usually necessary to provide a fingerprint instead of a zigbeeModel
    fingerprint: [
        {
            // The model ID from: Device with modelID 'TS0601' is not supported
            // You may need to add \u0000 at the end of the name in some cases
            modelID: 'TS0052',
            // The manufacturer name from: Device with modelID 'TS0601' is not supported.
            manufacturerName: '_TZ3000_mgusv51k'
        },
    ],
    model: 'FS-05R', // Vendor model number, look on the device for a model number
    vendor: 'TuYa', // Vendor of the device (only used for documentation and startup logging)
    description: 'Mini Dimmable Switch', // Description of the device, copy from vendor site. (only used for documentation and startup logging)
    fromZigbee: [fz.on_off, fzLocal.brightness], // We will add this later
    toZigbee: [tz.on_off, tz.light_onoff_brightness], // Should be empty, unless device can be controlled (e.g. lights, switches).
    exposes: [e.linkquality(),e.light_brightness()], // Defines what this device exposes, used for e.g. Home Assistant discovery and in the frontend
};

module.exports = definition;
