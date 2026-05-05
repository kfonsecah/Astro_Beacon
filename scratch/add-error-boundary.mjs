import fs from 'fs';
import path from 'path';

const files = [
  'app/_layout.tsx',
  'app/(auth)/_layout.tsx',
  'app/(auth)/login.tsx',
  'app/(tabs)/dashboard.tsx',
  'app/(tabs)/resources.tsx',
  'app/(tabs)/bestiary.tsx',
  'app/(tabs)/logbook.tsx',
  'app/(tabs)/map.tsx',
  'app/trips.tsx'
];

const importStatement = `import { RouteErrorFallback } from '@/components/common';`;
const exportStatement = `\nexport function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {\n  return <RouteErrorFallback error={error} retry={retry} />;\n}\n`;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (!content.includes('RouteErrorFallback')) {
    // Add import after the last import
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importStatement);
      content = lines.join('\n');
      changed = true;
    } else {
      content = importStatement + '\n' + content;
      changed = true;
    }
  }

  if (!content.includes('export function ErrorBoundary')) {
    content += exportStatement;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
}
