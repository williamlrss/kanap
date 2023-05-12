// // Managing cart | module type purpose for all files // //

'use strict';

// Importing custom alert module to provide a better user experience
import showAlert from './customAlert.js';

// Main function for cart management purpose
export default class Cart {
    constructor() {
        // Retrieve the cart from localStorage or create a new empty cart if it doesn't exist
        const cart = localStorage.getItem("cart");
        if (cart == null) {
            this.cart = [];

        } else {
            // Parse the cart from JSON and sort it by product ID to display similar products together
            this.cart = JSON.parse(cart);
            this.cart.sort((a, b) => (a._id < b._id) ? 1 : -1);
        }
    }

    // Save the current cart state to localStorage
    save() {
        localStorage.setItem("cart", JSON.stringify(this.cart));
    }

    // Adding product to cart from 'product.js'
    classCartAdd(productInCart) {
        // Validate that the product being added is a valid object with required properties
        if (!productInCart || typeof productInCart !== "object" || productInCart instanceof String || productInCart instanceof Number) {
            const errorMessage = `Invalid productInCart: must be an object with properties _id (string), color (string), name (string) and quantity (number). Received: ${productInCart}`;
            console.error(errorMessage);
            showAlert(errorMessage);
            return false;
        }

        // Validate the required properties of the product being added
        const { _id, color, quantity, name } = productInCart;
        if (!_id || typeof _id !== "string" || _id.trim().length === 0) {
            console.error('Invalid productInCart: _id must be a non-empty string');
            return false;
        }
        if (!color || typeof color !== "string" || color.trim().length === 0) {
            console.error('Invalid productInCart: color must be a non-empty string');
            return false;
        }
        if (!quantity || typeof quantity !== "number" || isNaN(quantity)) {
            console.error('Invalid productInCart: quantity must be a number');
            return false;
        }
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            console.error('Invalid productInCart: name must be a non-empty string');
            return false;
        }

        // Check if the product being added is already in the cart
        const foundProductInCart = this.cart.find(p => p._id === _id && p.color === color);

        // If the product is already in the cart, add the new quantity to the existing quantity
        if (foundProductInCart) {
            foundProductInCart.quantity = parseInt(foundProductInCart.quantity) + parseInt(productInCart.quantity);
        }
        // If the product is not already in the cart, add a new instance of it to the cart
        else {
            this.cart.push(productInCart);
        }

        // Save the updated cart state to localStorage and show a success message to the user
        this.save();
        showAlert(`Produit ajouté au panier : ${name} | ${color} | quantité : ${quantity}`);
        return true;
    }

    // Static method allows us to create an instance of the cart outside product.js as we don't manipulate the cart through product.html except to add the product
    static add(productInCart) {
        // Create a new instance of the Cart class
        const cart = new Cart();
        // Call the classCartAdd method on the new cart instance to add the product
        cart.classCartAdd(productInCart)
    }

    // Remove product in cart | from 'cart.js'
    classCartRemove(productInCart) {
        // Validate that the product being removed is a valid object with required properties
        if (!productInCart || typeof productInCart !== "object" || productInCart instanceof String || productInCart instanceof Number) {
            console.error(`Invalid productInCart: must be an object with properties _id (string), color (string), and quantity (number). Received: ${productInCart}`);
            return false;
        }

        // The deletion is done by creating an identical cart, filtered by omitting this product.
        this.cart = this.cart.filter(p => p._id !== productInCart._id || p.color !== productInCart.color);

        // Save the updated cart state to localStorage and show a success message to the user
        this.save();
        showAlert(`Produit supprimé du panier : ${productInCart.name} | ${productInCart.color}`);
    }

    // Update the quantity of an existing product in the cart | from 'cart.js'
    classCartNewQuantity(productInCart) {
        // Validate that the product being updated is a valid object with required properties
        if (!productInCart || typeof productInCart !== "object" || productInCart instanceof String || productInCart instanceof Number) {
            console.error(`Invalid productInCart: must be an object with properties _id (string), color (string), and quantity (number). Received: ${productInCart}`);
            return false;
        }

        // Find the product to update in the cart by matching its _id and color properties
        let foundProductInCart = this.cart.find(p => p._id == productInCart._id && p.color == productInCart.color);

        // If the new quantity is a valid number between 1 and 100, update the quantity of the selected product
        if (isNaN(productInCart.quantity) && productInCart.newQuantity >= 1) {
            foundProductInCart.quantity = productInCart.newQuantity;
        }

        // If the new quantity is not a valid number between 1 and 100, show an error message to the user
        else {
            showAlert('Veuillez sélectionner une valeur entre 1 et 100.')
        }

        // Save the updated cart state to localStorage
        this.save();
    }
}