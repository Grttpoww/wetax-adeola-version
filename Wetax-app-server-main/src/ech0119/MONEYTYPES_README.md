# MoneyTypes in eCH-0119

## Übersicht

Das eCH-0119 XSD definiert **zwei verschiedene MoneyTypes**:

### moneyType1 (Integer)
- **Typ**: `xs:integer`
- **Format**: Ganze Zahl, **KEINE Dezimalstellen**
- **Range**: -999999999999 bis 999999999999
- **Verwendung**: Die meisten Geldbeträge (Revenue, Deduction, Assets, etc.)

### moneyType2 (Decimal)
- **Typ**: `xs:decimal`
- **Format**: Dezimalzahl mit **max. 2 Nachkommastellen**
- **Range**: -999999999999.99 bis 999999999999.99
- **Verwendung**: Nur für `withholdingTax` (Verrechnungssteuer)

## Implementierung

### formatMoney() - für moneyType1
```typescript
export function formatMoney(value: number | undefined): number | undefined {
  if (value === undefined) return undefined
  // moneyType1 ist Integer - runden auf ganze Zahl
  return Math.round(value)
}
```

### formatMoneyType2() - für moneyType2
```typescript
export function formatMoneyType2(value: number | undefined): number | undefined {
  if (value === undefined) return undefined
  // moneyType2 ist Decimal mit 2 Nachkommastellen
  return Math.round(value * 100) / 100
}
```

## Verwendung in Mappern

### ✅ Korrekt
```typescript
// moneyType1 (Integer) - die meisten Felder
cantonalTax: formatMoney(computed.totalEinkuenfte)  // → 15000 (Integer)

// moneyType2 (Decimal) - nur withholdingTax
withholdingTax: formatMoneyType2(123.456)  // → 123.46 (Decimal)
```

### ❌ Falsch
```typescript
// FALSCH: Dezimalstellen für moneyType1
cantonalTax: 15000.50  // ❌ moneyType1 ist Integer!

// FALSCH: Integer für moneyType2
withholdingTax: 123  // ❌ moneyType2 braucht Dezimalstellen!
```

## Felder nach MoneyType

### moneyType1 (Integer) - Die meisten Felder
- `partner1Amount`, `partner2Amount`
- `cantonalTax`, `federalTax`
- `fiscalValue`, `businessPortion`
- `paymentPensionTotal`
- `provision3aPartner1Effective`
- Alle Revenue-, Deduction-, Asset-Beträge

### moneyType2 (Decimal) - Nur ein Feld
- `withholdingTax` (in `listOfSecurities`)

## Wichtige Erkenntnis

**moneyType1 ist Integer, nicht Decimal!**

Die vorherige Implementierung mit `roundToTwoDecimals()` war **falsch** für moneyType1. 
Alle Geldbeträge (außer withholdingTax) müssen als **ganze Zahlen** formatiert werden.

## Migration

Alle Mapper verwenden jetzt `formatMoney()` für moneyType1-Felder, was auf Integer rundet.

Falls in Zukunft `withholdingTax` implementiert wird, muss `formatMoneyType2()` verwendet werden.

