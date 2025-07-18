import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  limit: 100, // Maximum number of requests
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: { message: "Too many requests, please try again later." },
});

const emailRateLimiter = rateLimit({
  limit: 5, // Maximum number of email requests
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: { message: "Too many email requests, please try again later." },
});

const shorternRateLimiter = rateLimit({
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 60 * 60 * 1000, // 15 minutes
  message: {
    message: "Too many shortener request, please try after some hours",
  },
});

export { rateLimiter, emailRateLimiter, shorternRateLimiter };
