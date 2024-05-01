import mongoose from "mongoose";
import variables from "./variables.js";
const connect = async () => {
    try {
        await mongoose.connect(variables.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        return {
            status: '✅',
            message: 'Connected to database successfully.'
        }
    } catch (e) {
        console.log(e);
        return {
            status: '❌',
            message: 'Failed to connect to database.'
        }
    }
}
export default connect;