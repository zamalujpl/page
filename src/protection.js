/**
 * protection.js
 * Contains functions to protect images and content on the website
 * - Blocks right-click
 * - Disables keyboard shortcuts for inspect element
 * - Prevents image dragging
 */

(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // Block right-click menu
    document.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      return false;
    });

    // Disable inspect element keyboard shortcuts
    document.addEventListener("keydown", function(e) {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        return false;
      }
    });

    // Disable dragging for all images
    document.addEventListener("dragstart", function(e) {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    });

    // Function to apply protection to an image
    function protectImage(img) {
      img.setAttribute("draggable", "false");
      img.style.webkitUserDrag = "none";
      img.style.userDrag = "none";
      img.style.webkitUserSelect = "none";
      img.style.MozUserSelect = "none";
      img.style.msUserSelect = "none";
      img.style.userSelect = "none";

      // Add event listeners directly to the image
      img.addEventListener("dragstart", function(e) {
        e.preventDefault();
        return false;
      });

      img.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
      });
    }

    // Apply to existing images
    document.querySelectorAll("img").forEach(protectImage);

    // Set up observer for dynamically added images
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(function(node) {
            // Check if the added node is an image
            if (node.tagName === "IMG") {
              protectImage(node);
            }
            // Check for images inside the added node
            if (node.querySelectorAll) {
              node.querySelectorAll("img").forEach(protectImage);
            }
          });
        }
      });
    });

    // Start observing the entire document
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
})();
