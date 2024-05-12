import mongoose from "mongoose";
import variables from "./variables.js";

const connectDatabase = async () => {
    try {
        await mongoose.connect(variables.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        });
        console.log("Connect to database successfully");
    } catch (error) {
        console.log("Connect to database failed");
    }
}

export default connectDatabase;