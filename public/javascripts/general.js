$(document).ready
(
    function()
    {
        $("#menu-side").mmenu
        (
            {
                offCanvas:
                    {
                        menuInsertSelector: "body"
                    },
                navbar:
                    {
                        title: '<span id="my-page" class="fa fa-close" style="cursor: pointer"></span>'
                    },
                "extensions":
                    [
                        //"pagedim-black",
                        //"shadow-page",
                        "position-right"
                    ],
                "rtl":
                    {
                        use: true
                    }
            }
        );
        var API = $("#menu-side").data("mmenu");

        $("#my-page").click(function() {
            API.close();
        });
    }
);