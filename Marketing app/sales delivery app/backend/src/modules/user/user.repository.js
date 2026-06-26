import BaseRepository from '../../shared/base/BaseRepository.js';
import userModel from './user.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(userModel);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async findByIdWithPassword(id) {
    return this.model.findById(id);
  }

  async findByIdExcludePassword(id) {
    return this.model.findById(id).select('-password');
  }

  // Used for Refresh Token rotation (push, pull, clear, and check matching refresh tokens)
  async addRefreshToken(id, token) {
    return this.model.findByIdAndUpdate(
      id,
      { $push: { refreshTokens: token } },
      { new: true }
    );
  }

  async removeRefreshToken(id, token) {
    return this.model.findByIdAndUpdate(
      id,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  async clearAllRefreshTokens(id) {
    return this.model.findByIdAndUpdate(
      id,
      { $set: { refreshTokens: [] } },
      { new: true }
    );
  }
}

export default new UserRepository();
