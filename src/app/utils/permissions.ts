export type PermissionState = 'granted' | 'denied' | 'prompt';

const KEY = 'miahuabus_location_permission';

export function getLocationPermission(): PermissionState {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return 'prompt';
    if (v === 'granted') return 'granted';
    return 'denied';
  } catch (e) {
    return 'prompt';
  }
}

export function setLocationPermission(state: PermissionState) {
  try {
    localStorage.setItem(KEY, state);
  } catch (e) {
    // ignore
  }
}
