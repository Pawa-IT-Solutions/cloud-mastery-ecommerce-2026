import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { BigQuery } from "@google-cloud/bigquery";

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const CARTS = {};
const SESSIONS = {};
const ORDERS = {};

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || "https://cybqa.pesapal.com/pesapalv3";
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_NOTIFICATION_ID = process.env.PESAPAL_NOTIFICATION_ID;
const PESAPAL_CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL;
const PESAPAL_BRANCH = process.env.PESAPAL_BRANCH || "Store Name - HQ";
const PESAPAL_DEMO_AMOUNT = process.env.PESAPAL_DEMO_AMOUNT || "1";
const PESAPAL_PLACEHOLDER_EMAIL = process.env.PESAPAL_PLACEHOLDER_EMAIL || "demo@sokoai.africa";

// ==========================================
// BIGQUERY CONFIG & DATA ACCESS LOGIC
// ==========================================
const bigquery = new BigQuery({ projectId: "pawait-data-hub" });

async function getProduct(productId) {
  const query = `
    SELECT name, unitCost, quantity
    FROM \`pawait-data-hub.cloud_mastery.products\`
    WHERE id = @productId

    UNION ALL

    SELECT
      CONCAT(brand, ' ', batteryType, ' Battery') AS name,
      priceKes AS unitCost,
      stock AS quantity
    FROM \`pawait-data-hub.cloud_mastery.table_parts_catalog\`
    WHERE id = @productId

    LIMIT 1
  `;
  const options = {
    query,
    params: { productId },
  };
  const [rows] = await bigquery.query(options);
  return rows.length ? rows[0] : null;
}

const PORT = process.env.PORT || 8080;

function getCartServiceUrl(req) {
  if (process.env.CART_SERVICE_URL) {
    return process.env.CART_SERVICE_URL;
  }

  // In Cloud Functions/Run, this resolves to the deployed function URL host.
  return `${req.protocol}://${req.get("host")}`;
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/);
  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || "SokoAI";
  return { firstName, lastName };
}

async function getPesapalAccessToken() {
  const authResponse = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });
  const authData = await authResponse.json();
  return authData.token;
}

function getCart(sessionId) {
  if (!CARTS[sessionId]) {
    CARTS[sessionId] = { items: [], subtotalKes: 0 };
  }
  return CARTS[sessionId];
}

function recalc(cart) {
  cart.subtotalKes = cart.items.reduce((sum, i) => sum + i.lineTotalKes, 0);
  return cart;
}

// ==========================================
// CART ENDPOINTS (OPENAPI YAML COMPLIANT)
// ==========================================

// POST /addToCart
app.post("/addToCart", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ message: "sessionId query parameter is required" });
  }

  const { productId, quantity = 1 } = req.body;
  
  try {
    // Fetch product details from BigQuery
    const product = await getProduct(productId);

    if (!product) {
      return res.status(404).json({ message: "productId not found in catalogue." });
    }

    const cart = getCart(sessionId);
    const existingItem = cart.items.find(item => item.productId === productId);
    const totalRequestedQuantity = (existingItem ? existingItem.quantity : 0) + quantity;

    // BigQuery query returns available stock under the 'quantity' field alias
    if (totalRequestedQuantity > product.quantity) {
      return res.status(409).json({ message: "Requested quantity exceeds available stock." });
    }

    if (existingItem) {
      existingItem.quantity = totalRequestedQuantity;
      existingItem.lineTotalKes = existingItem.quantity * existingItem.unitCost;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        unitCost: product.unitCost,
        quantity,
        lineTotalKes: quantity * product.unitCost
      });
    }

    recalc(cart);
    return res.status(200).json({ success: true, message: "Cart updated successfully.", cart });
  } catch (error) {
    return res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
});

// POST /modifyCart
app.post("/modifyCart", async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ message: "sessionId query parameter is required" });
  }

  const { productId, quantity } = req.body;
  const cart = getCart(sessionId);
  const itemIndex = cart.items.findIndex(item => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "productId not found in cart." });
  }

  try {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await getProduct(productId);
      if (product && quantity > product.quantity) {
        return res.status(409).json({ message: "Requested quantity exceeds available stock." });
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].lineTotalKes = quantity * cart.items[itemIndex].unitCost;
    }

    recalc(cart);
    return res.status(200).json({ success: true, message: "Cart updated successfully.", cart });
  } catch (error) {
    return res.status(500).json({ message: "Error modifying cart", error: error.message });
  }
});

// POST /askToModifyCart
app.post("/askToModifyCart", (req, res) => {
  return res.status(200).json({ message: "Confirmation acknowledged." });
});

// ==========================================
// CHECKOUT & SESSION ENDPOINTS
// ==========================================

app.post("/session", (req, res) => {
  const { sessionId, name, phone, location } = req.body;
  console.log("Received session payload:", req.body);
  SESSIONS[sessionId] = { name: name || "", phone: phone || "", location: location || "" };
  const responseData = { success: true, session: SESSIONS[sessionId] };
  console.log("Returning response:", responseData);
  res.status(200).json(responseData);
});

