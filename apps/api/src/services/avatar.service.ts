import sharp from "sharp";
import { supabase, AVATAR_BUCKET } from "../lib/supabase";
import { prisma } from "../lib/prisma";

const ALLOWED_MAGIC_BYTES: Record<string, number[]> = {
    "image/jpeg": [0xFF, 0xD8, 0xFF],
    "image/png": [0x89, 0x50, 0x4E, 0x47],
    "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF (4 bytes) ... WEBP (offset 8) check is simplified
    "image/gif": [0x47, 0x49, 0x46],
};

export class AvatarServiceError extends Error {
    constructor(public message: string, public statusCode: number = 400) {
        super(message);
        this.name = "AvatarServiceError";
    }
}

export class AvatarService {
    /**
     * Helper to verify if the buffer starts with the signature of an allowed image type.
     */
    private static isValidImageBuffer(buffer: Buffer, mimeType: string): boolean {
        if (!ALLOWED_MAGIC_BYTES[mimeType]) return false;
        
        const signature = ALLOWED_MAGIC_BYTES[mimeType];
        for (let i = 0; i < signature.length; i++) {
            if (buffer[i] !== signature[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Uploads an avatar buffer to Supabase after converting it to WebP.
     * Updates the user's avatarUrl in the database.
     */
    public async uploadAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            throw new AvatarServiceError("Avatar upload is not configured on this server.", 500);
        }

        // Validate magic bytes (Anti-malware measure)
        if (!AvatarService.isValidImageBuffer(fileBuffer, mimeType)) {
            throw new AvatarServiceError("Invalid image signature. The file might be corrupted or forged.");
        }

        try {
            const processedBuffer = await sharp(fileBuffer)
                .resize(256, 256, { fit: "cover" })
                .webp({ quality: 80 })
                .toBuffer();

            const filePath = `${userId}.webp`;
            const { error: uploadError } = await supabase.storage
                .from(AVATAR_BUCKET)
                .upload(filePath, processedBuffer, {
                    contentType: "image/webp",
                    upsert: true, // Overwrites old avatar
                });

            if (uploadError) {
                console.error("Supabase Storage error:", uploadError);
                throw new AvatarServiceError("Failed to upload image to storage service.", 500);
            }

            // Retrieve Public URL
            const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
            const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;


            await prisma.user.update({
                where: { id: userId },
                data: { avatarUrl }
            });

            return avatarUrl;
        } catch (error) {
            if (error instanceof AvatarServiceError) throw error;
            console.error("Sharp processing error:", error);
            throw new AvatarServiceError("Failed to process the image file.");
        }
    }

    /**
     * Removes the avatar from Supabase and sets avatarUrl to null in the database.
     */
    public async deleteAvatar(userId: string): Promise<void> {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            throw new AvatarServiceError("Avatar system is not configured.", 500);
        }

        try {
            const filePath = `${userId}.webp`;
            
            const { error: removeError } = await supabase.storage
                .from(AVATAR_BUCKET)
                .remove([filePath]);

            if (removeError) {
                console.error("Supabase Storage remove error:", removeError);
            }

            await prisma.user.update({
                where: { id: userId },
                data: { avatarUrl: null }
            });
        } catch (error) {
            console.error("Delete avatar error:", error);
            throw new AvatarServiceError("Could not delete avatar record.");
        }
    }
}

export const avatarService = new AvatarService();
