// // Managing cart | module type purpose for all files // //

'use strict';
import showAlert from './customAlert.js';

export default class Cart {
    constructor() {
        const cart = localStorage.getItem("cart");
        if (cart == null) {
            this.cart = [];
            // If the cart doesn't exist then return an empty array of object

        } else {
            this.cart = JSON.parse(cart);
            this.cart.sort((a, b) => (a._id < b._id) ? 1 : -1);
            // If the cart does exist then return it from string (as it was "save()" into localStorage) as an array
            // and sort products by id's
        }
    }

    // Saving the cart into localStorage as a string
    save() {
        localStorage.setItem("cart", JSON.stringify(this.cart));
    }

    // Adding product to cart from 'product.js'
    classCartAdd(productInCart) {
        if (!productInCart || typeof productInCart !== "object" || productInCart instanceof String || productInCart instanceof Number) {
            console.error('Invalid productInCart: must be an object');
            return false;
        }

        const { _id, color, quantity } = productInCart;
        if (!_id || !color || !quantity) {
            console.error('productInCart is missing required properties');
            return false;
        }

        const foundProductInCart = this.cart.find(p => p._id === _id && p.color === color && p.imageUrl === productInCart.imageUrl);

        if (foundProductInCart) {
            foundProductInCart.quantity = parseInt(foundProductInCart.quantity) + parseInt(productInCart.quantity);
        } else {
            this.cart.push(productInCart);
        }

        this.save();
        showAlert(`Produit ajouté au panier : ${productInCart.name} | ${color}`);
        return true;
    }

    // Remove product in cart | from 'cart.js'
    classCartRemove(productInCart) {
        if (!productInCart || typeof productInCart !== "object") {
            console.error('productInCart is not an object');
            return false
        }

        // Next line re-create the cart with all product except the selected one
        this.cart = this.cart.filter(p => p._id !== productInCart._id || p.color !== productInCart.color);

        this.save();
    }

    // Applying new quantityInput.value to existing product | from 'cart.js'
    classCartNewQuantity(productInCart) {
        let foundProductInCart = this.cart.find(p => p._id == productInCart._id && p.color == productInCart.color);

        if (isNaN(productInCart.quantity) && productInCart.newQuantity >= 1) {
            foundProductInCart.quantity = productInCart.newQuantity;
        }

        else {
            showAlert('Veuillez sélectionner une valeur entre 1 et 100.')
        }

        this.save();
    }
}

Cart.add;