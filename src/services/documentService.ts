/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockDocumentProvider } from '../providers/document/MockDocumentProvider';
import { LegalDocument, GoldQuote } from '../types/domain';
import { store } from '../lib/store';

const documentProvider = new MockDocumentProvider();

export class DocumentService {
  public static async generateDocument(orderId: string, quote: GoldQuote): Promise<LegalDocument> {
    const doc = await documentProvider.generateAgreement({
      orderId,
      quote,
      userName: store.userProfile.name,
      userEmail: store.userProfile.email,
    });

    store.recordAuditEvent({
      orderId,
      userId: store.userProfile.userId,
      eventType: 'DOCUMENT_GENERATED',
      status: 'DOCUMENT_PENDING',
      referenceId: doc.documentId,
      actor: 'SYSTEM',
      metadata: { templateId: doc.templateId, title: doc.title },
    });

    return doc;
  }

  public static async signDocument(
    documentId: string,
    orderId: string,
    signerName: string,
    signatureIp: string,
  ): Promise<LegalDocument> {
    const doc = await documentProvider.signAgreement({
      documentId,
      signerName,
      signatureIp,
    });

    store.recordAuditEvent({
      orderId,
      userId: store.userProfile.userId,
      eventType: 'DOCUMENT_SIGNED',
      status: 'DOCUMENT_SIGNED',
      referenceId: doc.documentId,
      actor: 'CUSTOMER',
      metadata: {
        signerName,
        signatureIp,
        signatureHash: doc.signatureHash,
      },
    });

    return doc;
  }
}
