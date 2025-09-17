/* main.js — BEGINNER VERSION (hard reset on cancel/checkout)
   - No localStorage
   - Simple variables + innerHTML rendering
   - Force zeroes all qty labels so nothing “sticks”
*/

// ------- Data (menu of products) -------
var MENU = { // Define an object MENU that holds all available items grouped by category
  mains: [ // Array of main courses
    { id: "bigmac", name: "Big Mac", price: 55 }, // Each item has id, display name, and price
    { id: "cheeseburger", name: "Cheeseburger", price: 20 },
    { id: "mcchicken", name: "McChicken", price: 40 }
  ],
  drinks: [ // Array of drinks
    { id: "cola", name: "Coca-Cola", price: 18 },
    { id: "fanta", name: "Fanta", price: 18 },
    { id: "milkshake", name: "Milkshake", price: 28 }
  ],
  sides: [ // Array of side items
    { id: "fries", name: "Pommes Frites", price: 22 },
    { id: "nuggets6", name: "Chicken Nuggets (6)", price: 32 },
    { id: "salad", name: "Sidesalat", price: 25 }
  ],
  desserts: [ // Array of desserts
    { id: "mcflurry", name: "McFlurry", price: 30 },
    { id: "applepie", name: "Apple Pie", price: 15 },
    { id: "icecream", name: "Soft Ice", price: 18 }
  ]
};

// ------- State (variables that change while program runs) -------
var order = {};          // Object to keep track of the current order, e.g. {bigmac: 2, fries: 1}
var orderNumber = 1;     // Current order number shown to the customer, starts at 1
var dailyRevenue = 0;    // Total revenue of the day (sum of all completed orders)

// ------- Helper functions -------
function kr(x){ // Function to format a number as Danish currency
  return x.toFixed(2).replace(".", ",") + " kr"; // Round to 2 decimals, replace "." with ",", add " kr"
}

function allGroups(){ // Function to return all menu groups in one array
  return [MENU.mains, MENU.drinks, MENU.sides, MENU.desserts]; // Collects all arrays of items into one array
}

function findItemById(id){ // Function to look up an item in the menu by its id (e.g. "bigmac")
  var groups = allGroups(); // Get all groups (mains, drinks, sides, desserts)
  for (var g=0; g<groups.length; g++){ // Loop through each group
    for (var i=0; i<groups[g].length; i++){ // Loop through each item inside the group
      if (groups[g][i].id === id) return groups[g][i]; // If the id matches, return the item object
    }
  }
  return null; // If nothing matches, return null
}

// ------- Renderers (functions that update the page) -------
function renderHeader(){ // Updates the top bar showing order number and revenue
  document.getElementById("orderNo").textContent = orderNumber; // Put current order number into element with id "orderNo"
  document.getElementById("revenue").textContent = kr(dailyRevenue); // Put formatted revenue into element with id "revenue"
}

function renderMenuSection(containerId, items){ // Render one menu section (e.g. mains, drinks)
  var html = ""; // Start with empty HTML string
  for (var i=0; i<items.length; i++){ // Loop over every item in the section
    var it = items[i]; // Current item
    var qty = order[it.id] ? order[it.id] : 0; // Check current quantity in the order, default 0
    // Build HTML block for this item (name, price, buttons, and qty display)
    html += ''
      + '<div class="item">'
      +   '<div>'
      +     '<div class="name">' + it.name + '</div>'
      +     '<div class="price">' + kr(it.price) + '</div>'
      +   '</div>'
      +   '<div class="row">'
      +     '<button class="sub" onclick="changeQty(\''+it.id+'\',-1)">−</button>' // Button decreases quantity
      +     '<span id="q_'+it.id+'" style="min-width:18px;text-align:center;">'+qty+'</span>' // Shows current qty
      +     '<button class="add" onclick="changeQty(\''+it.id+'\',+1)">+</button>' // Button increases quantity
      +   '</div>'
      + '</div>';
  }
  document.getElementById(containerId).innerHTML = html; // Put generated HTML inside the correct container
}

function renderMenus(){ // Render all menu categories on the page
  renderMenuSection("main-list", MENU.mains); // Render mains
  renderMenuSection("drink-list", MENU.drinks); // Render drinks
  renderMenuSection("side-list", MENU.sides); // Render sides
  renderMenuSection("dessert-list", MENU.desserts); // Render desserts
}

function calcTotal(){ // Calculate the total cost of the current order
  var sum = 0; // Start with sum = 0
  for (var id in order){ // Loop through every item in the order
    if (order[id] > 0){ // Only count items with qty > 0
      var it = findItemById(id); // Find the item details (price, name)
      if (it) sum += it.price * order[id]; // Add price × quantity to sum
    }
  }
  return sum; // Return total sum
}

