
$(document).ready(function (){
  var pathname = window.location.pathname;
  if (pathname != "/hole") {
    window.location = "https://poppy.church/self-destruct";
  }
  setInterval( function () {
    var tmessage = $("#message p").text();
    var messages1 = $("#message p:last").text();
    var messages2 = $("#message p:first").text();
    var rtime = $("#time").text();
	var numofppl = parseInt(messages1.match(/\d+/));

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/",
      data: {"message":tmessage,"number": numofppl, "time":rtime},
    });
  }, 1000);
});
