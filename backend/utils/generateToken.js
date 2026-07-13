import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'super_secret_jwt_encryption_key_for_production_1298471',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Set JWT as an HTTP-Only Cookie
  res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: (Number(process.env.COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
});
  
  return token;
};

export default generateToken;
