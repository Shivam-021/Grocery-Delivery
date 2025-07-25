import React from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { categories } from "../assets/assets";
import ProductCart from "../components/ProductCart";

const ProductCategory = () => {
  const { products, searchQuery } = useAppContext();
  const { category } = useParams();
  const searchCategory = categories.find(
    (item) => item.path.toLocaleLowerCase() === category
  );

  const filteredProducts = products.filter(
    (product) => product.category.toLocaleLowerCase() === category
  );

  return (
    <div className="mt-16">
      {searchCategory && (
        <div className="flex flex-col items-end w-max ">
          <p className="text-2xl font-medium">
            {searchCategory.text.toUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
          {filteredProducts.map((product) => (
            <ProductCart key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[64vh]">
          <p className="text-2xl font-medium text-primary">
            No product foundin this category.{" "}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
