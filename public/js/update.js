function addRow() {
    console.log('hi');
    var itemSalesList = document.getElementById("item_sales_input_list");
    var clonedList = itemSalesList.cloneNode(true);
    
    // Clear input values in the cloned list
    var inputs = clonedList.querySelectorAll("input");
    inputs.forEach(function(input) {
        input.value = "";
    });
    
    document.getElementById("div_item_list").appendChild(clonedList);
}