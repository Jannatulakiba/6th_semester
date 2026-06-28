import BaseRepository from '../../shared/base/BaseRepository.js';
import orderModel from './order.model.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(orderModel);
  }

  async findWithPagination(query, skip, limit) {
    if (limit === 0) {
      return this.model.find(query).sort({ date: -1 });
    }
    return this.model.find(query).skip(skip).limit(limit).sort({ date: -1 });
  }
}

export default new OrderRepository();
