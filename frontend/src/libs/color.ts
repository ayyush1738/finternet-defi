const getColorForWallet = (walletAddress: string) => {
  const key = `walletColor_${walletAddress}`;
  let color = localStorage.getItem(key);

  if (!color) {
    const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#F59E0B', '#10B981', '#3B82F6'];
    color = colors[Math.floor(Math.random() * colors.length)];
    localStorage.setItem(key, color);
  }

  return color;
};
