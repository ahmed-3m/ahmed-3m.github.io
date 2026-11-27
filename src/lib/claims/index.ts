// Public, client-safe surface of the claims registry (spec 008). The figure check
// (./check) and the retired figures (./retired) are deliberately not exported here.

export { CLAIMS, DERIVED, isBackedValue, type Claim, type ClaimId, type ClaimUnit } from './registry'
export { QUALIFIERS, type Qualifier, type QualifierId } from './qualifiers'
export { formatLocaleNumber } from './format'
