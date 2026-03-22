const mongoose = require('mongoose');
const uri = "mongodb+srv://swaroopjadhav6161_db_user:ZstPRVOGxT013GNW@cluster0.egcuyzt.mongodb.net/civicfix?retryWrites=true&w=majority";
mongoose.connect(uri).then(() => {
    console.log("MongoDB Connected successfully");
    process.exit(0);
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
});
