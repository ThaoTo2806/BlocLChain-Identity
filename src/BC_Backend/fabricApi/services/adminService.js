    const fs = require("fs");
    const path = require("path");
    const { Wallets } = require("fabric-network");
    const FabricCAServices = require("fabric-ca-client"); // Đổi tên import
    require("dotenv").config();

    async function enrollAdmin() {
        try {
            const walletPath = path.join(__dirname, "../../wallet");
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            const adminExists = await wallet.get("admin");
            if (adminExists) {
                console.log("Admin identity already exists in the wallet");
                return;
            }

            // Thêm TLS Options
            const ca = new FabricCAServices(process.env.fabric_url, {
                trustedRoots: [],
                verify: false,
            });

            const enrollment = await ca.enroll({
                enrollmentID: process.env.ADMIN_USER,
                enrollmentSecret: process.env.ADMIN_PASS,
            });

            const identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: process.env.MSP_ID,
                type: "X.509",
            };

            await wallet.put("admin", identity);
            console.log("✅ Enrolled Admin Successfully!");
        } catch (error) {
            console.error("❌ Error enrolling admin identity:", error);
        }
    }

    module.exports = { enrollAdmin };
