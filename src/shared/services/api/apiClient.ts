// Re-export Firebase instances from the central config.
// This prevents duplicate app initialization errors.
export { auth, db } from '../../../config/firebase';
