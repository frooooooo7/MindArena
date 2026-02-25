import { describe, it, expect, vi, beforeEach } from "vitest";
import { avatarService, AvatarServiceError } from "../../services/avatar.service";
import { supabase, AVATAR_BUCKET } from "../../lib/supabase";
import { prisma } from "../../lib/prisma";
import sharp from "sharp";

vi.mock("../../lib/supabase", () => ({
    AVATAR_BUCKET: "avatars",
    supabase: {
        storage: {
            from: vi.fn().mockReturnThis(),
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
            remove: vi.fn()
        }
    }
}));

vi.mock("../../lib/prisma", () => ({
    prisma: {
        user: {
            update: vi.fn()
        }
    }
}));

// Mock sharp to return a fake buffer
vi.mock("sharp", () => {
    return {
        default: vi.fn(() => ({
            resize: vi.fn().mockReturnThis(),
            webp: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-processed-buffer"))
        }))
    };
});

describe("AvatarService", () => {
    const mockUserId = "user-123";
    
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_URL = "https://example.supabase.co";
        process.env.SUPABASE_SERVICE_KEY = "dummy-key";
    });

    describe("uploadAvatar", () => {
        it("should upload a valid avatar and return a public url with cache buster", async () => {
            // valid jpeg header
            const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0x00, 0x00]);
            
            vi.mocked(supabase.storage.from).mockReturnValue({
                upload: vi.fn().mockResolvedValue({ error: null }),
                getPublicUrl: vi.fn().mockReturnValue({
                    data: { publicUrl: "https://example.supabase.co/avatars/user-123.webp" }
                }),
                remove: vi.fn()
            } as any);

            const result = await avatarService.uploadAvatar(mockUserId, buffer, "image/jpeg");

            expect(sharp).toHaveBeenCalled();
            expect(supabase.storage.from).toHaveBeenCalledWith(AVATAR_BUCKET);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: { avatarUrl: expect.stringMatching(/https:\/\/example\.supabase\.co\/avatars\/user-123\.webp\?t=\d+/) }
            });
            expect(result).toMatch(/https:\/\/example\.supabase\.co\/avatars\/user-123\.webp\?t=\d+/);
        });

        it("should reject an invalid magic byte signature", async () => {
            // invalid header for jpeg
            const buffer = Buffer.from([0x00, 0x01, 0x02]);
            
            await expect(avatarService.uploadAvatar(mockUserId, buffer, "image/jpeg")).rejects.toThrow(AvatarServiceError);
            await expect(avatarService.uploadAvatar(mockUserId, buffer, "image/jpeg")).rejects.toThrow("Invalid image signature");
        });

        it("should handle supabase storage upload error", async () => {
            const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0x00, 0x00]);
            
            vi.mocked(supabase.storage.from).mockReturnValue({
                upload: vi.fn().mockResolvedValue({ error: new Error("Storage full") }),
                getPublicUrl: vi.fn(),
                remove: vi.fn()
            } as any);

            await expect(avatarService.uploadAvatar(mockUserId, buffer, "image/jpeg")).rejects.toThrow("Failed to upload image to storage service.");
        });
    });

    describe("deleteAvatar", () => {
        it("should remove the avatar from storage and database", async () => {
            vi.mocked(supabase.storage.from).mockReturnValue({
                remove: vi.fn().mockResolvedValue({ error: null }),
                upload: vi.fn(),
                getPublicUrl: vi.fn()
            } as any);

            await avatarService.deleteAvatar(mockUserId);

            expect(supabase.storage.from).toHaveBeenCalledWith(AVATAR_BUCKET);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: { avatarUrl: null }
            });
        });
    });
});
