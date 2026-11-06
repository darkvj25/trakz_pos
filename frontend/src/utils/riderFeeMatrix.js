/**
 * Rider's Fee Matrix & Customer Convenience Fee Matrix Configuration and Calculation Utilities
 *
 * Rider Fee Structure:
 * ---------------------------------------------------------------------------------
 * Distance        | Customer Fee (₱) | Rider Payout (₱) | TrakZ Margin (₱)
 * ---------------------------------------------------------------------------------
 * 0 - 2 km        | ₱45              | ₱38              | ₱7
 * >2 - 3 km       | ₱50              | ₱43              | ₱7
 * >3 - 4 km       | ₱55              | ₱45              | ₱10
 * >4 - 5 km       | ₱60              | ₱50              | ₱10
 * >5 - 6 km       | ₱65              | ₱55              | ₱10
 * >6 - 7 km       | ₱70              | ₱60              | ₱10
 * >7 - 8 km       | ₱75              | ₱65              | ₱10
 * 8 - under 10 km | ₱90              | ₱75              | ₱15
 * 10 - 11 km      | ₱93              | ₱78              | ₱15
 * >11 - 15 km     | ₱95              | ₱80              | ₱15
 * ---------------------------------------------------------------------------------
 *
 * Customer Convenience Fee Structure (Malaybalay Pilot Pricing):
 * ---------------------------------------------------------------------------------
 * Product Subtotal (Total Cart Items)  | Convenience Fee (Per Order)
 * ---------------------------------------------------------------------------------
 * ₱1 – ₱100                             | ₱5.00
 * ₱101 – ₱500                           | ₱7.50
 * Above ₱500                            | ₱10.00
 * ---------------------------------------------------------------------------------
 * Notes:
 * - Based on product subtotal.
 * - Only one convenience fee per order.
 * - Separate from delivery fee and optional rider tip.
 */

export const RIDER_FEE_MATRIX = [
  { minKm: 0, maxKm: 2, label: '0–2 km', customerFee: 45, riderPayout: 38, margin: 7, inclusiveMax: true },
  { minKm: 2, maxKm: 3, label: '>2–3 km', customerFee: 50, riderPayout: 43, margin: 7, inclusiveMax: true },
  { minKm: 3, maxKm: 4, label: '>3–4 km', customerFee: 55, riderPayout: 45, margin: 10, inclusiveMax: true },
  { minKm: 4, maxKm: 5, label: '>4–5 km', customerFee: 60, riderPayout: 50, margin: 10, inclusiveMax: true },
  { minKm: 5, maxKm: 6, label: '>5–6 km', customerFee: 65, riderPayout: 55, margin: 10, inclusiveMax: true },
  { minKm: 6, maxKm: 7, label: '>6–7 km', customerFee: 70, riderPayout: 60, margin: 10, inclusiveMax: true },
  { minKm: 7, maxKm: 8, label: '>7–8 km', customerFee: 75, riderPayout: 65, margin: 10, inclusiveMax: true },
  { minKm: 8, maxKm: 10, label: '8–under 10 km', customerFee: 90, riderPayout: 75, margin: 15, inclusiveMax: false },
  { minKm: 10, maxKm: 11, label: '10–11 km', customerFee: 93, riderPayout: 78, margin: 15, inclusiveMax: true },
  { minKm: 11, maxKm: 15, label: '>11–15 km', customerFee: 95, riderPayout: 80, margin: 15, inclusiveMax: true },
];

export const CONVENIENCE_FEE_MATRIX = [
  { minSubtotal: 1, maxSubtotal: 100, label: '₱1 – ₱100', fee: 5.00, inclusiveMax: true },
  { minSubtotal: 101, maxSubtotal: 500, label: '₱101 – ₱500', fee: 7.50, inclusiveMax: true },
  { minSubtotal: 500, maxSubtotal: Infinity, label: 'Above ₱500', fee: 10.00, inclusiveMax: false },
];

/**
 * Calculates delivery fee breakdown for a given distance in kilometers.
 * @param {number} distanceInKm - Distance in kilometers
 * @returns {object|null} - Fee details or null if invalid distance
 */
export const getRiderFeeDetails = (distanceInKm) => {
  const dist = parseFloat(distanceInKm);
  if (isNaN(dist) || dist < 0) return null;

  for (const tier of RIDER_FEE_MATRIX) {
    const minMatch = dist > tier.minKm || (tier.minKm === 0 && dist >= 0);
    const maxMatch = tier.inclusiveMax ? dist <= tier.maxKm : dist < tier.maxKm;

    if (minMatch && maxMatch) {
      return {
        distance: dist,
        tierLabel: tier.label,
        customerFee: tier.customerFee,
        riderPayout: tier.riderPayout,
        trakzMargin: tier.margin,
      };
    }
  }

  // Fallback if distance > 15km
  if (dist > 15) {
    const maxTier = RIDER_FEE_MATRIX[RIDER_FEE_MATRIX.length - 1];
    return {
      distance: dist,
      tierLabel: '>15 km (Max Tier Applied)',
      customerFee: maxTier.customerFee,
      riderPayout: maxTier.riderPayout,
      trakzMargin: maxTier.margin,
      exceedsMaxRange: true,
    };
  }

  return null;
};

/**
 * Calculates customer convenience fee based on product subtotal (Malaybalay Pilot Pricing).
 * @param {number} subtotalAmount - Total of items in cart (₱)
 * @returns {object} - Convenience fee breakdown
 */
export const getConvenienceFeeDetails = (subtotalAmount) => {
  const subtotal = parseFloat(subtotalAmount);
  if (isNaN(subtotal) || subtotal <= 0) {
    return {
      subtotal: 0,
      tierLabel: 'N/A',
      convenienceFee: 0,
    };
  }

  if (subtotal <= 100) {
    return {
      subtotal,
      tierLabel: '₱1 – ₱100',
      convenienceFee: 5.00,
    };
  }

  if (subtotal <= 500) {
    return {
      subtotal,
      tierLabel: '₱101 – ₱500',
      convenienceFee: 7.50,
    };
  }

  return {
    subtotal,
    tierLabel: 'Above ₱500',
    convenienceFee: 10.00,
  };
};

/**
 * Calculates full order totals including subtotal, delivery fee, convenience fee, rider tip, and discounts.
 * @param {number} subtotal - Cart subtotal (₱)
 * @param {number} distanceInKm - Delivery distance in km
 * @param {number} discount - Applied discount amount (₱)
 * @param {number} riderTip - Optional Rider's Tip amount (₱)
 * @returns {object} - Comprehensive fee breakdown
 */
export const calculateOrderTotalDetails = (subtotal = 0, distanceInKm = 0, discount = 0, riderTip = 0) => {
  const riderFeeDetails = getRiderFeeDetails(distanceInKm);
  const convenienceFeeDetails = getConvenienceFeeDetails(subtotal);

  const deliveryFee = riderFeeDetails ? riderFeeDetails.customerFee : 0;
  const convenienceFee = convenienceFeeDetails ? convenienceFeeDetails.convenienceFee : 0;
  const parsedSubtotal = Math.max(0, parseFloat(subtotal) || 0);
  const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
  const parsedRiderTip = Math.max(0, parseFloat(riderTip) || 0);

  const totalAmount = Math.max(0, parsedSubtotal + deliveryFee + convenienceFee + parsedRiderTip - parsedDiscount);

  return {
    subtotal: parsedSubtotal,
    deliveryFee,
    convenienceFee,
    riderTip: parsedRiderTip,
    discount: parsedDiscount,
    totalAmount,
    riderFeeDetails,
    convenienceFeeDetails,
  };
};
