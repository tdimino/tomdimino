document.addEventListener('DOMContentLoaded', function() {

  // Define an array of desired symbols
  const desiredSymbols = ['nūn', 'mēm', 'dālet', 'tāw'];

  // Get all of the SVG elements with the class "symbol"
  const symbolSVGs = document.querySelectorAll('.symbol');

  // Iterate over the SVG elements and add a click event listener to each one
  symbolSVGs.forEach(function(svg) {

    // Attach the click event listener to the SVG root element
    svg.addEventListener('click', function() {

      // Check if the ID of the clicked element is in the desired symbols array
      if (desiredSymbols.includes(svg.id)) {

        // Rotate the element around its Y axis for 2 seconds using GSAP
        gsap.to(svg, {
          rotationY: '+=360',
          duration: 2,
          perspective: 1000,
          scale3D: [1, 1, 1]
        });

      }
    });
  });
});
