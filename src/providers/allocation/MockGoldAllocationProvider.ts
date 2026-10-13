/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoldAllocationProvider } from '../../types/providers';
import { GoldAllocationRecord } from '../../types/domain';

export class MockGoldAllocationProvider implements GoldAllocationProvider {
  public readonly providerName = 'MOCK_DMCC_VAULT_ALLOCATION_SERVICE';

  private allocations: Map<string, GoldAllocationRecord> = new Map();

  public async allocateGold(params: {
    orderId: string;
    goldGrams: string;
    executionId: string;
    forceFailure?: boolean;
  }): Promise<GoldAllocationRecord> {
    if (params.forceFailure) {
      throw new Error('VAULT_BAR_INVENTORY_ALLOCATION_TIMEOUT');
    }

    const allocationId = `ALLOC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const egrCertificateNumber = `ONEX-CERT-${new Date().getFullYear()}-${params.orderId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
    const vaultBarSerialNumber = `DXB-TG-999.9-B${Math.floor(10000 + Math.random() * 90000)}`;

    const allocation: GoldAllocationRecord = {
      allocationId,
      orderId: params.orderId,
      goldGrams: params.goldGrams,
      purity: '24K (999.9 Fine Gold)',
      vaultLocation: 'TransGuard Dubai / DMCC Free Zone High Security Bullion Vault',
      vaultBarSerialNumber,
      egrCertificateNumber,
      allocatedAt: new Date().toISOString(),
      custodian: 'OneX Bullion Custodial Depository Ltd (Regulated by VARA / DMCC)',
    };

    this.allocations.set(allocationId, allocation);
    return allocation;
  }

  public async getAllocation(allocationId: string): Promise<GoldAllocationRecord | null> {
    return this.allocations.get(allocationId) || null;
  }
}
