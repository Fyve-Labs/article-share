/**
 * Article Share - Background Script
 * 
 * This script runs in the background and is responsible for managing
 * communication between the popup and content scripts.
 */

// When the extension icon is clicked, inject the content script if needed
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked, but we're using a popup so this is handled automatically");
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle requests to extract article content
  if (request.action === "extractArticle") {
    // Forward the request to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "No active tab found" });
        return;
      }
      
      const activeTab = tabs[0];
      
      // Send message to content script in the active tab
      chrome.tabs.sendMessage(activeTab.id, { action: "extractArticle" }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ 
            success: false, 
            error: "Failed to communicate with the page. Make sure you're on a readable article."
          });
        } else {
          sendResponse(response);
        }
      });
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // Handle requests to generate a summary
  if (request.action === "generateSummary") {
    generateSummary(request.data)
      .then(summary => {
        sendResponse({ success: true, summary });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

/**
 * Generates a summary of the article content based on the specified context and audience.
 * For the MVP, this uses a simple algorithm to extract key sentences.
 * 
 * In a production version, this would call an external API like OpenAI.
 */
async function generateSummary(data) {
  const { content, context, audience, title } = data;
  
  try {
    // In MVP, use a simple extractive summarization approach
    // In production, this would call an AI API
    
    // For now, simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Basic extractive summarization (for MVP only)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Select a subset of sentences based on length
    const numSentences = Math.min(5, Math.max(3, Math.floor(sentences.length / 10)));
    const selectedSentences = selectImportantSentences(sentences, numSentences);
    
    // Create the final summary
    let summary = `${title}\n\n`;
    
    // Adapt the intro based on audience
    if (audience === 'technical-team') {
      summary += `I wanted to share this technical article that could be valuable for our work. ${context}\n\n`;
    } else if (audience === 'business-stakeholders') {
      summary += `I found this article with important business implications. ${context}\n\n`;
    } else if (audience === 'general-audience') {
      summary += `I thought this was worth sharing: ${context}\n\n`;
    } else {
      summary += `I'm sharing this because: ${context}\n\n`;
    }
    
    // Add key points from the content
    summary += `Key points:\n`;
    selectedSentences.forEach((sentence, index) => {
      summary += `• ${sentence.trim()}.\n`;
    });
    
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

/**
 * Select important sentences for the summary based on simple heuristics.
 * In a real implementation, this would use more sophisticated NLP techniques.
 */
function selectImportantSentences(sentences, numSentences) {
  // Compute score for each sentence based on length and position
  const scoredSentences = sentences.map((sentence, index) => {
    // Normalize position - earlier sentences are more important (0-1 scale)
    const positionScore = 1 - (index / sentences.length);
    
    // Normalize length - medium length sentences are preferred
    const lengthScore = Math.min(1, sentence.split(' ').length / 20);
    
    // Combine scores (position is weighted more heavily)
    const score = positionScore * 0.6 + lengthScore * 0.4;
    
    return { sentence, score };
  });
  
  // Sort by score and select top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .map(item => item.sentence);
  
  return topSentences;
} 