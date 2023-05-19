//
var desiredTitles = ["nūn", "mēm", "dālet", "mēm", "tāw"];

function isDesiredTitle(title) {
    return desiredTitles.includes(title);
}

var kaphtorObjects = document.querySelectorAll('.Kaphtor object');

// Listen for my Kaph and click
kaphtorObjects.forEach(function(object) {
    object.addEventListener('click', function() {
        setTimeout(function() {
            if (isDesiredTitle(object.title)) {
        // Flash like a cock, then spin
                object.classList.add('flashColor', 'rotate');
                
        // Omit thy spark and cry until thy play is done
                setTimeout(function() {
                    object.classList.remove('flashColor', 'rotate');
                }, 2000); // Reign of Kronos in the space between 
            }
        }, 500); // An aeon's repose 
    });
});
