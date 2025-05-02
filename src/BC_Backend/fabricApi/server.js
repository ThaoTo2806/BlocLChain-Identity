const app = require("./app");
const PORT = process.env.PORT || 3001;
require("dotenv").config();
const { enrollAdmin } = require("./services/adminService");

enrollAdmin();
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
