const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware=require("../utils/auth");

router.post('/create-checkout-session', async (req, res) => {
    const { id, title, price } = req.body;
  
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
            },
            unit_amount: price, 
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/success?courseId=${id}`,
      cancel_url: `http://localhost:5173/cancel`,
    });
  
    res.json({ id: session.id });
  });


router.post('/confirm', authMiddleware, async (req, res) => {
const userId = req.user.id;
const { courseId } = req.body;

await User.findByIdAndUpdate(userId, {
    $addToSet: { purchasedCourses: courseId },
});

res.json({ success: true });
});

router.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });   
  

module.exports = router;
