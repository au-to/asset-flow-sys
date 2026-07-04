"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPLICATION_STATUS_LABELS = exports.ASSET_CATEGORY_LABELS = exports.AssetCategory = exports.ApplicationStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["EMPLOYEE"] = "EMPLOYEE";
    Role["MANAGER"] = "MANAGER";
    Role["ADMIN"] = "ADMIN";
    Role["AUDITOR"] = "AUDITOR";
})(Role || (exports.Role = Role = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["WITHDRAWN"] = "WITHDRAWN";
    ApplicationStatus["TERMINATED"] = "TERMINATED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var AssetCategory;
(function (AssetCategory) {
    AssetCategory["FIXED_ASSET"] = "FIXED_ASSET";
    AssetCategory["ELECTRONIC_DEVICE"] = "ELECTRONIC_DEVICE";
    AssetCategory["SOFTWARE_LICENSE"] = "SOFTWARE_LICENSE";
    AssetCategory["SENSITIVE_DATA"] = "SENSITIVE_DATA";
})(AssetCategory || (exports.AssetCategory = AssetCategory = {}));
exports.ASSET_CATEGORY_LABELS = {
    [AssetCategory.FIXED_ASSET]: '固定资产',
    [AssetCategory.ELECTRONIC_DEVICE]: '电子设备',
    [AssetCategory.SOFTWARE_LICENSE]: '软件许可证',
    [AssetCategory.SENSITIVE_DATA]: '敏感数据权限',
};
exports.APPLICATION_STATUS_LABELS = {
    [ApplicationStatus.PENDING]: '待审批',
    [ApplicationStatus.APPROVED]: '已通过',
    [ApplicationStatus.REJECTED]: '已驳回',
    [ApplicationStatus.WITHDRAWN]: '已撤回',
    [ApplicationStatus.TERMINATED]: '已终止',
};
//# sourceMappingURL=enums.js.map