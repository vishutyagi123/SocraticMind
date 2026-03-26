import { OAuth2Client } from 'google-auth-library';
import { OAuthAccount } from '../models/oauthAccount.model.js';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function googleRedirect(req, res) {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent',
  });
  res.redirect(url);
}

export async function googleCallback(req, res, next) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub, email, name, picture } = ticket.getPayload();
    let oauthAccount = await OAuthAccount.findByProvider('google', sub);
    let userId;

    if (oauthAccount) {
      userId = oauthAccount.user_id;
    } else {
      // Internal call to Auth Service
      const userRes = await fetch(`${process.env.AUTH_SERVICE_URL}/internal/users/find-or-create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Internal-Key': process.env.INTERNAL_API_KEY 
        },
        body: JSON.stringify({ email, name, avatarUrl: picture }),
      });

      if (!userRes.ok) {
        throw new Error(`Auth Service error: ${userRes.statusText}`);
      }

      const user = await userRes.json();
      userId = user.id;

      await OAuthAccount.create({
        userId,
        provider: 'google',
        providerId: sub,
        accessToken: tokens.access_token, // Ideally encrypted
        refreshToken: tokens.refresh_token, // Ideally encrypted
        email,
        profileData: { name, picture },
      });
    }

    // Call Auth Service to issue JWT tokens
    const tokenRes = await fetch(`${process.env.AUTH_SERVICE_URL}/internal/tokens/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY 
      },
      body: JSON.stringify({ userId, deviceInfo: req.headers['user-agent'] }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Auth Service error: ${tokenRes.statusText}`);
    }

    const { accessToken, refreshToken } = await tokenRes.json();

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, { 
      httpOnly: true, secure: isProduction, sameSite: isProduction ? 'strict' : 'lax', maxAge: 15 * 60 * 1000, path: '/'
    });
    res.cookie('refresh_token', refreshToken, { 
      httpOnly: true, secure: isProduction, sameSite: isProduction ? 'strict' : 'lax', path: '/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    next(err);
  }
}
