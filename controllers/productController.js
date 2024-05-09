import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path"; // Add this line

import Product from "../models/Product.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { StatusCodes } from "http-status-codes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find(req.body);
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findById({ _id: productId }).populate(
    "reviews"
  );
  if (!product) {
    throw new NotFoundError(`Product not found with this id ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { runsValidators: true, new: true }
  );
  if (!product) {
    throw new NotFoundError(`Product not found with this id ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) {
      throw new NotFoundError(`Product not found with this id ${productId}`);
    }
    await product.deleteOne();
    res
      .status(StatusCodes.OK)
      .json({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("error while deleting product", error.message);
  }
};
const uploadImage = async (req, res) => {
  console.log(req.files);
  try {
    if (!req.files) {
      throw new BadRequestError("No files were uploaded");
    }
    const productImage = await req.files.image;
    if (!productImage.mimetype.startsWith("image")) {
      throw new BadRequestError("Please upload the image ");
    }
    const imageSize = 50 * 1024 * 1024;
    if (productImage.size > imageSize) {
      throw new BadRequestError(
        `Please upload an image smaller than ${imageSize} MB`
      );
    }

    const imagePath = path.join(
      __dirname,
      "../public/uploads/" + `${productImage.name}`
    );
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({
      message: "Image uploaded successfully",
      image: `/uploads/${productImage.name}`,
    });
  } catch (error) {
    console.error(`Error uploading image: ${error.message}`);
  }
};

export {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
