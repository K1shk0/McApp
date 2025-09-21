var MENU = {                      // object using VAR (The value can be changed, could've used LET) named MENU that holds all items split by category
  mains: [                        // "mains" is an array of main-course items
    { id: "bigmac", name: "Big Mac", price: 55 },   // One product with unique id, display name, and price in DKK
    { id: "cheeseburger", name: "Cheeseburger", price: 20 }, 
    { id: "mcchicken", name: "McChicken", price: 40 }        
  ],                              // End of array
  drinks: [                       // Here we have another array called "drinks", still using the var MENU.
    { id: "cola", name: "Coca-Cola", price: 18 },   
    { id: "fanta", name: "Fanta", price: 18 },      
    { id: "milkshake", name: "Milkshake", price: 28 } 
  ]                              
};                                


// --------------------
// State (variables that can change as the user clicks)
// --------------------
var order = {};                   // "order" will store quantities by id, for an example { bigmac: 2, cola: 1 }


var orderNumber = localStorage.getItem("orderNumber")         // Here I keep track of which customer number we’re at. I used var so the value can change every time a new customer finishes their order.
  ? Number(localStorage.getItem("orderNumber"))               // If the browser already has a number saved in localStorage, I load it and convert it to a number.
  : 1;                                                        // If not, we start at 1.


var dailyRevenue = localStorage.getItem("dailyRevenue")       // This stores the total amount of money the kiosk has made today.
  ? Number(localStorage.getItem("dailyRevenue"))              // Like orderNumber, I try to load it from localStorage if it exists. Otherwise start at 0
  : 0;                                                        // I also used var here because it needs to change every time a new order is completed.


// --------------------
// Helpers (small utilities used by multiple places)
// --------------------
function kr(x) {                                              // Here we used a function which is a block of code that we can call and is reusable kr: format a number as Danish currency text
  var withTwo = x.toFixed(2);                                  // withTwo: convert number to a string with exactly 2 decimals
  var dk = withTwo.replace(".", ",");                          // dk: replace the dot with a comma (Danish style)
  return dk + " kr";                                           // Return the final string, e.g. "55,00 kr"
}                                                              


function saveState() {                                        // This function stores the current order number and daily revenue in the browser’s localStorage
  localStorage.setItem("orderNumber", orderNumber);            // That way, if the page refreshes, the kiosk doesn’t forget the numbers.
  localStorage.setItem("dailyRevenue", dailyRevenue);          
}


function showHeader() {                                         // This updates the top of the screen where the order number and revenue are shown.
  document.getElementById("orderNo").textContent = orderNumber;   // I used document.getElementById to grab the HTML element by its ID.
  document.getElementById("revenue").textContent = kr(dailyRevenue);  // and .textContent to change its text.
} 


function showMenu() {                                         // This builds the actual menu that the customer sees.
  var html = "";                                               // Start with an empty string that will collect HTML
  MENU.mains                                                   // Take mains
    .concat(MENU.drinks)                                       // Take Drinks combines them into one array by using concat so I can loop through both at once. (one array)
    .forEach(function (item) {                                 // Loops through each product in the combined list.
      var qty = order[item.id] ? order[item.id] : 0;            // This checks if the item is already in the customer’s order. if use, use that qty.
      html += `                                                 
      <div class="item">                                       <!-- One visual row for the product -->
        <span>${item.name} (${kr(item.price)})</span>          <!-- shows the products name and its price (formatted in Danish kr). -->
        <button onclick="addItem('${item.id}')">+</button>     <!-- a plus button that calls addItem() when clicked. -->
        <button onclick="removeItem('${item.id}')">-</button>  <!-- a minus button that calls removeItem(). -->
        <span id="qty_${item.id}">${qty}</span>                <!-- shows the current quantity for this item (like “2” if you ordered two). -->
      </div>`;                                                 // Close the item row
    });                                                        // Finish the forEach loop
  document.getElementById("menu").innerHTML = html;            // Finally, I put all the HTML inside the #menu element
}                                                              

