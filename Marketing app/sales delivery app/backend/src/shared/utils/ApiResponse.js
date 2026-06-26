class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  send(res) {
    // If data is null or undefined, do not spread it
    const responsePayload = {
      success: this.success,
      message: this.message,
      ...(this.data && typeof this.data === 'object' ? this.data : { data: this.data }),
    };
    return res.status(this.statusCode).json(responsePayload);
  }
}

export default ApiResponse;
