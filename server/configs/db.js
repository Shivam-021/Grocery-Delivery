import mongoose from "mongoose";

// Set event listener ONCE
mongoose.connection.on("connected", () => {
  console.log("Database connected");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;

 
