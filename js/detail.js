document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    
    // Initialize Masonry with error handling
    try {
        const msnry = new Masonry(grid, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-item',
            gutter: 8,
            fitWidth: false,
            percentPosition: true
        });

        // Layout Masonry after all images have loaded
        imagesLoaded(grid).on('done', function() {
            msnry.layout();
        }).on('fail', function(instance) {
            console.error('One or more images failed to load:', instance.elements);
            msnry.layout(); // Still layout even if some images fail
        });

        // Update layout on window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                msnry.layout();
            }, 100);
        });
    } catch (error) {
        console.error('Error initializing Masonry:', error);
    }
});