// Main JavaScript for GovEase AI Data Flow Diagrams

$(document).ready(function() {
    // Initialize Mermaid on all pages
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            securityLevel: 'loose'
        });
    }

    // Add active state to nav links
    $('.navbar-nav .nav-link').each(function() {
        if (this.href === window.location.href) {
            $(this).addClass('active');
        }
    });

    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
    });

    // Add copy functionality for diagram code
    $('.copy-btn').on('click', function() {
        var code = $(this).data('code');
        navigator.clipboard.writeText(code).then(function() {
            $('.copy-btn').text('Copied!');
            setTimeout(function() {
                $('.copy-btn').text('Copy Code');
            }, 2000);
        });
    });

    // Add diagram info toggle
    $('.toggle-info').on('click', function() {
        var target = $($(this).data('target'));
        target.toggleClass('d-none');
        $(this).text($(this).text() === 'Show Details' ? 'Hide Details' : 'Show Details');
    });
});
