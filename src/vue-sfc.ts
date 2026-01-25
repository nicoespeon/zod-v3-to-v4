import { parse as parseSFC, type SFCScriptBlock } from "@vue/compiler-sfc";

export interface VueScriptBlock {
  content: string;
  lang: "ts" | "tsx" | "js" | "jsx" | null;
  isSetup: boolean;
  loc: {
    start: { offset: number };
    end: { offset: number };
  };
}

export interface ParsedVueSFC {
  source: string;
  scriptBlocks: VueScriptBlock[];
  hasZodImport: boolean;
}

const ZOD_IMPORT_PATTERNS = [
  /from\s+['"]zod['"]/,
  /from\s+['"]zod\/v3['"]/,
  /from\s+['"]astro\/zod['"]/,
  /from\s+['"]astro:content['"]/,
  /from\s+['"]astro:schema['"]/,
];

export function parseVueSFC(source: string, filename: string): ParsedVueSFC {
  const { descriptor } = parseSFC(source, {
    filename,
    ignoreEmpty: true,
  });

  const scriptBlocks: VueScriptBlock[] = [];

  if (descriptor.script) {
    scriptBlocks.push(extractScriptBlock(descriptor.script, false));
  }

  if (descriptor.scriptSetup) {
    scriptBlocks.push(extractScriptBlock(descriptor.scriptSetup, true));
  }

  const hasZodImport = scriptBlocks.some((block) =>
    ZOD_IMPORT_PATTERNS.some((pattern) => pattern.test(block.content)),
  );

  return { source, scriptBlocks, hasZodImport };
}

function extractScriptBlock(
  block: SFCScriptBlock,
  isSetup: boolean,
): VueScriptBlock {
  // @vue/compiler-sfc already provides offsets for the content (not the tags)
  // loc.start.offset = position right after opening <script...> tag
  // loc.end.offset = position right before closing </script> tag
  return {
    content: block.content,
    lang: (block.lang as VueScriptBlock["lang"]) ?? null,
    isSetup,
    loc: {
      start: { offset: block.loc.start.offset },
      end: { offset: block.loc.end.offset },
    },
  };
}

export function reconstructVueSFC(
  originalSource: string,
  scriptBlocks: VueScriptBlock[],
  transformedContents: string[],
): string {
  // Sort blocks by offset in reverse order to avoid offset shifting during replacement
  const sortedPairs = scriptBlocks
    .map((block, i) => ({ block, transformed: transformedContents[i] }))
    .sort((a, b) => b.block.loc.start.offset - a.block.loc.start.offset);

  let result = originalSource;
  for (const { block, transformed } of sortedPairs) {
    result =
      result.slice(0, block.loc.start.offset) +
      transformed +
      result.slice(block.loc.end.offset);
  }

  return result;
}
