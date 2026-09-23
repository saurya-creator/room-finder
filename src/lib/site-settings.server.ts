import fs from "fs";
import path from "path";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "./site-settings";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "prisma", "site-settings.json");

export function getSiteSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
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
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error saving site settings:", err);
    throw new Error("Failed to save site settings");
  }
}
