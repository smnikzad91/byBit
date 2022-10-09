$(document).ready
(
    // function()
    // {
    //     $(".form-contact-submit").click
    //     (
    //         function()
    //         {
    //             var formData = new FormData($(".form-contact")[0]);
    //             var formAction = $(".form-contact").attr("action");
    //             var messageText = "";
    //             var nameFamily = $(".form-contact-name-family").val();
    //             var tel = $(".form-contact-tel").val();
    //             var subject = $(".form-contact-subject").val();
    //             var des = $(".form-contact-des").val();

    //             if(nameFamily.length >= 3 && tel.length === 11 && subject.length >= 3 && des.length >= 10)
    //             {
    //                 $(".form-contact-submit").hide();

    //                 $.ajax
    //                 ({
    //                     url: formAction,
    //                     type: "post",
    //                     data: formData,
    //                     dataType: "json",
    //                     contentType: false,
    //                     cache: false,
    //                     processData:false,
    //                     success: function(data)
    //                     {
    //                         if(data.result == 1)
    //                         {
    //                             $("#modal-error .modal-title").html("");
    //                             $("#modal-error .modal-body").html("اطلاعات با موفقیت ثبت شده اند.");
    //                             $("#modal-error").modal();

    //                             $(".form-contact")[0].reset();
    //                         }
    //                         else
    //                         {
    //                             if(data.errorNameFamily == 1) messageText += '<p>- نام و نام خانوادگی حداقل 3 حرف</p>';
    //                             if(data.errorTell == 1) messageText += '<p>- تلغن 11 رقم</p>';
    //                             if(data.errorSubject == 1) messageText += '<p>- موضوع حداقل 3 حرف</p>';
    //                             if(data.errorDes == 1) messageText += '<p>- توضیح حداقل 10 حرف</p>';

    //                             if(messageText == "") messageText += '<p>- مشکلی در ثبت اطلاعات پیش آمده است.</p>';

    //                             $("#modal-error .modal-title").html("خطا");
    //                             $("#modal-error .modal-body").html(messageText);
    //                             $("#modal-error").modal();
    //                         }

    //                         $(".form-contact-submit").show();
    //                     }
    //                 });
    //             }
    //             else
    //             {
    //                 if(!(nameFamily.length >= 3))
    //                 {
    //                     messageText += '<p>- نام و نام خانوادگی حداقل 3 حرف</p>';
    //                 }
    //                 if(!(tel.length === 11))
    //                 {
    //                     messageText += '<p>- تلغن 11 رقم</p>';
    //                 }
    //                 if(!(subject.length >= 3))
    //                 {
    //                     messageText += '<p>- موضوع حداقل 3 حرف</p>';
    //                 }
    //                 if(!(des.length >= 10))
    //                 {
    //                     messageText += '<p>- توضیح حداقل 10 حرف</p>';
    //                 }

    //                 $("#modal-error .modal-title").html("خطا");
    //                 $("#modal-error .modal-body").html(messageText);
    //                 $("#modal-error").modal();
    //             }

    //             return false;
    //         }
    //     );
    // }
);