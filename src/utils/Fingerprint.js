import FingerprintJS from '@fingerprintjs/fingerprintjs';

const getFingerprint = async () => {
    try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        
        const result = await fp.get();
        
        return result.visitorId;
    } catch(err){
        console.log(err);
        return; null;
    }
};

export default getFingerprint;
