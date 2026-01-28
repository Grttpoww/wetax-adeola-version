export interface CountryData {
  code: string
  name: string
  flag: string
  phoneCode: string
}

export const COUNTRIES: CountryData[] = [
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', phoneCode: '+43' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phoneCode: '+32' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', phoneCode: '+352' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', phoneCode: '+423' },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
]

export const DEFAULT_COUNTRY = COUNTRIES[0] // Switzerland as default
