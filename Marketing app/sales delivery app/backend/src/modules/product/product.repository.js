import BaseRepository from '../../shared/base/BaseRepository.js';
import productModel from './product.model.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(productModel);
  }

  async findWithPagination(query, skip, limit, sortObj) {
    if (limit === 0) {
      return this.model.find(query).sort(sortObj);
    }
    return this.model.find(query).skip(skip).limit(limit).sort(sortObj);
  }

  async count(query) {
    return this.model.countDocuments(query);
  }

  async findByIdWithCommentsAndRatings(id) {
    return this.model.findById(id)
      .populate('comments.user', 'name email profilePhoto')
      .populate('ratings.user', 'name');
  }
}

export default new ProductRepository();
