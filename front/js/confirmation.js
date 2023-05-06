// confirmation.html // Summary: show orderId to user, clear data

'use strict'

// Main function
const orderId = () =>  {
    const orderId = document.getElementById('orderId');
    orderId.textContent = localStorage.getItem("orderId");
    localStorage.clear();
}

orderId();