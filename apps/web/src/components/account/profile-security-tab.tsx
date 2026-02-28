import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSecurityTab() {
  return (
    <div className="space-y-5 pt-4">
      {/* Password (disabled) */}
      <div className="space-y-2">
        <Label htmlFor="edit-password" className="text-sm font-semibold text-foreground/80">
          Password
        </Label>
        <Input
          id="edit-password"
          type="password"
          value="••••••••"
          disabled
          className="bg-background/30 border-border/30 opacity-60 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Password change is not available yet.
        </p>
      </div>

      <div className="rounded-xl border border-border/30 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          🔒 Security settings will be available in a future update. You&apos;ll be able to change your password and manage two-factor authentication.
        </p>
      </div>
    </div>
  );
}
