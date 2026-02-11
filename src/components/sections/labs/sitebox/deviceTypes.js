/**
 * Shared device type definitions for SiteBox device markers.
 * Used by SiteBoxToolbar (dropdown), SiteBox (state), and SiteBoxCanvas (rendering).
 */
const DEVICE_TYPES = {
  door:      { icon: 'material-symbols:door-front',       color: '#8B5CF6', label: 'Door' },
  camera:    { icon: 'material-symbols:videocam-outline',  color: '#3B82F6', label: 'Camera' },
  enclosure: { icon: 'material-symbols:tv-gen-outline',    color: '#22C55E', label: 'Enclosure' },
  alarm:     { icon: 'material-symbols:alarm-on',          color: '#EF4444', label: 'Alarm' },
  network:   { icon: 'material-symbols:lan',               color: '#F97316', label: 'Network' },
};

export const ANNOTATION_TYPES = {
  observation: { icon: 'material-symbols:visibility',            color: '#06B6D4', label: 'Observation' },
  rfi:         { icon: 'material-symbols:help-circle-outline',   color: '#F59E0B', label: 'RFI' },
  note:        { icon: 'material-symbols:sticky-note-2',         color: '#94A3B8', label: 'Note' },
};

export const TAG_PREFIXES = {
  pin: 'MRK',
  device_door: 'DOR',
  device_camera: 'CAM',
  device_enclosure: 'ENC',
  device_alarm: 'ALM',
  device_network: 'NET',
  observation: 'OBS',
  rfi: 'RFI',
  note: 'NTE',
};

export default DEVICE_TYPES;
