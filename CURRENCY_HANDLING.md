# Currency Handling Guide

This application has been updated to handle payment amounts in the smallest currency unit, following payment industry best practices.

## Overview

All payment amounts must be entered and processed in the smallest currency unit:
- **USD**: Enter amounts in cents (100 = $1.00)
- **EUR**: Enter amounts in cents (100 = €1.00)
- **JPY**: Enter amounts in yen (100 = ¥100)
- **GBP**: Enter amounts in pence (100 = £1.00)

## Zero-Decimal Currencies

Some currencies don't have decimal places and are already in their smallest unit:
- JPY (Japanese Yen)
- KRW (Korean Won)
- VND (Vietnamese Dong)
- CLP (Chilean Peso)
- ISK (Icelandic Króna)
- HUF (Hungarian Forint)
- TWD (Taiwan Dollar)
- UGX (Ugandan Shilling)

## Examples

### USD (Cents)
- To charge $1.00: Enter `100` → Displays as "$1.00"
- To charge $10.50: Enter `1050` → Displays as "$10.50"
- To charge $0.99: Enter `99` → Displays as "$0.99"

### EUR (Cents)
- To charge €1.00: Enter `100` → Displays as "€1.00"
- To charge €25.99: Enter `2599` → Displays as "€25.99"

### GBP (Pence)
- To charge £1.00: Enter `100` → Displays as "£1.00"
- To charge £15.75: Enter `1575` → Displays as "£15.75"

### INR (Paise)
- To charge ₹1.00: Enter `100` → Displays as "₹1.00"
- To charge ₹50.25: Enter `5025` → Displays as "₹50.25"

### AUD (Cents)
- To charge A$1.00: Enter `100` → Displays as "A$1.00"
- To charge A$12.99: Enter `1299` → Displays as "A$12.99"

### CAD (Cents)
- To charge C$1.00: Enter `100` → Displays as "C$1.00"
- To charge C$8.75: Enter `875` → Displays as "C$8.75"

### ANG (Cents)
- To charge ƒ1.00: Enter `100` → Displays as "ƒ1.00"
- To charge ƒ20.50: Enter `2050` → Displays as "ƒ20.50"

### JPY (Yen - Zero Decimal)
- To charge ¥100: Enter `100` → Displays as "¥100"
- To charge ¥1000: Enter `1000` → Displays as "¥1000"

## Implementation Details

### Components Updated

1. **InitialPaymentForm.js**
   - Input field now accepts integer values only
   - Placeholder shows examples for different currencies
   - Helper text explains the format
   - Amount is parsed as integer with `parseInt(amount, 10)`

2. **PaymentDetailsPage.js**
   - Similar updates to amount input field
   - Validation ensures positive integers only
   - Amount passed as integer to next component

3. **CardSelectionPage.js**
   - Added `formatAmountForDisplay()` helper function
   - Button text shows properly formatted amount for display
   - API payload uses the integer amount directly

### Helper Function

The `formatAmountForDisplay(amount, currency)` function handles display formatting with proper currency symbols:

```javascript
const formatAmountForDisplay = (amount, currency) => {
  // Zero-decimal currencies (amounts are already in the correct unit)
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'UGX'];
  
  if (zeroDecimalCurrencies.includes(currency?.toUpperCase())) {
    return `${amount} ${currency}`;
  }
  
  // For decimal currencies, divide by 100 to get the major unit
  const majorAmount = (amount / 100).toFixed(2);
  
  // Add currency symbols for better display
  switch (currency?.toUpperCase()) {
    case 'USD':
      return `$${majorAmount}`;
    case 'EUR':
      return `€${majorAmount}`;
    case 'GBP':
      return `£${majorAmount}`;
    case 'INR':
      return `₹${majorAmount}`;
    case 'AUD':
      return `A$${majorAmount}`;
    case 'CAD':
      return `C$${majorAmount}`;
    case 'ANG':
      return `ƒ${majorAmount}`;
    case 'JPY':
      return `¥${amount}`;
    default:
      return `${majorAmount} ${currency}`;
  }
};
```

## API Integration

The payment API receives amounts in the smallest currency unit as integers:

```javascript
const payload = {
  routing_id: routingId,
  payment: { 
    amount: Number(amount), // Integer amount in smallest unit
    currency: currency 
  },
  // ... other fields
};
```

## Benefits

1. **Precision**: Avoids floating-point arithmetic issues
2. **Consistency**: Follows payment industry standards
3. **API Compatibility**: Matches expected format for payment processors
4. **International Support**: Handles both decimal and zero-decimal currencies correctly

## Testing

Test with various amounts to ensure proper handling:

- Small amounts: 1, 50, 99
- Round amounts: 100, 500, 1000
- Large amounts: 999999
- Zero-decimal currencies: JPY amounts like 100, 1000, 5000

## Migration Notes

If you have existing data with decimal amounts, you'll need to convert them:
- Multiply USD/EUR/GBP amounts by 100
- Keep JPY/KRW amounts as-is
- Update any stored amounts in your database accordingly
