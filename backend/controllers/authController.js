// controllers/authController.js

export const verify = (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // 🔹 यहां तुम्हारी token verification logic आएगी
    // Example:
    if (token === "123456") {
      return res.json({ success: true, message: "Token verified" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
