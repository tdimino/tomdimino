// Artifex GSAP - Semitic Symbol 3D Animation System
// Uses GSAP + CSS 3D transforms for performant animations

class SemiticSymbolAnimator {
  constructor() {
    this.symbols = [];
    this.currentBackgroundIndex = 0;
    this.backgrounds = [
      'Kaphtor/Dolphins.jpg',  // Default background
      'Kaphtor/GreatMother-optimized.jpg'  // Alternate background
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
    const element = symbolData.element;

    // Determine tear color based on background
    const tearColor = this.currentBackgroundIndex === 1 ? '#e7525b' : '#4a90e2';

    // Trigger tear effect
    this.createTearEffect(element, tearColor);

    // 90-degree rotation in 2D plane (like spinning a card on a table)
    gsap.to(element, {
      rotateZ: '+=90',  // Z-axis rotation keeps SVG visible and flat
      duration: 0.6,
      ease: 'power2.inOut',
      transformOrigin: 'center center',
      onComplete: () => {
        symbolData.isAnimating = false;
      }
    });

    console.log(`Rotating symbol ${symbolData.index}`);
  }

  createTearEffect(element, color) {
    // Get the SVG path element(s) to find symbol bounds
    const paths = element.querySelectorAll('path');
    if (paths.length === 0) return;

    const rect = element.getBoundingClientRect();

    // Sample points along SVG paths to find upper regions
    const edgePoints = [];
    paths.forEach(path => {
      const pathLength = path.getTotalLength();
      const samples = 12;

      for (let i = 0; i < samples; i++) {
        const point = path.getPointAtLength((pathLength * i) / samples);
        const CTM = element.getScreenCTM();

        if (CTM) {
          const screenPoint = {
            x: CTM.a * point.x + CTM.c * point.y + CTM.e,
            y: CTM.b * point.x + CTM.d * point.y + CTM.f
          };
          edgePoints.push(screenPoint);
        }
      }
    });

    // Sort by Y to find highest points (where tears originate)
    edgePoints.sort((a, b) => a.y - b.y);
    const topPointsCount = Math.ceil(edgePoints.length * 0.3);
    const topPoints = edgePoints.slice(0, topPointsCount);

    // Spawn 8-15 tears with varied timing
    const tearCount = gsap.utils.random(8, 15, 1);

    for (let i = 0; i < tearCount; i++) {
      // Stagger tear creation for flowing effect
      gsap.delayedCall(i * gsap.utils.random(0.05, 0.15), () => {
        this.createSingleTear(topPoints, color, rect);
      });
    }
  }

  createSingleTear(topPoints, color, symbolRect) {
    // Create teardrop-shaped element
    const tear = document.createElement('div');
    tear.style.position = 'fixed';
    tear.style.pointerEvents = 'none';
    tear.style.zIndex = '1000';

    // Teardrop dimensions
    const size = gsap.utils.random(6, 10);

    tear.style.width = size + 'px';
    tear.style.height = size + 'px';

    // Classic CSS teardrop shape using border-radius
    // Creates a perfect water droplet: round at top, pointed at bottom
    tear.style.borderRadius = '50% 50% 50% 0';

    // Rotate to point downward
    tear.style.transform = 'rotate(45deg)';

    // Translucent color using rgba
    const alpha = gsap.utils.random(0.6, 0.85);
    const rgbColor = this.hexToRgb(color);
    tear.style.backgroundColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha})`;

    // Glassy liquid effect with subtle blur
    tear.style.filter = `blur(0.3px) brightness(1.15)`;

    // Light refraction effect - subtle glow and internal highlight
    tear.style.boxShadow = `
      inset -2px -2px 3px rgba(255, 255, 255, 0.6),
      inset 2px 2px 3px rgba(0, 0, 0, 0.15),
      0 2px 6px ${color}55
    `;

    // Start position from symbol's upper regions
    const startPoint = topPoints[Math.floor(Math.random() * topPoints.length)];
    const startX = startPoint.x - (size / 2) + gsap.utils.random(-3, 3);
    const startY = startPoint.y + gsap.utils.random(-2, 2);

    tear.style.left = startX + 'px';
    tear.style.top = startY + 'px';

    document.body.appendChild(tear);

    // Physics for falling tear
    const gravity = gsap.utils.random(400, 600);
    const duration = gsap.utils.random(1.2, 2.5);

    // Slight horizontal drift
    const drift = gsap.utils.random(-12, 12);

    // Wobble for organic movement
    const wobbleSpeed = gsap.utils.random(0.5, 1.5);
    const wobbleAmount = gsap.utils.random(2, 5);

    const startTime = Date.now();

    // Create timeline for tear animation
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.removeChild(tear);
      }
    });

    // Fade in at birth
    tl.from(tear, {
      opacity: 0,
      duration: 0.1,
      ease: 'power1.out'
    });

    // Main falling animation with physics
    tl.to(tear, {
      duration: duration,
      opacity: 0,
      ease: 'power1.in',
      onUpdate: function() {
        const t = (Date.now() - startTime) / 1000;

        // Vertical fall with gravity: y = y₀ + ½gt²
        const y = startY + (0.5 * gravity * t * t);

        // Horizontal wobble (tears sway as they fall)
        const wobble = Math.sin(t * wobbleSpeed * Math.PI * 2) * wobbleAmount;
        const x = startX + (drift * t) + wobble;

        tear.style.left = x + 'px';
        tear.style.top = y + 'px';

        // Keep the 45deg rotation while stretching slightly as it falls
        const stretch = 1 + (t * 0.12);
        tear.style.transform = `rotate(45deg) scaleY(${stretch})`;
      }
    }, 0.1);
  }

  handleHoverEnter(index) {
    const symbolData = this.symbols[index];

    // Scale up on hover with smooth easing
    gsap.to(symbolData.element, {
      scale: 1.15,
      duration: 0.3,
      ease: 'power2.out'
    });

    console.log(`Hover enter on symbol ${index}`);
  }

  handleHoverLeave(index) {
    const symbolData = this.symbols[index];

    // Scale back to normal
    gsap.to(symbolData.element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });

    console.log(`Hover leave on symbol ${index}`);
  }

  hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  cycleBackground() {
    // Cycle to next background
    this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
    const nextBackground = this.backgrounds[this.currentBackgroundIndex];

    console.log(`Cycling to background: ${nextBackground}`);

    // Create smooth fade transition using overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    // Apply the same dark overlay and parallax settings as in CSS
    overlay.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBackground})`;
    overlay.style.backgroundSize = 'cover';
    overlay.style.backgroundPosition = 'center center';
    overlay.style.backgroundRepeat = 'no-repeat';
    overlay.style.backgroundAttachment = 'fixed';
    overlay.style.opacity = '0';
    overlay.style.zIndex = '-1';
    overlay.style.pointerEvents = 'none';

    document.body.appendChild(overlay);

    // Fade in the overlay
    gsap.to(overlay, {
      opacity: 1,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        // Update body background - use backgroundImage to preserve other properties
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBackground})`;
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        // Remove height constraint to let background extend full page
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';
        document.body.removeChild(overlay);
      }
    });
  }
}

// Initialize the animator
const semiticAnimator = new SemiticSymbolAnimator();

// Expose globally for debugging
window.semiticAnimator = semiticAnimator;
