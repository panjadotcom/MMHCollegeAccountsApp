
$(".custom-file-input").on('change', function(el) {
  let filename = $(el.target).val().split("\\").pop();
  let nextSibling = el.target.nextElementSibling;
  nextSibling.innerText = filename;
});

$("div .alert").on('mouseover', (el) => {
  setTimeout(() => {
    $("div .alert").remove();
  }, 500);
});