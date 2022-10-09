$(document).ready
(
    function()
    {
        // slider
        new Swiper
        (
            ".slider-bar .swiper-container",
            {
                slidesPerView: "auto",
                loop: true,
                centeredSlides: true,
                speed: 1000,
                autoplay:
                    {
                        delay: ($(".slider-bar .swiper-slide").length > 1) ? 5000 : 500000000,
                        disableOnInteraction: false
                    },
                pagination:
                    {
                        el: ".slider-bar .swiper-pagination",
                        clickable: true
                    }
            }
        );
        if($(".slider-bar .swiper-slide").length <= 3) $(".slider-bar .swiper-pagination").hide();

        // news-bar
        var newsSwiper = new Swiper
        (
            ".news-bar .swiper-container",
            {
                slidesPerView: 3,
                loop: false,
                speed: 1000,
                spaceBetween: 30,
                navigation:
                    {
                        nextEl: ".news-bar .swiper-button-next",
                        prevEl: ".news-bar .swiper-button-prev"
                    },
                breakpoints:
                    {
                        1199: { slidesPerView: 3 },
                        992: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        550: { slidesPerView: 1 }
                    },
                on:
                    {
                        init: function()
                        {
                            initSwiper(".news-bar");
                        }
                    }
            }
        );
        newsSwiper.on
        (
            "slideChange",
            function()
            {
                initSwiper(".news-bar");
            }
        );

        // course-bar
        var courseSwiper = new Swiper
        (
            ".course-bar .swiper-container",
            {
                slidesPerView: 2,
                loop: false,
                speed: 1000,
                spaceBetween: 30,
                navigation:
                    {
                        nextEl: ".course-bar .swiper-button-next",
                        prevEl: ".course-bar .swiper-button-prev"
                    },
                breakpoints:
                    {
                        1199: { slidesPerView: 2 },
                        992: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        550: { slidesPerView: 1 }
                    },
                on:
                    {
                        init: function()
                        {
                            initSwiper(".course-bar");
                        }
                    }
            }
        );
        courseSwiper.on
        (
            "slideChange",
            function()
            {
                initSwiper(".course-bar");
            }
        );

        // article-bar
        var articleSwiper = new Swiper
        (
            ".article-bar .swiper-container",
            {
                slidesPerView: 3,
                loop: false,
                speed: 1000,
                spaceBetween: 30,
                navigation:
                    {
                        nextEl: ".article-bar .swiper-button-next",
                        prevEl: ".article-bar .swiper-button-prev"
                    },
                breakpoints:
                    {
                        1199: { slidesPerView: 2 },
                        992: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        550: { slidesPerView: 1 }
                    },
                on:
                    {
                        init: function()
                        {
                            initSwiper(".article-bar");
                        }
                    }
            }
        );
        articleSwiper.on
        (
            "slideChange",
            function()
            {
                initSwiper(".article-bar");
            }
        );

        // video-bar
        var videoSwiper = new Swiper
        (
            ".video-bar .swiper-container",
            {
                slidesPerView: 2,
                loop: false,
                speed: 1000,
                spaceBetween: 30,
                navigation:
                    {
                        nextEl: ".video-bar .swiper-button-next",
                        prevEl: ".video-bar .swiper-button-prev"
                    },
                breakpoints:
                    {
                        1199: { slidesPerView: 2 },
                        992: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        550: { slidesPerView: 1 }
                    },
                on:
                    {
                        init: function()
                        {
                            initSwiper(".video-bar");
                        }
                    }
            }
        );
        videoSwiper.on
        (
            "slideChange",
            function()
            {
                initSwiper(".video-bar");
            }
        );
    }
);

$(window).on
(
    "load",
    function()
    {
        initSwiper(".news-bar");
        initSwiper(".course-bar");
        initSwiper(".article-bar");
        initSwiper(".video-bar");
    }
);

$(window).on
(
    "resize",
    function()
    {
        initSwiper(".news-bar");
        initSwiper(".course-bar");
        initSwiper(".article-bar");
        initSwiper(".video-bar");
    }
);

function initSwiper(sectionClass)
{
    var btnNext = $(sectionClass + " .swiper-button-next.swiper-button-disabled").length;
    var btnPrev = $(sectionClass + " .swiper-button-prev.swiper-button-disabled").length;

    if(btnNext > 0 && btnPrev > 0)
        $(sectionClass + " .swiper-button-box").hide();
    else
        $(sectionClass + " .swiper-button-box").show();
}