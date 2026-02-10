import DOMPurify from 'dompurify'

/**
 * Sanitize HTML for the campaign EDITOR.
 * Allows email-related tags and attributes needed for composing newsletters.
 * This is used when the user is editing their own content.
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'section', 'span', 'strong',
      'style', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
      'head', 'meta', 'title', 'body', 'html', 'link',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'style', 'class', 'id', 'width', 'height',
      'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'bgcolor',
      'target', 'rel', 'charset', 'name', 'content', 'http-equiv', 'lang',
    ],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * FIX: Sanitize for PREVIEW rendering — more restrictive.
 * 
 * Used when displaying received/external content (e.g., campaign previews,
 * report previews). Blocks potential attack vectors:
 * 
 * - No <style> tags       → prevents CSS injection / CSS-based tracking
 * - No <link> tags        → prevents external stylesheet loading / tracking
 * - No <meta>/<head>      → not needed in previews
 * - <img> allowed but     → src must be http/https (no data: URIs for tracking pixels)
 * - No <script> (default) → always blocked by DOMPurify
 * - No event handlers     → onclick, onerror etc. always stripped
 */
export function sanitizePreview(dirty) {
  if (!dirty) return ''

  // FIX: Hook to block data: URIs on images (hidden tracking pixels)
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'IMG' && node.hasAttribute('src')) {
      const src = node.getAttribute('src')
      // Allow only http/https — block data:, javascript:, blob: etc.
      if (src && !/^https?:\/\//i.test(src)) {
        node.removeAttribute('src')
        node.setAttribute('alt', '[immagine bloccata]')
      }
    }
    // Force links to open in new tab safely
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'section', 'span', 'strong',
      'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
      // FIX: NO style, link, meta, head, title, body, html
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'style', 'class', 'width', 'height',
      'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'bgcolor',
      'target', 'rel',
      // FIX: NO id, name, content, http-equiv, charset, lang
    ],
    ALLOW_DATA_ATTR: false,
  })

  // Remove the hook after use to avoid affecting sanitizeHTML calls
  DOMPurify.removeHook('afterSanitizeAttributes')

  return clean
}
