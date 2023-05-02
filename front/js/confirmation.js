// // Processing the form within confirmation.html // //
'use strict'
const orderId = () =>  {
    const orderId = document.getElementById('orderId');
    orderId.textContent = localStorage.getItem("orderId");
    localStorage.clear();
}

orderId();