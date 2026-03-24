"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiresPermissions = exports.PERMISSIONS_METADATA_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_METADATA_KEY = 'permissions';
const RequiresPermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_METADATA_KEY, permissions);
exports.RequiresPermissions = RequiresPermissions;
//# sourceMappingURL=permissions.decorator.js.map