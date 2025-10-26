// Artifex GSAP - Semitic Symbol 3D Animation System
// Uses GSAP + CSS 3D transforms for performant animations

class SemiticSymbolAnimator {
  constructor() {
    this.symbols = [];
    this.currentBackgroundIndex = 0;

    // Detect if device is mobile
    this.isMobile = this.detectMobile();

    // Set backgrounds based on device type
    this.backgrounds = this.isMobile ? [
      'Kaphtor/iPhone-Dolphins.jpg',  // Default mobile background
      'Kaphtor/iPhone-GreatMother.jpg'  // Alternate mobile background
    ] : [
      'Kaphtor/Dolphins.jpg',  // Default desktop background
      'Kaphtor/GreatMother-optimized.jpg'  // Alternate desktop background
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
    console.log(`Device type: ${this.isMobile ? 'Mobile' : 'Desktop'}`);

    // Get all SVG symbols
    const symbolElements = document.querySelectorAll('.symbol');
    console.log(`Found ${symbolElements.length} symbols`);

    symbolElements.forEach((symbol, index) => {
      this.setupSymbol(symbol, index);
    });
  }

  detectMobile() {
    // Check for mobile device using multiple methods
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for touch support and common mobile patterns
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isSmallScreen = window.innerWidth <= 1024;

    return isTouchDevice && (isMobileUserAgent || isSmallScreen);
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

    // 90-degree rotation in 2D plane (like spinning a card on a table)
    // Force hardware acceleration on mobile with additional properties
    gsap.to(element, {
      rotateZ: '+=90',  // Z-axis rotation keeps SVG visible and flat
      duration: 0.6,
      ease: 'power2.inOut',
      transformOrigin: 'center center',
      force3D: true,  // Force GPU acceleration
      // Explicitly set transform to ensure visibility on mobile Safari
      onUpdate: function() {
        // Force repaint on mobile devices
        if (this.targets()[0]) {
          this.targets()[0].style.willChange = 'transform';
        }
      },
      onComplete: () => {
        symbolData.isAnimating = false;
        // Remove will-change after animation completes to free resources
        element.style.willChange = 'auto';
      }
    });

    console.log(`Rotating symbol ${symbolData.index}`);
  }

  createTearEffect(element, color, startRotation = 0, endRotation = startRotation + 90, rotationDuration = 0.6) {
    // Get the SVG path element(s) to find symbol bounds
    const paths = element.querySelectorAll('path');
    if (paths.length === 0) return;

    const rect = element.getBoundingClientRect();
    const symbolCenter = {
      x: rect.left + (rect.width / 2),
      y: rect.top + (rect.height / 2)
    };

    const avatarElement = document.querySelector('.gaze-tracker-container img, .gaze-tracker-container, .Avatar');
    const avatarData = avatarElement ? this.getAvatarData(avatarElement.getBoundingClientRect()) : null;

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
    const sourcePoints = topPoints.length ? topPoints : this.generateFallbackPoints(rect);
    const rotationDelta = endRotation - startRotation || 90;

    // Spawn 8-15 tears with varied timing
    const tearCount = gsap.utils.random(8, 15, 1);

    for (let i = 0; i < tearCount; i++) {
      const progress = tearCount === 1 ? 1 : gsap.utils.random(0.15, 0.95);
      const basePoint = sourcePoints[Math.floor(Math.random() * sourcePoints.length)];
      const rotatedPoint = this.rotatePointAroundCenter(
        basePoint,
        symbolCenter,
        rotationDelta * progress
      );

      const jitteredPoint = {
        x: rotatedPoint.x + gsap.utils.random(-4, 4),
        y: rotatedPoint.y + gsap.utils.random(-4, 4)
      };

      const fallTargetX = gsap.utils.interpolate(rotatedPoint.x, symbolCenter.x, 0.35);
      const delay = progress * rotationDuration * gsap.utils.random(0.85, 1.05);
      const impactPoint = avatarData
        ? this.getAvatarImpactPoint(avatarData)
        : this.getFallbackImpactPoint(symbolCenter, rect, fallTargetX);

      gsap.delayedCall(delay, () => {
        this.createSingleTear(jitteredPoint, color, impactPoint);
      });
    }
  }

  createSingleTear(startPoint, color, impactPoint = null) {
    const palette = this.getTearPalette(color);
    const fallbackImpact = impactPoint || {
      x: startPoint.x,
      y: startPoint.y + gsap.utils.random(180, 240),
      normal: { x: 0, y: 1 }
    };
    const targetNormal = fallbackImpact.normal || { x: 0, y: 1 };

    // Wrapper follows physics, inner droplet handles the styling
    const tearWrapper = document.createElement('div');
    tearWrapper.style.position = 'fixed';
    tearWrapper.style.pointerEvents = 'none';
    tearWrapper.style.zIndex = '1000';

    // Teardrop dimensions
    const size = gsap.utils.random(9, 16);
    const height = size * 1.35;
    tearWrapper.style.width = size + 'px';
    tearWrapper.style.height = height + 'px';

    const droplet = document.createElement('div');
    droplet.style.position = 'relative';
    droplet.style.width = '100%';
    droplet.style.height = '100%';
    droplet.style.borderRadius = '45% 45% 55% 55% / 45% 45% 55% 55%';
    droplet.style.clipPath = 'polygon(50% 0%, 82% 16%, 100% 58%, 50% 100%, 0% 58%, 18% 16%)';
    droplet.style.background = `
      radial-gradient(circle at 30% 25%, ${palette.glow} 0%, ${palette.highlight} 35%, ${palette.mid} 65%, ${palette.shadow} 100%)
    `;
    droplet.style.boxShadow = `
      inset -3px -5px 8px ${palette.shadowSoft},
      inset 3px 3px 5px ${palette.highlightSoft},
      0 8px 14px ${palette.shadowSoft}
    `;
    droplet.style.filter = 'brightness(1.05) saturate(1.1)';
    const baseRotation = gsap.utils.random(-5, 5);
    droplet.style.transform = `rotate(${baseRotation}deg)`;
    droplet.style.overflow = 'visible';

    // Lens flare style highlight
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.top = `${size * 0.12}px`;
    highlight.style.left = `${size * 0.18}px`;
    highlight.style.width = `${size * 0.4}px`;
    highlight.style.height = `${size * 0.4}px`;
    highlight.style.borderRadius = '50%';
    highlight.style.background = `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)`;
    highlight.style.filter = 'blur(0.5px)';
    highlight.style.opacity = '0.9';
    droplet.appendChild(highlight);

    // Lower refraction glint
    const glint = document.createElement('div');
    glint.style.position = 'absolute';
    glint.style.bottom = `${size * 0.15}px`;
    glint.style.right = `${size * 0.18}px`;
    glint.style.width = `${size * 0.25}px`;
    glint.style.height = `${size * 0.25}px`;
    glint.style.borderRadius = '50%';
    glint.style.background = `radial-gradient(circle, ${palette.highlightSoft} 0%, transparent 70%)`;
    glint.style.filter = 'blur(1px)';
    glint.style.opacity = '0.65';
    droplet.appendChild(glint);

    // Soft trail so each droplet feels like liquid stretching downward
    const tail = document.createElement('div');
    tail.style.position = 'absolute';
    tail.style.top = `${size * 0.7}px`;
    tail.style.left = `${size * 0.35}px`;
    tail.style.width = `${size * 0.3}px`;
    tail.style.height = `${height}px`;
    tail.style.borderRadius = '50%';
    tail.style.background = `linear-gradient(180deg, ${palette.glow} 0%, transparent 100%)`;
    tail.style.opacity = '0.45';
    tail.style.filter = 'blur(1.2px)';
    droplet.appendChild(tail);

    tearWrapper.appendChild(droplet);

    // Start position from symbol's upper regions
    const startX = startPoint.x - (size / 2) + gsap.utils.random(-2, 2);
    const startY = startPoint.y - (size * 0.25) + gsap.utils.random(-1, 2);

    tearWrapper.style.left = startX + 'px';
    tearWrapper.style.top = startY + 'px';

    document.body.appendChild(tearWrapper);

    // Physics for falling tear
    const gravity = gsap.utils.random(400, 600);
    const duration = gsap.utils.random(1.25, 2.2);

    // Horizontal drift nudges the droplet toward the impact point
    const targetX = fallbackImpact.x - (size / 2);
    const targetY = fallbackImpact.y - (size * 0.15);
    const drift = (targetX - startX) / duration;

    // Wobble for organic movement
    const wobbleSpeed = gsap.utils.random(0.5, 1.5);
    const wobbleAmount = gsap.utils.random(2, 5);

    const startTime = Date.now();

    // Create timeline for tear animation
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.removeChild(tearWrapper);
      }
    });

    // Fade in at birth
    tl.from(tearWrapper, {
      opacity: 0,
      duration: 0.1,
      ease: 'power1.out'
    });

    // Main falling animation with physics
    let hasBounced = false;

    tl.to(tearWrapper, {
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

        if (!hasBounced && y >= targetY) {
          hasBounced = true;
          tearWrapper.style.left = targetX + 'px';
          tearWrapper.style.top = targetY + 'px';
          tl.kill();
          window.requestAnimationFrame(() => {
            // Hand off to bounce animation that slides along the avatar contour
            this.bounceTear(tearWrapper, droplet, targetNormal, baseRotation);
          });
          return;
        }

        tearWrapper.style.left = x + 'px';
        tearWrapper.style.top = y + 'px';

        // Keep organic wobble and stretch on the droplet itself
        const stretch = 1 + (t * 0.18);
        droplet.style.transform = `rotate(${baseRotation}deg) scaleY(${stretch})`;
      }
    }.bind(this), 0.1);
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

  rgbToString({ r, g, b }, alpha = 1) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  mixColor(source, target, ratio) {
    return {
      r: Math.round(source.r + (target.r - source.r) * ratio),
      g: Math.round(source.g + (target.g - source.g) * ratio),
      b: Math.round(source.b + (target.b - source.b) * ratio)
    };
  }

  getTearPalette(hex) {
    const base = this.hexToRgb(hex);
    const highlight = this.mixColor(base, { r: 255, g: 255, b: 255 }, 0.55);
    const mid = this.mixColor(base, { r: 255, g: 255, b: 255 }, 0.25);
    const shadow = this.mixColor(base, { r: 0, g: 0, b: 0 }, 0.35);
    const glow = this.mixColor(base, { r: 255, g: 255, b: 255 }, 0.7);

    return {
      highlight: this.rgbToString(highlight, 0.95),
      highlightSoft: this.rgbToString(highlight, 0.5),
      mid: this.rgbToString(mid, 0.85),
      shadow: this.rgbToString(shadow, 0.9),
      shadowSoft: this.rgbToString(shadow, 0.5),
      glow: this.rgbToString(glow, 0.35)
    };
  }

  getAvatarData(rect) {
    const radius = Math.min(rect.width, rect.height) / 2;
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      radius
    };
  }

  getAvatarImpactPoint(avatar) {
    const angle = gsap.utils.random(-65, 65);
    const rad = (angle - 90) * (Math.PI / 180);
    const radiusOffset = avatar.radius + gsap.utils.random(-4, 6);
    const x = avatar.centerX + radiusOffset * Math.cos(rad);
    const y = avatar.centerY + radiusOffset * Math.sin(rad);

    return {
      x,
      y,
      normal: {
        x: Math.cos(rad),
        y: Math.sin(rad)
      }
    };
  }

  getFallbackImpactPoint(symbolCenter, rect, fallTargetX) {
    return {
      x: fallTargetX,
      y: symbolCenter.y + rect.height * gsap.utils.random(0.65, 0.85),
      normal: { x: 0, y: 1 }
    };
  }

  rotatePointAroundCenter(point, center, angleDegrees) {
    const angle = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: center.x + (dx * cos - dy * sin),
      y: center.y + (dx * sin + dy * cos)
    };
  }

  generateFallbackPoints(rect) {
    const points = [];
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top + rect.height * 0.15;

    for (let i = -3; i <= 3; i++) {
      points.push({
        x: centerX + (i * rect.width * 0.12),
        y: topY + Math.abs(i) * 2
      });
    }

    return points;
  }

  getRunoffDirection(normal = { x: 0, y: 1 }) {
    const dir = {
      x: normal.x,
      y: Math.abs(normal.y) + 0.35
    };
    const length = Math.hypot(dir.x, dir.y) || 1;
    return {
      x: dir.x / length,
      y: dir.y / length
    };
  }

  bounceTear(wrapper, droplet, normal = { x: 0, y: 1 }, baseRotation = 0) {
    const direction = this.getRunoffDirection(normal);
    const slideDistance = gsap.utils.random(24, 40);
    const slideX = direction.x * slideDistance;
    const slideY = direction.y * slideDistance;

    const bounceTl = gsap.timeline({
      onComplete: () => {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      }
    });

    bounceTl
      .to(droplet, {
        scaleY: 0.65,
        scaleX: 1.15,
        duration: 0.12,
        ease: 'power2.in'
      }, 0)
      .to(wrapper, {
        duration: 0.35,
        left: `+=${slideX}`,
        top: `+=${slideY}`,
        ease: 'power2.out'
      }, 0)
      .to(droplet, {
        opacity: 0,
        duration: 0.3,
        ease: 'power1.out'
      }, 0.05)
      .to(droplet, {
        duration: 0.3,
        rotate: baseRotation + direction.x * 25
      }, 0);
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
