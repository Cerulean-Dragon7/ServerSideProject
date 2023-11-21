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
    
    // Append the clonedList to the div_item_list in the new dialog
    //divItemList.appendChild(clonedList);
    //console.log('hi',divItemList);

}

/*
const dialog = document.querySelector('#dialog');
const showbutton = document.querySelector('#edit_button');
const closebutton = document.querySelector('#cretae_button');
console.log(dialog);
console.log(showbutton);
console.log(closebutton);

$('.edit_button').click(function() {
// Find the parent container of the clicked button
var parentContainer = $(this).closest('.order_title_container');

// Find the <span> element within the parent container and log its text

let doc = {};
doc['_id'] = parentContainer.attr('id');
doc['saleDate'] = new Date(parentContainer.find('span.date').text()).toISOString();

let items = [];
let item_name = parentContainer.find('span.item_name');
let item_price = parentContainer.find('span.item_price');
let item_quantity = parentContainer.find('span.item_quantity');
for(let i =0; i<item_name.length; i++){
    let item = {};

    let name = item_name[i].innerText;
    let price = parseFloat(item_price[i].innerText);
    let quantity = parseInt(item_quantity[i].innerText);

    item['name'] = name;
    item['price'] = price;
    item['quantity'] = quantity;
    
    items.push(item);
    console.log[item];
}
doc['items'] = items;
doc['storeLocation'] = parentContainer.find('span.storeLocation').text();

let customer = {
    gender: parentContainer.find('span.customer_gender').text(),
    age: parseInt(parentContainer.find('span.customer_age').text()),
    email: parentContainer.find('span.customer_email').text(),
    satisfaction: parseInt(parentContainer.find('span.customer_satisfaction').text()),
};

doc['customer'] = customer;
doc['couponUsed'] = parentContainer.find('span.couponUsed').text();
doc['purchaseMethod'] = parentContainer.find('span.purchaseMethod').text();

console.log(doc);


});

showbutton.addEventListener("click", () => {
    dialog.showModal();
});

closebutton.addEventListener("click", () => {
    dialog.close();
});*/