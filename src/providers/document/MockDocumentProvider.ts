/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentProvider } from '../../types/providers';
import { LegalDocument, GoldQuote } from '../../types/domain';

export class MockDocumentProvider implements DocumentProvider {
  public readonly providerName = 'MOCK_DIGITAL_SIGNATURE_SERVICE';

  private documents: Map<string, LegalDocument> = new Map();

  public async generateAgreement(params: {
    orderId: string;
    quote: GoldQuote;
    userName: string;
    userEmail: string;
  }): Promise<LegalDocument> {
    const documentId = `DOC-AGR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const contentMarkdown = `
# ONEX GOLD CUSTODIAL ALLOCATION AGREEMENT
**Document Reference:** TEMPLATE01 / ${documentId}  
**Date of Generation:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}  
**Order Reference:** ${params.orderId}

---

### 1. PARTIES
This OneX Gold Purchase & Custodial Custody Agreement is entered between:
- **Platform & Custodian:** OneX Technologies Ltd & OneX Vault Depository (DMCC Dubai)
- **Investor / Beneficiary:** ${params.userName} (${params.userEmail})

---

### 2. ALLOCATION SPECIFICATION
- **Asset Type:** OneX Gold representing allocated 24K Physical Bullion (1 Token = 1g Gold)
- **Purity:** 999.9 Fine Investment Grade Gold
- **Quantity:** ${params.quote.quantityGrams} Gram(s) [${params.quote.quantityGrams} OneX Gold Tokens]
- **Settlement Amount:** AED ${params.quote.totalPayableAed} (Inclusive of 0.50% Platform Fee AED ${params.quote.platformFeeAed})
- **Underlying Depository Vault:** TransGuard / DMCC Secure Vault Facility, Dubai, UAE

---

### 3. LEGAL TITLE & CUSTODY
1. **Unencumbered Ownership:** Title to physical gold allocated under this agreement passes unencumbered to the Investor upon settlement.
2. **Segregation:** The gold is allocated with specific bar serials and segregated from platform balance sheet assets.
3. **Audit & Inspection:** Backed 1:1 by physical audited gold reserves. The Investor holds the right to transfer, sell, or request physical redemption in accordance with OneX redemption terms.

---
*By applying your electronic signature below, you confirm acceptance of the OneX Gold Purchase Terms and Gold Investment Disclosures.*
`;

    const doc: LegalDocument = {
      documentId,
      orderId: params.orderId,
      templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
      title: 'TEMPLATE01 — OneX Gold Custodial Allocation Agreement',
      description: 'Legal title transfer and 1:1 allocated custodial gold ownership confirmation document.',
      status: 'PENDING',
      signerName: params.userName,
      contentMarkdown,
    };

    this.documents.set(documentId, doc);
    return doc;
  }

  public async signAgreement(params: {
    documentId: string;
    signerName: string;
    signatureIp: string;
  }): Promise<LegalDocument> {
    const doc = this.documents.get(params.documentId);
    if (!doc) {
      throw new Error(`Document ${params.documentId} not found.`);
    }

    doc.status = 'SIGNED';
    doc.signerName = params.signerName;
    doc.signatureDate = new Date().toISOString();
    doc.signatureIp = params.signatureIp;
    doc.signatureHash = `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Date.now()}`;

    return doc;
  }
}
