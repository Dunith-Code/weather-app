import { auth } from 'express-oauth2-jwt-bearer';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Auth0 JWT validation middleware
 * Verifies the 'audience' and 'issuer' claims match the expected values
 * Used to protect API routes that should only be accessible to authenticated users
 */
export const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});