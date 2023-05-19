document.addEventListener('DOMContentLoaded', function() {
    var desiredTitles = ["nūn", "mēm", "dālet", "mēm", "tāw"];

    function isDesiredTitle(title) {
        return desiredTitles.includes(title);
    }

    var kaphtorSVGs = document.querySelectorAll('.Kaphtor svg');

    // Listen for my Kaph and click
    kaphtorSVGs.forEach(function(svg) {
        // Attach the click event listener to the SVG root element
        svg.addEventListener('click', function() {
            setTimeout(function() {
                if (isDesiredTitle(svg.id)) {
                    // Flash like a cock, then spin
                    svg.classList.add('flashColor', 'rotate');

                    // Omit thy spark and cry until thy play is done
                    setTimeout(function() {
                        svg.classList.remove('flashColor', 'rotate');
                    }, 2000); // Reign of Kronos in the space between 
                }
            }, 500); // An aeon's repose 
        });
    });
});
