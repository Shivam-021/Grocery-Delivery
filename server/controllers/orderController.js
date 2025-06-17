import Order from "../models/order.js";
import Product from "../models/product.js";
import Stripe from 'stripe'
import User from "../models/user.js"

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Calculate amount using items
    const itemAmounts = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return product.offerPrice * item.quantity;
      })
    );
    let amount = itemAmounts.reduce((acc, curr) => acc + curr, 0);

    // Add tax 2%
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Orders by user Id : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get All orders for Seller/admin : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//place order strip : '/api/order/stripe'

export const placeOrderStripe = async (req, res) => {
  try {
     const userId = req.userId;
    const {  items, address } = req.body;
    const {origin} = req.headers;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let productData = []

    // Calculate amount using items
    const itemAmounts = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        productData.push({
          name:product.name,
          price:product.offerPrice,
          quantity: item.quantity,
        })
        return product.offerPrice * item.quantity;
      })
    );
    let amount = itemAmounts.reduce((acc, curr) => acc + curr, 0);

    // Add tax 2%
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Strip gateway initlized

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

    // create line item for stripe

    const line_items = productData.map((item)=>{
      return{
        price_data:{
          currency: "AUD",
          product_data: { name: item.name },
          unit_amount: Math.round((item.price + item.price * 0.02) * 100),
        },
       quantity: item.quantity
      }
    })

    // Create session

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
       mode: "payment",
       success_url: `${origin}/loader?next=my-orders`,
       cancel_url: `${origin}/my-orders`,
       metadata:{
        orderId : order._id.toString(),
        userId,
       }
    })

  

    return res.status(201).json({ success: true, url: session.url});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// stripe web hooks to verify the payments : /stripe

export const stripeWebhooks = async (req, res)=>{

  // stripe getway initlized

   const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

   const sig = req.headers["stripe-signature"];

   let event;

   try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
   } catch (error) {
    res.status(400).send(`webhook error${error.message}`)
   }

  // handel the event 
  switch (event.type) {
    case  "payment_intent.succeeded":{
      const payment_intent = event.data.object;
      const payment_intentId = payment_intent.id;

      // getting session meta data
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:payment_intentId
      });
      const {orderId, userId} = session.data[0].metadata;

      // Mark payment as paid 

      await Order.findByIdAndUpdate(orderId, {isPaid:true})

      await User.findByIdAndUpdate(userId,{cartitems:{}})
      break;
    }
    case  "payment_intent.payment_failed":{
      const payment_intent = event.data.object;
      const payment_intentId = payment_intent.id;

      // getting session meta data
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:payment_intentId
      });
      const {orderId} = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId)
      break;
    }
  
    default:
      console.error(`unhandled event type ${event.type}`)
      break;
  }
  res.json({received:true})
}