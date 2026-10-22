import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedDeviceId = null;

const getFingerprint = async () => {
    // 1. Agar localStorage me already persistent stable device ID hai toh wahi use karo
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('admin_device_id');
            if (stored) {
                cachedDeviceId = stored;
                return stored;
            }
        } catch (_) {}
    }

    if (cachedDeviceId) return cachedDeviceId;

    try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        if (result && result.visitorId) {
            cachedDeviceId = result.visitorId;
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('admin_device_id', cachedDeviceId);
                } catch (_) {}
            }
            return cachedDeviceId;
        }
    } catch(err) {
        console.warn('FingerprintJS load error:', err);
    }

    // Fallback: stable unique device ID generate karo taaki kabhi undefined/null na jaye
    const fallbackId = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    cachedDeviceId = fallbackId;
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('admin_device_id', fallbackId);
        } catch (_) {}
    }
    return fallbackId;
};

export default getFingerprint;
