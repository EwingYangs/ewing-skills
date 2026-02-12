/**
 * Markdown to Notion blocks converter using @tryfabric/martian
 * 
 * This module wraps the martian library to convert Markdown content
 * into Notion API block format.
 */

import { markdownToBlocks, markdownToRichText } from "@tryfabric/martian";
import type { NotionBlock } from "./notion-api.js";

export interface ConvertOptions {
  /**
   * Enable emoji-style callouts in blockquotes
   * When true, blockquotes starting with emoji will be converted to Notion callouts
   */
  enableEmojiCallouts?: boolean;
  
  /**
   * Validate image URLs and convert invalid ones to text
   * Default: true
   */
  strictImageUrls?: boolean;
}

/**
 * Convert Markdown content to Notion blocks
 * 
 * @param markdown - The markdown content to convert
 * @param options - Conversion options
 * @returns Array of Notion block objects ready for API submission
 */
export function convertMarkdownToNotionBlocks(
  markdown: string,
  options: ConvertOptions = {}
): NotionBlock[] {
  const {
    enableEmojiCallouts = true,
    strictImageUrls = true,
  } = options;

  try {
    const blocks = markdownToBlocks(markdown, {
      enableEmojiCallouts,
      strictImageUrls,
      notionLimits: {
        truncate: true,
        onError: (err: Error) => {
          console.warn("Notion limit warning:", err.message);
        },
      },
    });

    return blocks as NotionBlock[];
  } catch (error) {
    console.error("Failed to convert markdown to Notion blocks:", error);
    // Return a simple paragraph block with the raw content as fallback
    return [{
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: {
            content: markdown.slice(0, 2000), // Notion has 2000 char limit per text block
          },
        }],
      },
    }];
  }
}

/**
 * Convert Markdown to Notion rich text (for inline content)
 * 
 * @param markdown - The markdown content to convert
 * @returns Array of Notion rich text objects
 */
export function convertMarkdownToRichText(markdown: string): unknown[] {
  try {
    return markdownToRichText(markdown);
  } catch (error) {
    console.error("Failed to convert markdown to rich text:", error);
    return [{
      type: "text",
      text: {
        content: markdown.slice(0, 2000),
      },
    }];
  }
}

/**
 * Create a bookmark block for the source URL
 */
export function createBookmarkBlock(url: string): NotionBlock {
  return {
    object: "block",
    type: "bookmark",
    bookmark: {
      url,
    },
  };
}

/**
 * Create a divider block
 */
export function createDividerBlock(): NotionBlock {
  return {
    object: "block",
    type: "divider",
    divider: {},
  };
}

/**
 * Create a callout block with metadata
 */
export function createMetadataCallout(
  title: string,
  url: string,
  capturedAt: string,
  author?: string
): NotionBlock {
  let content = `**${title}**\n\nSource: ${url}\nCaptured: ${capturedAt}`;
  if (author) {
    content += `\nAuthor: ${author}`;
  }

  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: [{
        type: "text",
        text: {
          content,
        },
      }],
      icon: {
        type: "emoji",
        emoji: "📎",
      },
      color: "gray_background",
    },
  };
}
