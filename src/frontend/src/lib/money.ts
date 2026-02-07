export function formatPrice(priceInPaise: bigint | number): string {
  const price = typeof priceInPaise === 'bigint' ? Number(priceInPaise) : priceInPaise;
  const rupees = price / 100;
  return `₹${rupees.toFixed(2)}`;
}

export function formatPriceShort(priceInPaise: bigint | number): string {
  const price = typeof priceInPaise === 'bigint' ? Number(priceInPaise) : priceInPaise;
  const rupees = price / 100;
  
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  
  return `₹${Math.round(rupees)}`;
}
