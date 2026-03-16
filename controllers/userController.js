const User = require("../models/user.js");

// get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200);
        res.json(users);
    } catch (err) {
        res.status(500);
        res.json({ error: "failed to get users" });
    }
};

// get a single user by id
const getSingleUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200);
        res.json(user);
    } catch (error) {
        res.status(404);
        res.json({ error: error.message });
    }
};

// update a user
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { email, isAdmin } = req.body;

    try {
        const updateFields = {};

        if (email !== undefined) {
            updateFields.email = email;
        }

        if (isAdmin !== undefined) {
            updateFields.isAdmin = isAdmin;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200);
        res.json({
            message: "User updated successfully!",
            data: updatedUser,
        });
    } catch (error) {
        res.status(400);
        res.json({ error: error.message });
    }
};

// delete a user
const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // prevent admins from deleting themselves
        if (req.user.id === userId) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        // prevent deleting the last admin
        if (userToDelete.isAdmin) {
            const adminCount = await User.countDocuments({ isAdmin: true });

            if (adminCount <= 1) {
                return res.status(400).json({ message: "Cannot delete the last admin" });
            }
        }

        const deletedUser = await User.findByIdAndDelete(userId).select("-password");

        res.status(200);
        res.json({
            message: "Successfully deleted user",
            data: deletedUser,
        });
    } catch (error) {
        res.status(500);
        res.json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getSingleUserById,
    updateUser,
    deleteUser
};