function showCart() {                                          // showCart: rebuild the cart list and total
  var total = 0;                                               // Start by making a variable, it is 0, because we havent added anything
  var html = "";                                               // I also start with an empty string called html, This string will be filled with list items, one for each product in the order.
  for (var id in order) {                                      // Loop over every property name in "order" (each is an item id) 
    var qty = order[id];                                       // qty is the amount ordered for this id
    if (qty > 0) {                                             // Only show items with qty > 0
      var item = findItem(id);                                 // Lookup the full item (name, price) by id
      total += item.price * qty;                               // Add this line's subtotal to the running total
      html += `<li>${item.name} × ${qty} = ${kr(item.price * qty)}</li>`; // Add a list row for this item
    }                                                          
  }                                                            
  if (html === "") html = "<li>Ingen varer endnu</li>";        // If no items, show a friendly empty message
  document.getElementById("cartList").innerHTML = html;        // After the loop finishes, I take all the HTML I built and put it inside the #menu element on the webpage.
  document.getElementById("total").textContent = kr(total);    // This will update the total in the #total span
}

// --------------------
// Actions (called by buttons)
// --------------------
function findItem(id) {                                       // findItem: find a menu item object by its id, Example: if I call findItem("bigmac"), then inside the function id is "bigmac".
  var all = MENU.mains.concat(MENU.drinks);                    // Merge mains and drinks into one array, So now all contains all items in the menu (both mains and drinks).
  return all.find(function (x) { return x.id === id; });       // It goes through the array all one by one and looks for the first element that matches the condition.
}                                                              // This helper function looks up an item in the menu by its id


function addItem(id) {                                        // addItem: increase quantity for a given id
  if (!order[id]) order[id] = 0;                               // order[id] means “look up the quantity of this product in the order.” Otherwise 0
  order[id]++;                                                 // Increase the quantity by 1
  document.getElementById("qty_" + id).textContent = order[id]; // Update the visible quantity label in the menu, .textContent = order[id] means: show the current quantity there.
  showCart();                                                  // Re-render the cart so totals and lines update
}                                                              


function removeItem(id) {                                     // removeItem: decrease quantity for a given id
  if (order[id] && order[id] > 0) {                            // Only decrease if it already exists and is > 0
    order[id]--;                                               // Reduce the quantity by 1
  }                                                            // End conditional
  document.getElementById("qty_" + id).textContent = order[id] ? order[id] : 0; // Update menu label to new qty (or 0)
  showCart();                                                  
}                                                             


function checkout() {                                         // checkout: finalize the order
  var text = "Bestilling #" + orderNumber + "\n";              // Start building the receipt text with the order number
  var total = 0;                                               // Total price accumulator
  for (var id in order) {                                      // Loops over every product in the order object
    var qty = order[id];                                       // Gets the quantity of this product.
    if (qty > 0) {                                             // Only include positive quantities
      var item = findItem(id);                                 // Looks up the menu item object using its id., Example: findItem("bigmac") returns { id: "bigmac", name: "Big Mac", price: 55 }.
      total += item.price * qty;                               // Add to running total
      text += item.name + " × " + qty + " = " + kr(item.price * qty) + "\n"; // Append line to receipt text
    }                                                          // End if qty>0
  }                                                            // End for...in
  text += "TOTAL: " + kr(total);                               // Append the final total line
  alert(text);                                                 // Show the receipt in a simple alert popup (beginner-friendly)

  dailyRevenue += total;                                       // Add this order's total to the daily revenue
  orderNumber++;                                               // Increase the order number for the next customer
  saveState();                                                 // Persist updated orderNumber and dailyRevenue to localStorage

  order = {};                                                  // Clear the current order to start fresh
  showHeader();                                                // Update header (new number and revenue)
  showMenu();                                                  // Rebuild menu (all qty labels reset to 0)
  showCart();                                                  // Empty the cart UI
}                                                              // End checkout

function cancelOrder() {                                      // cancelOrder: discard current order without changing number
  order = {};                                                  // Clear the order object
  showMenu();                                                  // Reset all menu qty labels to 0
  showCart();                                                  // Empty the cart UI
  alert("Bestilling annulleret.");                             // Tell the user it was cancelled
}                                                              // End cancelOrder


showHeader();                                                  // Draw the header with current orderNumber and revenue
showMenu();                                                    // Build the menu interface
showCart();                                                    // Show an empty cart and 0 total
