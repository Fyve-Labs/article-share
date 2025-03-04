/**
 * Article Share - Popup Script
 * 
 * This script controls the popup UI and orchestrates the interaction
 * between the user, the content script, and the background script.
 */

// DOM elements
const extractionStatus = document.getElementById('extraction-status');
const articleInfo = document.getElementById('article-info');
const articleTitle = document.getElementById('article-title');
const articleMetadata = document.getElementById('article-metadata');
const sharingContext = document.getElementById('sharing-context');
const contextInput = document.getElementById('context-input');
const audienceSelection = document.getElementById('audience-selection');
const audienceSelect = document.getElementById('audience-select');
const customAudience = document.getElementById('custom-audience');
const customAudienceInput = document.getElementById('custom-audience-input');
const summaryContainer = document.getElementById('summary-container');
const summaryLoading = document.getElementById('summary-loading');
const summaryContent = document.getElementById('summary-content');
const actionButtons = document.getElementById('action-buttons');
const copyBtn = document.getElementById('copy-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const statusMessage = document.getElementById('status-message');

// Store article data
let articleData = null;

// Add debounce function at the top of the file
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
});

/**
 * Initialize the popup and start the extraction process
 */
function initializePopup() {
  // Extract the article content
  extractArticle();
  
  // Set up event listeners
  audienceSelect.addEventListener('change', handleAudienceSelectChange);
  
  // Apply debounce to context input validation
  const debouncedValidateContext = debounce(validateContextInput, 2000);
  contextInput.addEventListener('input', debouncedValidateContext);
  
  copyBtn.addEventListener('click', copyToClipboard);
  regenerateBtn.addEventListener('click', regenerateSummary);
  
  // If we're already in the custom audience mode, show the input
  if (audienceSelect.value === 'custom') {
    customAudience.classList.remove('hidden');
  }
}

/**
 * Extract article content from the current tab
 */
function extractArticle() {
  showExtractionStatus();
  
  chrome.runtime.sendMessage({ action: "extractArticle" }, (response) => {
    if (response && response.success) {
      articleData = response.data;
      showArticleInfo();
    } else {
      showExtractionError(response?.error || "Failed to extract article");
    }
  });
}

/**
 * Show the extraction status UI
 */
function showExtractionStatus() {
  extractionStatus.classList.remove('hidden');
  articleInfo.classList.add('hidden');
  sharingContext.classList.add('hidden');
  audienceSelection.classList.add('hidden');
  summaryContainer.classList.add('hidden');
  actionButtons.classList.add('hidden');
}

/**
 * Show extraction error
 */
function showExtractionError(message) {
  extractionStatus.innerHTML = `
    <p class="error">Error: ${message}</p>
    <button id="retry-btn">Retry</button>
  `;
  
  document.getElementById('retry-btn').addEventListener('click', () => {
    extractArticle();
  });
}

/**
 * Show the article info and proceed to the context input step
 */
function showArticleInfo() {
  extractionStatus.classList.add('hidden');
  articleInfo.classList.remove('hidden');
  sharingContext.classList.remove('hidden');
  
  // Populate article info
  articleTitle.textContent = articleData.title;
  let metadataText = "";
  
  if (articleData.author) {
    metadataText += `By ${articleData.author}`;
  }
  
  if (articleData.publishDate) {
    if (metadataText) metadataText += " • ";
    metadataText += formatDate(articleData.publishDate);
  }
  
  articleMetadata.textContent = metadataText || "No additional metadata available";
  
  // Focus the context input
  contextInput.focus();
}

/**
 * Handle audience selection change
 */
function handleAudienceSelectChange() {
  if (audienceSelect.value === 'custom') {
    customAudience.classList.remove('hidden');
    customAudienceInput.focus();
  } else {
    customAudience.classList.add('hidden');
    
    // Check if we can move to the summary generation step
    if (contextInput.value.trim().length >= 3) {
      audienceSelection.classList.remove('hidden');
      generateSummary();
    }
  }
}

/**
 * Validate the context input and show the audience selection if valid
 */
function validateContextInput() {
  if (contextInput.value.trim().length >= 3) {
    audienceSelection.classList.remove('hidden');
    
    // If audience is already selected, generate the summary
    if (audienceSelect.value !== 'custom' || customAudienceInput.value.trim().length >= 3) {
      generateSummary();
    }
  }
}

/**
 * Generate a summary based on the article content, context, and audience
 */
function generateSummary() {
  // Make sure we have an article and context
  if (!articleData || !contextInput.value.trim()) {
    return;
  }
  
  // Show loading state
  summaryContainer.classList.remove('hidden');
  summaryLoading.classList.remove('hidden');
  summaryContent.classList.add('hidden');
  actionButtons.classList.add('hidden');
  
  // Get the selected audience
  let audience = audienceSelect.value;
  if (audience === 'custom') {
    audience = customAudienceInput.value.trim();
    if (!audience) {
      return;
    }
  }
  
  // Request summary generation
  chrome.runtime.sendMessage({
    action: "generateSummary",
    data: {
      content: articleData.content,
      title: articleData.title,
      url: articleData.url,
      context: contextInput.value.trim(),
      audience: audience
    }
  }, (response) => {
    if (response && response.success) {
      displaySummary(response.summary);
    } else {
      displaySummaryError(response?.error || "Failed to generate summary");
    }
  });
}

/**
 * Display the generated summary
 */
function displaySummary(summary) {
  summaryLoading.classList.add('hidden');
  summaryContent.classList.remove('hidden');
  actionButtons.classList.remove('hidden');
  
  // Set the summary content
  summaryContent.textContent = summary;
  
  // Make the summary content editable
  summaryContent.focus();
}

/**
 * Display a summary generation error
 */
function displaySummaryError(message) {
  summaryLoading.classList.add('hidden');
  summaryContent.classList.remove('hidden');
  
  summaryContent.innerHTML = `<p class="error">Error: ${message}</p>`;
  
  regenerateBtn.textContent = "Try Again";
  actionButtons.classList.remove('hidden');
}

/**
 * Regenerate the summary, potentially with new context or audience
 */
function regenerateSummary() {
  generateSummary();
}

/**
 * Copy the summary to clipboard
 */
function copyToClipboard() {
  const summaryText = summaryContent.textContent;
  
  // Get the article URL from articleData
  const articleUrl = articleData && articleData.url ? articleData.url : window.location.href;
  
  // Combine URL and summary for copying
  const textToCopy = `${articleUrl}\n\n${summaryText}`;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Show copy confirmation
      copyBtn.innerHTML = '✓ Copied!';
      
      // Show status message
      if (statusMessage) {
        statusMessage.textContent = 'Copied to clipboard!';
        statusMessage.classList.remove('hidden');
      }
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
      
      // Show error message
      if (statusMessage) {
        statusMessage.textContent = 'Failed to copy to clipboard';
        statusMessage.classList.remove('hidden');
      }
    });
}

/**
 * Format a date string into a readable format
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
} 