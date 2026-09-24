import fs from "fs";
import path from "path";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "./site-settings";

const BASE_SETTINGS_FILE_PATH = path.join(process.cwd(), "prisma", "site-settings.json");
const TMP_SETTINGS_FILE_PATH = "/tmp/site-settings.json";

function getWritablePath(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    // If not yet copied to /tmp, seed it from BASE if available
    if (!fs.existsSync(TMP_SETTINGS_FILE_PATH) && fs.existsSync(BASE_SETTINGS_FILE_PATH)) {
      try {
        fs.copyFileSync(BASE_SETTINGS_FILE_PATH, TMP_SETTINGS_FILE_PATH);
      } catch {}
    }
    return TMP_SETTINGS_FILE_PATH;
  }
  return BASE_SETTINGS_FILE_PATH;
}

export function getSiteSettings(): SiteSettings {
  try {
    const targetPath = getWritablePath();
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
    if (fs.existsSync(BASE_SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(BASE_SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error("Error reading site settings, falling back to defaults:", err);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  try {
    const current = getSiteSettings();
    const updated = { ...current, ...settings };
    const targetPath = getWritablePath();
    fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error saving site settings:", err);
    return { ...DEFAULT_SITE_SETTINGS, ...settings };
  }
}
