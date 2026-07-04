"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskAssetKey = maskAssetKey;
function maskAssetKey(key) {
    if (!key || key.length < 5)
        return '****';
    const parts = key.split('_');
    if (parts.length >= 3) {
        return `${parts[0].slice(0, 3)}-****-${parts[parts.length - 1]}`;
    }
    return `${key.slice(0, 3)}-****-${key.slice(-1)}`;
}
//# sourceMappingURL=mask.js.map