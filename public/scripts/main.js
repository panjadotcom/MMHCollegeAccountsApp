
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

function filterTableContent(inputLabel, tableLabel) {
    var input, filter, table, tr, td, cell, i, j;
    input = document.getElementById(inputLabel);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableLabel);
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
          // Hide the row initially.
          tr[i].style.display = "none";
      
          td = tr[i].getElementsByTagName("td");
          for (var j = 0; j < td.length; j++) {
          cell = tr[i].getElementsByTagName("td")[j];
          if (cell) {
              if (cell.innerHTML.toUpperCase().indexOf(filter) > -1) {
              tr[i].style.display = "";
              break;
              } 
          }
        }
    }
}