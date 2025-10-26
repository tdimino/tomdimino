// Artifex GSAP - Semitic Symbol 3D Animation System
// Uses GSAP + CSS 3D transforms for performant animations

class SemiticSymbolAnimator {
  constructor() {
    this.symbols = [];
    this.currentBackgroundIndex = 0;
    this.backgrounds = [
      'Kaphtor/GreatMother-optimized.jpg',
      'Kaphtor/Dolphins.jpg'
    ];

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Artifex GSAP: Initializing symbol animations');

    // Get all SVG symbols
    const symbolElements = document.querySelectorAll('.symbol');
    console.log(`Found ${symbolElements.length} symbols`);

    symbolElements.forEach((symbol, index) => {
      this.setupSymbol(symbol, index);
    });
  }

  setupSymbol(symbolElement, index) {
    // Enable 3D transforms
    gsap.set(symbolElement, {
      transformStyle: 'preserve-3d',
      transformPerspective: 1000
    });

    // Store symbol data
    this.symbols.push({
      element: symbolElement,
      index: index,
      isAnimating: false
    });

    // Add event listeners
    this.attachEventListeners(symbolElement, index);
  }

  attachEventListeners(symbolElement, index) {
    // Click handler for rotation animation
    symbolElement.addEventListener('click', () => {
      this.handleSymbolClick(index);
    });

    // Hover effects
    symbolElement.addEventListener('mouseenter', () => {
      this.handleHoverEnter(index);
    });

    symbolElement.addEventListener('mouseleave', () => {
      this.handleHoverLeave(index);
    });
  }

  handleSymbolClick(index) {
    const symbolData = this.symbols[index];

    if (symbolData.isAnimating) {
      console.log('Symbol still animating, ignoring click');
      return;
    }

    console.log(`Symbol ${index} clicked`);
    symbolData.isAnimating = true;

    // Rotate the symbol (to be implemented in next task)
    this.rotateSymbol(symbolData);

    // Cycle background
    this.cycleBackground();
  }

  rotateSymbol(symbolData) {
    // Placeholder for 3D rotation animation
    // Will be implemented in tomdimino-4
    console.log('Rotation animation - to be implemented');

    // Reset animation flag after a delay
    setTimeout(() => {
      symbolData.isAnimating = false;
    }, 1000);
  }

  handleHoverEnter(index) {
    // Placeholder for hover scale effect
    // Will be implemented in tomdimino-7
    console.log(`Hover enter on symbol ${index}`);
  }

  handleHoverLeave(index) {
    // Placeholder for hover scale effect
    // Will be implemented in tomdimino-7
    console.log(`Hover leave on symbol ${index}`);
  }

  cycleBackground() {
    // Placeholder for background cycling
    // Will be implemented in tomdimino-6
    console.log('Background cycling - to be implemented');
  }
}

// Initialize the animator
const semiticAnimator = new SemiticSymbolAnimator();

// Expose globally for debugging
window.semiticAnimator = semiticAnimator;
