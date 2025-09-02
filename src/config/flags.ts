// Feature flags for safe rollout
export const FLAGS = {
  notifications: import.meta.env.VITE_NOTIFICATIONS === '1',
};