// Listen for my Kaph and click
kaphtorObjects.forEach(function(object) {
    object.addEventListener('load', function() {
        var svgDoc = object.contentDocument; // Get the SVG document inside the Object tag
        var svgRoot = svgDoc.documentElement; // Get the root SVG element

        // Attach the click event listener to the SVG root element
        svgRoot.addEventListener('click', function() {
            setTimeout(function() {
                if (isDesiredTitle(object.title)) {
                    // Flash like a cock, then spin
                    svgRoot.classList.add('flashColor', 'rotate');

                    // Omit thy spark and cry until thy play is done
                    setTimeout(function() {
                        svgRoot.classList.remove('flashColor', 'rotate');
                    }, 2000); // Reign of Kronos in the space between 
                }
            }, 500); // An aeon's repose 
        });
    });
});

