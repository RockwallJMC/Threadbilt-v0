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

export default DEVICE_TYPES;
