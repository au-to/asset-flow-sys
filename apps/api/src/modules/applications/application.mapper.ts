import { maskAssetKey } from '@asset-flow/shared';
import { AssetCategory } from '@prisma/client';

export function generateAssetKey(index: number): string {
  return `SECRET_KEY_2026_${String.fromCharCode(65 + (index % 26))}`;
}

export function maskApplicationItems<T extends { assetKey?: string | null }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    assetKey: item.assetKey ? maskAssetKey(item.assetKey) : null,
    assetKeyRaw: undefined,
  }));
}

export function enrichItemsWithKeys(
  items: { category: AssetCategory; assetName: string; quantity: number }[],
) {
  return items.map((item, index) => ({
    ...item,
    assetKey:
      item.category === AssetCategory.SENSITIVE_DATA ? generateAssetKey(index) : null,
  }));
}
