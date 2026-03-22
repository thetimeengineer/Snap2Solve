export const categoryIcons: Record<string, string> = {
  pothole: '🕳️',
  streetlight: '💡',
  garbage: '🗑️',
  water: '🚰',
  drainage: '🌊',
  traffic: '🚦',
  park: '🌳',
  other: '📋'
};

export const statusColors: Record<string, string> = {
  reported: 'bg-red-100 text-red-800',
  acknowledged: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};
