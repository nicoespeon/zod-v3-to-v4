export interface AstroScriptBlock {
  content: string;
  type: "frontmatter" | "script";
  loc: {
    start: { offset: number };
    end: { offset: number };
  };
}

export interface ParsedAstroSFC {
  source: string;
  scriptBlocks: AstroScriptBlock[];
  hasZodImport: boolean;
}

const ZOD_IMPORT_PATTERNS = [
  /from\s+['"]zod['"]/,
  /from\s+['"]zod\/v3['"]/,
  /from\s+['"]astro\/zod['"]/,
  /from\s+['"]astro:content['"]/,
  /from\s+['"]astro:schema['"]/,
];

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
const SCRIPT_TAG_REGEX = /<script>([^]*?)<\/script>/g;

export function parseAstroSFC(
  source: string,
  _filename: string,
): ParsedAstroSFC {
  const scriptBlocks: AstroScriptBlock[] = [];

  const frontmatterMatch = FRONTMATTER_REGEX.exec(source);
  if (frontmatterMatch) {
    const contentStart = source.indexOf("\n", source.indexOf("---")) + 1;
    const contentEnd = source.indexOf("\n---", contentStart);

    scriptBlocks.push({
      content: frontmatterMatch[1]!,
      type: "frontmatter",
      loc: {
        start: { offset: contentStart },
        end: { offset: contentEnd },
      },
    });
  }

  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = SCRIPT_TAG_REGEX.exec(source)) !== null) {
    const fullMatch = scriptMatch[0];
    const content = scriptMatch[1]!;
    const tagEnd = scriptMatch.index + fullMatch.indexOf(">") + 1;
    const contentEnd = scriptMatch.index + fullMatch.lastIndexOf("</script>");

    scriptBlocks.push({
      content,
      type: "script",
      loc: {
        start: { offset: tagEnd },
        end: { offset: contentEnd },
      },
    });
  }

  const hasZodImport = scriptBlocks.some((block) =>
    ZOD_IMPORT_PATTERNS.some((pattern) => pattern.test(block.content)),
  );

  return { source, scriptBlocks, hasZodImport };
}

export function reconstructAstroSFC(
  originalSource: string,
  scriptBlocks: AstroScriptBlock[],
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
