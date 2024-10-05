// utils/calcPrices.js
export const calcPrices = (orderItems) => {
   const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
   };

   // Calculate items price
   const itemsPrice = addDecimals(orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0));

   // Calculate tax price (9% tax for example)
   const taxPrice = addDecimals(itemsPrice * 0.09);

   // Calculate shipping price (free shipping for orders over $100)
   const shippingPrice = itemsPrice > 100 ? '0.00' : '10.00';

   // Calculate total price
   const totalPrice = addDecimals(Number(itemsPrice) + Number(taxPrice) + Number(shippingPrice));

   return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
   };
};
