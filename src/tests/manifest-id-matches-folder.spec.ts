import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PLUGIN_DIR = 'temp/vault/.obsidian/plugins/lineage-dev';

describe('manifest.json validation', () => {
    it('manifest.json id must match plugin folder name (case-sensitive)', () => {
        const manifestPath = path.join(PLUGIN_DIR, 'manifest.json');
        const folderName = path.basename(PLUGIN_DIR); // e.g. "lineage-dev"

        expect(fs.existsSync(manifestPath), `manifest.json not found at ${manifestPath}`).toBe(true);

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        expect(manifest.id, `manifest.json id "${manifest.id}" must match folder name "${folderName}" (case-sensitive)`).toBe(folderName);
    });

    it('manifest.json must have required fields', () => {
        const manifestPath = path.join(PLUGIN_DIR, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        expect(manifest.id).toBeDefined();
        expect(manifest.name).toBeDefined();
        expect(manifest.version).toBeDefined();
        expect(manifest.minAppVersion).toBeDefined();
        expect(manifest.author).toBeDefined();
    });
});
