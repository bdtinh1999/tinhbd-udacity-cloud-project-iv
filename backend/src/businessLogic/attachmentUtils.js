const s3BucketName = process.env.ATTACHMENT_S3_BUCKET;

class AttachmentUtils {
  constructor(bucketName = s3BucketName) {
    this.bucketName = bucketName;
  }

  getAttachmentUrl(todoId) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
  }
}

module.exports = { AttachmentUtils };