app.get("/session/:sessionId", (req, res) => {
  const session = SESSIONS[req.params.sessionId];
  if (!session) {
    return res.status(404).json({ message: `No session found for '${req.params.sessionId}'.` });
  }
  res.status(200).json({ success: true, session });
});

const EMPTY_CART_RECHECK_DELAY_MS = 450;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get("/cart/:sessionId", (req, res) => {
  const cart = getCart(req.params.sessionId);
  res.status(200).json({ success: true, cart });
});

app.get("/cartSummary/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;

  // First read
  let cart = getCart(sessionId);

  // Double-check guard: if empty, wait briefly and re-read once
  if (cart.items.length === 0) {
    await sleep(EMPTY_CART_RECHECK_DELAY_MS);
    cart = getCart(sessionId);

    if (cart.items.length === 0) {
      return res
        .status(200)
        .json({ summary: "Your cart is empty. Would you like to add anything?" });
    }
  }

  const summary = `Your cart has ${cart.items.length} items. Subtotal: KES ${cart.subtotalKes}. Would you like to checkout or keep shopping?`;
  return res.status(200).json({ summary });
});

app.post("/checkout", async (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  try {
    const cartServiceUrl = getCartServiceUrl(req);

    const cartResponse = await fetch(`${cartServiceUrl}/cart/${sessionId}`);
    const cartData = await cartResponse.json();

    if (!cartData?.cart?.items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const realSubtotal = cartData.cart.subtotalKes;

    const sessionResponse = await fetch(`${cartServiceUrl}/session/${sessionId}`);
    if (!sessionResponse.ok) {
      return res.status(404).json({
        message: "No customer info found for this session",
      });
    }
    const sessionData = await sessionResponse.json();
    const customer = sessionData.session;
    const { firstName, lastName } = splitName(customer.name);

    const accessToken = await getPesapalAccessToken();
    const merchantReference = `SOKOAI-${Date.now()}`;

    const orderRequest = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: merchantReference,
          amount: Number(PESAPAL_DEMO_AMOUNT),
          currency: "KES",
          description: `SokoAI order - cart total KES ${realSubtotal}`,
          callback_url: PESAPAL_CALLBACK_URL,
          redirect_mode: "PARENT_WINDOW",
          notification_id: PESAPAL_NOTIFICATION_ID,
          branch: PESAPAL_BRANCH,
          billing_address: {
            email_address: PESAPAL_PLACEHOLDER_EMAIL,
            phone_number: customer.phone || "",
            country_code: "KE",
            first_name: firstName,
            middle_name: "",
            last_name: lastName,
            line_1: customer.location || "",
            line_2: "",
            city: "",
            state: "",
            postal_code: "",
            zip_code: "",
          },
        }),
      },
    );

    if (!orderRequest.ok) {
        const errText = await orderRequest.text();
        console.error("Pesapal Error Response:", errText);
        return res.status(orderRequest.status).json({ message: "Pesapal rejected order", error: errText });
    }

    const orderData = await orderRequest.json();

    ORDERS[sessionId] = {
      merchantReference,
      orderTrackingId: orderData.order_tracking_id,
      location: customer.location || "",
      status: "pending",
    };

    return res.status(200).json({
      message: "Checkout initiated",
      merchantReference,
      cartSubtotalKes: realSubtotal,
      chargedAmountKes: Number(PESAPAL_DEMO_AMOUNT),
      redirectUrl: orderData.redirect_url,
      orderTrackingId: orderData.order_tracking_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Checkout error", error: error.message });
  }
});

app.post("/checkout/ipn", async (req, res) => {
  console.log("IPN received:", req.body);

  const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } =
    req.body;

  const sessionId = Object.keys(ORDERS).find(
    (key) => ORDERS[key].orderTrackingId === OrderTrackingId,
  );

  if (sessionId) {
    try {
      const accessToken = await getPesapalAccessToken();
      const statusResponse = await fetch(
        `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const statusData = await statusResponse.json();
      ORDERS[sessionId].status =
        statusData.payment_status_description || "unknown";
    } catch (error) {
      console.error("Failed to fetch transaction status:", error.message);
    }
  }

  res.status(200).send("IPN received successfully");
});

app.get("/checkout/status/:sessionId", (req, res) => {
  const order = ORDERS[req.params.sessionId];
  if (!order) {
    return res.status(404).json({ message: "No order found for this session" });
  }
  return res.status(200).json({
    status: order.status,
    location: order.location,
    merchantReference: order.merchantReference,
  });
});

app.get("/paymentSummary/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const order = ORDERS[sessionId];
  
  if (!order) {
    return res.status(404).json({ summary: "I couldn't find an active order record for this session." });
  }

  // Check if payment was successful based on Pesapal status
  const isPaid = order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'success';
  
  let summary = "";
  if (isPaid) {
    summary = `Payment confirmed! Your order ${order.merchantReference} is being prepared and will be delivered to ${order.location}. Thank you for shopping with SokoAI!`;
  } else {
    summary = `Your order status is currently '${order.status}'. Please check your payment status on your phone or contact support if the payment was deducted.`;
  }

  res.status(200).json({ summary });
});

export const cart_agent = app;

if (!process.env.FUNCTION_TARGET) {
  app.listen(PORT, () => {
    console.log(`SokoAI Cart & Checkout service running on port ${PORT}`);
  });
}

