window.addRow = () => {
    var itemSalesList = document.getElementById("item_sales_input_list");
    var clonedList = itemSalesList.cloneNode(true);
    
    // Clear input values in the cloned list
    var inputs = clonedList.querySelectorAll("input");
    inputs.forEach(function(input) {
        input.value = "";
    });

    // Get the div_item_list element in the newly created dialog
    newDialog = document.getElementById("dialog");
    var divItemList = newDialog.querySelector("#div_item_list");
}