function updateAllQtyLabelsTo(data){ // Update all visible quantity numbers in the menu
  var groups = allGroups(); // Get all groups of items
  for (var g=0; g<groups.length; g++){ // Loop over groups
    for (var i=0; i<groups[g].length; i++){ // Loop over each item in the group
      var id = groups[g][i].id; // Get item id
      var el = document.getElementById("q_"+id); // Find the span element for this item's qty
      if (el) el.textContent = data[id] ? data[id] : 0; // Set text to the value in "data" or 0 if not present
    }
  }
}

function renderCart(){ // Render the cart on the right side of the screen
  var itemsHtml = ""; // Start with empty HTML for cart
  var has = false; // Flag: does the cart have any items?
  for (var id in order){ // Loop through order items
    if (order[id] > 0){ // Only add items with qty > 0
      has = true; // Cart is not empty
      var it = findItemById(id); // Find item details
      itemsHtml += '<li><span>'+it.name+' × '+order[id]+'</span><b>'+kr(it.price*order[id])+'</b></li>'; // Add line for cart
    }
  }
  if (!has) itemsHtml = '<li class="empty">Ingen varer endnu</li>'; // If empty, show message

  document.getElementById("cartList").innerHTML = itemsHtml; // Show cart items
  document.getElementById("total").textContent = kr(calcTotal()); // Show total price
  document.getElementById("checkoutBtn").disabled = !has; // Disable checkout button if cart is empty

  updateAllQtyLabelsTo(order); // Sync all qty counters in menu with order
}

// ------- Actions (what user can do) -------
function changeQty(id, delta){ // Increase or decrease quantity of an item
  var current = order[id] ? order[id] : 0; // Get current qty or 0 if not in order
  var next = current + delta; // Add delta (±1)
  if (next < 0) next = 0; // Don’t allow negative qty
  if (next === 0) delete order[id]; else order[id] = next; // If 0, remove from order; else set new qty
  renderCart(); // Update cart and menu
}

function hardResetOrderAndUI(){ // Reset everything after cancel/checkout
  for (var k in order) delete order[k]; // Remove all items from the order object
  updateAllQtyLabelsTo({}); // Reset all counters in menu to 0
  document.getElementById("cartList").innerHTML = '<li class="empty">Ingen varer endnu</li>'; // Empty cart list
  document.getElementById("total").textContent = kr(0); // Set total to 0
  document.getElementById("checkoutBtn").disabled = true; // Disable checkout button
}

function openReceipt(){ // Show the receipt modal with the order details
  var text = "McDonald’s – Bestilling #"+orderNumber+"\n"; // Start with order number
  text += "--------------------------------\n"; // Divider line
  for (var id in order){ // Loop over items in the order
    if (order[id] > 0){ // Only include items with qty > 0
      var it = findItemById(id); // Find item details
      text += it.name+" × "+order[id]+"  …  "+kr(it.price*order[id])+"\n"; // Add line with item, qty, and subtotal
    }
  }
  text += "--------------------------------\n"; // Divider
  text += "TOTALT: "+kr(calcTotal())+"\n\n"; // Add total price
  text += "Tak for din bestilling!"; // Thank you message
  document.getElementById("receipt").textContent = text; // Put receipt text in modal
  document.getElementById("modal").style.display = "flex"; // Show modal by setting display to flex
}

function closeReceiptAndFinalize(){ // Close receipt modal and finalize order
  dailyRevenue += calcTotal(); // Add this order’s total to daily revenue
  orderNumber += 1; // Increase order number for next customer
  renderHeader(); // Update header with new order number and revenue

  hardResetOrderAndUI(); // Clear cart and reset UI

  document.getElementById("modal").style.display = "none"; // Hide modal again
}

function cancelOrder(){ // Cancel the current order
  hardResetOrderAndUI(); // Reset cart and UI but keep same order number
  alert("Bestilling annulleret. Nummeret genbruges til næste kunde."); // Inform user
}

// ------- Wire up (connect buttons to functions) -------
document.getElementById("checkoutBtn").onclick = openReceipt; // Checkout button → open receipt
document.getElementById("closeModal").onclick = closeReceiptAndFinalize; // Close modal button → finalize order
document.getElementById("cancelBtn").onclick = cancelOrder; // Cancel button → cancel order

// ------- Init (start program by showing initial UI) -------
renderHeader(); // Show order number + revenue at top
renderMenus();  // Render all menu items
renderCart();   // Render empty cart
