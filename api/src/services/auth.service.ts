import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model.js';
import { signToken, verifyToken, hashToken, generateRefreshToken } from '../utils/jwt.util.js';
import { AppError } from '../middlewares/error.middleware.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  /**
   * Register: Create user with hashed password, return tokens
   */
  async register(input: RegisterInput) {
    // Check if user exists
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash
    });

    // Generate tokens
    const accessToken = signToken({ sub: user._id, email: user.email });
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token
    user.refreshTokens.push(hashToken(refreshToken));
    await user.save();

    return {
      user: { id: user._id, email: user.email },
      accessToken,
      refreshToken
    };
  }

  /**
   * Login: Validate credentials, return tokens
   */
  async login(input: LoginInput) {
    // Find user
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = signToken({ sub: user._id, email: user.email });
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store hashed refresh token
    user.refreshTokens.push(hashToken(refreshToken));
    await user.save();

    return {
      user: { id: user._id, email: user.email },
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh: Exchange refresh token for new access token
   */
  async refresh(refreshToken: string) {
    // Verify token
    const decoded = verifyToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Check if refresh token is valid (hashed stored)
    const tokenHash = hashToken(refreshToken);
    if (!user.refreshTokens.includes(tokenHash)) {
      throw new AppError('Refresh token revoked', 401);
    }

    // Generate new access token
    const accessToken = signToken({ sub: user._id, email: user.email });

    return { accessToken };
  }

  /**
   * Logout: Revoke refresh token
   */
  async logout(userId: string, refreshToken?: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (refreshToken) {
      // Remove specific refresh token
      const tokenHash = hashToken(refreshToken);
      user.refreshTokens = user.refreshTokens.filter(t => t !== tokenHash);
    } else {
      // Revoke all refresh tokens
      user.refreshTokens = [];
    }

    await user.save();
    return { message: 'Logged out successfully' };
  }
}

export const authService = new AuthService();
