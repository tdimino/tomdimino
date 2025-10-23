/**
 * Vanilla JavaScript Gaze Tracker
 * Makes an avatar image follow the user's cursor
 * Based on face_looker by Kylan
 */

(function() {
  'use strict';

  // Grid configuration (must match generation parameters)
  const P_MIN = -15;
  const P_MAX = 15;
  const STEP = 3;
  const SIZE = 256;
  const BASE_PATH = './faces/';

  /**
   * Converts normalized coordinates [-1, 1] to grid coordinates
   */
  function quantizeToGrid(val) {
    const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2; // [-1,1] -> [-15,15]
    const snapped = Math.round(raw / STEP) * STEP;
    return Math.max(P_MIN, Math.min(P_MAX, snapped));
  }

  /**
   * Converts grid coordinates to filename format
   */
  function gridToFilename(px, py) {
    const sanitize = (val) => {
      // Ensure we have a float string with decimal (matches Python's behavior)
      const floatStr = Number(val).toFixed(1); // Converts to "0.0", "12.0", "-15.0" format
      return floatStr.replace('-', 'm').replace('.', 'p');
    };
    return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
  }

  /**
   * Preload all face images for smooth transitions
   */
  function preloadImages(callback) {
    const images = [];
    let loaded = 0;
    let total = 0;

    // Calculate total images
    for (let py = P_MIN; py <= P_MAX; py += STEP) {
      for (let px = P_MIN; px <= P_MAX; px += STEP) {
        total++;
      }
    }

    console.log(`Preloading ${total} face images...`);

    // Preload each image
    for (let py = P_MIN; py <= P_MAX; py += STEP) {
      for (let px = P_MIN; px <= P_MAX; px += STEP) {
        const img = new Image();
        const filename = gridToFilename(px, py);
        img.src = BASE_PATH + filename;

        img.onload = img.onerror = function() {
          loaded++;
          if (loaded === total) {
            console.log('All face images preloaded!');
            if (callback) callback();
          }
        };

        images.push(img);
      }
    }

    return images;
  }

  /**
   * Initialize gaze tracking on an avatar element
   */
  function initGazeTracker(avatarElement, options) {
    options = options || {};
    const debug = options.debug || false;
    const preload = options.preload !== false; // default true

    if (!avatarElement) {
      console.error('Avatar element not found');
      return;
    }

    // Create container wrapper
    const container = document.createElement('div');
    container.className = 'gaze-tracker-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';

    // Preserve original avatar dimensions
    const originalWidth = avatarElement.offsetWidth || avatarElement.width;
    const originalHeight = avatarElement.offsetHeight || avatarElement.height;
    container.style.width = originalWidth + 'px';
    container.style.height = originalHeight + 'px';

    // Replace avatar with container
    avatarElement.parentNode.insertBefore(container, avatarElement);
    avatarElement.remove();

    // Create new img element for face tracking
    const img = document.createElement('img');
    img.className = 'gaze-tracker-image';
    img.alt = 'Interactive Avatar';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transition = 'opacity 0.1s ease-out';
    img.style.userSelect = 'none';
    img.style.pointerEvents = 'none';

    // Preserve original styling
    if (avatarElement.style.borderRadius) {
      img.style.borderRadius = avatarElement.style.borderRadius;
    }
    if (avatarElement.className.includes('Avatar')) {
      img.style.borderRadius = '50%';
    }

    container.appendChild(img);

    // Set initial center gaze
    const centerFilename = gridToFilename(0, 0);
    img.src = BASE_PATH + centerFilename;

    // Debug overlay
    let debugOverlay = null;
    if (debug) {
      debugOverlay = document.createElement('div');
      debugOverlay.style.position = 'absolute';
      debugOverlay.style.top = '10px';
      debugOverlay.style.left = '10px';
      debugOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
      debugOverlay.style.color = 'white';
      debugOverlay.style.padding = '10px';
      debugOverlay.style.borderRadius = '5px';
      debugOverlay.style.fontFamily = 'monospace';
      debugOverlay.style.fontSize = '12px';
      debugOverlay.style.zIndex = '1000';
      container.appendChild(debugOverlay);
    }

    /**
     * Update the gaze based on cursor/touch position
     */
    function updateGaze(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Convert to normalized coordinates [-1, 1]
      const nx = (clientX - centerX) / (rect.width / 2);
      const ny = (clientY - centerY) / (rect.height / 2);

      // Clamp to [-1, 1] range
      const clampedX = Math.max(-1, Math.min(1, nx));
      const clampedY = Math.max(-1, Math.min(1, -ny));  // Invert Y axis

      // Convert to grid coordinates
      const px = quantizeToGrid(clampedX);
      const py = quantizeToGrid(clampedY);

      // Update image
      const filename = gridToFilename(px, py);
      const imagePath = BASE_PATH + filename;
      img.src = imagePath;

      // Update debug info
      if (debug && debugOverlay) {
        debugOverlay.innerHTML = `
          Mouse: (${Math.round(clientX)}, ${Math.round(clientY)})<br>
          Normalized: (${clampedX.toFixed(2)}, ${clampedY.toFixed(2)})<br>
          Grid: (${px}, ${py})<br>
          Image: ${filename}
        `;
      }
    }

    /**
     * Handle mouse movement
     */
    function handleMouseMove(e) {
      updateGaze(e.clientX, e.clientY);
    }

    /**
     * Handle touch movement
     */
    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateGaze(touch.clientX, touch.clientY);
      }
    }

    // Attach event listeners to document for full tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Preload images if enabled
    if (preload) {
      preloadImages(function() {
        console.log('Gaze tracker ready!');
      });
    }

    // Return API for cleanup
    return {
      destroy: function() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }

  // Auto-initialize on DOM ready if avatar exists
  function autoInit() {
    const avatar = document.querySelector('.Avatar');
    if (avatar) {
      initGazeTracker(avatar, {
        debug: false,
        preload: true
      });
    }
  }

  // Export to global scope
  window.GazeTracker = {
    init: initGazeTracker,
    autoInit: autoInit
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
