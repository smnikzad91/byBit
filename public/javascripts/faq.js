$(document).ready
(
    function()
    {
        $(".question-answer-box").click
        (
            function()
            {
                if($(this).hasClass("active"))
                {
                    $(this).removeClass("active").find(".answer").slideUp(300);
                }
                else
                {
                    $(".question-answer-box").removeClass("active");
                    $(".answer").slideUp(300);

                    $(this).addClass("active").find(".answer").slideDown(300);
                }
            }
        );
    }
);