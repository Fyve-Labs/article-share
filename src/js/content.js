/**
 * Article Share - Content Script
 * 
 * This script is injected into web pages and is responsible for extracting
 * article content when the extension is activated.
 */

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractArticle") {
    extractArticleContent()
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

/**
 * Extracts article content from the current page.
 * Uses a basic extraction algorithm focused on finding the main content.
 */
async function extractArticleContent() {
  try {
    // Extract basic metadata
    const title = document.title || "";
    const url = window.location.href;
    
    // Try to find author and publication date
    let author = "";
    let publishDate = "";
    
    // Common author selectors
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      'a[rel="author"]',
      '.author',
      '.byline'
    ];
    
    // Try each selector until we find an author
    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        if (element.tagName === 'META') {
          author = element.getAttribute('content');
        } else {
          author = element.textContent.trim();
        }
        
        if (author) break;
      }
    }
    
    // Common date selectors
    const dateSelectors = [
      'meta[name="date"]',
      'meta[property="article:published_time"]',
      'time',
      '.date',
      '.published'
    ];
    
    // Try each selector until we find a date
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        if (element.tagName === 'META') {
          publishDate = element.getAttribute('content');
        } else if (element.tagName === 'TIME') {
          publishDate = element.getAttribute('datetime') || element.textContent.trim();
        } else {
          publishDate = element.textContent.trim();
        }
        
        if (publishDate) break;
      }
    }
    
    // Extract the main content
    let content = extractMainContent();
    
    return {
      title,
      url,
      author,
      publishDate,
      content
    };
  } catch (error) {
    console.error("Error extracting article:", error);
    throw new Error("Failed to extract article content");
  }
}

/**
 * Attempts to find and extract the main content of an article.
 * Uses a basic algorithm to identify the largest text block.
 */
function extractMainContent() {
  // Common content selectors
  const contentSelectors = [
    'article',
    '.article',
    '.post-content',
    '.article-content',
    '.entry-content',
    'main',
    '#content',
    '.content'
  ];
  
  // Try each selector
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Get text content, removing excess whitespace
      const content = element.textContent.trim().replace(/\s+/g, ' ');
      if (content.length > 200) {  // Minimum content length to be considered an article
        return content;
      }
    }
  }
  
  // Fallback: Find the element with the most text content
  const paragraphs = document.querySelectorAll('p');
  let largestContentElement = null;
  let largestContentLength = 0;
  
  // Group paragraphs by parent to find the parent with the most text content
  const parentContentMap = new Map();
  
  paragraphs.forEach(p => {
    const parent = p.parentElement;
    const currentLength = parentContentMap.get(parent) || 0;
    parentContentMap.set(parent, currentLength + p.textContent.length);
    
    // Update largest content if this parent has more text
    if (parentContentMap.get(parent) > largestContentLength) {
      largestContentLength = parentContentMap.get(parent);
      largestContentElement = parent;
    }
  });
  
  if (largestContentElement && largestContentLength > 200) {
    return largestContentElement.textContent.trim().replace(/\s+/g, ' ');
  }
  
  // Last resort: just get all paragraph text
  let allContent = "";
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    if (text.length > 20) {  // Skip very short paragraphs
      allContent += text + "\n\n";
    }
  });
  
  return allContent.trim();
} 