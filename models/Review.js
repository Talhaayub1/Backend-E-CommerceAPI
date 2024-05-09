import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);

  try {
    await this.model("Product").findOneAndUpdate(
      {
        _id: productId,
      },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numofReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
  console.log(result);
};

ReviewSchema.pre("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
  // console.log();
});
ReviewSchema.pre("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
  // console.log();
});

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
