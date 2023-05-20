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
            if (isDesiredTitle(svg.id)) {
                // Spin
                gsap.to(svg, { rotationY: 360, duration: 2 });

                // Omit thy spark and cry until thy play is done
                setTimeout(function() {
                    gsap.to(svg, { rotationY: 0, duration: 2 });
                }, 2000); // Reign of Kronos in the space between 
            }
        });
    });
});
