document.addEventListener('DOMContentLoaded', function() {

  // Define an array of desired symbols
  const desiredSymbols = ['nūn', 'mēm', 'dālet', 'tāw'];

  // Get all of the SVG elements with the class "symbol"
  const symbolSVGs = document.querySelectorAll('.symbol');

  // Iterate over the SVG elements and add a click event listener to each one
  symbolSVGs.forEach(function(svg) {

    // Track the current state of the SVG element
    let isRotated = false;

    // Attach the click event listener to the SVG root element
    svg.addEventListener('click', function() {

      // Check if the ID of the clicked element is in the desired symbols array
      if (desiredSymbols.includes(svg.id)) {

        // Rotate and invert the element if it's not already rotated
        if (!isRotated) {
          gsap.to(svg, {
            rotationY: '+=180',
            scaleX: -1,
            duration: 1,
            perspective: 1000
          });
          isRotated = true;
        } else {
          // Restore the original rotation and appearance
          gsap.to(svg, {
            rotationY: '+=180',
            scaleX: 1,
            duration: 1,
            perspective: 1000
          });
          isRotated = false;
        }
      }
    });
  });
});
