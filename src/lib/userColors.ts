// Generate consistent color for each user name
export const getUserColor = (name: string): string => {
  if (!name) return 'bg-gray-500';
  
  // Create hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Predefined vibrant colors with good contrast
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-rose-500'
  ];
  
  // Use hash to select color consistently
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
