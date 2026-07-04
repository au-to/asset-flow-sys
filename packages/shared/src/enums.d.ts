export declare enum Role {
    EMPLOYEE = "EMPLOYEE",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
    AUDITOR = "AUDITOR"
}
export declare enum ApplicationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN",
    TERMINATED = "TERMINATED"
}
export declare enum AssetCategory {
    FIXED_ASSET = "FIXED_ASSET",
    ELECTRONIC_DEVICE = "ELECTRONIC_DEVICE",
    SOFTWARE_LICENSE = "SOFTWARE_LICENSE",
    SENSITIVE_DATA = "SENSITIVE_DATA"
}
export declare const ASSET_CATEGORY_LABELS: Record<AssetCategory, string>;
export declare const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string>;
