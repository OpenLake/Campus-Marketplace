class ApiResponse {
  constructor(statusCode = 200, data = null, message = "Success", metadata = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }
}

export { ApiResponse };
