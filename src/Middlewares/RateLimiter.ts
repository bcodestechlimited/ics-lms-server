import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
});

const apiLimiterDouble = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 60 * 2,
	standardHeaders: true,
	legacyHeaders: false,
});

const apiLimiterFive = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 60 * 5,
	standardHeaders: true,
	legacyHeaders: false,
});

export { apiLimiter, apiLimiterDouble, apiLimiterFive };
