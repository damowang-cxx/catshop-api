"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_CUSTOMER_PASSWORD_HASH = exports.DEV_ADMIN_PASSWORD_HASH = exports.PASSWORD_HASH_OPTIONS = exports.PASSWORD_MAX_LENGTH = exports.PASSWORD_MIN_LENGTH = void 0;
exports.isArgon2Hash = isArgon2Hash;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const argon2 = __importStar(require("argon2"));
exports.PASSWORD_MIN_LENGTH = 8;
exports.PASSWORD_MAX_LENGTH = 128;
exports.PASSWORD_HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
};
exports.DEV_ADMIN_PASSWORD_HASH = '$argon2id$v=19$m=19456,t=2,p=1$5msT9CblrNrv7razUCSHvg$9fJcm9kEWSOl/dtIoagTV9o9GU7do3QkcaTgw+4PlTg';
exports.DEV_CUSTOMER_PASSWORD_HASH = '$argon2id$v=19$m=19456,t=2,p=1$Bh4xCTD/UFX8zOYBLGFzRQ$kncUvnvrxHS029pbkfEEeq0FIhPQ1UeC1d7Z/2V0poA';
function isArgon2Hash(value) {
    return typeof value === 'string' && value.startsWith('$argon2id$');
}
async function hashPassword(password) {
    return argon2.hash(password, exports.PASSWORD_HASH_OPTIONS);
}
async function verifyPassword(passwordHash, password) {
    if (!isArgon2Hash(passwordHash)) {
        return false;
    }
    return argon2.verify(passwordHash, password);
}
//# sourceMappingURL=password.util.js.map