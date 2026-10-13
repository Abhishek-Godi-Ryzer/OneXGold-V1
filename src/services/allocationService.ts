/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockGoldAllocationProvider } from '../providers/allocation/MockGoldAllocationProvider';
import { GoldAllocationRecord } from '../types/domain';
import { store } from '../lib/store';

const allocationProvider = new MockGoldAllocationProvider();

export class AllocationService {
  public static async allocatePhysicalGold(params: {
    orderId: string;
    goldGrams: string;
    executionId: string;
  }): Promise<GoldAllocationRecord> {
    store.recordAuditEvent({
      orderId: params.orderId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_ALLOCATION_STARTED',
      status: 'GOLD_ALLOCATING',
      referenceId: params.executionId,
      actor: 'VAULT_CUSTODIAN',
      metadata: { goldGrams: params.goldGrams },
    });

    const allocation = await allocationProvider.allocateGold({
      orderId: params.orderId,
      goldGrams: params.goldGrams,
      executionId: params.executionId,
      forceFailure: store.simulationConfig.forceAllocationFailure,
    });

    store.recordAuditEvent({
      orderId: params.orderId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_ALLOCATION_COMPLETED',
      status: 'GOLD_ALLOCATED',
      referenceId: allocation.allocationId,
      actor: 'VAULT_CUSTODIAN',
      metadata: {
        egrCertificateNumber: allocation.egrCertificateNumber,
        vaultBarSerialNumber: allocation.vaultBarSerialNumber,
        vaultLocation: allocation.vaultLocation,
      },
    });

    return allocation;
  }
}
