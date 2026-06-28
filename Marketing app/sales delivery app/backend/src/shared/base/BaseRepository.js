export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}, options = {}) {
    return this.model.find(query, null, options);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findOne(query) {
    return this.model.findOne(query);
  }

  async create(data) {
    return this.model.create(data);
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async findOneAndUpdate(query, data, options = { new: true }) {
    return this.model.findOneAndUpdate(query, data, options);
  }

  async findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(query) {
    return this.model.deleteMany(query);
  }

  async countDocuments(query = {}) {
    return this.model.countDocuments(query);
  }
}
