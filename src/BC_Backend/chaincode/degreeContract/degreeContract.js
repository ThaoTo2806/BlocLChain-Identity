"use strict";

const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class DegreeVerification extends Contract {
    constructor() {
        super("DegreeVerification");
    }

    // Helper function to generate degree hash
    _generateDegreeHash(degreeData) {
        const dataToHash = JSON.stringify(sortKeysRecursive(degreeData));
        return crypto.createHash("sha256").update(dataToHash).digest("hex");
    }

    // Helper function to generate HMAC
    _generateHMAC(data, secret) {
        return crypto.createHmac("sha256", secret).update(data).digest("hex");
    }

    // Helper function to create Merkle proof
    _createMerkleProof(approvals) {
        if (!approvals || approvals.length === 0) return null;

        const leaves = approvals.map((approval) =>
            crypto
                .createHash("sha256")
                .update(JSON.stringify(approval))
                .digest("hex")
        );

        const merkleRoot = this._calculateMerkleRoot(leaves);
        return {
            root: merkleRoot,
            leaves: leaves,
        };
    }

    // Helper function to calculate Merkle root
    _calculateMerkleRoot(leaves) {
        if (leaves.length === 1) return leaves[0];

        const newLeaves = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = leaves[i + 1] || left;
            const combined = crypto
                .createHash("sha256")
                .update(left + right)
                .digest("hex");
            newLeaves.push(combined);
        }

        return this._calculateMerkleRoot(newLeaves);
    }

    async InitLedger(ctx) {
        const systemParams = {
            APPROVAL_TIMEOUT: 7 * 24 * 60 * 60 * 1000,
            SECRET_KEY:
                process.env.SECRET_KEY ||
                "f4e218cfe73f4a23425c198f611a1ab09182c7b6e8f0de4879f6b5b44d4cd250e",
        };
        await ctx.stub.putState(
            "systemParams",
            Buffer.from(stringify(sortKeysRecursive(systemParams)))
        );
    }

    async CreateDegree(
        ctx,
        id,
        userId,
        major,
        degreeName,
        degreeType,
        graduationYear,
        gpa,
        approver,
        approverRole,
        frontImageCID,
        backImageCID,
        issuedAt
    ) {
        if (approverRole !== "manager") {
            throw new Error("Unauthorized: Only manager can create degree");
        }

        if (!this._validateDegreeData(degreeType, graduationYear, gpa)) {
            throw new Error("Invalid degree data");
        }

        const approvalRecord = {
            approver: approver,
            timestamp: issuedAt,
            level: 1,
            signature: this._generateHMAC(
                JSON.stringify({
                    id,
                    approver,
                    timestamp: issuedAt,
                }),
                (await ctx.stub.getState("systemParams")).toString()
            ),
        };

        const degree = {
            ID: id,
            UserID: userId,
            Major: major,
            DegreeName: degreeName,
            DegreeType: Number(degreeType),
            GraduationYear: Number(graduationYear),
            GPA: Number(gpa),
            Status: "pending_level_2",
            IssuedAt: issuedAt,
            ApprovedByLevel1: approver,
            ApprovedAtLevel1: issuedAt,
            ApprovedByLevel2: null,
            ApprovedAtLevel2: null,
            FrontImageCID: frontImageCID,
            BackImageCID: backImageCID,
            LastUpdated: issuedAt,
            DegreeHash: null,
            ApprovalChain: [approvalRecord],
            MerkleProof: null,
        };

        degree.DegreeHash = this._generateDegreeHash(degree);
        degree.MerkleProof = this._createMerkleProof(degree.ApprovalChain);

        await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive(degree)))
        );
        return JSON.stringify(degree);
    }

    async ApproveLevel2(ctx, id, approver, approverRole, now) {
        if (approverRole !== "verifier") {
            throw new Error("Unauthorized: Only verifier can approve level 2");
        }

        const degreeString = await this.ReadDegree(ctx, id);
        const degree = JSON.parse(degreeString);

        if (degree.Status !== "pending_level_2") {
            throw new Error("Degree không ở trạng thái hợp lệ để duyệt mức 2");
        }

        const createdTime = new Date(degree.IssuedAt).getTime();
        const currentTime = now;
        const systemParams = JSON.parse(
            await ctx.stub.getState("systemParams")
        );
        if (currentTime - createdTime > systemParams.APPROVAL_TIMEOUT) {
            throw new Error("Đã quá thời gian chờ duyệt");
        }

        const approvalRecord = {
            approver: approver,
            timestamp: now,
            level: 2,
            signature: this._generateHMAC(
                JSON.stringify({
                    id,
                    approver,
                    timestamp: now,
                }),
                (await ctx.stub.getState("systemParams")).toString()
            ),
        };

        degree.Status = "valid";
        degree.ApprovedByLevel2 = approver;
        degree.ApprovedAtLevel2 = now;
        degree.ApprovalChain.push(approvalRecord);
        degree.MerkleProof = this._createMerkleProof(degree.ApprovalChain);
        degree.LastUpdated = now;

        // Regenerate final degree hash
        degree.DegreeHash = this._generateDegreeHash(degree);

        await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive(degree)))
        );
        return JSON.stringify(degree);
    }

    async ReadDegree(ctx, id) {
        const degreeJSON = await ctx.stub.getState(id);
        if (!degreeJSON || degreeJSON.length === 0) {
            throw new Error(`Degree ${id} does not exist`);
        }
        return degreeJSON.toString();
    }

    async UpdateDegreeStatus(ctx, id, status) {
        const degreeString = await this.ReadDegree(ctx, id);
        const degree = JSON.parse(degreeString);
        degree.Status = status;

        await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive(degree)))
        );
    }

    async DegreeExists(ctx, id) {
        const degreeJSON = await ctx.stub.getState(id);
        return degreeJSON && degreeJSON.length > 0;
    }

    async GetAllDegrees(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange("", "");
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(
                result.value.value.toString()
            ).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
                // Chỉ trả về các bằng cấp mà người dùng có quyền xem
                if (await this._checkViewPermission(ctx, record)) {
                    allResults.push(record);
                }
            } catch (err) {
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // New function to verify degree authenticity
    async VerifyDegree(ctx, id) {
        const degreeString = await this.ReadDegree(ctx, id);
        const degree = JSON.parse(degreeString);

        if (degree.Status !== "valid") {
            throw new Error("Degree chưa được duyệt hoàn toàn");
        }

        // Verify degree hash
        const currentHash = this._generateDegreeHash(degree);
        if (currentHash !== degree.DegreeHash) {
            throw new Error(
                "Degree hash không khớp - bằng cấp có thể đã bị thay đổi"
            );
        }

        // Verify Merkle proof
        if (!degree.MerkleProof) {
            throw new Error("Không tìm thấy bằng chứng Merkle");
        }

        const calculatedRoot = this._calculateMerkleRoot(
            degree.MerkleProof.leaves
        );
        if (calculatedRoot !== degree.MerkleProof.root) {
            throw new Error("Bằng chứng Merkle không hợp lệ");
        }

        return {
            isValid: true,
            degree: degree,
            verificationTime: new Date().toISOString(),
        };
    }

    // Private helper functions
    async _checkPermission(ctx, clientIdentity, action) {
        const attributes = clientIdentity.getAttributeValue("role");
        const permissions = {
            manager: ["create", "view"],
            verifier: ["approve", "view"],
            student: ["view"],
        };

        return permissions[attributes]?.includes(action) || false;
    }

    async _checkViewPermission(ctx, degree) {
        const clientIdentity = ctx.clientIdentity;
        const attributes = clientIdentity.getAttributeValue("role");

        // Manager và verifier có thể xem tất cả
        if (["manager", "verifier"].includes(attributes)) return true;

        // Student chỉ có thể xem bằng của mình
        if (attributes === "student") {
            return degree.UserID === clientIdentity.getAttributeValue("userId");
        }

        return false;
    }

    _validateDegreeData(degreeType, graduationYear, gpa) {
        const currentYear = new Date().getFullYear();
        return (
            degreeType >= 0 &&
            degreeType <= 3 &&
            graduationYear > 1900 &&
            graduationYear <= currentYear &&
            gpa >= 0 &&
            gpa <= 4.0
        );
    }

    // New function to batch create degrees
    async CreateDegreesBatch(ctx, degreesData) {
        try {
            // Parse the batch data
            const degrees = JSON.parse(degreesData);

            if (!Array.isArray(degrees)) {
                throw new Error(
                    "Dữ liệu đầu vào phải là một mảng các bằng cấp"
                );
            }

            const results = [];

            // Process each degree in the batch
            for (const degreeData of degrees) {
                try {
                    const {
                        id,
                        userId,
                        major,
                        degreeName,
                        degreeType,
                        graduationYear,
                        gpa,
                        approver,
                        approverRole,
                        frontImageCID,
                        backImageCID,
                        issuedAt,
                    } = degreeData;

                    // Check if degree already exists to avoid duplicates
                    const exists = await this.DegreeExists(ctx, id);
                    if (exists) {
                        results.push({
                            id,
                            success: false,
                            error: "Bằng cấp đã tồn tại",
                        });
                        continue;
                    }

                    // Validate approver role
                    if (approverRole !== "manager") {
                        results.push({
                            id,
                            success: false,
                            error: "Unauthorized: Only manager can create degree",
                        });
                        continue;
                    }

                    // Validate degree data
                    if (
                        !this._validateDegreeData(
                            degreeType,
                            graduationYear,
                            gpa
                        )
                    ) {
                        results.push({
                            id,
                            success: false,
                            error: "Invalid degree data",
                        });
                        continue;
                    }

                    // Create approval record
                    const approvalRecord = {
                        approver: approver,
                        timestamp: issuedAt,
                        level: 1,
                        signature: this._generateHMAC(
                            JSON.stringify({
                                id,
                                approver,
                                timestamp: issuedAt,
                            }),
                            (await ctx.stub.getState("systemParams")).toString()
                        ),
                    };

                    // Create degree object
                    const degree = {
                        ID: id,
                        UserID: userId,
                        Major: major,
                        DegreeName: degreeName,
                        DegreeType: Number(degreeType),
                        GraduationYear: Number(graduationYear),
                        GPA: Number(gpa),
                        Status: "pending_level_2",
                        IssuedAt: issuedAt,
                        ApprovedByLevel1: approver,
                        ApprovedAtLevel1: issuedAt,
                        ApprovedByLevel2: null,
                        ApprovedAtLevel2: null,
                        FrontImageCID: frontImageCID,
                        BackImageCID: backImageCID,
                        LastUpdated: issuedAt,
                        DegreeHash: null,
                        ApprovalChain: [approvalRecord],
                        MerkleProof: null,
                        BatchProcessed: true,
                    };

                    // Generate degree hash and merkle proof
                    degree.DegreeHash = this._generateDegreeHash(degree);
                    degree.MerkleProof = this._createMerkleProof(
                        degree.ApprovalChain
                    );

                    // Store in ledger
                    await ctx.stub.putState(
                        id,
                        Buffer.from(stringify(sortKeysRecursive(degree)))
                    );

                    results.push({
                        id,
                        success: true,
                    });
                } catch (error) {
                    results.push({
                        id: degreeData.id || "unknown",
                        success: false,
                        error: error.message,
                    });
                }
            }

            return JSON.stringify({
                successful: results.filter((r) => r.success).length,
                failed: results.filter((r) => !r.success).length,
                results: results,
            });
        } catch (error) {
            throw new Error(`Batch processing failed: ${error.message}`);
        }
    }
}

module.exports = DegreeVerification;
