export const isDebug = () => {
  const q = new URLSearchParams(location.search);
  const hash = location.hash.replace('#','');
  return (window as any).__DEBUG_FLAG || q.get('debug') === '1' || hash === 'debug';
};