import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import { checkPermission } from "../utils/index.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";

const fakeStripeAPI = async ({ amoumt, currency }) => {
  const client_secret = "randomSecretValue";
  return { client_secret, amoumt };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError(
      "No cart items provided, Please provide a cart items.."
    );
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("No tax or shipping fee provided");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product found for: ${item.product}`);
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderSchema = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderSchema];
    // as we add items in order, we need to calculate the subtotal also
    subtotal += item.amount * price;
  }

  // calculate total amount
  const totalAmount = subtotal + tax + shippingFee;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: totalAmount,
    currency: "USD",
  });

  // now create order

  const order = await Order.create({
    orderItems,
    subtotal,
    tax,
    shippingFee,
    totalAmount,
    clienSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getCurrentUserOrder = async (req, res) => {
  // res.send("current user  Order");
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findById({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order found for: ${orderId}`);
  }

  checkPermission(order.user, req.user);

  res.status(StatusCodes.OK).json({ order });
};

const updateOrder = async (req, res) => {
  // res.send("Update Order");
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new NotFoundError(`No order found for: ${orderId}`);
  }

  checkPermission(order.user, req.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res
    .status(StatusCodes.OK)
    .json({ order, msg: "Order Successfully Updated...." });
};

export {
  getAllOrders,
  createOrder,
  getCurrentUserOrder,
  getSingleOrder,
  updateOrder,
};
